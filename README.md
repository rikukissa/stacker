<p align="center" style="color: #343a40">
  <img src="./.github/logo.svg" alt="logo" height="150" width="150">
  <h1 align="center">Stacker</h1>
</p>

<p align="center">Intuitive and automated way for creating and reviewing stacked pull requests on Github<br/> <a href="https://chrome.google.com/webstore/detail/apkgobbdndlnnelabdjdapopocfcgbhf">Download the Chrome extension</a></p>

![Status](https://travis-ci.com/rikukissa/stacker.svg?token=zwBSeTmkrmCBprBpJMHF&branch=develop)
[![Sponsored](https://img.shields.io/badge/chilicorn-sponsored-brightgreen.svg?logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAA4AAAAPCAMAAADjyg5GAAABqlBMVEUAAAAzmTM3pEn%2FSTGhVSY4ZD43STdOXk5lSGAyhz41iz8xkz2HUCWFFhTFFRUzZDvbIB00Zzoyfj9zlHY0ZzmMfY0ydT0zjj92l3qjeR3dNSkoZp4ykEAzjT8ylUBlgj0yiT0ymECkwKjWqAyjuqcghpUykD%2BUQCKoQyAHb%2BgylkAyl0EynkEzmkA0mUA3mj86oUg7oUo8n0k%2FS%2Bw%2Fo0xBnE5BpU9Br0ZKo1ZLmFZOjEhesGljuzllqW50tH14aS14qm17mX9%2Bx4GAgUCEx02JySqOvpSXvI%2BYvp2orqmpzeGrQh%2Bsr6yssa2ttK6v0bKxMBy01bm4zLu5yry7yb29x77BzMPCxsLEzMXFxsXGx8fI3PLJ08vKysrKy8rL2s3MzczOH8LR0dHW19bX19fZ2dna2trc3Nzd3d3d3t3f39%2FgtZTg4ODi4uLj4%2BPlGxLl5eXm5ubnRzPn5%2Bfo6Ojp6enqfmzq6urr6%2Bvt7e3t7u3uDwvugwbu7u7v6Obv8fDz8%2FP09PT2igP29vb4%2BPj6y376%2Bu%2F7%2Bfv9%2Ff39%2Fv3%2BkAH%2FAwf%2FtwD%2F9wCyh1KfAAAAKXRSTlMABQ4VGykqLjVCTVNgdXuHj5Kaq62vt77ExNPX2%2Bju8vX6%2Bvr7%2FP7%2B%2FiiUMfUAAADTSURBVAjXBcFRTsIwHAfgX%2FtvOyjdYDUsRkFjTIwkPvjiOTyX9%2FAIJt7BF570BopEdHOOstHS%2BX0s439RGwnfuB5gSFOZAgDqjQOBivtGkCc7j%2B2e8XNzefWSu%2BsZUD1QfoTq0y6mZsUSvIkRoGYnHu6Yc63pDCjiSNE2kYLdCUAWVmK4zsxzO%2BQQFxNs5b479NHXopkbWX9U3PAwWAVSY%2FpZf1udQ7rfUpQ1CzurDPpwo16Ff2cMWjuFHX9qCV0Y0Ok4Jvh63IABUNnktl%2B6sgP%2BARIxSrT%2FMhLlAAAAAElFTkSuQmCC)](http://spiceprogram.org/oss-sponsorship)

Stacker is a Chrome extension that makes working with stacked pull requests easier both for PR authors and reviewers. Github's UI provides a lot of useful features for working with stacked PRs out of the box. However, many of those features require you to follow manual, repeatitive steps, that this extension automates for you.

# So what are stacked pull requests?

TODO

# Two workflows you'll encounter when doing pull requests

<table>
  <thead>
    <tr>
      <td width="50%" align="center">
        <br />
        <img align="center" src="./.github/based-pr.svg" height="150"><br />
        <br />
        <p>
          <strong>
            Parent based pull request
          </strong>
          <br />
          PR's <a href="https://github.com/blog/2224-change-the-base-branch-of-a-pull-request">base</a>
          is set to parent PR branch
        </p>
      </td>
      <td width="50%" align="center">
        <br />
        <br />
        <img src="./.github/upstream-pr.svg" height="150">
        <br />
        <br />
        <p>
          <strong>
            Upstream based pull request
          </strong>
          <br />
          PR shares the same history with its parent, while still keeping its base as <strong>upstream</strong>
        </p>
      </td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <br />
        <p align="center">
          <img alt="PR 2" src="./.github/PR2.png" height="11px" />
          is a clear extension of <img alt="PR 1" src="./.github/PR1.png" width="30px" />.<br /> Together they form a working piece of new functionality.
        </p>
      </td>
      <td>
        <p align="center">
          <br />
          <img alt="PR 2" src="./.github/PR2.png" height="11px" />
          requires some functionality from
          <img alt="PR 1" src="./.github/PR1.png" width="30px" /> for it to work.
          They can be considered as two separate increments.
        </p>
      </td>
    </tr>
  </tbody>
</table>

---

## Parent based pull request

### Good parts

**<img alt="PR 2" src="./.github/PR2.png" height="11px" /> is easily reviewable once the reviewer understands changes proposed in <img alt="PR 1" src="./.github/PR1.png" width="30px" />.**

- Github's "Files changed" view only shows changes made in <img alt="PR 2" src="./.github/PR2.png" height="11px" />

### Bad parts

**Feature can only be shipped forward after all child PRs are ready.**

- <img alt="PR 1" src="./.github/PR1.png" height="11px" /> can't be merged to upstream before <img alt="PR 2" src="./.github/PR2.png" height="11px" /> is reviewed and merged to <img alt="PR 1" src="./.github/PR1.png" width="30px" />.

**<img alt="PR 2" src="./.github/PR2.png" height="11px" /> can be accidentally merged to a stale branch**

- If <img alt="PR 1" src="./.github/PR1.png" width="30px" /> still gets merged before, failing to update <img alt="PR 2" src="./.github/PR2.png" height="11px" />'s
base before merging will lead into it being merged to a stale branch.

---
## Upstream based pull request

### Good parts

**TODO prs can be merged freely**

### Bad parts

**<img alt="PR 2" src="./.github/PR2.png" height="11px" /> includes changes from both PRs, making it more difficult to review.**

- ✨ This is where Stacker can help you. It changes Github's default "Files changed" view to show you only changes from the pull request you're reviewing.


**There's no easy way of seeing that <img alt="PR 2" src="./.github/PR2.png" height="11px" /> should be a continuum for <img alt="PR 1" src="./.github/PR1.png" width="30px" />**

- ✨ We've added clear colored labels to Github's "Pull requests" view showing you which PRs form a complete feature. On top of this, each label includes a number to help you understand in which orde the pull requests should be reviewed.

**<img alt="PR 1" src="./.github/PR1.png" width="30px" /> can get merged accidentally if <img alt="PR 2" src="./.github/PR2.png" height="11px" /> is merged first**

- ✨ TODO stuff about warnings



---

# Installation
**Give it a go** (public repositories):

1. Download [the extension](https://chrome.google.com/webstore/detail/apkgobbdndlnnelabdjdapopocfcgbhf)

**If you like it and want to keep on using it** (+ private repositories):

2. Generate a new personal access token with following permissions: <br/><img alt="Required permissions" src="./.github/permissions.png" width="174px" />
3. Open up Stacker options by clicking the extension icon at the right-top corner of your Chrome window. You'll notice that **access token** field for github.com domain is empty. Paste your token there and you're all set!

**For Github Enterprise users:**

4. Add a new domain and access token from Stacker options (step 3).

---

# Features


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

# Related work

- [Stacked Pull Requests: Keeping GitHub Diffs Small](https://graysonkoonce.com/stacked-pull-requests-keeping-github-diffs-small/)

- [#959 Mark pull request as depending on another](https://github.com/isaacs/github/issues/959)
- [#950 Stacked Pull Requests](https://github.com/isaacs/github/issues/950)

---

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

**Thanks for reading 🙂**
