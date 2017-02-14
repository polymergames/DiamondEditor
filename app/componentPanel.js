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
      // case 'animatorSheet':
      //   PanelComponentVar = AnimatorSheetComponentPanel
      //   break
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

// prop spriteHandle should be the integer handle
// of the Diamond texture to be converted to a file link.
// prop onChange will be called with the new texture handle
// when the sprite in this field is changed.
class SpriteField extends React.Component {
  constructor(props) {
    super(props)
    this.openSprite = this.openSprite.bind(this)
  }

  // load a sprite from a file provided by the file picker
  openSprite() {
    openFilePicker(fileNames => {
      if (fileNames.length > 0) {
        let sprite = getTextureFromPath(fileNames[0])
        if (sprite) {
          this.props.onChange(sprite.handle)
        }
        else {
          console.log('Sprite ' + fileName + ' could not be loaded!');
        }
      }
    })
  }

  render() {
    let spritePath = getTexturePathFromHandle(this.props.spriteHandle)
    return (<span className="file-link" onClick={this.openSprite}>{spritePath}</span>)
  }
}

class RenderComponentPanel extends React.Component {
  constructor(props) {
    super(props)
    this.handleSpriteChange = this.handleSpriteChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleSpriteChange(spriteHandle) {
    // pass on the new sprite to the parent
    let renderObj = {}
    copyObj(this.props.object, renderObj)
    renderObj.sprite = {handle: spriteHandle}
    this.props.onChange(this.props.label, renderObj)
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
    // don't display the sprite handle- the path will be displayed instead
    let displayedObj = {}
    copyObj(this.props.object, displayedObj)
    delete displayedObj.sprite

    return (
      <div>
        <h3>{this.props.label}</h3>
        {this.props.object.sprite && (
          <p>{'sprite: '}
            <SpriteField
              spriteHandle={this.props.object.sprite.handle}
              onChange={this.handleSpriteChange}
            />
          </p>
        )}
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

// class AnimatorSheetComponentPanel extends React.Component {
//   //
// }

class ParticleComponentPanel extends React.Component {
  constructor(props) {
    super(props)
    this.handleSpriteChange = this.handleSpriteChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  // load a sprite from a file provided by the file picker
  handleSpriteChange(spriteHandle) {
    // pass on the new sprite to the parent
    let particleObj = {}
    copyObj(this.props.object, particleObj)
    particleObj.particleTexture = getTexturePathFromHandle(spriteHandle)
    this.props.onChange(this.props.label, particleObj)
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
    let sprite = getTextureFromPath(this.props.object.particleTexture)

    // remove the default display of the sprite path (will be replaced by link)
    let displayedObj = {}
    copyObj(this.props.object, displayedObj)
    delete displayedObj.particleTexture

    return (
      <div>
        <h3>{this.props.label}</h3>
        {sprite && (
          <p>{'particleTexture: '}
            <SpriteField
              spriteHandle={sprite.handle}
              onChange={this.handleSpriteChange}
            />
          </p>
        )}
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
