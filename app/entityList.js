const electron = require('electron')

import React from 'react'
import {DynamicSelectableList} from './list'

// Diamond functions
const createEntity = electron.remote.getGlobal('createEntity')
const destroyEntity = electron.remote.getGlobal('destroyEntity')

/**
 * Prop addButtonContent will be displayed in the add entity button.
 */
export class EntityList extends React.Component {
  constructor(props) {
    super(props)
    this.currentID = 1
    this.addEntity = this.addEntity.bind(this)
  }

  addEntity(addItem) {
    const name = 'entity' + this.currentID++
    createEntity(name)
    addItem({id: name, value: name})
  }

  render() {
    return (
      <DynamicSelectableList
        addButtonContent={this.props.addButtonContent}
        newItem={this.addEntity}
      />
    )
  }
}
