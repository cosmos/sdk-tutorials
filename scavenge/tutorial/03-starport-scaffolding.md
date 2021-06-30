---
order: 3
---

# Starport
## Requirements 

For this tutorial we will be using [Starport](https://github.com/tendermint/starport) v0.13.1, an easy to use tool for building blockchains. To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.13.1! | bash
```

You can also use Starport v0.13.1 on the web in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.13.1). Learn more about other ways to [install Starport](https://github.com/tendermint/starport/blob/develop/docs/1%20Introduction/2%20Install.md).

## Creating a blockchain

Afterwards, you can enter in `starport` in your terminal, and should see the following help text displayed:
```sh
$ starport
A tool for scaffolding out Cosmos applications

Usage:
  starport [command]

Available Commands:
  app         Generates an empty application
  build       Builds an app and installs binaries
  chain       Relay connects blockchains via IBC protocol
  help        Help about any command
  module      Manage cosmos modules for your app
  network     Create and start blockchains collaboratively
  serve       Launches a reloading server
  type        Generates CRUD actions for type
  version     Version will output the current build information

Flags:
  -h, --help     help for starport
  -t, --toggle   Help message for toggle

Use "starport [command] --help" for more information about a command.
```

Now that the `starport` command is available, you can scaffold an application by using the `starport scaffold chain` command:

```bash
$ starport scaffold chain --help
Generates an empty application

Usage:
  starport scaffold chain [github.com/org/repo] [flags]

Flags:
      --address-prefix string   Address prefix (default "cosmos")
  -h, --help                    help for app
      --sdk-version string      Target Cosmos-SDK Version -launchpad -stargate (default "stargate")
```

Let's start by scaffolding our `scavenge` application with `starport scaffold chain`. This should generate a directory of folders called `scavenge` inside your current working directory, as well as scaffold our `scavenge` module. 

```bash
$ starport scaffold chain github.com/github-username/scavenge --sdk-version="launchpad"

⭐️ Successfully created a Cosmos app 'scavenge'.
👉 Get started with the following commands:

 % cd scavenge
 % starport chain serve

NOTE: add --verbose flag for verbose (detailed) output.
```

You've successfully scaffolded a Cosmos SDK application using `starport`! In the next step, we're going to run the application using the instructions provided. 
