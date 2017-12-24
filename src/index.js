import { stringify } from "qs";
function getLocation(pathname) {
  const [
    owner,
    repo,
    type,
    pullRequest,
    view
  ] = document.location.pathname.split("/").filter(part => part !== "");
  return { owner, repo, type, pullRequest, view };
}

function render(html) {
  document.getElementById(
    "files"
  ).innerHTML = `<div class="js-diff-progressive-container">${html}</div>`;
}

async function selectBase(base, location, pr) {
  const { owner, repo, type, pullRequest, view } = location;

  const params = {
    base_sha: base.head,
    commentable: true,
    head_user: base.owner,
    pull_number: pr.number,
    sha1: base.head,
    sha2: pr.head.sha,
    start_entry: 0,
    diff: "split"
  };
  const query = stringify(params);

  const url = `https://github.com/${owner}/${repo}/diffs?${query}`;

  render(await (await fetch(url)).text());
}

async function getPRData(location) {
  const { owner, repo, pullRequest } = location;

  return (await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullRequest}`
  )).json();
}

async function getBases(location) {
  const { owner, repo } = location;
  const FORKS_URL = `https://api.github.com/repos/${owner}/${repo}/forks`;
  const BRANCHES_URL = `https://api.github.com/repos/${owner}/${repo}/branches`;
  const bases = [];
  const forks = await (await fetch(FORKS_URL)).json();
  const branches = await (await fetch(BRANCHES_URL)).json();

  branches.forEach(branch => {
    bases.push({
      id: `${owner}/${repo}/${branch.name}`,
      owner: owner,
      name: branch.name,
      head: branch.commit.sha
    });
  });

  for (const fork of forks) {
    const branches = await (await fetch(
      fork.branches_url.replace("{/branch}", "")
    )).json();

    branches.forEach(branch => {
      bases.push({
        id: fork.full_name + "/" + branch.name,
        owner: fork.owner.login,
        name: branch.name,
        head: branch.commit.sha
      });
    });
  }
  return bases;
}

(async function run() {
  const location = getLocation(document.location.pathname);

  const pr = await getPRData(location);
  const bases = await getBases(location);
  console.log(pr);

  const select = document.createElement("select");

  bases.forEach(base => {
    const option = document.createElement("option");
    option.innerHTML = `${base.owner} / ${base.name}`;
    option.value = base.id;
    select.appendChild(option);
  });

  document.querySelectorAll(".float-right.pr-review-tools")[0].prepend(select);

  select.addEventListener("change", event => {
    const id = event.target.value;
    const base = bases.find(base => base.id === id);

    selectBase(base, location, pr);
  });
})();
