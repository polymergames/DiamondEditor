require('../less/main.less') // allows hot-reloading of less

import React from 'react'
import ReactDOM from 'react-dom'
import {DynamicList} from './list'

const electron = require('electron')

// class Search extends React.Component {
//     render() {
//         return (
//           <p>
//             <input type = "text" />
//             <input type = "submit" />
//           </p>
//         )
//     }
// }

// Render to ID content in the DOM
ReactDOM.render( <DynamicList /> ,
  document.getElementById('content')
)


const createEntity = electron.remote.getGlobal('createEntity')
const destroyEntity = electron.remote.getGlobal('destroyEntity')

createEntity("swaglord")
createEntity("yolo")
destroyEntity("swaglord")
createEntity("ayyyy")
