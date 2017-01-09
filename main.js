const {app, BrowserWindow} = require('electron')
const Diamond = require('jdiamond')

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let componentPanel

function startUp() {
    if (Diamond.init()) {
        createComponentPanel()

        Diamond.launch()
        Diamond.cleanUp()
    }
}

function createComponentPanel () {
    // Create the browser window.
    componentPanel = new BrowserWindow({width: 300, height: 800})

    // and load the index.html of the app.
    componentPanel.loadURL(url.format({
        pathname: path.join(__dirname, 'component-panel.html'),
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

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (componentPanel === null) {
        createComponentPanel()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
