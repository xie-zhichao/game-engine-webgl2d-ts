import { Engine } from './core/gl/engine';

(function appStartup () {
  let _engine: Engine;

  window.onload = function() {
    try {
      _engine = new Engine('viewport');
      _engine.start();
    } catch (error) {
      console.error('engine startup failed!', error);
    }
  };
  
  window.onresize = function() {
    _engine.resize();
  }

  window.onerror = (event, source, lineno, colno, error) => {
    console.error('engine fires error!', event, source, lineno, colno, error);
  };

})();
