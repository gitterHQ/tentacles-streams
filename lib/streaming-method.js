'use strict';

module.exports = function streamingMethod(fn) {
  return function() {
    var args = Array.prototype.slice.apply(arguments);
    return this._client._streamMethod(this._resource, fn, args);
  };
};
