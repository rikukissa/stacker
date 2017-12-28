import { h } from "dom-chef";
import { IGithubPullRequest } from "../../../api";
import { createIdForPullRequest } from "../../../lib/base";

export default function PullRequest(
  pullRequest: IGithubPullRequest,
  onSelect: (pr: IGithubPullRequest) => void
) {
  return (
    <span
      className="select-menu-item js-navigation-item js-navigation-open js-pull-base-branch-item"
      role="menuitem"
      data-pr={createIdForPullRequest(pullRequest)}
      onClick={event => event.stopPropagation() || onSelect(pullRequest)}
    >
      <svg
        aria-hidden="true"
        className="octicon octicon-check select-menu-item-icon"
        height="16"
        version="1.1"
        viewBox="0 0 12 16"
        width="12"
      >
        <path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z" />
      </svg>
      <div className="select-menu-item-text">
        #{pullRequest.number} {pullRequest.title}
      </div>
    </span>
  );
}
