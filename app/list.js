import React from 'react'
import {Button} from './button'

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
