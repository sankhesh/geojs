var inherit = require('../inherit');
var registerRenderer = require('../registry').registerRenderer;
var renderer = require('../renderer');
var vtk = require('vtk.js');
var vtkFullScreenRenderWindow = vtk.Rendering.Misc.vtkFullScreenRenderWindow;

/**
 * Create a new instance of class vtkjsRenderer
 *
 * @class geo.gl.vtkjsRenderer
 * @extends geo.renderer
 * @param canvas
 * @returns {geo.gl.vtkjsRenderer}
 */
var vtkjsRenderer = function (arg) {
  'use strict';

  if (!(this instanceof vtkjsRenderer)) {
    return new vtkjsRenderer(arg);
  }
  arg = arg || {};
  renderer.call(this, arg);

  var mat4 = require('gl-mat4');
  var geo_event = require('../event');

  var m_this = this,
      m_width = 0,
      m_height = 0,
      s_init = this._init;

  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    background: [0.1, 0.5, 0.5] });
  const vtkjsren = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();

  /**
   * Return width of the renderer
   */
  this.width = function () {
    return m_width;
  };

  /**
   * Return height of the renderer
   */
  this.height = function () {
    return m_height;
  };

  /**
   * Get context specific renderer
   */
  this.contextRenderer = function () {
    return vtkjsren;
  };

  /**
   * Get API used by the renderer
   */
  this.api = function () {
    return 'vtkjs';
  };

  /**
   * Initialize
   */
  this._init = function () {
    if (m_this.initialized()) {
      return m_this;
    }

    s_init.call(m_this);

    /* Initialize the size of the renderer */
    var map = m_this.layer().map(),
        mapSize = map.size();
    m_this._resize(0, 0, mapSize.width, mapSize.height);
    return m_this;
  };

  /**
   * Handle resize event
   */
  this._resize = function (x, y, w, h) {
    m_this._render();

    return m_this;
  };

  /**
   * Render.  This actually schedules rendering for the next animation frame.
   */
  this._render = function () {
    /* If we are already scheduled to render, don't schedule again.  Rather,
     * mark that we should render after other animation frame requests occur.
     * It would be nice if we could just reschedule the call by removing and
     * readding the animation frame request, but this doesn't work for if the
     * reschedule occurs during another animation frame callback (it then waits
     * until a subsequent frame). */
    m_this.layer().map().scheduleAnimationFrame(this._renderFrame, true);
    return m_this;
  };

  /**
   * This clears the render timer and actually renders.
   */
  this._renderFrame = function () {
    m_this._updateRendererCamera();
    renderWindow.render();
  };

  /**
   * Exit
   */
  this._exit = function () {
    // DO NOTHING
  };

  this._updateRendererCamera = function () {
    var map = m_this.layer().map(),
        camera = map.camera(),
        view = camera.view,
        proj = camera.projectionMatrix;
    const viewmat = mat4.create();
    mat4.copy(viewmat, view);
    const projmat = mat4.create();
    mat4.copy(projmat, proj);
    m_this.contextRenderer().getActiveCamera().setViewMatrix(viewmat);
    m_this.contextRenderer().getActiveCamera().setProjectionMatrix(projmat);
  };

  /**
   * Connect to pan event.  This is sufficient, as all zooms and rotations also
   *produce a pan
   */
  m_this.layer().geoOn(geo_event.pan, function (evt) {
    // DO NOTHING
  });

  /**
   * Connect to parallelprojection event
   */
  m_this.layer().geoOn(geo_event.parallelprojection, function (evt) {
    // DO NOTHING
  });

  return this;
};

inherit(vtkjsRenderer, renderer);

registerRenderer('vtkjs', vtkjsRenderer);

module.exports = vtkjsRenderer;