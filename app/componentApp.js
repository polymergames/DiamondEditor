require('../less/main.less') // allows hot-reloading of less

const {ipcRenderer} = require('electron')

import React from 'react'
import ReactDOM from 'react-dom'
import {ObjectPanel} from './panel'
import {LabeledField} from './input'

ipcRenderer.on('setEntity', (event, data) => {
  ReactDOM.render(
    <div className="component-panel">
      <p>{data.name}</p>

      <p>Position:</p>
      <ObjectPanel
        object={data.entity.transform.position}
        onChange={(prop, val) => {}}
      />

      <LabeledField
        label='Rotation'
        value={data.entity.transform.rotation}
        onChange={(val) => {}}
      />

      <p>Scale:</p>
      <ObjectPanel
        object={data.entity.transform.scale}
        onChange={(prop, val) => {}}
      />
    </div>,
    document.getElementById('content')
  )
})
