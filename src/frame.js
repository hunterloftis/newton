;(function(Newton) {

  'use strict';

  'use strict'

  var lastTime = 0;

  // Browsers
  if (typeof window !== 'undefined') {
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isChrome = !!window.chrome && !isOpera;

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = timeoutFrame;
      window.cancelAnimationFrame = cancelTimeoutFrame;
    }

    Newton.frame = window.requestAnimationFrame.bind(window);         // TODO: shim Function.bind?
    Newton.cancelFrame = window.cancelAnimationFrame.bind(window);
  }

  // Node
  else {
    Newton.frame = timeoutFrame;
    Newton.cancelFrame = cancelTimeoutFrame;
  }

  function timeoutFrame(simulator, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = setTimeout(function() { simulator(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };

  function cancelTimeoutFrame(id) {
    clearTimeout(id);
  };

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
