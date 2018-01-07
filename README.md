<p align="center" style="color: #343a40">
  <img src="./.github/logo.svg" alt="logo" height="150" width="150">
  <h1 align="center">Stacker</h1>
</p>

<p align="center">Intuitive and automated way for creating and reviewing stacked pull requests on Github<br/> <a href="https://chrome.google.com/webstore/detail/apkgobbdndlnnelabdjdapopocfcgbhf">Download the Chrome extension</a></p>

![Status](https://travis-ci.com/rikukissa/stacker.svg?token=zwBSeTmkrmCBprBpJMHF&branch=develop)

Stacker is a Chrome extension that makes working with stacked pull requests easier both for PR authors and reviewers. Github's UI provides a lot of useful features for working with stacked PRs out of the box. However, many of those features require you to follow manual, repeatitive steps, that this extension automates for you.

## So what are stacked pull requests?

TODO

## Stacking options

[purple]: https://placehold.it/15/7057ff/000000?text=+
[yellow]: https://placehold.it/15/FBCA04/000000?text=+

[Change the base branch of a Pull Request](https://github.com/blog/2224-change-the-base-branch-of-a-pull-request)

### Each PRs' base set to parent PR's branch

<img src="./.github/based-pr.svg" height="150">

Pros:
- Diff ("Files change" view) only shows changes from ![PR 2][yellow]


Cons:
- ![PR 1][purple] can't be merged to upstream before ![PR 2][yellow] is reviewed and merged to ![PR 1][purple].
 - Feature can only be shipped forward when all child PRs are ready.
- If ![PR 1][purple] still gets merged before, failing to update ![PR 2][yellow]'s base before merging will lead into it being merged to a stale branch.

### All PRs based on upstream (Suggested when using the extension)

<img src="./.github/upstream-pr.svg" height="150">

Pros:
- No tinkering with PRs' base

Cons:
- "Files changed" view and all the other ![PR 2][yellow]'s views are now cluttered with changes related to ![PR 1][purple].
  - Stacker automatically hides all of these
- ![PR 1][purple] can get merged accidentally if ![PR 2][yellow] is merged first


---

## Installation
**Give it a go:**

1. Download [the extension](https://chrome.google.com/webstore/detail/apkgobbdndlnnelabdjdapopocfcgbhf)

**If you like it and want to keep on using it:**

2. Generate a new personal access token with following permissions: <br/><img alt="Required permissions" src="./.github/permissions.png" width="174px" />
3. Open up Stacker options by clicking the extension icon at the right-top corner of your Chrome window. You'll notice that **access token** field for github.com domain is empty. Paste your token there and you're all set!

**For Github Enterprise users:**

4. Add a new domain and access token from Stacker options (step 3).

---

## Features


<h3 align="center">Mark pull request as dependent of your previous work</h3>


|<img alt="Pull request order visible in pull requests" src="./.github/list-view.png" width="513px" /> | <img alt="Select parent pull request" src="./.github/parent-selector.png" width="320px" /> |
|--|--|

<p>
  When reviewing stacked pull requests, it's important to know in what order the work should be reviewed. Most commonly the proposed solution is to prefix pull request titles with <strong>[PART-2]</strong>, which works fine. Stacker does this automatically for you and uses different colors to make distinction between the different chains of pull requests.
</p>

<h3 align="center">View only changes made in this pull request</h3>

|<img width="860px" alt="Only relevant changes visible" src="./.github/diff-all-visible.png" />|
|--|
|<img width="860px" alt="Only relevant changes visible" src="./.github/diff-pr-visible.png" />|

<p>
  By default on the "Files changed" tab, Github shows you all changes from all commits included in your pull request. Oftentimes when working with stacked pull requests this is not what you want. Stacker automatically figures out which commits are actually part of the pull request and redirects you to a diff view with only these changes.
</p>


<h3 align="center">Automatic warnings on sequential pull requests</h3>


|<img width="789px" alt="Automatic warnings on sequential pull requests" src="./.github/warning.png" />|
|--|

<p>
  Stacker adds a warning to every pull request that has been marked dependent on some other pull request. This is to prevent accidental merging before the parent pull request is merged.
</p>

---

## Related work

- [Stacked Pull Requests: Keeping GitHub Diffs Small](https://graysonkoonce.com/stacked-pull-requests-keeping-github-diffs-small/)

- [#959 Mark pull request as depending on another](https://github.com/isaacs/github/issues/959)
- [#950 Stacked Pull Requests](https://github.com/isaacs/github/issues/950)

---

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

**Thanks for reading 🙂**
