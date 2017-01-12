import React from 'react'
import {Button} from './button'

// TODO: allow multiple selections (ex. holding Shift/Cmd))
/**
 * Prop items should be an array of {id, item} objects,
 * where each item will be rendered inside a list element with key=id.
 *
 * optional Prop onSelect will be called when an item is selected
 * with the item's id given as an argument.
 *
 * optional Prop onDeselect will be called when an item is deselected
 * (ie, it was selected and is no longer selected)
 * with the item's id given as an argument.
 *
 * optional Prop selected can be given as an id that should be initially selected.
 *
 * Applies css class selectable-list-item on list items, in addition to
 * selected-item on the currently selected list item.
 */
exports.SelectableList = class SelectableList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: this.props.selected
    }

    this.onClick = this.onClick.bind(this)
  }

  onClick(e, id) {
    // send callback if another item is currently selected
    if (this.state.selected &&
        this.props.onDeselect &&
        this.state.selected != id) {
      this.props.onDeselect(this.state.selected)
    }

    // set the currently selected item
    this.setState(() => ({
      selected: id
    }))

    // send callback for the newly selected item
    if (this.props.onSelect)
      this.props.onSelect(id)
  }

  render() {
    // console.log(this.prop)
    return (
      <ul>
        {this.props.items.map(item => (
          <li
            key={item.id}
            className={
              'selectable-list-item' +
              (item.id == this.state.selected ? ' selected-item' : '')
            }
            onClick={e => this.onClick(e, item.id)}
          >
            {item.item}
          </li>
        ))}
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
