'use strict';

var streamingMethod = require('./streaming-method');

module.exports = function streamingResource(name, resource) {
  function StreamingResource(client) {
    this._client = client;
    this._resource = client._tentacles[name];
  }

  StreamingResource.prototype = Object.keys(resource.prototype).reduce(function(memo, name) {
    if (/^list/.test(name)) {
      memo[name] = streamingMethod(resource.prototype[name]);
    }
    return memo;
  }, {});

  return StreamingResource;
};
