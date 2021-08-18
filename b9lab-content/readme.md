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
| Main branch   | `content-updates`                                          |
| Workflow      | `feature` --> `b9lab-content-updates`                            |
| Naming schema | `is-feature-description` where `is` are your name initials |
| Merge by      | All                                                        |
| Manager       | Citlali                                                    |

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
| Manager       | Ibo                                                        |

When a content package is ready for review by cosmos, we will transfer it to the b9lab-content-updates branch in the Github repo and open a pull request towards main. This will then be reviewed and merged by the Cosmos team.
Note: Updates on the pull request in the upstream repository will be pulled downstream after merge, so you don't need to sync them manually.