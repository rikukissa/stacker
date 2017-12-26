import { AccessToken, getPullRequest, UnauthorizedError } from "./api";
import diffSelect from './features/diff-select'
import { createId } from "./lib/base";
import { getLocation,ILocation, isPRView } from "./lib/location";

async function getPRData(accessToken: AccessToken, location: ILocation) {
  return getPullRequest(accessToken)(location.ownerLogin, location.repoName, location.prNumber);
}

(async function run() {
  if(!isPRView(document.location)) {
    return
  }
  const location = getLocation(document.location);
  const accessToken = window.localStorage.getItem('TODO_token')
  const pullRequest = await getPRData(accessToken, location)

  const context = {
    accessToken,
    base: {
      head: pullRequest.head.sha,
      id: createId(pullRequest.base.repo.owner.login, pullRequest.base.repo.name, pullRequest.base.ref),
      name: pullRequest.base.ref,
      owner: pullRequest.base.repo.owner.login,
      selected: true
    },
    head: {
      head: pullRequest.head.sha,
      id: createId(pullRequest.head.user.login, pullRequest.head.repo.name, pullRequest.head.ref),
      name: pullRequest.head.ref,
      owner: pullRequest.head.user.login,
      selected: false
    },
    location: document.location,
    pullRequest,
  }
  diffSelect(context)

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
