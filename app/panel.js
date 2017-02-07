import React from 'react'
import {LabeledField} from './input'

// prop onChange will be called when the value of a property input
// in this panel changes value, passing this panel's label prop
// and the new value of its object.
export class ObjectPanel extends React.Component {
  render() {
    // render a panel or field for each property of the object
    return (
      <div>
        {!this.props.hideLabel && <h3>{this.props.label}</h3>}
        {Object.keys(this.props.object).map(prop => {
          // recursively make object panel
          if (typeof this.props.object[prop] == 'object') {
            return (
              <ObjectPanel
                key={prop}
                label={prop}
                object={this.props.object[prop]}
                onChange={(label, val) => {
                  let obj = this.props.object
                  obj[label] = val
                  this.props.onChange(this.props.label, obj)
                }}
              />
            )
          }
          // otherwise, this property is not an object
          return (
            <LabeledField
              key={prop}
              label={prop}
              value={this.props.object[prop]}
              onChange={val => {
                let obj = this.props.object
                obj[prop] = val
                this.props.onChange(this.props.label, obj)
              }}
            />
          )
        })}
      </div>
    )
  }
}
