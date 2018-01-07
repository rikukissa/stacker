import { css } from "emotion";
import { h } from "preact";
import { getPullRequests, IGithubPullRequest } from "../../api";
import {
  BaseId,
  createIdForPullRequest,
  getBasePullRequest
} from "../../lib/base";
import { IStackerContext } from "../../lib/context";
import { getOwner, getRepo, isPullsListView } from "../../lib/location";
import { toDOMNode } from "../../lib/vdom";

const badges = css`
  display: inline-block;
`;

const badge = css`
  color: #fff;
  text-align: center;
  justify-content: center;
  align-items: center;
  display: inline-flex;
  font-size: 14px;
  font-weight: 600;
`;

const ball = css`
  color: #fff;
  display: inline-block;
  padding: 1px 2px;
  font-size: 12px;
  vertical-align: middle;
  border-radius: 3px;
  margin-left: 3px;
`;

const numberStyle = css`
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
  "#fbca04",
  "#28a745",
  "#b60205",
  "#5319e7",
  "#1d76db",
  "#19eaea",
  "#dd8b58",
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
      const shouldChangeColor =
        pullRequestGraph.children.length > 1 && node.children.length > 0;

      const color = shouldChangeColor
        ? stackNode.color + index + (node.parent ? 1 : 0)
        : stackNode.color;

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
          return <div />;
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
            className={`stacker-part-badge ${badge}`}
            style={{
              color: mainColor
            }}
          >
            <span className={numberStyle}>part {stackNode.number + 1}</span>
            {branches && childCount > 0 ? (
              <div
                className={ball}
                style={{
                  "background-color": childColor
                }}
              >
                <span>+{childCount}</span>
              </div>
            ) : (
              <div />
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
  const $pullRequest = document.querySelector(`#issue_${pullRequest.number}`);

  const $prInfo =
    $pullRequest &&
    $pullRequest.querySelector(".link-gray-dark.no-underline.h4");

  // const $prName = $prInfo && $prInfo.querySelector(".d-inline-block");

  const listItemVisible = Boolean($pullRequest);

  if (!listItemVisible) {
    return;
  }

  // const stackerInfo = getStackerInfo(pullRequest);

  if ($prInfo && $prInfo.parentElement) {
    $prInfo.parentElement.insertBefore(
      toDOMNode(getBadge(pullRequest, pullRequestGraph)),
      $prInfo.nextSibling
    );
  }
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

  const pullRequests = await getPullRequests(context)(
    getOwner(context.location),
    getRepo(context.location)
  );
  const prGraph = createPRGraph(pullRequests);

  Array.from(document.querySelectorAll(`.${badge}`)).forEach(el => el.remove());

  pullRequests.forEach(pr => render(pr, pullRequests, prGraph));

  // console.log(pullRequests.map(getStackerInfo));
}
