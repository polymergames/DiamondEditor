import React from 'react'
import {LabeledField} from './input'

export class ObjectPanel extends React.Component {
  render() {
    return (
      <div>
        {Object.keys(this.props.object).map(prop => {
          <LabeledField
            key={prop}
            label={prop}
            value={this.props.object[prop]}
            onChange={val => this.props.onChange(prop, val)}
          />
        })}
      </div>
    )
  }
}
