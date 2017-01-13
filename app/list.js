import React from 'react'
import {Button} from './button'

// TODO: allow multiple selections (ex. holding Shift/Cmd))
/**
 * Prop items should be an array of {id, value} objects,
 * where each value will be rendered inside a list element with key=id.
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
export class SelectableList extends React.Component {
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
            {item.value}
          </li>
        ))}
      </ul>
    )
  }
}


/**
 * A Selectable list with a button to add new items.
 *
 * Prop items is an initial array of {id, value} objects
 * where each value will be rendered in a SelectableList
 *
 * Prop newItem is a callback function that is called when the add item button
 * is clicked. It is passed a callback function addItem and
 * an array of the current items in the list. The callback addItem should be called
 * by the client with an {id, value} object argument as a new item to add to the list.
 *
 * Prop addButtonContent will be displayed in the add item button.
 *
 * Props onSelect, onDeselect, and selected are passed as the
 * corresponding props to SelectableList.
 *
 * Applies css class add-button-container to the add item button.
 *
 * See SelectableList for more info about the contained list.
 *
 */
export class DynamicSelectableList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      items: this.props.items ? this.this.props.items : []
    }

    this.addItem = this.addItem.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  addItem(item) {
    this.setState(prevState => {
      // Update the list
      return {
        items: prevState.items.concat([item])
      }
    })
  }

  // for button
  onClick(e) {
    // Let client pass a new list item
    // to the addItem function
    if (this.props.newItem)
      this.props.newItem(this.addItem, this.state.items)
  }

  render() {
    return (
      <div>
        <div className="add-button-container">
          <Button content={this.props.addButtonContent} onClick={this.onClick} />
        </div>
        <SelectableList
          items={this.state.items.map(item =>
            ({id: item.id, value: item.value})
          )}
          onSelect={this.props.onSelect}
          onDeselect={this.props.onDeselect}
          selected={this.props.selected}
        />
      </div>
    )
  }
}
