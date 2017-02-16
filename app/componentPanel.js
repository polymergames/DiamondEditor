import electron from 'electron'
import React from 'react'
import {Button} from './button'
import {ObjectPanel, ArrayPanel} from './panel'
import * as Util from './util'

// Diamond functions
const getTextureFromPath = electron.remote.getGlobal('getTextureFromPath')
const getTexturePathFromHandle = electron.remote.getGlobal('getTexturePathFromHandle')
const openFilePicker = electron.remote.getGlobal('openFilePicker')
const saveKeyVals = electron.remote.getGlobal('saveKeyVals')
// const entityChannel = 'setEntity'

// renders the appropriate UI panel for editing the given Diamond component
export class ComponentPanel extends React.Component {
  render() {
    let PanelComponentVar = null

    switch(this.props.label) {
      case 'renderComponent':
        PanelComponentVar = RenderComponentPanel
        break
      case 'animatorSheet':
        PanelComponentVar = AnimatorSheetComponentPanel
        break
      case 'circleCollider':
        PanelComponentVar = CircleColliderComponentPanel
        break
      case 'polygonCollider':
        PanelComponentVar = PointArrayComponentPanel
        break
      case 'particleEmitter':
        PanelComponentVar = ParticleComponentPanel
        break
      default:
        PanelComponentVar = ObjectPanel
    }

    if (PanelComponentVar) {
      return (
        <div className="component-panel">
          <div className="close-button-container">
            {this.props.label != 'transform' && (
              <Button
                content="x"
                onClick={e => this.props.onClose(this.props.label)}
              />
            )}
          </div>
          <PanelComponentVar
            label={this.props.label}
            object={this.props.object}
            onChange={this.props.onChange}
          />
          <div className="save-button-container">
            {this.props.label != 'rigidbody' &&
              // TODO: opening the save dialog breaks the renderer for some reason
              (
                <Button
                  content="save"
                  onClick={e => {
                    let config = {}
                    Util.componentObjToConfig(this.props.label, this.props.object, config)
                    // send config to main process to save in a file
                    saveKeyVals(config)
                    // ipcRenderer.send(entityChannel, config)
                  }}
                />
              )
            // See
            // http://stackoverflow.com/questions/11336663/how-to-make-a-browser-display-a-save-as-dialog-so-the-user-can-save-the-conten
            // <a href="data:application/xml;charset=utf-8,swag" download="component.cfg">save</a>
            }
          </div>
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
    Util.copyObj(this.props.object, renderObj)
    renderObj.sprite = {handle: spriteHandle}
    this.props.onChange(this.props.label, renderObj)
  }

  handleChange(componentName, displayedObj) {
    // the sprite object was removed from the displayed object,
    // so it should be added back before sending to the parent
    let renderObj = {}
    Util.copyObj(displayedObj, renderObj)
    renderObj.sprite = this.props.object.sprite
    this.props.onChange(componentName, renderObj)
  }

  render() {
    // don't display the sprite handle- the path will be displayed instead
    let displayedObj = {}
    Util.copyObj(this.props.object, displayedObj)
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

class AnimatorSheetComponentPanel extends React.Component {
  constructor(props) {
    super(props)
    this.handleSpriteChange = this.handleSpriteChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleSpriteChange(spriteHandle) {
    // pass on the new spritesheet to the parent
    let obj = {}
    Util.copyObj(this.props.object, obj)
    obj.spritesheet = {handle: spriteHandle}
    this.props.onChange(this.props.label, obj)
  }

  handleChange(componentName, displayedObj) {
    // the spritesheet object was removed from the displayed object,
    // so it should be added back before sending to the parent
    let obj = {}
    Util.copyObj(displayedObj, obj)
    obj.spritesheet = this.props.object.spritesheet
    this.props.onChange(componentName, obj)
  }

  render() {
    // don't display the spritesheet handle- the path will be displayed instead
    let displayedObj = {}
    Util.copyObj(this.props.object, displayedObj)
    delete displayedObj.spritesheet

    return (
      <div>
        <h3>{this.props.label}</h3>
        <p>{'spritesheet: '}
          <SpriteField
            spriteHandle={this.props.object.spritesheet.handle}
            onChange={this.handleSpriteChange}
          />
        </p>
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
    this.handleSpriteChange = this.handleSpriteChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  // load a sprite from a file provided by the file picker
  handleSpriteChange(spriteHandle) {
    // pass on the new sprite to the parent
    let particleObj = {}
    Util.copyObj(this.props.object, particleObj)
    particleObj.particleTexture = getTexturePathFromHandle(spriteHandle)
    this.props.onChange(this.props.label, particleObj)
  }

  handleChange(componentName, displayedObj) {
    // the particleTexture value was removed from the displayed object,
    // so it should be added back before sending to the parent
    let particleObj = {}
    Util.copyObj(displayedObj, particleObj)
    particleObj.particleTexture = this.props.object.particleTexture
    this.props.onChange(componentName, particleObj)
  }

  render() {
    let sprite = getTextureFromPath(this.props.object.particleTexture)

    // remove the default display of the sprite path (will be replaced by link)
    let displayedObj = {}
    Util.copyObj(this.props.object, displayedObj)
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

class CircleColliderComponentPanel extends React.Component {
  render() {
    return (
      <ObjectPanel
        label={this.props.label}
        object={this.props.object}
        onChange={this.props.onChange}
      />
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
    Util.copyObj(this.props.object[this.props.object.length - 1], array[this.props.object.length])
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
