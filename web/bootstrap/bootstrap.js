(function (root) {
  'use strict';

  if (
    root.PROFIT_LENS_BOOTSTRAP_APP &&
    typeof root.PROFIT_LENS_BOOTSTRAP_APP.start === 'function'
  ) {
    root.PROFIT_LENS_BOOTSTRAP_APP.start();
  }
})(window);
