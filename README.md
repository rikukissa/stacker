<p align="center" style="color: #343a40">
  <img src="./.github/logo.svg" alt="emotion" height="150" width="150">
  <h1 align="center">Stacker</h1>
</p>
<p align="center">Split your huge pull requests into small, easily understandable pieces<br/> <a href="https://chrome.google.com/webstore/detail/apkgobbdndlnnelabdjdapopocfcgbhf">Download the Chrome extension</a></p>

Stacker is a Chrome extension that allows you to mark pull requests as dependend of each other. This way, instead of creating one large PR for your feature, you are able to create multiple smaller ones, while still having the same base branch for each pull request.

## Installation
1. Download the extension
2. Generate a new personal access token with following permissions: <br/><img alt="Required permissions" src="./.github/permissions.png" width="174px" />
3. Open any repository's "Pull requests" view on Github and input the access token when Stacker prompts you about it

## Workflow
1. Create a new pull request
2. Select a parent pull request
3. Done! After this everyone with the extension can see your pull request as a dependant PR

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