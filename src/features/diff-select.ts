import { stringify } from "querystring";
import {
  getBranches,
  getForks,
  getPullRequest,
  IGithubBranch,
  IGithubFork,
  IGithubPullRequest
} from "../api";
import { createId, IBase } from "../lib/base";
import { IStackerContext } from "../lib/context";
import { getLocation, isFilesView } from "../lib/location";

interface IDiffSelectContext {
  context: IStackerContext;
  pullRequest: IGithubPullRequest;
  head: IBase;
  base: IBase;
}

function getStackerInfo(pr: IGithubPullRequest) {
  const matches = pr.body.match(/<!--(.*)-->/);
  if (!matches) {
    return null;
  }
  const [, json] = matches;

  try {
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

async function getBases(featureContext: IDiffSelectContext) {
  const forks = await getForks(featureContext.context.accessToken)(
    featureContext.pullRequest.base.repo
  );
  const branches = await getBranches(featureContext.context.accessToken)(
    featureContext.pullRequest.base.repo
  );

  const bases: IBase[] = [];

  branches.forEach((branch: IGithubBranch) => {
    bases.push({
      head: branch.commit.sha,
      id: createId(
        featureContext.pullRequest.base.repo.owner.login,
        featureContext.pullRequest.base.repo.name,
        branch.name
      ),
      name: branch.name,
      owner: featureContext.pullRequest.base.repo.owner.login,
      selected: branch.name === featureContext.pullRequest.base.ref
    });
  });

  const forksP: Array<Promise<IBase[]>> = forks.map(
    async (fork: IGithubFork) => {
      const response = await fetch(fork.branches_url.replace("{/branch}", ""));
      const forkBranches = await response.json();

      return forkBranches.map((branch: IGithubBranch) => ({
        head: branch.commit.sha,
        id: createId(fork.owner.login, fork.full_name, branch.name),
        name: branch.name,
        owner: fork.owner.login,
        selected: false
      }));
    }
  );

  const forksBranches = await Promise.all(forksP);

  return bases.concat(
    forksBranches.reduce(
      (memo: IBase[], forkBranches: IBase[]) => memo.concat(forkBranches),
      []
    )
  );
}

function render(html: string): void {
  const $files = document.getElementById("files");
  if (!$files) {
    // TODO probably not in files view
    return;
  }
  $files.innerHTML = `<div class="js-diff-progressive-container">${html}</div>`;
}

async function selectBase(context: IDiffSelectContext, base: IBase) {
  const params = {
    base_sha: base.head,
    commentable: true,
    diff: "split",
    head_user: base.owner,
    pull_number: context.pullRequest.number,
    sha1: base.head,
    sha2: context.pullRequest.head.sha,
    start_entry: 0
  };
  const query = stringify(params);

  const url = `https://github.com/${
    context.pullRequest.base.repo.owner.login
  }/${context.pullRequest.base.repo.name}/diffs?${query}`;

  const response = await fetch(url, { credentials: "include" });
  render(await response.text());
}

function createSelectInput(context: IDiffSelectContext, bases: IBase[]) {
  const $select = document.createElement("select");

  bases.filter(base => base.id !== context.head.id).forEach(base => {
    const option = document.createElement("option");
    option.innerHTML = `${base.owner} - ${base.name}`;
    option.value = base.id;
    $select.appendChild(option);
  });
  return $select;
}

export default async function initialize(context: IStackerContext) {
  if (!isFilesView(context.location)) {
    return;
  }

  const location = getLocation(document.location);
  const pullRequest = await getPullRequest(context.accessToken)(
    location.ownerLogin,
    location.repoName,
    location.prNumber
  );

  const featureContext = {
    base: {
      head: pullRequest.head.sha,
      id: createId(
        pullRequest.base.repo.owner.login,
        pullRequest.base.repo.name,
        pullRequest.base.ref
      ),
      name: pullRequest.base.ref,
      owner: pullRequest.base.repo.owner.login,
      selected: true
    },
    context,
    head: {
      head: pullRequest.head.sha,
      id: createId(
        pullRequest.head.user.login,
        pullRequest.head.repo.name,
        pullRequest.head.ref
      ),
      name: pullRequest.head.ref,
      owner: pullRequest.head.user.login,
      selected: false
    },
    pullRequest
  };

  const bases = await getBases(featureContext);

  const $select = createSelectInput(featureContext, bases);

  const prsSelectedBase = bases.find(
    base => base.id === featureContext.base.id
  );

  if (prsSelectedBase) {
    $select.value = prsSelectedBase.id;
  }

  const $toolBar = document.querySelectorAll(".float-right.pr-review-tools")[0];
  const $diffSwitch = document.querySelectorAll(
    ".float-right.pr-review-tools .diffbar-item"
  )[0];

  $toolBar.insertBefore($select, $diffSwitch);

  $select.addEventListener("change", event => {
    const id = (event.target as HTMLSelectElement).value;
    const selectedBase = bases.find(base => base.id === id);
    if (!selectedBase) {
      // TODO probably can't even happen
      return;
    }
    selectBase(featureContext, selectedBase);
  });

  const info = getStackerInfo(featureContext.pullRequest);

  if (info) {
    const selectedBase = bases.find(base => base.id === info.baseBranch);
    $select.value = info.baseBranch;
    if (!selectedBase) {
      // TODO probably can't even happen
      return;
    }
    selectBase(featureContext, selectedBase);
  }
}
