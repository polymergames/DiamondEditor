import electron from 'electron'
import React from 'react'
import {DynamicSelectableList} from './list'

// Diamond functions
const diamondCreateEntity = electron.remote.getGlobal('createEntity')
const diamondDestroyEntity = electron.remote.getGlobal('destroyEntity')
const diamondCreateComponent = electron.remote.getGlobal('createEntityComponent')
const windowOpenEntity = electron.remote.getGlobal('openEntity')

/**
 * Prop addButtonContent will be displayed in the add entity button.
 */
export class EntityList extends React.Component {
  constructor(props) {
    super(props)
    this.currentID = 1
    this.addEntity = this.addEntity.bind(this)
    this.onSelectEntity = this.onSelectEntity.bind(this)
  }

  addEntity(addItem) {
    // create a new entity, add a transform to it,
    // and display it in the entity list
    const name = 'entity' + this.currentID++
    diamondCreateEntity(name)
    diamondCreateComponent(name, 'transform')
    addItem({id: name, value: name})
  }

  onSelectEntity(entityName) {
    // tell the entity editing window to display this entity
    windowOpenEntity(entityName)
  }

  render() {
    return (
      <DynamicSelectableList
        addButtonContent={this.props.addButtonContent}
        newItem={this.addEntity}
        onSelect={this.onSelectEntity}
      />
    )
  }
}
