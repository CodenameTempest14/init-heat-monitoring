# .githooks

Git hooks for this repo. `pre-push` blocks any push that is not to your own branch (never `main`), any branch deletion and any force-push. `branch-owners.txt` maps each person's `git config user.email` to their branch. Enable once per clone: `git config core.hooksPath .githooks`.
