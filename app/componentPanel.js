import React from 'react'
import {ObjectPanel} from './panel'

// renders the appropriate UI panel for editing the given Diamond component
export class ComponentPanel extends React.Component {
  render() {
    let PanelComponentVar = null

    switch(this.props.label) {
      case 'renderComponent':
        PanelComponentVar = RenderComponentPanel
        break
      default:
        PanelComponentVar = ObjectPanel
    }

    if (PanelComponentVar) {
      return (
        <PanelComponentVar
          label={this.props.label}
          object={this.props.object}
          onChange={this.props.onChange}
        />
      )
    }
    return null
  }
}

export class RenderComponentPanel extends React.Component {
  render() {
    return (
      <ObjectPanel
        label={this.props.label}
        object={this.props.object}
        onChange={this.props.onChange}
      />
    )
  }
}
