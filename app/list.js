import React from 'react'
import {Button} from './button'
import {Selectable} from './label'

// TODO: allow multiple selections (ex. holding Shift/Cmd))
/**
 * Prop items should be an array of {key, item} objects,
 * where each item will be rendered inside a list element with key=key.
 *
 * Prop onSelect will be called when an item is selected
 * with the item's key given as an argument.
 *
 * Prop onDeselect will be called when an item is deselected
 * (ie, it was selected and is no longer selected)
 * with the item's key given as an argument.
 *
 * Prop selected can be given as a key that should be initially selected.
 */
exports.SelectableList = class SelectableList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: this.props.selected
    }

    this.onClick = this.onClick.bind(this)
  }

  onClick(e, key) {
    this.setState(() => {
      selected: key
    })
    this.props.onSelect(key)
  }

  render() {
    return (
      <ul className="vertical-list">
        {this.props.items.map(item =>
          <li key={item.key}>
            <Selectable
              selected={this.state.selected == item.key}
              onClick={this.onClick}
              key={item.key}
              content={item.item}
            />
          </li>
        )}
      </ul>
    )
  }
}

// TODO: use a given list implementation like SelectableList
exports.DynamicList = class DynamicList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      items: []
    }

    // This binding is necessary to make `this` work in the callback
    // Do this in constructor instead of when providing callback
    // to prevent constructing a new function at every render
    this.addItem = this.addItem.bind(this);
  }

  addItem(e) {
    this.setState(prevState => {
      // Get a new list item from client
      const newItem = this.props.newItem(e, prevState.items)
      // Update the list
      return {
        items: prevState.items.concat([<li key={newItem.key}>{newItem.item}</li>])
      }
    })
  }

  render() {
    return (
      <div>
        <div className="add-button-container">
          <Button content="+" onClick={this.addItem} />
        </div>
        <ul className="vertical-list">
          {this.state.items}
        </ul>
      </div>
    )
  }
}
