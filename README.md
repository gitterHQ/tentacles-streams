# tentacles-streams

A streaming GitHub client for pagenated results for node.js.

## What is Tentacles Streams?

Tentacles Streams is an adapter for the [Tentacles](https://github.com/gitterHQ/tentacles) GitHub client. It takes pagenated results from the GitHub API and returns a stream of results.

## Using Tentacles Streams

Install Tentacles Streams:

```shell
$ npm install tentacles-streams --save
```

```javascript
var TentaclesStreams = require('tentacles-streams');

/* Options are passed through to the tentacles client. */
var client = new TentaclesStreams({ accessToken: process.env.GITHUB_ACCESS_TOKEN });

/* Creates a ReadableStream in object stream mode. Options are passed through to Tentacles */
var stream = client.issue.listAllVisibleForAuthUser({ query: { state: 'all', per_page: 10 /* Will default to 100 */ } });

/* Pipe the stream somewhere */
stream.pipe(issueProcessor);

/* .. or use events .. */
stream.on('data', function(issue) {
  /* Do something with the issue */
});

stream.on('end', function() {
  /* All results have been read */
});

stream.on('error', function(err) {
  /* An error occurred */
});
```

## Supported Methods

All Tentacles methods starting with `list` are supported. Currently these are:

**Git Refs**:
* `tentacles.gitRef.listAll(full_name, options)`

**Issues**:
* `tentacles.issue.listAllVisibleForAuthUser(options)`
* `tentacles.issue.listAllOwnerAndMemberForAuthUser(options)`
* `tentacles.issue.listForOrgForAuthUser(org, options)`
* `tentacles.issue.listForRepo(full_name, options)`

**Orgs**:
* `tentacles.org.listForAuthUser(options)`
* `tentacles.org.listForUser(username, options)`

**Org Membership**:
* `tentacles.orgMember.listMembers(org, options)`
* `tentacles.orgMember.listPublicMembers(org, options)`
* `tentacles.orgMember.listMembershipsForAuthUser(options)`

**Pull Requests**:
* `tentacles.pullRequest.listForRepo(full_name, options)`
* `tentacles.pullRequest.listCommits(full_name, number, options)`
* `tentacles.pullRequest.listFiles(full_name, number, options)`

**Repos**:
* `tentacles.repo.listForAuthUser(options)`
* `tentacles.repo.listForUser(username, options)`
* `tentacles.repo.listForOrg(org, options)`
* `tentacles.repo.listContributors(full_name, options)`
* `tentacles.repo.listLanguages(full_name, options)`
* `tentacles.repo.listTeams(full_name, options)`
* `tentacles.repo.listTags(full_name, options)`
* `tentacles.repo.listBranches(full_name, options)`

**Repo Collaborators**:
* `tentacles.repoCollaborator.list(full_name, options)`

**Repo Commits**:
* `tentacles.repoCommit.list(full_name, options)`

**Starring**:
* `tentacles.starring.listForRepo(full_name, options)`
* `tentacles.starring.listForUser(username, options)`
* `tentacles.starring.listForAuthUser(options)`

**User Emails**:
* `tentacles.userEmail.listForAuthUser(options)`

**User Followers**:
* `tentacles.userFollower.listForUser(username, options)`
* `tentacles.userFollower.listForAuthUser(options)`
* `tentacles.userFollower.listFollowingForUser(username, options)`
* `tentacles.userFollower.listFollowingForAuthUser(options)`

**Watching**:
* `tentacles.watching.listForRepo(full_name, options)`
* `tentacles.watching.listForUser(username, options)`
* `tentacles.watching.listForAuthUser(options)`

## Progress

If you want to get a rough idea of the progress of the stream, you can do this
by passing `stream: { progress: true }` through the options hash. The stream will
then consist of hashes with `{ item: page: lastPage: pageIndex: pageLength: }`.

```javascript
var TentaclesStreams = require('tentacles-streams');

var client = new TentaclesStreams();
var stream = client.issue.listForRepo('ruby/ruby', { stream: { progress: true } });

/* .. or use events .. */
stream.on('data', function(data) {
  var issue = data.item;
  console.log('Page #' + data.page + ' of #' + data.lastPage); // Page #1 of #3
  console.log('Item #' + data.pageIndex ' of #' + (data.pageLength - 1)); // Item #0 of #99
});
```

## Skipping results

If you want to skip some pages in the results, set `{ query: { page: X } }` in the options hash.

```javascript
var TentaclesStreams = require('tentacles-streams');

var client = new TentaclesStreams();
var stream = client.issue.listForRepo('ruby/ruby', { query: { page: 5 } });

/* Will start streaming from page 5 of results */
```



### Contributing

Built by [Andrew Newdigate](https://github.com/suprememoocow)
([@suprememoocow](https://twitter.com/suprememoocow)) and the team at
[Gitter](https://gitter.im).

Pull requests are welcome!

### Licence

```
The MIT License (MIT)

Copyright (c) 2015 Gitter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
