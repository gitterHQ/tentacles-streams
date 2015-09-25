'use strict';

var TentaclesStreams = require('..');
var assert = require('assert');

function doneOnStream(stream, done) {
  var finished = false;
  stream.on('end', function() {
    // Deal with end before error
    setTimeout(function() {
      if (!finished) {
        finished = true;
        done();
      }
    }, 10);
  });

  stream.on('error', function(err) {
    finished = true;
    done(err);
  });

}


describe('streaming-client', function() {
  this.timeout(25000);

  it('should stream issues for repos', function(done) {
    var client = new TentaclesStreams({ accessToken: process.env.GITHUB_ACCESS_TOKEN });
    var stream = client.issue.listForRepo('ruby/ruby', { query: { state: 'all' } });

    var count = 0;
    stream.on('data', function() {
      ++count;
    });

    doneOnStream(stream, done);
  });

  it('should respect the maxPages parameter', function(done) {
    var client = new TentaclesStreams({ accessToken: process.env.GITHUB_ACCESS_TOKEN });
    var stream = client.issue.listForRepo('ruby/ruby', { query: { state: 'all', per_page: 20 }, maxPages: 2 });

    var count = 0;
    stream.on('data', function() {
      ++count;
    });

    doneOnStream(stream, function(err) {
      if (err) return done(err);
      assert.strictEqual(count, 40);
      done();
    });
  });

  it('should stream with batches', function(done) {
    var client = new TentaclesStreams({ accessToken: process.env.GITHUB_ACCESS_TOKEN });
    var stream = client.issue.listForRepo('ruby/ruby', { query: { state: 'all' }, stream: { batchPages: true } });

    stream.on('data', function(data) {
      assert(Array.isArray(data.items));
      assert(data.items.length > 0);
      assert(data.page > 0);
      assert(data.lastPage > 0);
    });

    doneOnStream(stream, done);

  });

});
