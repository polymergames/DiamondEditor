require('../less/main.less') // allows hot-reloading of less
import React from 'react'
import ReactDOM from 'react-dom'
import {EntityPanel} from './entityPanel'

ReactDOM.render(
  <div className="entity-panel">
    <EntityPanel/>
  </div>,
  document.getElementById('content')
)
