import React from 'react'
import {ObjectPanel} from './panel'
import {LabeledField} from './input'

export class TransformPanel extends React.Component {
  render() {
    return (
      <div className="component-panel">
        <p>{this.props.data.name}</p>

        <p>Position:</p>
        <ObjectPanel
          object={this.props.transform.position}
          onChange={(prop, val) => {}}
        />

        <LabeledField
          label='Rotation'
          value={this.props.transform.rotation}
          onChange={(val) => {}}
        />

        <p>Scale:</p>
        <ObjectPanel
          object={this.props.transform.scale}
          onChange={(prop, val) => {}}
        />
      </div>
    )
  }
}
