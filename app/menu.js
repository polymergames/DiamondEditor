import React from 'react'

// prop items is an array of elements displayed as list items in the menu.
// prop onClick is a callback function that is passed the clicked item
// when a menu item is clicked.
//
// applies css class menu-component to the menu
// and menu-component-item to the menu items
export class Menu extends React.Component {
  render() {
    return (
      <ul className="menu-component">
        {this.props.items.map(item => (
          <li
            className="menu-component-item"
            key={item}
            style={{listStyleType: 'none'}}
            onClick={e => this.props.onClick(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    )
  }
}
