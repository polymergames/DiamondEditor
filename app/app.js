require('../less/main.less')

'use strict'

import React from 'react'
import ReactDOM from 'react-dom'

class Search extends React.Component {
    render() {
        return (
          <form>
            <input type = "text" />
            <input type = "submit" />
          </form>
        )
    }
}

// Render to ID content in the DOM
ReactDOM.render( < Search / > ,
    document.getElementById('content')
)
