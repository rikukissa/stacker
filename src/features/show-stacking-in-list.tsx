import { h } from "dom-chef";
import { css } from "emotion";
import { isAccessible } from "get-contrast";

import * as select from "select-dom";
import { getPullRequests, IGithubPullRequest } from "../api";
import {
  BaseId,
  createIdForPullRequest,
  getBasePullRequest
} from "../lib/base";
import { IStackerContext } from "../lib/context";
import { getOwner, getRepo, isPullsListView } from "../lib/location";

const badges = css`
  display: inline-block;
`;

const badge = css`
  color: #fff;
  text-align: center;
  display: inline-block;
  padding: 0 5px;
  border-radius: 3px;

  font-size: 12px;
  font-weight: 600;
  &:not(:first-child) {
    margin-left: 0.5em;
  }
`;

const ball = css`
  color: #fff;
  height: 100%;
  display: inline-block;
  padding: 2px 5px;
  margin: 0 -5px 0 3px;
  border-radius: 0 3px 3px 0;
`;

const numberStyle = css`
  padding: 2px 0;
  display: inline-block;
`;

interface IStackNode {
  number: number;
  color: number;
  parentColor: number;
  node: INode;
}

const COLORS = [
  "#7057ff",
  "#ffdb0b",
  "#1ddb82",
  "#1d76db",
  "#5319e7",
  "#b60205",
  "#0052cc",
  "#e99695",
  "#d93f0b"
];

function getStackNumbers(
  pullRequest: IGithubPullRequest,
  pullRequestGraph: INode,
  stackNode: IStackNode = {
    color: 0,
    node: pullRequestGraph,
    number: 0,
    parentColor: 0
  }
): IStackNode[] {
  return pullRequestGraph.children.reduce(
    (found, node: INode, index) => {
      const color = index > 0 ? stackNode.color + index : stackNode.color;

      const parentColor = stackNode.color;

      if (node.id === createIdForPullRequest(pullRequest)) {
        return found.concat({ ...stackNode, node, parentColor, color });
      }

      return found.concat(
        getStackNumbers(pullRequest, node, {
          color,
          node,
          number: stackNode.number + 1,
          parentColor
        })
      );
    },
    [] as IStackNode[]
  );
}

function getBadge(pullRequest: IGithubPullRequest, pullRequestGraph: INode) {
  return (
    <div className={badges}>
      {getStackNumbers(pullRequest, pullRequestGraph).map(stackNode => {
        if (
          stackNode.node.children.length === 0 &&
          stackNode.node.parent === null
        ) {
          return null;
        }

        const childCount = stackNode.node.children.length;

        const branches =
          stackNode.node.parent && stackNode.parentColor !== stackNode.color;

        const mainColor = branches
          ? COLORS[stackNode.parentColor]
          : COLORS[stackNode.color];
        const childColor = branches
          ? COLORS[stackNode.color]
          : COLORS[stackNode.parentColor];

        return (
          <div
            className={badge}
            style={{
              "background-color": mainColor,
              color: !isAccessible(mainColor, "#fff") ? "#1c2733" : null
            }}
          >
            <span className={numberStyle}>part {stackNode.number + 1}</span>
            {branches &&
              childCount > 0 && (
                <div
                  className={ball}
                  style={{
                    "background-color": childColor,
                    color: !isAccessible(childColor, "#fff") ? "#1c2733" : null
                  }}
                >
                  <span>+{childCount}</span>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
}

function render(
  pullRequest: IGithubPullRequest,
  pullRequests: IGithubPullRequest[],
  pullRequestGraph: INode
): void {
  const $pullRequest = select(`#issue_${pullRequest.number}`) as Element;

  const $prInfo = select(".mt-1.text-small.text-gray", $pullRequest) as Element;

  const $prName = select(".d-inline-block", $prInfo) as Element;

  const listItemVisible = Boolean($pullRequest);

  if (!listItemVisible) {
    return;
  }

  // const stackerInfo = getStackerInfo(pullRequest);

  $prInfo.insertBefore(getBadge(pullRequest, pullRequestGraph), $prName);
}

interface INode {
  children: INode[];
  id: BaseId | null;
  parent: BaseId | null;
}

function createPRGraph(pullRequests: IGithubPullRequest[]): INode {
  const nodes: INode[] = [];
  const toplevelNodes: INode[] = [];
  const lookupList = {};

  for (const pullRequest of pullRequests) {
    const base = getBasePullRequest(pullRequest, pullRequests);
    const parent = base ? createIdForPullRequest(base) : null;
    const node = {
      children: [],
      id: createIdForPullRequest(pullRequest),
      parent
    };
    lookupList[node.id] = node;
    nodes.push(node);
    if (parent === null) {
      toplevelNodes.push(node);
    }
  }

  for (const node of nodes) {
    if (node.parent === null) {
      continue;
    }
    const parent = lookupList[node.parent];
    parent.children = parent.children.concat(node);
  }
  return {
    children: toplevelNodes,
    id: null,
    parent: null
  };
}

export default async function initialize(context: IStackerContext) {
  if (!isPullsListView(context.location)) {
    return;
  }

  const pullRequests = await getPullRequests(context.accessToken)(
    getOwner(context.location),
    getRepo(context.location)
  );
  const prGraph = createPRGraph(pullRequests);

  Array.from(document.querySelectorAll(`.${badge}`)).forEach(el => el.remove());

  pullRequests.forEach(pr => render(pr, pullRequests, prGraph));

  // console.log(pullRequests.map(getStackerInfo));
}
