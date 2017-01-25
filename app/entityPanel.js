import electron, {ipcRenderer} from 'electron'
import React from 'react'
import {ObjectPanel} from './panel'

// Diamond functions
const electronUpdateEntity = electron.remote.getGlobal('updateEntity')
const entityChannel = 'setEntity'

export class EntityPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      name: '',
      entity: {}
    }

    this.setEntity = this.setEntity.bind(this)
  }

  componentWillMount() {
    ipcRenderer.on(entityChannel, this.setEntity)
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

  render() {
    // regarding onChange:
    // rather than changing this component's state,
    // the change is sent to the main electron process.
    // This component will always reflect the state sent from
    // ipcRenderer's channel entityChannel.
    return (
      <ObjectPanel
        label={this.state.name}
        object={this.state.entity}
        onChange={electronUpdateEntity}
      />
    )
  }
}
