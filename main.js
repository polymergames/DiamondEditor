const {app, dialog, ipcMain, BrowserWindow} = require('electron')
const Diamond = require('jdiamond')

// TODO: remove this from release
const installExtension = require('electron-devtools-installer')

const fs = require('fs')
const path = require('path')
const url = require('url')

const entityChannel = 'setEntity'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let entitylistPanel = null
let componentPanel = null

let isDiamondOpen = false

let textureTable = {}

const defaultTexturePath = path.join(__dirname, 'assets/default.png')
const defaultParticleConfigPath = path.join(__dirname, 'assets/defaultParticles.json')

const defaultSpritesheetPath = path.join(__dirname, 'assets/defaultSpritesheet.png')
let defaultAnimation = {
  frameLength: 20,
  numFrames:   4,
  numRows:     1,
  numColumns:  4
}

const defaultCircle = {center: {x: 0, y: 0}, radius: 50}
const defaultPolygon = [
  {x: -15, y: -15},
  {x: 0, y: 15},
  {x: 15, y: -15}
]

const debugColor = {r: 0, g: 255, b: 0, a: 100}
const debugPointRadius = 1

function startUp() {
  // DEBUG
  // TODO: remove this from release
  // add react developer tools
  installExtension.default(installExtension.REACT_DEVELOPER_TOOLS)
    .then((name) => {
      console.log(`Added Extension:  ${name}`)
    })
    .catch((err) => console.log('An error occurred: ', err))

  // launch!
  startDiamond()
}

