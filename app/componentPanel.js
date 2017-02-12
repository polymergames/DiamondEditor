import electron from 'electron'
import React from 'react'
import {Button} from './button'
import {ObjectPanel, ArrayPanel} from './panel'
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
      case 'particleEmitter':
        PanelComponentVar = ParticleComponentPanel
        break
      case 'polygonCollider':
        PanelComponentVar = PointArrayComponentPanel
        break
      default:
        PanelComponentVar = ObjectPanel
    }

    if (PanelComponentVar) {
      return (
        <div className="component-panel">
          <PanelComponentVar
            label={this.props.label}
            object={this.props.object}
            onChange={this.props.onChange}
          />
        </div>
      )
    }
    return null
  }
}

class RenderComponentPanel extends React.Component {
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
        <h3>{this.props.label}</h3>
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

class ParticleComponentPanel extends React.Component {
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
          let particleObj = this.props.object
          particleObj.particleTexture = fileNames[0]
          this.props.onChange(this.props.label, particleObj)
        }
        else {
          console.log('Sprite ' + fileName + ' could not be loaded!');
        }
      }
    })
  }

  handleChange(componentName, displayedObj) {
    // the particleTexture value was removed from the displayed object,
    // so it should be added back before sending to the parent
    let particleObj = {}
    copyObj(displayedObj, particleObj)
    particleObj.particleTexture = this.props.object.particleTexture
    this.props.onChange(componentName, particleObj)
  }

  render() {
    let spritePath = this.props.object.particleTexture

    // remove the default display of the sprite path
    let displayedObj = {}
    copyObj(this.props.object, displayedObj)
    delete displayedObj.particleTexture

    return (
      <div>
        <h3>{this.props.label}</h3>
        <p>particleTexture: <span className="fileLink" onClick={this.openSprite}>{spritePath}</span></p>
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

class PointArrayComponentPanel extends React.Component {
  constructor(props) {
    super(props)
    this.addItem = this.addItem.bind(this)
  }

  addItem() {
    let array = this.props.object.slice(0)
    array.push({})
    copyObj(this.props.object[this.props.object.length - 1], array[this.props.object.length])
    this.props.onChange(this.props.label, array)
  }

  render() {
    return (
      <ArrayPanel
        label={this.props.label}
        object={this.props.object}
        onChange={this.props.onChange}
        addButtonContent={'+'}
        addItem={this.addItem}
      />
    )
  }
}
