import { Engine } from './core/gl/engine';

let _engine: Engine;

window.onload = function() {
  _engine = new Engine('viewport');
  _engine.start();
};

window.onresize = function() {
  _engine.resize();
}
