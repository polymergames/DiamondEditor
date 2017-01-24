require('../less/main.less') // allows hot-reloading of less

const {ipcRenderer} = require('electron')

import React from 'react'
import ReactDOM from 'react-dom'
import {TransformPanel} from './componentPanel'

ipcRenderer.on('setEntity', (event, data) => {
  ReactDOM.render(
    <ComponentPanel transform={data.entity.transform} />,
    document.getElementById('content')
  )
})
