import electron from 'electron'
import React from 'react'
import {Button} from './button'
import {ObjectPanel} from './panel'
import {copyObj} from './util'

// Diamond functions
const getTextureFromPath = electron.remote.getGlobal('getTextureFromPath')
const getTexturePathFromHandle = electron.remote.getGlobal('getTexturePathFromHandle')
const openFilePicker = electron.remote.getGlobal('openFilePicker')

// renders the appropriate UI panel for editing the given Diamond component
export class ComponentPanel extends React.Component {
  render() {
    let PanelComponentVar = null

    switch(this.props.label) {
      case 'renderComponent':
        PanelComponentVar = RenderComponentPanel
        break
      default:
        PanelComponentVar = ObjectPanel
    }

    if (PanelComponentVar) {
      return (
        <PanelComponentVar
          label={this.props.label}
          object={this.props.object}
          onChange={this.props.onChange}
        />
      )
    }
    return null
  }
}

export class RenderComponentPanel extends React.Component {
  constructor(props) {
    super(props)
    this.openSprite = this.openSprite.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  // load a sprite from a file provided by the file picker
  openSprite() {
    openFilePicker(fileNames => {
      if (fileNames.length > 0) {
        let sprite = getTextureFromPath(fileNames[0])
        if (sprite) {
          let renderObj = this.props.object
          renderObj.sprite = sprite
          this.props.onChange(this.props.label, renderObj)
        }
        else {
          console.log('Sprite ' + fileName + ' could not be loaded!');
        }
      }
    })
  }

  handleChange(componentName, displayedObj) {
    // the sprite object was removed from the displayed object,
    // so it should be added back before sending to the parent
    let renderObj = {}
    copyObj(displayedObj, renderObj)
    renderObj.sprite = this.props.object.sprite
    this.props.onChange(componentName, renderObj)
  }

  render() {
    let spritePath = null
    if (this.props.object.sprite) {
      spritePath = getTexturePathFromHandle(this.props.object.sprite.handle)
    }

    // don't display the sprite handle- the path will be displayed instead
    let displayedObj = {}
    copyObj(this.props.object, displayedObj)
    delete displayedObj.sprite

    return (
      <div>
        <p>{this.props.label}</p>
        <p>sprite: <span className="fileLink" onClick={this.openSprite}>{spritePath}</span></p>
        <ObjectPanel
          label={this.props.label}
          hideLabel={true}
          object={displayedObj}
          onChange={this.handleChange}
        />
      </div>
    )
  }
}
