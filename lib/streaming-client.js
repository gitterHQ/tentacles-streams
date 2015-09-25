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
    var maxPages = options && options.maxPages;

    options.spread = true;

    var query = options.query;
    if (!query) query = options.query = {};
    if (!query.per_page) query.per_page = DEFAULT_PERPAGE;
    var perPage = query.per_page;
    var initialPage = query.page || 1;


    var batchPages = options.stream && options.stream.batchPages;

    return es.readable(function (count, callback) {
      var page = initialPage + count;
      query.page = page;
      var self = this;

      fn.apply(resource, args)
        .spread(function(results, response) {
          var lastPage = getTotalPages(response.headers) || page;

          // No results? End the stream
          if (!results || !results.length) {
            return self.emit('end');
          }

          // Pump out the date
          if (batchPages) {
            self.emit('data', {
              items: results,
              page: page,
              lastPage: lastPage
            });
          } else {
            results.forEach(function(result) {
              self.emit('data', result);
            });
          }

          // If we get back less than one page of results,
          // or we're on the last page, end the stream
          if (results.length < perPage || page === lastPage) {
            return self.emit('end');
          }

          if (maxPages && count >= maxPages - 1) {
            // Maximum number of pages have been read.
            // In future, it may be useful to emit some sort of `truncate` event.
            return self.emit('end');
          }

          callback(); // Ready to continue...
        })
        .catch(callback);
    });
  }
};

module.exports = TentaclesStreams;
