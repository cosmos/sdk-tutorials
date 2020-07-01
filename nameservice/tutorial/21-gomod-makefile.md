---
order: 21
---

# go.mod and Makefile

## `Makefile`

Help users build your application by writing a `./Makefile` in the root directory that includes common commands. The scaffolding tool has created a generic makefile that you will be able to use:

> _*NOTE*_: The below Makefile contains some of same commands as the Cosmos SDK and Tendermint Makefiles.

+++ https://github.com/cosmos/sdk-tutorials/blob/master/nameservice/Makefile

### How about including Ledger Nano S support?

This requires a few small changes:

- Create a file `Makefile.ledger` with the following content:

+++ https://github.com/cosmos/sdk-tutorials/blob/master/nameservice/Makefile.ledger

- Add `include Makefile.ledger` at the beginning of the Makefile:

+++ https://github.com/cosmos/sdk-tutorials/blob/master/nameservice/Makefile

## `go.mod`

Golang has a few dependency management tools. In this tutorial you will be using [`Go Modules`](https://github.com/golang/go/wiki/Modules). `Go Modules` uses a `go.mod` file in the root of the repository to define what dependencies the application needs. Cosmos SDK apps currently depend on specific versions of some libraries. The below manifest contains all the necessary versions. To get started replace the contents of the `./go.mod` file with the `constraints` and `overrides` below:

> _*NOTE*_: If you are following along in your own repo you will need to change the module path to reflect that (`github.com/{ .Username }/{ .Project.Repo }`).

- You will have to run `go get ./...` to get all the modules the application is using. This command will get the dependency version stated in the `go.mod` file.
- If you would like to use a specific version of a dependency then you have to run `go get github.com/<github_org>/<repo_name>@<version>`

<!-- <<< @/nameservice/go.mod -->

## Building the app

```bash
# Install the app into your $GOBIN
make install

# Now you should be able to run the following commands:
nsd help
nscli help
```

### Congratulations, you have finished your nameservice application! Try running and interacting with it!
