const {app, BrowserWindow} = require('electron')
const Diamond = require('jdiamond')

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let entitylistPanel = null
let componentPanel = null

let isDiamondOpen = false
let currentlyDisplayedEntity = null // the name of the entity currently active on the componentPanel


function startUp() {
  if (Diamond.init()) {
    isDiamondOpen = true

    // DEBUG
    // add react developer tools
    BrowserWindow.addDevToolsExtension(
      '~/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.15.4_0'
    )

    // set of entity objects. an entity object contains component objects.
    let entities = {}

    // Use queues so that entities are only created/destroyed/changed
    // during game update callback
    let newEntityQueue = [] // each element is a name
    let deleteEntityQueue = []
    let updateEntityQueue = [] // each element is an object containing a name and an entity (containing component objects)
    let deleteComponentQueue = [] // each element is {entityName, componentName}

    global.createEntity = function(name) {
      newEntityQueue.push(name)
    }

    global.destroyEntity = function(name) {
      deleteEntityQueue.push(name)
    }

    global.updateEntity = function(name, entity) {
      updateEntityQueue.push({name: name, entity: entity})
    }

    global.removeEntityComponent = function(entityName, componentName) {
      deleteComponentQueue.push(
        {entityName: entityName, componentName: componentName}
      )
    }

    global.openEntity = function(name) {
      if (componentPanel == null) {
        createComponentPanel()
      }
      currentlyDisplayedEntity = name
    }

    // resolution and coordinates for the Diamond game window
    const resolution = Diamond.renderer.resolution
    const middle = Diamond.Vector2.scalarVec(resolution, {x: 0.5, y: 0.5})

    // this will run every frame in the Diamond engine game loop
    const update = function() {
      // Create new entities
      for (let i = 0; i < newEntityQueue.length; ++i) {
        // Only create a new entity if one doesn't already exist by that name
        if (!entities.hasOwnProperty(newEntityQueue[i])) {
          entities[newEntityQueue[i]] = {
            transform: new Diamond.Transform2(middle)
          }
        }
      }
      newEntityQueue = []

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

      // Update entity components
      for (let i = 0; i < updateEntityQueue.length; ++i) {
        let name = updateEntityQueue[i].name
        let entity = updateEntityQueue[i].entity
        if (entities.hasOwnProperty(name)) {
          for (let component in entity) {
            entities[name][component].set(entity[component])
          }
        }
      }
      updateEntityQueue = []

      // TODO: update entities
      console.log(entities)
      for (entity in entities) {
        //
      }

      // update the entity display in the component panel
      if (componentPanel && currentlyDisplayedEntity) {
        componentPanel.webContents.send(
          'setEntity',
          {
            name: currentlyDisplayedEntity,
            entity: entityObj(entities[currentlyDisplayedEntity])
          }
        )
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
