import React from 'react'

export class Button extends React.Component {
  render() {
    return (
      <button
        onClick={this.props.onClick}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
      >
        {this.props.content}
      </button>
    )
  }
}
