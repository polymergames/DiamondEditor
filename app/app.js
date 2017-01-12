require('../less/main.less') // allows hot-reloading of less

import React from 'react'
import ReactDOM from 'react-dom'
import {SelectableList, DynamicList} from './list'

const electron = require('electron')

const messages = ['hi', 'hello', 'sup man']

// Render to ID content in the DOM
ReactDOM.render(
  <div className="vertical-list">
    <SelectableList
      items={messages.map(message =>
        ({id: message, item: message})
      )}
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
