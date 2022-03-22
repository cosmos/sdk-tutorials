# B9lab processes

This file describes the internal processes for the [B9lab](https://b9lab.com) contribution team. External contributors should follow the [Contribution Guide](../CONTRIBUTING.md).


## General

**We are exclusively working on the [public GitHub repository](https://github.com/cosmos/sdk-tutorials)!**

Our default branch naming scheme applies: A branch should be named `xx-branch-description`, there xx should be replaced with your initials (lowercase), and the branch description should give enough context to understand what content suggestions are included in this branch. For example, this file has been updated through a branch named `is-update-guidelines`.


## Creating a new Pull Request

When creating a new Pull Request, you **must** follow these steps:

1. Select the `b9lab_pr_template` as a Pull Request template.
2. Set a [descriptive name](https://cbea.ms/git-commit/), including a category prefix if applicable:
   * `docs:` for changes on the content,
   * `fix:` for updates fixing issues on the platform. These do not include fixes on the text content itself, which fall in the `docs:` category,
   * `feature:` for updates on the platform features/functionality.
   
   For example, `docs: add feegrant module tutorial` is a PR name.
3. Set the Pull Request description, filling all required fields.
4. Apply the **label** `b9lab-internal-review`.
5. Set up Assignee if required: Assignees should be people who need to work on something. Also make sure all assignees know what they need to do, using the description and/or comments.
6. Set up the Pull Request as a Draft (click on the arrow next to the _Create Pull Request_ button and select _Create Draft Pull Request_).


The Pull Request is now ready to be moved into the internal review state.


## R1 - start internal review

Once your Pull Request is ready for internal review (technical and/or language), you can initiate the internal review process:

1. Check the checkboxes on the Pull Request description accordingly to the review you want to request, in the internal review section:

- Technical review
  - [x] requested
  - [ ] completed
- Language review
  - [x] requested
  - [ ] completed

2. Make sure the internal reviewers are set up correctly. You should select at least one reviewer for each review type:
   * Technical review,
   * Language review,
   * Technical platform review (optional, only required if the PR changes any platform code including the main menu config).

3. Inform (ping) all reviewers via Slack, with a link to the Pull Request.

Once a reviewer has completed their review, they will check the completed checkbox accordingly and approve the changes.


## R2 - move to external review

Once the internal review has been completed, the Pull Request can be moved into the external review pipeline, in a very similar process:

1. Check the checkboxes on the Pull Request description accordingly to the review you want to request in the external review section.
2. Make sure the external reviewers are set up correctly. You should select at least one reviewer for each review type.
3. Remove the label `b9lab-internal-review` and instead add the label `b9lab-external-review`.
4. Inform (ping) all reviewers via Slack with a link to the Pull Request.

External reviewers are also asked to check the status checkbox on the Pull Request description accordingly when they have completed their review, as well as approve the changes.


## R3 - internal QA review

When you are ready for a last internal QA review, initiate it with a similar procedure:

1. Check the checkboxes on the Pull Request description accordingly to the review you want to request in the internal QA review section.
2. Make sure the QA reviewers are set up correctly:
   * Citlali (@CitMC) for language review.
3. Remove the label `b9lab-external-review` and instead apply the label `b9lab-qa-review`.
4. Inform (ping) all reviewers via Slack with a link to the Pull Request.

## R4 - final QA review

Finally, the content goes through a last external QA review before it is released for publishing:

1. Check the checkboxes on the Pull Request description accordingly to the review you want to request in the final QA review section.
2. Make sure the QA reviewers are set up correctly:
   * Noam (@nooomski).
3. Remove the label `b9lab-qa-review` and instead apply the label `final-qa-review`.
4. Inform (ping) all reviewers via Slack with a link to the Pull Request.

Once the final QA review has been completed, the reviewers should update the checkboxes on the description to indicate the review is completed.

## Ready to merge

Finally, the Pull Request should be:
- Assigned to Ibo Sy (@coldice) for final merge and approval.
- Remove the Draft state
- Check the box _Ready to be merged_ at the end of the checklist
