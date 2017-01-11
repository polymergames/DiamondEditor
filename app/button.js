import React from 'react'

exports.Button = class Button extends React.Component {
  render() {
    return (
      <button onClick={this.props.onClick}>{this.props.content}</button>
    )
  }
}
