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

export function transformObjToConfig(transform, config) {
  config.scaleX = transform.scale.x
  config.scaleY = transform.scale.y
}

export function renderComponentObjToConfig(renderComponent, config) {
  // only get the filename from the texture path
  config.texture = getTexturePathFromHandle(renderComponent.sprite.handle).split(/\/|\\/).slice(-1)[0]
  config.renderLayer = renderComponent.layer
  config.pivotX = renderComponent.pivot.x
  config.pivotY = renderComponent.pivot.y
}

export function animatorSheetObjToConfig(animator, config) {
  Object.keys(animator).map(prop => {
    if (prop === 'spritesheet')
      config.texture = getTexturePathFromHandle(animator[prop].handle).split(/\/|\\/).slice(-1)[0]
    else
      config[prop] = animator[prop]
  })
}

export function circleColliderObjToConfig(collider, config) {
  config.centerX = collider.center.x
  config.centerY = collider.center.y
  config.radius = collider.radius
}

export function pointsArrayToConfig(points, config) {
  for (let i = 0; i < points.length; i++) {
    let xkey = 'x' + (i+1).toString(10)
    let ykey = 'y' + (i+1).toString(10)
    config[xkey] = points[i].x
    config[ykey] = points[i].y
  }
}

export function particleEmitterObjToConfig(particles, config) {
  Object.assign(config, particles)
  config.particleTexture = config.particleTexture.split(/\/|\\/).slice(-1)[0]
}
