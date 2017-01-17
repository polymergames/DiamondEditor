require('../less/main.less') // allows hot-reloading of less

import React from 'react'
import ReactDOM from 'react-dom'

// Render to ID content in the DOM
ReactDOM.render(
  <p>
    "Hello world!"
  </p>,
  document.getElementById('content')
)
