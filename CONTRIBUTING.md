# Cosmos SDK Tutorials repo

This repository contains the code and content for the published [Cosmos SDK Tutorials](https://tutorials.cosmos.network/).


## Most Tutorials are Version-Specific

If the tutorial instructs you to download a specific version, that means that the code and the docs for each tutorial are tested, supported, and based on a specific version of the software. Be sure to download and use the right version.


## Contributing

Thank you for helping us to create and maintain awesome tutorials.

- To set up your environment for success, follow the [technical set up](TECHNICAL-SETUP.md) guidelines.
- To provide feedback, file an issue and provide abundant details to help us understand how we can make it better.
- To provide feedback and a fix, you can make a direct contribution. This repo is protected since we provide the code and the docs to help you learn. If you're not a member or maintainer, fork the repo and then submit a Pull Request from your forked repo to master.

### Language and Style

We welcome contributions to the tutorials. Our technical content follows the Google developer documentation style guide:

- [Google developer documentation style guide](https://developers.google.com/style)
- [Highlights](https://developers.google.com/style/highlights)
- [Word list](https://developers.google.com/style/word-list)
- [Style and tone](https://developers.google.com/style/tone)
- [Writing for a global audience](https://developers.google.com/style/translation)
- [Cross-references](https://developers.google.com/style/cross-references)
- [Present tense](https://developers.google.com/style/tense)

The Google guidelines include more material than is listed here, and are used as a guide that enables easy decision making about proposed content changes.

Other useful resources:

- [Google Technical Writing Courses](https://developers.google.com/tech-writing)
- [GitHub guides on mastering markdown](https://guides.github.com/features/mastering-markdown/)

### Pull Request

When you submit your PR, please use the default [Pull Request template](/.github/pull_request_template.md).


## Platform configuration and use

This documentation platform is using [VuePress](https://vuepress.vuejs.org/) with a [custom theme](https://github.com/b9lab/vuepress-theme-cosmos/tree/b9lab-theme-updates), which is referenced in this repo as [Submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules).

The main VuePress configuration file is located at `.vuepress/config.js`.

### README Metadata

The layout metadata at the top of the README.md file controls the main landing page (`/`). Write permissions are limited to preserve the structure and contents.

### Folder structure

The published content currently lives in two separate folders:

- `academy` contains the _Cosmos Academy_ content
- `tutorials` contains specific tutorials on different topics

### Components and advanced features

There is a hidden file (not linked in the main menu) published at [/feature-test](/feature-test/index.md), which demonstrates the use of all custom components used on this platform. This page is also available on the deployed website at [https://tutorials.cosmos.network/feature-test/](https://tutorials.cosmos.network/feature-test/).


## Images

**Please note that images _must_ be linked using an absolute path!**


## Who works on the tutorials?

Meet the people [behind the Cosmos SDK and contributors](https://github.com/cosmos/sdk-tutorials/graphs/contributors).


## Viewing Tutorial Builds

There are two ways to see what your changes will look like in production before the updated pages are published:

- When a PR is ready for review, you can see a deployed preview on a URL that is unique for that PR.
- While a PR is in DRAFT mode, you can preview a local build.

### Preview PRs on a Deployed Preview

After the PR moves from **Draft** to **Ready for review**, the CI status checks generate a Netlify deploy preview. Netlify keeps this preview up to date as you continue to work and commit new changes to the same branch.

To view a deployed preview on a **Ready for review** PR, click the **Details** link on the netlify commit status line:

![deploy-preview](./deploy-preview.png)

### Preview Draft PRs on a Local Web Browser

Since the deploy preview doesn't work on Draft PRs, follow these steps to preview the tutorial build on a local web browser.

1. If you haven't already, clone the tutorials repo to your local machine and change to that directory. For example:

    ```bash
    cd ~/github
    git clone --recursive https://github.com/cosmos/sdk-tutorials
    cd sdk-tutorials
    ```

2. Local tutorials require JavaScript. If needed, install [npm](https://docs.npmjs.com/cli/v6/commands/npm-install).

3. For each branch you work in, install the npm packages for the SDK tutorials:

    ```sh
    $ npm install
    ```

4. Start the local instance of the tutorial build:

    ```sh
    $ npm run serve
    ```

  A successful client compile looks like: `> VuePress dev server listening at http://localhost:8080/ ✔ Client Compiled successfully in 280.71ms success [12:06:28] Build 03d41f finished in 283 ms! ( http://localhost:8080/ )`

5. You can now view the tutorial build on a local web browser. Isn't this fun?

    **Tip:** On a mac, press the command key and click `http://localhost:8080/` for quick access.
