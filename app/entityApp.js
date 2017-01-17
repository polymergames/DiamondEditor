require('../less/main.less') // allows hot-reloading of less

import React from 'react'
import ReactDOM from 'react-dom'
import {EntityList} from './entityList'

// Render to ID content in the DOM
ReactDOM.render(
  <div className="vertical-list">
    <EntityList addButtonContent="+" />
  </div>,
  document.getElementById('content')
)