function startDiamond() {
  let config = new Diamond.Config()
  // TODO: let user configure window size, etc.

  if (Diamond.init(config)) {
    isDiamondOpen = true

    // set of entity objects. an entity object contains component objects.
    let entities = {}

    // Use queues so that entities are only created/destroyed/changed
    // during game update callback
    let newEntityQueue = [] // each element is a name
    let deleteEntityQueue = []
    let updateEntityQueue = [] // each element is an object containing a name and an entity (containing component objects)
    let newComponentQueue = [] // each element is {entityName, componentName}
    let deleteComponentQueue = [] // each element is {entityName, componentName}

    // the name of the entity currently active on the componentPanel
    let currentlyDisplayedEntityName = null
    let displayedEntityNeedsUpdate = false

    // updates the entity currently displayed in the component panel
    const updateDisplayedEntity = function(entityName) {
      componentPanel.webContents.send(
        entityChannel,
        {
          name: entityName,
          entity: entityObj(entities[entityName])
        }
      )
      displayedEntityNeedsUpdate = false
    }

    // will only create an entity if one doesn't already exist by that name
    global.createEntity = function(name) {
      newEntityQueue.push(name)
    }

    global.destroyEntity = function(name) {
      deleteEntityQueue.push(name)
    }

    // will perform a shallow merge of the provided entity object with the
    // existing entity, ie.
    // will update the properties of the named entity to those present in the
    // given entity object- the entity object passed here only needs to contain
    // the properties being modified, any properties that are not included will
    // not be deleted or changed.
    global.updateEntity = function(name, entity) {
      // console.log(entity)
      updateEntityQueue.push({name: name, entity: entity})
    }

    global.createEntityComponent = function(entityName, componentName) {
      newComponentQueue.push(
        {entityName: entityName, componentName: componentName}
      )
    }

    global.removeEntityComponent = function(entityName, componentName) {
      deleteComponentQueue.push(
        {entityName: entityName, componentName: componentName}
      )
    }

    global.openEntity = function(entityName) {
      if (componentPanel == null) {
        createComponentPanel()
      }
      currentlyDisplayedEntityName = entityName
      updateDisplayedEntity(currentlyDisplayedEntityName)
    }

    global.getTextureFromPath = getTextureFromPath
    global.getTexturePathFromHandle = getTexturePathFromHandle

    global.openFilePicker = openFilePicker
    global.parseConfigFile = parseConfigFile
    global.saveKeyVals = saveKeyVals

    // receive messages from component panel window
    ipcMain.on(entityChannel, function(event, message) {
      if (message === 'needEntity') {
        updateDisplayedEntity(currentlyDisplayedEntityName)
      }
    })


    // === UPDATE ===
    // this will run every frame in the Diamond engine game loop
    const update = function() {
      // Create new entities
      for (let i = 0; i < newEntityQueue.length; ++i) {
        // Only create a new entity if one doesn't already exist by that name
        if (!entities.hasOwnProperty(newEntityQueue[i])) {
          // entities[newEntityQueue[i]] = {
          //   transform: new Diamond.Transform2(screenMiddle)
          // }
          entities[newEntityQueue[i]] = {}
        }
      }
      newEntityQueue = []

      // Create new components
      for (let i = 0; i < newComponentQueue.length; ++i) {
        let entityName = newComponentQueue[i].entityName
        let componentName = newComponentQueue[i].componentName
        // check that the entity exists and that it doesn't
        // already have the component being created.
        if (entities.hasOwnProperty(entityName) &&
            !entities[entityName].hasOwnProperty(componentName)) {
          newComponent = createDefaultComponent(entities[entityName], componentName)
          if (newComponent)
            entities[entityName][componentName] = newComponent

          // update the displayed entity in the UI if necessary
          displayedEntityNeedsUpdate = displayedEntityNeedsUpdate ||
                                       entityName == currentlyDisplayedEntityName
        }
      }
      newComponentQueue = []

      // Update entity components
      for (let i = 0; i < updateEntityQueue.length; ++i) {
        let name = updateEntityQueue[i].name
        let entity = updateEntityQueue[i].entity
        if (entities.hasOwnProperty(name)) {
          for (let component in entity) {
            // safety check- animation values are not allowed to be < 1
            if (component === 'animatorSheet') {
              Object.keys(entity[component]).map(prop => {
                if (typeof entity[component][prop] === 'number' && entity[component][prop] < 1) {
                  entity[component][prop] = 1
                }
              })
            }
            // TODO: this is a temporary fix for renderComponent
            // when renderComponent sprite is changed with .set,
            // it gets messed up :()
            if (component === 'renderComponent' &&
                !entities[name].animatorSheet && // because render component shouldnt be destroyed while being used by an animator
                entities[name].transform &&
                entity[component].sprite) {
              entities[name][component].destroy()
              entities[name][component] = new Diamond.RenderComponent2D(
                  entities[name].transform,
                  entity[component].sprite
              )
              let newComponent = entities[name][component]
              newComponent.layer = entity[component].layer
              newComponent.pivot = entity[component].pivot
              if (entity[component].isFlippedX) newComponent.flipX()
              if (entity[component].isFlippedY) newComponent.flipY()
            }
            // safety check- polygon colliders should have at least 3 points
            // if less than 3 points were given, UI needs to be updated to be fixed
            else if (component === 'polygonCollider' && entity[component].length < 3) {
              displayedEntityNeedsUpdate = displayedEntityNeedsUpdate ||
                                           entityName == currentlyDisplayedEntityName
            }
            else {
              // console.log('Updating component ' + component)
              // console.log(entity[component])
              // console.log(entities[name][component])
              entities[name][component].set(entity[component])
            }
          }
        }
      }
      updateEntityQueue = []

      // Destroy removed components
      for (let i = 0; i < deleteComponentQueue.length; ++i) {
        let entityName = deleteComponentQueue[i].entityName
        let componentName = deleteComponentQueue[i].componentName

        // check that the entity exists and that
        // it has the component being removed.
        if (entities.hasOwnProperty(entityName) &&
            entities[entityName].hasOwnProperty(componentName)) {
          // don't remove a component if a dependent component exists
          if (!(componentName == 'renderComponent' &&
                entities[entityName].hasOwnProperty('animatorSheet')) &&
              !(componentName == 'rigidbody' &&
                (entities[entityName].hasOwnProperty('circleCollider') ||
                 entities[entityName].hasOwnProperty('polygonCollider'))
               )
             ) {
            entities[entityName][componentName].destroy()
            delete entities[entityName][componentName]

            // update the displayed entity in the UI if necessary
            displayedEntityNeedsUpdate = displayedEntityNeedsUpdate ||
                                         entityName == currentlyDisplayedEntityName
          }
        }
      }
      deleteComponentQueue = []

      // Destroy deleted entities
      for (let i = 0; i < deleteEntityQueue.length; ++i) {
        if (entities.hasOwnProperty(deleteEntityQueue[i])) {
          for (let prop in entities[deleteEntityQueue[i]]) {
            // assumes that all game entity properties have a destroy() function
            entities[deleteEntityQueue[i]][prop].destroy()
          }
          delete entities[deleteEntityQueue[i]]
        }
      }
      deleteEntityQueue = []

      // DEBUG
      // console.log(entities)
      for (entityName in entities) {
        let entity = entities[entityName]
        if (entityName === currentlyDisplayedEntityName) {
          // mark the entity's position
          if (entity.transform) {
            Diamond.Debug.drawCircle({
              center: entity.transform.position, radius: debugPointRadius
            }, debugColor)
          }
          // draw colliders
          if (entity.circleCollider) {
            Diamond.Debug.drawCircleCollider(entity.circleCollider, debugColor)
          }
          if (entity.polygonCollider) {
            Diamond.Debug.drawPolyCollider(entity.polygonCollider, debugColor)
          }
        }
        // console.log(entityName)
        // console.log(entity.transform.obj)
        // for (let prop in entity)
        //   console.log(entity[prop].obj)
        // console.log(entity)
      }

      // update the entity display in the component panel
      if (componentPanel &&
          currentlyDisplayedEntityName &&
          displayedEntityNeedsUpdate) {
        updateDisplayedEntity(currentlyDisplayedEntityName)
      }
    }

    // Open editor panels
    createEntityListPanel()

    // Fire up the engine
    Diamond.launch(update)
    Diamond.cleanUp()
    isDiamondOpen = false
  }
}


