# Cosmos SDK Tutorials repo

This repository contains the code and content for the published along side the [Cosmos SDK documentation](https://docs.cosmos.network/).

## Most Tutorials are Version-Specific

If the tutorial instructs you to download a specific version, that means that the code and the docs for each tutorial are tested, supported, and based on a specific version of the software. Be sure to download and use the right version.

## Contributing

Thank you for helping us to create and maintain this awesome developer portal.

### Language and Style

We welcome contributions to the tutorials. Our technical content follows the Google developer documentation style guide:

* [Google developer documentation style guide](https://developers.google.com/style)
* [Highlights](https://developers.google.com/style/highlights)
* [Word list](https://developers.google.com/style/word-list)
* [Style and tone](https://developers.google.com/style/tone)
* [Writing for a global audience](https://developers.google.com/style/translation)
* [Cross-references](https://developers.google.com/style/cross-references)
* [Present tense](https://developers.google.com/style/tense)

The Google guidelines include more material than is listed here, and are used as a guide that enables easy decision making about proposed content changes.

Other useful resources:

* [Google Technical Writing Courses](https://developers.google.com/tech-writing)
* [GitHub guides on mastering markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

### Pull Request

When you submit your PR, please use the default [Pull Request template](./.github/PULL_REQUEST_TEMPLATE.md).

### Folder structure

The published content currently lives in a few separate folders:

* `tutorials` contains specific tutorials on different topics

## Images

**Please note that images _must_ be linked using an absolute path!**

## Who works on the tutorials?

Meet the people [behind the Cosmos SDK and contributors](https://github.com/cosmos/sdk-tutorials/graphs/contributors).

## Viewing Example Builds

There are two ways to see what your changes will look like in production before the updated pages are published:

* When a PR is ready for review, you can see a preview deployment.
* While a PR is in DRAFT mode, you can preview a local build.

### Pull Requests

After the PR is created CI will kick off and run. All of ci must pass in order to merge the PR. Once the PR is merged, the changes will be deployed to the production site.

```sh
npm run serve
```

to start the local server.

A successful client compile looks like: `> VuePress dev server listening at http://localhost:8080/ ✔ Client Compiled successfully in 280.71ms success [12:06:28] Build 03d41f finished in 283 ms! ( http://localhost:8080/ )`

You can now view the tutorial build on a local web browser at `http://localhost:8080/`.
