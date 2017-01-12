import React from 'react'

/**
 * Prop selected is a boolean that indicates whether
 * this Selectable should be in a selected state (true) or not (false).
 *
 * Prop onClick is a function(e, key) called when this Selectable is clicked.
 *
 * Prop key is sent as an argument to onClick to identify the Selectable.
 *
 * Prop content is rendered inside the Selectable.
 *
 * In order to select/deselect a Selectable, it must be reconstructed
 * when prop onClick is called, passing in the correct value for props.selected.
 * See SelectableList for example of how to use Selectables.
 */
exports.Selectable = class Selectable extends React.Component {
  render() {
    return (
      <span onClick={e => this.props.onClick(e, this.props.key)} className={this.props.selected ? 'selected-item' : ''}>
        {this.props.content}
      </span>
    )
  }
}
