'use strict';

var TentaclesStreams = require('..');
var assert = require('assert');

describe('streaming-client', function() {
  this.timeout(25000);

  it('should stream issues for users', function(done) {
    if (!process.env.GITHUB_ACCESS_TOKEN) {
      done(new Error('Please set GITHUB_ACCESS_TOKEN environment variable'));
    }

    var client = new TentaclesStreams({ accessToken: process.env.GITHUB_ACCESS_TOKEN });
    var stream = client.issue.listAllVisibleForAuthUser({ query: { state: 'all', per_page: 10 } });

    var count = 0;
    stream.on('data', function() {
      ++count;
    });

    stream.on('end', function() {
      // This is very arbitary. TODO: better tests!
      assert(count > 10);
      done();
    });

    stream.on('error', done);
  });

  it('should stream issues for repos', function(done) {
    var client = new TentaclesStreams({ accessToken: process.env.GITHUB_ACCESS_TOKEN });
    var stream = client.issue.listForRepo('ruby/ruby', { query: { state: 'all' } });

    var count = 0;
    stream.on('data', function() {
      ++count;
    });

    stream.on('end', function() {
      done();
    });

    stream.on('error', done);
  });

  it('should stream with batches', function(done) {
    var client = new TentaclesStreams({ accessToken: process.env.GITHUB_ACCESS_TOKEN });
    var stream = client.issue.listForRepo('ruby/ruby', { query: { state: 'all' }, stream: { batchPages: true } });

    stream.on('data', function(data) {
      assert(data.length > 0);
      assert(Array.isArray(data));
    });

    stream.on('end', function() {
      done();
    });

    stream.on('error', done);
  });

});
