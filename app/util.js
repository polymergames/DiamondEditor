import electron from 'electron'

const getTexturePathFromHandle = electron.remote.getGlobal('getTexturePathFromHandle')

export function copyObj(from, to) {
  return Object.assign(to, from)
}

export function componentObjToConfig(componentName, component, config) {
  switch (componentName) {
    case 'transform':
      transformObjToConfig(component, config)
      break
    case 'renderComponent':
      renderComponentObjToConfig(component, config)
      break
    case 'animatorSheet':
      animatorSheetObjToConfig(component, config)
      break
    case 'circleCollider':
      circleColliderObjToConfig(component, config)
      break
    case 'polygonCollider':
      pointsArrayToConfig(component, config)
      break
    case 'particleEmitter':
      particleEmitterObjToConfig(component, config)
      break
    default:
      Object.assign(config, component)
  }
}

export function configToComponentObj(componentName, config, obj) {
  switch (componentName) {
    case 'transform':
      return transformConfigToObj(config, obj)
      break
    case 'renderComponent':
      return renderComponentConfigToObj(config, obj)
      break
    case 'animatorSheet':
      return animatorSheetConfigToObj(config, obj)
      break
    case 'circleCollider':
      return circleColliderConfigToObj(config, obj)
      break
    case 'polygonCollider':
      return pointsConfigToArray(config)
      break
    case 'particleEmitter':
      return particleEmitterConfigToObj(config, obj)
      break
    default:
      return Object.assign(obj, config)
  }
}

export function transformObjToConfig(transform, config) {
  config.scaleX = transform.scale.x
  config.scaleY = transform.scale.y
}

export function transformConfigToObj(config, obj) {
  if (config.hasOwnProperty('scaleX') && config.hasOwnProperty('scaleY')) {
    obj.scale = {
      x: (typeof config.scaleX === 'string' ? parseFloat(config.scaleX) : config.scaleX),
      y: (typeof config.scaleY === 'string' ? parseFloat(config.scaleY) : config.scaleY)
    }
  }
  return obj
}


export function renderComponentObjToConfig(renderComponent, config) {
  // only get the filename from the texture path
  config.texture = getTexturePathFromHandle(renderComponent.sprite.handle).split(/\/|\\/).slice(-1)[0]
  config.renderLayer = renderComponent.layer
  config.pivotX = renderComponent.pivot.x
  config.pivotY = renderComponent.pivot.y
}

// ignores the texture field
export function renderComponentConfigToObj(config, obj) {
  if (config.hasOwnProperty('renderLayer'))
    obj.layer = typeof config.renderLayer === 'string' ? parseInt(config.renderLayer) : config.renderLayer

  if (config.hasOwnProperty('pivotX') && config.hasOwnProperty('pivotY')) {
    obj.pivot = {
      x: (typeof config.pivotX === 'string' ? parseFloat(config.pivotX) : config.pivotX),
      y: (typeof config.pivotY === 'string' ? parseFloat(config.pivotY) : config.pivotY)
    }
  }
  return obj
}


export function animatorSheetObjToConfig(animator, config) {
  Object.keys(animator).map(prop => {
    if (prop === 'spritesheet')
      config.texture = getTexturePathFromHandle(animator[prop].handle).split(/\/|\\/).slice(-1)[0]
    else
      config[prop] = animator[prop]
  })
}

// ignores the texture field
export function animatorSheetConfigToObj(config, obj) {
  Object.keys(config).map(prop => {
    if (prop !== 'texture') {
      obj[prop] = typeof config[prop] === 'string' ? parseInt(config[prop]) : config[prop]
    }
  })
  return obj
}


export function circleColliderObjToConfig(collider, config) {
  config.centerX = collider.center.x
  config.centerY = collider.center.y
  config.radius = collider.radius
}

export function circleColliderConfigToObj(config, obj) {
  if (config.hasOwnProperty('centerX') && config.hasOwnProperty('centerY')) {
    obj.center = {
      x: (typeof config.centerX === 'string' ? parseFloat(config.centerX) : config.centerX),
      y: (typeof config.centerY === 'string' ? parseFloat(config.centerY) : config.centerY)
    }
  }

  if (config.hasOwnProperty('radius'))
    obj.radius = typeof config.radius === 'string' ? parseFloat(config.radius) : config.radius

  return obj
}


export function pointsArrayToConfig(points, config) {
  for (let i = 0; i < points.length; i++) {
    let xkey = 'x' + (i+1).toString(10)
    let ykey = 'y' + (i+1).toString(10)
    config[xkey] = points[i].x
    config[ykey] = points[i].y
  }
}

export function pointsConfigToArray(config) {
  let array = []

  let index = 1
  while (true) {
    let xprop = 'x' + index.toString(10)
    let yprop = 'y' + index.toString(10)

    if (config.hasOwnProperty(xprop) && config.hasOwnProperty(yprop)) {
      array.push({
        x: (typeof config[xprop] === 'string' ? parseFloat(config[xprop]) : config[xprop]),
        y: (typeof config[yprop] === 'string' ? parseFloat(config[yprop]) : config[yprop])
      })
    }
    else {
      break
    }

    index += 1
  }

  return array
}


export function particleEmitterObjToConfig(particles, config) {
  Object.assign(config, particles)
  config.particleTexture = config.particleTexture.split(/\/|\\/).slice(-1)[0]
}

// ignores the particleTexture field
export function particleEmitterConfigToObj(config, obj) {
  Object.keys(config).map(prop => {
    if (prop !== 'particleTexture') {
      // these are the boolean fields
      if (prop === 'animateScale' ||
          prop === 'accelerate' ||
          prop === 'animateColor' ||
          prop === 'emitOnWake') {
        switch (config[prop].toLowerCase()) {
          case '1':
          case 'y':
          case 't':
          case 'yes':
          case 'true':
            obj[prop] = true
            break
          default:
            obj[prop] = false
        }
      }
      // everything else is assumed to be a number
      else {
        obj[prop] = typeof config[prop] === 'string' ? parseFloat(config[prop]) : config[prop]
      }
    }
  })

  return obj
}
