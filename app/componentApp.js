require('../less/main.less') // allows hot-reloading of less

const {ipcRenderer} = require('electron')

import React from 'react'
import ReactDOM from 'react-dom'

ipcRenderer.on('setEntity', (event, data) => {
  // Render to ID content in the DOM
  ReactDOM.render(
    <div>
      <p>{data.name}</p>
      <p>Position: {data.entity.transform.position.x}, {data.entity.transform.position.y}</p>
    </div>,
    document.getElementById('content')
  )
})
