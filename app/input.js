import React from 'react'

export class LabeledField extends React.Component {
  constructor(props) {
    super(props)
    this.startDrag = this.startDrag.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.stopDrag = this.stopDrag.bind(this)
  }

  componentDidMount() {
    if (typeof this.props.value === 'number') {
      window.addEventListener('mouseup', this.stopDrag, false)
    }
  }

  componentWillUnmount() {
    if (typeof this.props.value === 'number') {
      window.removeEventListener('mouseup', this.stopDrag, false)
    }
  }

  startDrag(e) {
    if (typeof this.props.value === 'number') {
      this.mouseX = e.clientX
      window.addEventListener('mousemove', this.onDrag, false)
      this.dragging = true
    }
  }

  onDrag(e) {
    this.props.onChange(this.props.value + (e.clientX - this.mouseX))
    this.mouseX = e.clientX
  }

  stopDrag() {
    if (typeof this.props.value === 'number') {
      window.removeEventListener('mousemove', this.onDrag, false)
      this.dragging = false
    }
  }

  render() {
    let spanclass=""

    if (typeof this.props.value === 'number')
      spanclass = 'draggable-control'

    return (
      <label>
        <span className={spanclass}
          onMouseDown={this.startDrag}
        >
          {this.props.label}
        </span>
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
    let val = e.target.value
    if (this.props.type === 'number') {
      val = parseFloat(val)
    }
    this.props.onChange(val)
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
