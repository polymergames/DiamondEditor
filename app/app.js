require('../less/main.less') // allows hot-reloading of less
const electron = require('electron')

import React from 'react'
import ReactDOM from 'react-dom'
import {DynamicSelectableList} from './list'


const messages = ['hi', 'hello', 'sup man']

// Render to ID content in the DOM
ReactDOM.render(
  <div className="vertical-list">
    <DynamicSelectableList
      items={messages.map(message =>
        ({id: message, value: message})
      )}
      addButtonContent="+"
    />
  </div>,
  document.getElementById('content')
)


const createEntity = electron.remote.getGlobal('createEntity')
const destroyEntity = electron.remote.getGlobal('destroyEntity')

createEntity("swaglord")
createEntity("yolo")
destroyEntity("swaglord")
createEntity("ayyyy")
