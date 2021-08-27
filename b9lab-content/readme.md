# Information for B9lab

## B9lab Cosmos developer platform readme
This project runs on [vuepress](https://vuepress.vuejs.org/)

Related repositories:
* [sdk-tutorials on Github (upstream)](https://github.com/cosmos/sdk-tutorials)
* [sdk-tutorials on B9lab gitlab](https://git.b9lab.com/client-projects/cosmos/cosmos-developer-platform)
* [vuepress-theme-cosmos](https://github.com/cosmos/vuepress-theme-cosmos)

## Local development
Install the application with
`npm install`
and run it with 
`npm run serve`

## Features
You can find the feature test file in /feature-test locally, or on [our staging server](http://prview-w4572v20dp8fqtbd7v.s3-website-eu-west-1.amazonaws.com/feature-test)

## Internal Workflow (Gitlab)

|               | Overview                                                   |
|---------------|------------------------------------------------------------|
| Main branch   | `b9lab-content-updates`                                          |
| Workflow      | `feature` --> `b9lab-content-updates`                            |
| Naming schema | `is-feature-description` where `is` are your name initials |
| Merge by      | All                                                        |
| Managed by    | Citlali                                                    |

On our git (gitlab), you can always find the most recent content on the `b9lab-content-updates` branch.
* To work on an update, branch out of `b9lab-content-updates` into a feature branch, named `xx-your-feature-description`, where `xx` are your name initials (two letter code).
* When complete, setup a merge request from your branch toward `b9lab-content-updates`. If a review is required, you can request a review directly, otherwise you can merge into `b9lab-content-updates` directly, if no further check or discussion is required.
* In case of questions, please ping Citlali.
* Never push to main!

## Transfer to Github (upstream)
Manually handled by Ibo

## Cosmos review (Github)

|               | Overview                                                   |
|---------------|------------------------------------------------------------|
| Main branch   | `b9lab-content-updates`                                    |
| Workflow      | `b9lab-content-updates` --> `main (master)`                |
| Merge by      | Billy / Cosmos team                                        |
| Managed by    | Ibo                                                        |

When a content package is ready for review by cosmos, we will transfer it to the b9lab-content-updates branch in the Github repo and open a pull request towards main. This will then be reviewed and merged by the Cosmos team.
Note: Updates on the pull request in the upstream repository will be pulled downstream after merge, so you don't need to sync them manually.

# Information for cosmos
## General
This readme holds information for the update coordination between cosmos and B9lab during our project run. The goal is to extend the existing platform with new content, new functionalities and a new design. We are following the published contribution guidelines and processes, requesting a review and merge of our updates via a Github PR.

As we are extending the platform functionality, you will see updates to the platform code in the `.vuepress` directory. These updates are pushed in through the `b9lab-platform-updates` branch.

Content updates are pushed in through the `b9lab-content-updates` branch and will focus on changing the content inside the `./b9lab-content` folder.

## Menu outline
We have also updated the main config in `./vuepress/config.js` with the outline for these new sections, but deactivated them for now, allowing us to already merge into main without revealing the new content yet. Further reorganization of the main menu might happen before this project's updates are published.

## New features
We have added an (unlinked) overview page for the new features at `/feature-test`, demonstrating the use of these new components. Currently, you will find there:
* Multi Code Box (CodeGroup)
* Expansion panel
* H5P Container
* Highlight Box for info, tip, warning and further reading (Note: the styling of these will be updated)

## Update steps
* We will initially push a big update to the `b9lab-platform-updates` branch, which contains the new features and the file/folder outline for the b9lab content.
* This will be followed by multiple updates to `b9lab-content-updates`, aiming for a short review cycle for the new content updates
* There will be another big update at a later point, implementing design updates through the platform updates branch. This might be combined with a final update, releasing the new content to the public.
