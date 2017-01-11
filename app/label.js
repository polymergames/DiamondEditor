import React from 'react'

exports.Label = class Label extends React.Component {
  render() {
    return (
      <span>{this.props.content}</span>
    )
  }
}


exports.EditableLabel = class EditableLabel extends Label {
}
