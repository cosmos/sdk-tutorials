# Information for B9lab

## B9lab Cosmos developer platform readme

This project runs on [vuepress](https://vuepress.vuejs.org/).

Related repositories:

* [sdk-tutorials on Github (upstream)](https://github.com/cosmos/sdk-tutorials)
* [sdk-tutorials on private B9lab GitLab](https://git.b9lab.com/client-projects/cosmos/cosmos-developer-platform)
* [vuepress-theme-cosmos](https://github.com/cosmos/vuepress-theme-cosmos)

## Local development

To contribute to this project, install the Developer Portal application to enable preview on a local web browser.

1. If you haven't already, clone the repo to your local machine and change to that directory. For example:

    ```bash
    cd ~/github
    git clone https://git.b9lab.com/client-projects/cosmos/cosmos-developer-platform
    cd cosmos
    ```

2. Local tutorials require JavaScript. If needed, install [npm](https://docs.npmjs.com/cli/v6/commands/npm-install).

3. For each branch you work in, install the npm packages for the Developer Portal:

    ```bash
    npm install
    ```

4. Start the local instance of the portal build:

    ```bash
    npm run serve
    ```

    A successful client compile looks like: 
    
    ```bash
    > VuePress dev server listening at http://localhost:8080/ ✔ Client Compiled successfully in 280.71ms success [12:06:28] Build 03d41f finished in 283 ms! ( http://localhost:8080/ )
    ```

5. You can now view the portal build on a local web browser. 

    Tip: On a Mac, press the command key and click `http://localhost:8080/` for quick access to the local preview. If you are already using port 8080 on your local machine, the preview increments to the next available port 8081, and so on. 

## Features

You can find the feature test file in `/feature-test` locally or on [the staging server](http://prview-w4572v20dp8fqtbd7v.s3-website-eu-west-1.amazonaws.com/feature-test).

## Internal B9lab Workflow (GitLab)

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

When a content package is ready for review by Cosmos, we will transfer it to the b9lab-content-updates branch in the Github repo and open a pull request towards main. This will then be reviewed and merged by the Cosmos team.
Note: Updates on the pull request in the upstream repository are pulled downstream after the merge, so you don't need to sync them manually.

# Information for Cosmos Collaboration

## General

This `readme` holds information for the update coordination between Cosmos and B9lab during our project run. The goal is to extend the existing platform with new content, new functionalities, and a new design. The project follows the published contribution guidelines and processes for requesting a review and merging updates using a PR on GitHub.

As platform functionality is extended, updates to the platform code are made in the `.vuepress` directory. These updates are pushed in through the `b9lab-platform-updates` branch.

Content updates are pushed in through the `b9lab-content-updates` branch and focus on changing the content inside the `./b9lab-content` folder.

## Menu Outline

We have also updated the main config in `./vuepress/config.js` with the outline for these new sections, but deactivated them for now, allowing us to already merge into main without revealing the new content yet. Further reorganization of the main menu might happen before this project's updates are published.

## New features
We have added an (unlinked) overview page for the new features at `/feature-test` that demonstrate the use of these new components. Current features include:

* Multi Code Box (CodeGroup)
* Expansion panel
* H5P Container
* Highlight Box for info, tip, warning, and further reading (Note: the styling of these will be updated)

## Update Steps

* The initial big update is a push to the `b9lab-platform-updates` branch that contains the new features and the file and folder outline for the B9lab content.
* This initial update will be followed by multiple updates to `b9lab-content-updates`, allowing for shorter review cycles for the new content updates.
* Another big update is planned for a later point to implement design updates through the platform updates branch. This design update might be combined with a final update before releasing the new content to the public.
