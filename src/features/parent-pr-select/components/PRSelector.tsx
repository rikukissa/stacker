import { h } from "jsx-dom/svg";

import { IGithubPullRequest } from "../../../api";
import PullRequest from "./PullRequest";

export const ID = "stacker-pr-selector";

export default function PRSelector(
  pullRequests: IGithubPullRequest[],
  basePR: IGithubPullRequest | null,
  selectPullRequest: (pr: IGithubPullRequest) => void
) {
  const selectPR = (pr: IGithubPullRequest) => {
    // Close the dropdown
    document.body.click();

    selectPullRequest(pr);
  };

  return (
    <div id={ID} className="discussion-sidebar-item">
      <div className="select-menu js-menu-container js-select-menu">
        <button
          type="button"
          className="discussion-sidebar-heading discussion-sidebar-toggle js-menu-target"
          aria-label="Parent pull request"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <svg
            aria-hidden="true"
            className="octicon octicon-gear"
            height="16"
            version="1.1"
            viewBox="0 0 14 16"
            width="14"
          >
            <path
              fill-rule="evenodd"
              d="M14 8.77v-1.6l-1.94-.64-.45-1.09.88-1.84-1.13-1.13-1.81.91-1.09-.45-.69-1.92h-1.6l-.63 1.94-1.11.45-1.84-.88-1.13 1.13.91 1.81-.45 1.09L0 7.23v1.59l1.94.64.45 1.09-.88 1.84 1.13 1.13 1.81-.91 1.09.45.69 1.92h1.59l.63-1.94 1.11-.45 1.84.88 1.13-1.13-.92-1.81.47-1.09L14 8.75v.02zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
            />
          </svg>
          Parent pull request
        </button>

        <div className="select-menu-modal-holder js-menu-content js-navigation-container">
          <div className="select-menu-modal">
            <div className="select-menu-header">
              <svg
                aria-label="Close"
                className="octicon octicon-x js-menu-close"
                height="16"
                version="1.1"
                viewBox="0 0 12 16"
                width="12"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"
                />
              </svg>
              <span className="select-menu-title">Parent pull request</span>
            </div>

            <div className="js-select-menu-deferred-content">
              <div className="select-menu-header">
                <svg
                  aria-label="Close"
                  className="octicon octicon-x js-menu-close"
                  height="16"
                  version="1.1"
                  viewBox="0 0 12 16"
                  width="12"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"
                  />
                </svg>
                <span className="select-menu-title">
                  Choose a parent pull request
                </span>
              </div>

              <div className="select-menu-filters">
                <div className="select-menu-text-filter">
                  <input
                    type="text"
                    id="prs-filter-field"
                    className="form-control js-filterable-field js-navigation-enable"
                    placeholder="Pull request"
                    aria-label="Type or choose a pull request"
                  />
                </div>
              </div>

              <div className="select-menu-list">
                <div
                  data-filterable-for="prs-filter-field"
                  data-filterable-type="substring"
                >
                  {pullRequests.map(pr => PullRequest(pr, selectPR))}
                </div>

                <div className="select-menu-no-results">None yet</div>
              </div>
            </div>

            <div className="select-menu-loading-overlay anim-pulse">
              <svg
                aria-hidden="true"
                className="octicon octicon-octoface"
                height="32"
                version="1.1"
                viewBox="0 0 16 16"
                width="32"
              >
                <path
                  fill-rule="evenodd"
                  d="M14.7 5.34c.13-.32.55-1.59-.13-3.31 0 0-1.05-.33-3.44 1.3-1-.28-2.07-.32-3.13-.32s-2.13.04-3.13.32c-2.39-1.64-3.44-1.3-3.44-1.3-.68 1.72-.26 2.99-.13 3.31C.49 6.21 0 7.33 0 8.69 0 13.84 3.33 15 7.98 15S16 13.84 16 8.69c0-1.36-.49-2.48-1.3-3.35zM8 14.02c-3.3 0-5.98-.15-5.98-3.35 0-.76.38-1.48 1.02-2.07 1.07-.98 2.9-.46 4.96-.46 2.07 0 3.88-.52 4.96.46.65.59 1.02 1.3 1.02 2.07 0 3.19-2.68 3.35-5.98 3.35zM5.49 9.01c-.66 0-1.2.8-1.2 1.78s.54 1.79 1.2 1.79c.66 0 1.2-.8 1.2-1.79s-.54-1.78-1.2-1.78zm5.02 0c-.66 0-1.2.79-1.2 1.78s.54 1.79 1.2 1.79c.66 0 1.2-.8 1.2-1.79s-.53-1.78-1.2-1.78z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <span className="css-truncate sidebar-projects">
        {basePR ? `#${basePR.number} ${basePR.title}` : "None yet"}
      </span>
    </div>
  );
}
