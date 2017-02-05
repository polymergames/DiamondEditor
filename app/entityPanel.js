import electron, {ipcRenderer} from 'electron'
import React from 'react'
import {ObjectPanel} from './panel'
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

  handleChange(newName, newEntity) {
    this.setState({name: newName, entity: newEntity})
    diamondUpdateEntity(newName, newEntity)
  }

  createComponent(componentName) {
    diamondCreateComponent(this.state.name, componentName)
  }

  render() {
    return (
      <div>
        <ObjectPanel
          label={this.state.name}
          object={this.state.entity}
          onChange={this.handleChange}
        />
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