function getTextureFromPath(texturePath) {
  let texture = textureTable[texturePath]
  // load the texture for the first time
  // if it's not already cached
  if (!texture) {
    texture = Diamond.renderer.loadTexture(texturePath)
    textureTable[texturePath] = texture
  }
  return texture
}

function getTexturePathFromHandle(textureHandle) {
  for (let path in textureTable) {
    if (textureTable[path].handle == textureHandle)
      return path
  }
  return null
}

// opens the system dialog to open file(s).
// passes the selected files(s) as an array of file paths to callback.
function openFilePicker(callback) {
  dialog.showOpenDialog({
    properties: ['openFile']
  }, callback)
}

function parseConfigFile(fileName, config) {
  // TODO: is it safe to assume utf8 encoding?
  // is there a more robust way?
  let configStr = fs.readFileSync(fileName, 'utf8')
  if (configStr) {
    configStr.split(/\r?\n/).map(str => {
      let line = str.trim()
      // a line of config must have at least key:value
      // and should not start with '#' (comment line)
      if (line.length >= 3 && line.charAt(0) != '#') {
        let parts = line.split(/:/)
        if (parts.length > 1)
          config[parts[0].trim()] = parts[1].trim()
      }
    })
  }
  return config
}

// saves the given object to a file as a list of key-value pairs.
function saveKeyVals(obj) {
  dialog.showSaveDialog({}, fileName => {
    if (fileName) {
      let configStr = Diamond.Util.objToKeyvalPairs(obj)
      fs.writeFile(fileName, configStr, error => {
        if (error)
          console.log(error)
      })
    }
  })
}

// returns an object containing all the component.obj objects
// of the components in the given entity
function entityObj(entity) {
  ret = {}
  for (let component in entity) {
    ret[component] = entity[component].obj
  }
  return ret
}

