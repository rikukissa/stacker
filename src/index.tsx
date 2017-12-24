import { stringify } from "querystring";
import { AccessToken, getBranches, getForks, getPullRequest, UnauthorizedError } from "./api";

interface IBase {
  id: string,
  head: string,
  owner: string,
  name: string
}

interface ILocation {
  owner: string,
  repo: string,
  type: string,
  pullRequest: string,
  view: string,
}

interface IPullRequest {
  number: string,
  head: { sha: string }
}

interface IGithubBranch {
  commit: { sha: string },
  name: string
}

function getLocation(pathname: string) : ILocation {
  const [
    owner,
    repo,
    type,
    pullRequest,
    view
  ] = document.location.pathname.split("/").filter(part => part !== "");
  return { owner, repo, type, pullRequest, view };
}

function render(html: string) : void {
  const $files = document.getElementById(
    "files"
  )
  if(!$files) {
    // TODO probably not in files view
    return
  }
  $files.innerHTML = `<div class="js-diff-progressive-container">${html}</div>`;
}

async function selectBase(base: IBase, location: ILocation, pr: IPullRequest) {
  const { owner, repo } = location;

  const params = {
    base_sha: base.head,
    commentable: true,
    diff: "split",
    head_user: base.owner,
    pull_number: pr.number,
    sha1: base.head,
    sha2: pr.head.sha,
    start_entry: 0,
  };
  const query = stringify(params);

  const url = `https://github.com/${owner}/${repo}/diffs?${query}`;

  render(await (await fetch(url, { credentials: 'include' })).text());
}

async function getPRData(accessToken: AccessToken, location: ILocation) {
  const { owner, repo, pullRequest } = location;

  return getPullRequest(accessToken)(owner, repo, pullRequest);
}

async function getBases(accessToken: AccessToken, location: ILocation) {
  const { owner, repo } = location;

  const bases : IBase[] = [];

  const forks = await getForks(accessToken)(owner, repo);
  const branches = await getBranches(accessToken)(owner, repo);

  branches.forEach((branch: IGithubBranch) => {
    bases.push({
      head: branch.commit.sha,
      id: `${owner}/${repo}/${branch.name}`,
      name: branch.name,
      owner
    });
  });

  for (const fork of forks) {
    const forkBranches = await (await fetch(
      fork.branches_url.replace("{/branch}", "")
    )).json();

    forkBranches.forEach((branch: IGithubBranch) => {
      bases.push({
        head: branch.commit.sha,
        id: fork.full_name + "/" + branch.name,
        name: branch.name,
        owner: fork.owner.login,
      });
    });
  }
  return bases;
}

function isPluginEnabled(href: string) {
  return href.includes('github.com') && href.includes('/pull');
}

(async function run() {
  const location = getLocation(document.location.pathname);

  if(!isPluginEnabled(document.location.href)) {
    return
  }
  const accessToken = window.localStorage.getItem('TODO_token')

  const pr = await getPRData(accessToken, location);
  const bases = await getBases(accessToken, location);

  const $select = document.createElement("select");

  bases.forEach(base => {
    const option = document.createElement("option");
    option.innerHTML = `${base.owner} / ${base.name}`;
    option.value = base.id;
    $select.appendChild(option);
  });

  const $toolBar = document.querySelectorAll(".float-right.pr-review-tools")[0]
  const $diffSwitch = document.querySelectorAll(".float-right.pr-review-tools .diffbar-item")[0]

  $toolBar.insertBefore($select, $diffSwitch)

  $select.addEventListener("change", event => {
    const id = (event.target as HTMLSelectElement).value;
    const selectedBase = bases.find(base => base.id === id);
    if(!selectedBase) {
      // TODO probably can't even happen
      return;
    }
    selectBase(selectedBase, location, pr);
  });
})().catch(err => {
  if(err instanceof UnauthorizedError) {
    const token = window.prompt('Please enter an access token')
    if(token) {
      window.localStorage.setItem('TODO_token', token);
      window.location.reload()
    }
  }

  console.log(err);

});
