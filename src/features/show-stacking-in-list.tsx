import { h } from "dom-chef";
import { css } from "emotion";

import * as select from "select-dom";
import { getPullRequests, IGithubPullRequest } from "../api";
import { BaseId, createIdForPullRequest } from "../lib/base";
import { IStackerContext } from "../lib/context";
import { getOwner, getRepo, isPullsListView } from "../lib/location";
import { getStackerInfo } from "../lib/prInfo";

const badge = css`
  color: #fff;
  position: relative;
  text-align: center;
  display: inline-block;
  padding: 1px 3px 1px 5px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
`;

const ball = css`
  width: 9px;
  height: 9px;
  border-radius: 4px;
  position: absolute;
  bottom: -4px;
  left: -4px;
  border: 1px solid #fff;
`;

interface IStackNode {
  number: number;
  color: number;
  parentColor: number;
  node: INode;
}

const COLORS = [
  "#0e8a16",
  "#fbca04",
  "#1d76db",
  "#006b75",
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
    <div>
      {getStackNumbers(pullRequest, pullRequestGraph).map(stackNode => {
        if(stackNode.node.children.length === 0 && stackNode.node.parent === null) {
          return null
        }

        return (
          <div
            className={badge}
            style={{ "background-color": COLORS[stackNode.color] }}
          >
            {stackNode.node.parent &&
              stackNode.parentColor !== stackNode.color && (
                <div
                  className={ball}
                  style={{ "background-color": COLORS[stackNode.parentColor] }}
                />
              )}

            <span>part {stackNode.number + 1}.</span>
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

  const $prInfo = select(
    ".float-left.col-9.p-2.lh-condensed",
    $pullRequest
  ) as Element;

  const $prName = select(".link-gray-dark.no-underline", $prInfo) as Element;

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
    const stackerInfo = getStackerInfo(pullRequest);

    const parent = stackerInfo && stackerInfo.baseBranch;

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
  pullRequests.forEach(pr => render(pr, pullRequests, prGraph));

  // console.log(pullRequests.map(getStackerInfo));
}
