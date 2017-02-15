import React from 'react'
import {Button} from './button'
import {LabeledField} from './input'
import {copyObj} from './util'

// TODO: recursively render arrays as well as objects
// see http://stackoverflow.com/questions/767486/how-do-you-check-if-a-variable-is-an-array-in-javascript

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

// prop addItem is a function that is called when the add button is clicked
// to add an item to the array. The function should handle adding an array item.
export class ArrayPanel extends React.Component {
  render() {
    return (
      <div>
        {!this.props.hideLabel && <h3>{this.props.label}</h3>}
        {Object.keys(this.props.object).map(index => {
          let xbutton = (
            <div className="close-button-container">
              <Button
                content="x"
                onClick={e => {
                  let obj = this.props.object.slice(0)
                  obj.splice(index, 1)
                  this.props.onChange(this.props.label, obj)
                }}
              />
            </div>
          )

          // recursively make object panel
          if (typeof this.props.object[index] == 'object') {
            return (
              <div key={index}>
                {xbutton}
                <ObjectPanel
                  label={index}
                  object={this.props.object[index]}
                  onChange={(label, val) => {
                    let obj = this.props.object
                    obj[label] = val
                    this.props.onChange(this.props.label, obj)
                  }}
                />
              </div>
            )
          }
          // otherwise, this property is not an object
          return (
            <div key={index}>
              {xbutton}
              <LabeledField
                label={index}
                value={this.props.object[index]}
                onChange={val => {
                  let obj = this.props.object
                  obj[index] = val
                  this.props.onChange(this.props.label, obj)
                }}
              />
            </div>
          )
        })}
        <div className="add-button-container">
          <Button content={this.props.addButtonContent} onClick={this.props.addItem} />
        </div>
      </div>
    )
  }
}
