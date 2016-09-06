# tentacles-streams

A streaming GitHub client for pagenated results for node.js.

## What is Tentacles Streams?

Tentacles Streams is an adapter for the [Tentacles](https://github.com/gitterHQ/tentacles) GitHub client. It takes pagenated results from the GitHub API and returns a stream of results. All pages of results will automatically be fetched from GitHub.

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

**Events**:
* `tentacles.events.listPublic(options)`
* `tentacles.events.listForRepo(full_name, options)`
* `tentacles.events.listIssueEventsForRepo(full_name, options)`
* `tentacles.events.listNetworkEventsForRepo(full_name, options)`
* `tentacles.events.listForOrg(org, options)`
* `tentacles.events.listReceivedEventsForUser(username, options)`
* `tentacles.events.listPublicReceivedEventsForUser(username, options)`
* `tentacles.events.listEventsForUser(username, options)`
* `tentacles.events.listPublicEventsForUser(username, options)`
* `tentacles.events.listForUserInOrg(username, org, options)`

**GitRef**:
* `tentacles.gitRef.listAll(full_name, ref, options)`

**Issue**:
* `tentacles.issue.listAllVisibleForAuthUser(options)`
* `tentacles.issue.listAllOwnerAndMemberForAuthUser(options)`
* `tentacles.issue.listForOrgForAuthUser(full_name, options)`
* `tentacles.issue.listForRepo(full_name, options)`

**IssueComment**:
* `tentacles.issueComment.listForIssue(full_name, number, options)`
* `tentacles.issueComment.listForRepo(full_name, options)`

**IssueLabel**:
* `tentacles.issueLabel.listForRepo(full_name, options)`
* `tentacles.issueLabel.listForIssue(full_name, number, options)`
* `tentacles.issueLabel.listForMilestone(full_name, number, options)`

**Org**:
* `tentacles.org.listForAuthUser(options)`
* `tentacles.org.listForUser(username, options)`
* `tentacles.org.listAll(options)`

**OrgMember**:
* `tentacles.orgMember.listMembers(org, options)`
* `tentacles.orgMember.listPublicMembers(org, options)`
* `tentacles.orgMember.listMembershipsForAuthUser(options)`

**OrgTeam**:
* `tentacles.org.listForOrg(org, options)`
* `tentacles.org.listMembers(id, options)`
* `tentacles.org.listRepos(id, options)`
* `tentacles.org.listForAuthUser(full_name, options)`

**PullRequest**:
* `tentacles.pullRequest.listForRepo(full_name, options)`
* `tentacles.pullRequest.listCommits(full_name, number, options)`
* `tentacles.pullRequest.listFiles(full_name, number, options)`

**PullRequestComment**:
* `tentacles.pullRequestComments.listForPullRequest(full_name, number, options)`
* `tentacles.pullRequestComments.listForRepo(full_name, options)`

**Reaction**:
* `tentacles.reactions.listForCommitComment(full_name, id, options)`
* `tentacles.reactions.listForIssue(full_name, number, options)`
* `tentacles.reactions.listForIssueComment(full_name, id, options)`
* `tentacles.reactions.listForPullRequestReviewComment(full_name, id, options)`

**Repo**:
* `tentacles.repo.listForAuthUser(options)`
* `tentacles.repo.listForUser(username, options)`
* `tentacles.repo.listForOrg(org, options)`
* `tentacles.repo.listContributors(full_name, options)`
* `tentacles.repo.listLanguages(full_name, options)`
* `tentacles.repo.listTeams(full_name, options)`
* `tentacles.repo.listTags(full_name, options)`
* `tentacles.repo.listBranches(full_name, options)`

**RepoCollaborator**:
* `tentacles.repoCollaborator.list(full_name, options)`

**RepoCommit**:
* `tentacles.repoCommit.list(full_name, options)`

**RepoWebhooks**:
* `tentacles.repoWebHooks.list(full_name, options)`

**Starring**:
* `tentacles.starring.listForRepo(full_name, options)`
* `tentacles.starring.listForUser(username, options)`
* `tentacles.starring.listForAuthUser(options)`

**User**:
* `tentacles.user.listAll(options)`

**UserEmail**:
* `tentacles.userEmail.listForAuthUser(options)`

**UserFollower**:
* `tentacles.userFollower.listForUser(username, options)`
* `tentacles.userFollower.listForAuthUser(options)`
* `tentacles.userFollower.listFollowingForUser(username, options)`
* `tentacles.userFollower.listFollowingForAuthUser(options)`

**Watching**:
* `tentacles.watching.listForRepo(full_name, options)`
* `tentacles.watching.listForUser(username, options)`
* `tentacles.watching.listForAuthUser(options)`

## Batching Pages

You can configure Tentacles Streams to pump the each page of results through as
an hash of `{ items: [], page: n, lastPage: m }`, rather than individual items.
To do this, set `{ stream: { batchPages: true } }` in the options hash.

```javascript
var TentaclesStreams = require('tentacles-streams');

var client = new TentaclesStreams();
var stream = client.issue.listForRepo('ruby/ruby', { stream: { batchPages: true } });

stream.on('data', function(data) {
  console.log(data.items.length); // 100 (or `per_page`) items
  console.log(data.page); // 1 - n
  console.log(data.lastPage); // n
});
```

## Backpressure, Pause and Resume

The streams support backpressure and `pause` and `resume`

```javascript
var TentaclesStreams = require('tentacles-streams');

var client = new TentaclesStreams();
var stream = client.issue.listForRepo('ruby/ruby');

var count = 0;
stream.on('data', function(issue) {
  console.log(issue);

  /* Pause for 1s every hundred issues */
  if (++count % 100 === 0) {
    stream.pause();
    setTimeout(function() {
      stream.resume();
    }, 1000);
  }
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