// creates a new Diamond component with default properties.
// make sure the entity has the prerequisite components
// to create the new component! ex., a lot of components
// require an existing transform
function createDefaultComponent(entity, componentName) {
  switch (componentName) {
    case 'transform':
      const screenMiddle =
        Diamond.Vector2.scalarVec(Diamond.renderer.resolution, {x: 0.5, y: 0.5})
      return new Diamond.Transform2(screenMiddle)
      break

    case 'renderComponent':
      if (!entity.transform)  return null
      let defaultTexture = getTextureFromPath(defaultTexturePath)
      if (!defaultTexture)    return null
      return new Diamond.RenderComponent2D(entity.transform, defaultTexture)
      break

    case 'animatorSheet':
      if (!entity.renderComponent) {
        // HACK
        // add renderComponent to entity if it doesn't already exist
        entity.renderComponent = createDefaultComponent(entity, 'renderComponent')
        if (!entity.renderComponent) {
          console.log('Failed to load render component')
          return null
        }
      }
      defaultAnimation.spritesheet = getTextureFromPath(defaultSpritesheetPath)
      entity.renderComponent.sprite = defaultAnimation.spritesheet
      return new Diamond.AnimatorSheet(defaultAnimation, entity.renderComponent)

    case 'particleEmitter':
      if (!entity.transform)  return null
      const configFile = fs.readFileSync(defaultParticleConfigPath)
      let config = JSON.parse(configFile)
      // need to make particleTexture path relative to electron directory
      config.particleTexture = path.join(__dirname, config.particleTexture)
      if (configFile) {
        return new Diamond.ParticleEmitter2D(config, entity.transform)
      }
      else {
        console.log('Failed to load particle config ' + defaultParticleConfigPath);
        return null
      }
      break

    case 'circleCollider':
      if (!entity.rigidbody) {
        if (!entity.transform)  return null
        // HACK
        // add rigidbody to the entity if it doesn't already exist
        entity.rigidbody = new Diamond.Rigidbody2D(entity.transform)
      }
      return new Diamond.CircleCollider(entity.rigidbody, defaultCircle)
      break

    case 'polygonCollider':
      if (!entity.rigidbody) {
        if (!entity.transform)  return null
        // HACK
        // add rigidbody to the entity if it doesn't already exist
        entity.rigidbody = new Diamond.Rigidbody2D(entity.transform)
      }
      return new Diamond.PolygonCollider(entity.rigidbody, defaultPolygon)
    default:
      return null
  }
}


function createEntityListPanel() {
  entitylistPanel = new BrowserWindow({
    width: 300,
    height: 800,
    x: 0,
    y: 0
  })

  entitylistPanel.loadURL(url.format({
    pathname: path.join(__dirname, 'public/entitylist-panel.html'),
    protocol: 'file:',
    slashes: true
  }))

  entitylistPanel.on('closed', () => {
    entitylistPanel = null
  })
}


function createComponentPanel () {
  // Create the browser window.
  // TODO: use title bar style hidden (for OSX only hehe) and implement drag in CSS
  // http://electron.atom.io/docs/api/frameless-window/
  // TODO: figure out how to position windows properly
  // const pos = electron.screen.getPrimaryDisplay().workAreaSize
  // pos.width -= 250
  // pos.height -= 300
  // console.log(pos)
  componentPanel = new BrowserWindow({
    width: 350,
    height: 800
  })

  // and load the index.html of the app.
  componentPanel.loadURL(url.format({
    pathname: path.join(__dirname, 'public/component-panel.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  componentPanel.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    componentPanel = null
  })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', startUp)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  // Close Diamond when editor is quitting
  if (isDiamondOpen) {
    Diamond.quit()
    // Diamond.cleanUp will happen in startUp thread
    isDiamondOpen = false
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (entitylistPanel === null) {
    createEntityListPanel()
  }
})
