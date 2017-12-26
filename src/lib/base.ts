export interface IBase {
  id: string;
  head: string;
  owner: string;
  name: string;
  selected: boolean;
}

export function createId(owner: string, repo: string, branchName: string) {
  return `${owner}:${repo}:${branchName}`;
}
