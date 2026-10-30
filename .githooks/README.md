# .githooks

Git hooks for this repo. `pre-push` blocks any push that is not to your own branch (never another person's branch; `main` is allowed for the owner only while they are the only builder, D-014), any branch deletion and any force-push. `branch-owners.txt` maps each person's `git config user.email` to their branch. Enable once per clone: `git config core.hooksPath .githooks`.
