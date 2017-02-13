import React from 'react'
import {Button} from './button'

export class Dropdown extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      contentsVisible: false
    }

    this.mouseDownOnDropdown = false
    this.toggleMenu = this.toggleMenu.bind(this)
    this.showContents = this.showContents.bind(this)
    this.hideContents = this.hideContents.bind(this)
    this.mouseDownHandler = this.mouseDownHandler.bind(this)
    this.mouseUpHandler = this.mouseUpHandler.bind(this)
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.toggleMenu, false)
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.toggleMenu, false)
  }

  toggleMenu(e) {
    console.log('mousedown event')
    if (!this.mouseDownOnDropdown) {
      console.log('hiding contents')
      this.hideContents()
    }
  }

  showContents() {
    console.log('showing contents')
    this.setState({
      contentsVisible: true
    })
  }

  hideContents() {
    this.setState({
      contentsVisible: false
    })
  }

  mouseDownHandler() {
    this.mouseDownOnDropdown = true
  }

  mouseUpHandler() {
    this.mouseDownOnDropdown = false
  }

  render() {
    return (
      <div style={{position: 'relative'}}>
        <Button
          content={this.props.button}
          onClick={this.showContents}
          onMouseDown={this.mouseDownHandler}
          onMouseUp={this.mouseUpHandler}
        />
        {this.state.contentsVisible &&
          <div
            style={{position: 'absolute', zIndex: 1}}
            onMouseDown={this.mouseDownHandler}
            onMouseUp={this.mouseUpHandler}
          >
            {this.props.children}
          </div>
        }
      </div>
    )
  }
}
