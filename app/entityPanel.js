import electron, {ipcRenderer} from 'electron'
import React from 'react'
import {ComponentPanel} from './componentPanel'
import {Dropdown} from './dropdown'
import {Menu} from './menu'

// Diamond functions
const diamondUpdateEntity = electron.remote.getGlobal('updateEntity')
const diamondCreateComponent = electron.remote.getGlobal('createEntityComponent')
const entityChannel = 'setEntity'

export class EntityPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      name: '',
      entity: {}
    }

    this.setEntity = this.setEntity.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.createComponent = this.createComponent.bind(this)
  }

  componentDidMount() {
    ipcRenderer.on(entityChannel, this.setEntity)
    ipcRenderer.send(entityChannel, 'needEntity')
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(entityChannel, this.setEntity)
  }

  // this function is used as a callback
  // to listen to external entity updates
  setEntity(event, data) {
    this.setState({
      name: data.name,
      entity: data.entity
    })
  }

  handleChange(componentName, newComponent) {
    this.setState(prevState => {
      // update Diamond with the changed component
      let entityChanges = {}
      entityChanges[componentName] = newComponent
      diamondUpdateEntity(this.state.name, entityChanges)
      // update UI
      let newEntity = prevState.entity
      newEntity[componentName] = newComponent
      return {entity: newEntity}
    })
  }

  createComponent(componentName) {
    diamondCreateComponent(this.state.name, componentName)
  }

  render() {
    return (
      <div>
        <p>{this.state.name}</p>
        {Object.keys(this.state.entity).map(componentName => {
          return (
            <ComponentPanel
              key={componentName}
              label={componentName}
              object={this.state.entity[componentName]}
              onChange={this.handleChange}
            />
          )
        })}
        <div className='dropdown-menu'>
          <Dropdown button="+">
            <Menu
              items={[
                'renderComponent',
                'particleEmitter'
              ]}
              onClick={this.createComponent}
            />
          </Dropdown>
        </div>
      </div>
    )
  }
}
