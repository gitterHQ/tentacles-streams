'use strict';

var Tentacles = require('tentacles');
var makeResources = require('./make-resources');
var es = require('event-stream');
var _ = require('lodash');
var parseLinks = require('parse-links');
var url = require('url');

var resources = makeResources(Tentacles.resources);

var DEFAULT_PERPAGE = 100;

function TentaclesStreams(options) {
  this._tentacles = new Tentacles(options);
  var self = this;
  Object.keys(resources).forEach(function(name) {
    self[name] = new resources[name](self);
  });
}

function getTotalPages(headers) {
  if (!headers.link) return;
  var links = parseLinks(headers.link);

  if (!links.last) return;
  var parsed = url.parse(links.last, true);
  return parseInt(parsed.query.page, 10);
}

TentaclesStreams.prototype = {
  _streamMethod: function(resource, fn, args) {
    var spec = fn.spec;
    var argCount = spec.urlParams && spec.urlParams.length || 0;

    // Replace or create the options argument
    var options = args[argCount] = _.extend({}, args[argCount]); // Clone

    options.spread = true;

    var query = options.query;
    if (!query) query = options.query = {};
    if (!query.per_page) query.per_page = DEFAULT_PERPAGE;
    var perPage = query.per_page;
    var initialPage = query.page || 1;
    var progress = options.stream && options.stream.progress;

    return es.readable(function (count, callback) {
      var page = initialPage + count;
      query.page = page;
      var self = this;

      fn.apply(resource, args)
        .spread(function(results, response) {
          var lastPage = getTotalPages(response.headers) || page;

          if (!results) {
            return self.emit('end');
          }

          results.forEach(function(result, index) {
            if (progress) {
              self.emit('data', { item: result, page: page, lastPage: lastPage, pageIndex: index, pageLength: results.length });
            } else {
              self.emit('data', result);
            }
          });

          if (results.length < perPage) {
            return self.emit('end');
          }

          if (page === lastPage) {
            return self.emit('end');
          }

          callback();
        })
        .catch(callback);
    });
  }
};

module.exports = TentaclesStreams;
