---
order: 19
---

# Entrypoints

In golang the convention is to place files that compile to a binary in the `./cmd` folder of a project. For your application there are 2 binaries that you want to create:

- `nsd`: This binary is similar to `bitcoind` or other cryptocurrency daemons in that it maintains p2p connections, propagates transactions, handles local storage and provides an RPC interface to interact with the network. In this case, Tendermint is used for networking and transaction ordering.
- `nscli`: This binary provides commands that allow users to interact with your application.

To get started create two files in your project directory that will instantiate these binaries:

- `./cmd/nsd/main.go`
- `./cmd/nscli/main.go`

## `nsd`

Start by adding the following code to `cmd/nsd/main.go`:

> _*NOTE*_: Your application needs to import the code you just wrote. Here the import path is set to this repository (`github.com/cosmos/sdk-tutorials/nameservice`). If you are following along in your own repo you will need to change the import path to reflect that (`github.com/{ .Username }/{ .Project.Repo }`).

<<<@/nameservice/cmd/nsd/main.go

Notes on the above code:

- Most of the code above combines the CLI commands from Tendermint, Cosmos-SDK and your Nameservice module.

## `nscli`

Finish up by building the `nscli` command:

> _*NOTE*_: Your application needs to import the code you just wrote. Here the import path is set to this repository (`github.com/cosmos/sdk-tutorials/nameservice`). If you are following along in your own repo you will need to change the import path to reflect that (`github.com/{ .Username }/{ .Project.Repo }`).

<<<@/nameservice/cmd/nscli/main.go

Note:

- The code combines the CLI commands from Tendermint, Cosmos-SDK and your Nameservice module.
- The [`cobra` CLI documentation](http://github.com/spf13/cobra) will help with understanding the above code.
- You can see the `ModuleClient` defined earlier in action here.
- Note how the routes are included in the `registerRoutes` function.

### Now that you have your binaries defined its time to deal with dependency management and build your app.
