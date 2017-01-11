import React from 'react'
import {Button} from './button'

class VerticalList extends React.Component {
  render() {
    const listItems = this.props.elements.map((element) =>
      <li>{element}</li>
    )

    return (
      <ul className="VerticalList">{listItems}</ul>
    )
  }
}

exports.DynamicList = class DynamicList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      items: ['hi']
    }

    // This binding is necessary to make `this` work in the callback
    // Do this in constructor instead of when providing callback
    // to prevent constructing a new function at every render
    this.addElement = this.addElement.bind(this);
  }

  addElement(e) {
    console.log("TODO: ADDING")
  }

  render() {
    // Note: binding is necessary to make `this` work in a callback
    return (
    <div>
      <div className="AddButton">
        <Button content="+" onClick={this.addElement} />
      </div>
      <div>
        <VerticalList elements={this.state.items} />
      </div>
    </div>
    )
  }
}
