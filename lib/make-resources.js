'use strict';

var streamingResource = require('./streaming-resource');

module.exports = function makeResources(resources) {
  return Object.keys(resources).reduce(function(memo, name) {
    var instanceName = name.charAt(0).toLowerCase() + name.slice(1);

    memo[instanceName] = streamingResource(instanceName, resources[name]);
    return memo;
  }, {});
};
