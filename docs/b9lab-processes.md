# B9lab processes

This file describes the internal processes for the [B9lab](https://b9lab.com) contribution team. External contributors should follow the [Contribution Guide](../CONTRIBUTING.md).

## General

**We are exclusively working on the public github repository at [https://github.com/cosmos/sdk-tutorials](https://github.com/cosmos/sdk-tutorials)!**

Our default branch naming scheme applies: A branch should be named `xx-branch-description`, there xx should be replaced with your initials (lowercase), and the branch description should give enough context to understand what is in this branch. For example, this file has been updated through a branch named `is-update-guidelines`.

## Creating a new Pull Request

When creating a new Pull Request, you **must** follow these steps:

1. Select the `b9lab_pr_template` as Pull request template
2. Set a [descriptive name](https://cbea.ms/git-commit/), including a category prefix if applicable
   * `docs:` for changes on the content
   * `fix:` for updates fixing issues on the platform. These do not include fixes on the text content itself, which fall in the `docs:` category
   * `feature:` for updates on the platform features/functionality
3. Set the Pull Request description, filling all required fields
4. Apply the **label** `b9lab-internal`
5. Set up Assignee if required: Assignees should be people who need to work on something. Also make sure all assignees know what they need to do, using the description and/or comments.
6. Set up the Pull Request in Draft initially (click on the arrow next to the _Create Pull Request_ button and select _Create Draft Pull Request_.)


The Pull Request is now ready to be moved into the internal review state.

## I Start internal review

Once your Pull Request is ready for internal review (content and/or language), you can initiate the internal review process:

1. Check the checkboxes on the Pull Request description accordingly to the review you want to request, in the internal review section:

- Technical content review
  - [x] requested
  - [ ] completed
- Language review
  - [x] requested
  - [ ] completed

2. Make sure the internal reviewers are set up correctly. You should select at least one reviewer for each review type:
   * Technical content review
   * Language review
   * Technical platform review (optional, only required if the PR changes any platform code, including the main menu config)

TODO: Inform reviewer?

Once a reviewer has completed their review, they will check the completed checkbox accordingly and approve the changes.


## II Move to external review

Once the internal review has been completed, the PR can be moved into the external review pipeline, in a very similar process:

1. Check the checkboxes on the Pull Request description accordingly to the review you want to request, in the external review section
2. Make sure the external reviewers are set up correctly. You should select at least one reviewer for each review type
3. Remove the label `b9lab-internal`, and add the label `open-for-review` instead.
4. Remove the Draft state on the Pull Request.

External reviewers are also asked to check the status checkbox on the Pull Request description accordingly when they have completed their review, as well as approve the changes.

## III Final QA review

Finally, once all external reviews are completed, a final QA review is required before merge. To initiate it, a similar procedure is used:

1. Check the checkboxes on the Pull Request description accordingly to the review you want to request, in the final qa review section (usually this should only be a last language review).
2. Make sure the QA reviewers are set up correctly:
   * CitMC for language review
   * Xavier for technical content review
3. Remove the label `open-for-review` and apply the label `final-qa-review` instead

Once the final qa review has been completed, the reviewers should update the checkboxes on the description to indicate the review is completed, and approve the PR.

Finally, the PR should be assigned to Ibo for final merge.
