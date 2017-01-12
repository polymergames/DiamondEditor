import React from 'react'

exports.Selectable = class Selectable extends React.Component {
  render() {
    return (
      <span onClick={this.props.onClick} className={this.props.selected ? 'selected-bg' : ''}>
        {this.props.content}
      </span>
    )
  }
}
