export interface IStackerInfo {
  baseBranch: string | null;
}

const COMMENT_REGEXP = /<!--(.*)-->/;

function getStackerJSON(body: string): string | null {
  const matches = body.match(COMMENT_REGEXP);

  if (!matches) {
    return null;
  }
  return matches[1];
}

export function getStackerInfo(body: string): IStackerInfo | null {
  const json = getStackerJSON(body);

  if (!json) {
    return null;
  }

  try {
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

export function updateStackerInfo(body: string, info: IStackerInfo) {
  const json = getStackerJSON(body);

  if (!json) {
    return `${body.replace(/\n+$/, "")}\n\n<!--${JSON.stringify(info)}-->`;
  }
  return `${body
    .replace(COMMENT_REGEXP, "")
    .replace(/\n+$/, "")}\n\n<!--${JSON.stringify(info)}-->`;
}
