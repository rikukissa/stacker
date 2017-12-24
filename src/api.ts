/* tslint:disable max-classes-per-file */
export class UnauthorizedError {}
export class APILimitError {}
/* tslint:enable */

export type AccessToken = string | null;

async function makeRequest(url: string, accessToken: AccessToken) {
  const params = accessToken
    ? {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    : undefined;

  const response = await fetch(url, params);

  if (!response.ok) {
    if (response.status === 403) {
      throw new APILimitError();
    }
    if (response.status === 404) {
      throw new UnauthorizedError();
    }
    throw Error(response.statusText);
  }
  return response.json();
}

export function getPullRequest(accessToken: AccessToken) {
  return (owner: string, repo: string, prNumber: string) =>
    makeRequest(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      accessToken
    );
}

export function getForks(accessToken: AccessToken) {
  return (owner: string, repo: string) =>
    makeRequest(
      `https://api.github.com/repos/${owner}/${repo}/forks`,
      accessToken
    );
}

export function getBranches(accessToken: AccessToken) {
  return (owner: string, repo: string) =>
    makeRequest(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      accessToken
    );
}
