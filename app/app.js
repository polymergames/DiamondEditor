require('../less/main.less') // allows hot-reloading of less

import React from 'react'
import ReactDOM from 'react-dom'
import {DynamicList} from './list'

const electron = require('electron')

// Render to ID content in the DOM
ReactDOM.render(
  <DynamicList
    newItem={() => ({key: Math.random(), item: Math.random()})}
  />,
  document.getElementById('content')
)


const createEntity = electron.remote.getGlobal('createEntity')
const destroyEntity = electron.remote.getGlobal('destroyEntity')

createEntity("swaglord")
createEntity("yolo")
destroyEntity("swaglord")
createEntity("ayyyy")
