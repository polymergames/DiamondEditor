const {app, ipcMain, BrowserWindow} = require('electron')
const Diamond = require('jdiamond')

// TODO: remove this from release
const installExtension = require('electron-devtools-installer')

const path = require('path')
const url = require('url')

const entityChannel = 'setEntity'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let entitylistPanel = null
let componentPanel = null

let isDiamondOpen = false

let defaultTexture = null
let defaultTexturePath = 'assets/default.png'

function startUp() {
  // DEBUG
  // TODO: remove this from release
  // add react developer tools
  // BrowserWindow.addDevToolsExtension(
  //   '~/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.15.4_0'
  // )
  installExtension.default(installExtension.REACT_DEVELOPER_TOOLS)
    .then((name) => {
      console.log(`Added Extension:  ${name}`)
      startDiamond()
    })
    .catch((err) => console.log('An error occurred: ', err))
}

function startDiamond() {
  if (Diamond.init()) {
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
      updateEntityQueue.push({name: name, entity: entity})
    }

    global.createEntityComponent = function(entityName, componentName) {
      newComponentQueue.push(
        {entityName: entityName, componentName: componentName}
      )
      displayedEntityNeedsUpdate = true
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

    // receive messages from component panel window
    ipcMain.on(entityChannel, function(event, message) {
      if (message == 'needEntity')
        updateDisplayedEntity(currentlyDisplayedEntityName)
    })

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
        }
      }
      newComponentQueue = []

      // Update entity components
      for (let i = 0; i < updateEntityQueue.length; ++i) {
        let name = updateEntityQueue[i].name
        let entity = updateEntityQueue[i].entity
        if (entities.hasOwnProperty(name)) {
          for (let component in entity) {
            // console.log("Setting component " + component)
            entities[name][component].set(entity[component])
          }
        }
      }
      updateEntityQueue = []

      // Destroy removed components
      // TODO

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
      for (entity in entities) {
        console.log(entity)
        // console.log(entities[entity].transform.obj)
        for (let prop in entities[entity])
          console.log(entities[entity][prop].obj)
        // console.log(entities[entity])
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


// returns an object containing all the component.obj objects
// of the components in the given entity
function entityObj(entity) {
  ret = {}
  for (let component in entity) {
    ret[component] = entity[component].obj
  }
  return ret
}

function loadDefaultTexture() {
  return Diamond.renderer.loadTexture(defaultTexturePath)
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
      break;
    case 'renderComponent':
      if (!transform)       return null
      if (!defaultTexture)  defaultTexture = loadDefaultTexture()
      return new Diamond.RenderComponent2D(entity.transform, defaultTexture)
      break;
    case 'particleEmitter':
    // TODO: pass default particle emitter config
      if (!transform)       return null
      return new Diamond.ParticleEmitter2D({}, entity.transform)
      break;
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
    width: 300,
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
