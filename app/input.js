import React from 'react'

export class LabeledField extends React.Component {
  render() {
    return (
      <label>
        {this.props.label}
        <TypedField
          value={this.props.value}
          onChange={this.props.onChange}
        />
      </label>
    )
  }
}

export class TypedField extends React.Component {
  render() {
    let FieldComponentVar
    let type

    switch (typeof this.props.value) {
      case 'boolean':
        FieldComponentVar = Checkbox
        break
      case 'number':
        FieldComponentVar = InputField
        type = 'number'
        break
      case 'string':
        FieldComponentVar = InputField
        type = 'text'
        break
      default:
        FieldComponentVar = null
        type = null
    }

    if (FieldComponentVar) {
      return (
        <FieldComponentVar
          value={this.props.value}
          onChange={this.props.onChange}
          type={type}
        />
      )
    }
    return null
  }
}

export class Checkbox extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    this.props.onChange(e.target.checked)
  }

  render() {
    return (
      <input
        type="checkbox"
        checked={this.props.value}
        onChange={this.handleChange}
      />
    )
  }
}

export class InputField extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    this.props.onChange(e.target.value)
  }

  render() {
    return (
      <input
        type={this.props.type}
        value={this.props.value}
        onChange={this.handleChange}
      />
    )
  }
}
