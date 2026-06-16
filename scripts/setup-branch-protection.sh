#!/usr/bin/env bash
# Apply branch protection to `main` so only reviewed, CI-passing PRs can land.
#
# Requires the `gh` CLI authenticated with a token that has `repo` admin scope:
#   gh auth login --scopes "repo,admin:repo_hook"
#
# Re-run any time to update the rules — the API is idempotent.

set -euo pipefail

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
BRANCH="${BRANCH:-main}"

echo "Protecting ${REPO}@${BRANCH}…"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/branches/${BRANCH}/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["verify", "commitlint"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": true
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false,
  "restrictions": null
}
JSON

echo "Done."
echo
echo "Next steps:"
echo "  - In repo Settings → Actions → General, set Workflow permissions to"
echo "    'Read and write' so the release job can push the changelog commit"
echo "    and create releases."
echo "  - In Settings → Branches → main → 'Allow specified actors to bypass"
echo "    required pull requests', add 'github-actions[bot]' (or your release"
echo "    PAT/App identity) so semantic-release can push the changelog commit."
