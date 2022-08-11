---
title: Prepare and do migrations
order: 6
description: Keep your software and network up to date
tag: deep-dive
---

# Prepare and do migrations

Your software is now running, that is good. Time passes and a software upgrade vote proposal passed. You need to upgrade your node to the next version. The state may need to migrate too. When the state needs to migrate, it is also said that there are _breaking changes_. This state migration is the upgrade step that takes most of the time.

You can do the whole process somewhat manually or use a tool to assist you do it smoothly and fast. This is not an unreasonable concern since, when you upgrade, all nodes are simultaneously down.

The main tool is [Cosmovisor](https://docs.cosmos.network/master/run-node/cosmovisor.html). It is a wrapper executable that in turn launches your node as a subprocess and can be configured to stop at a certain point, of time or of block height.

Before you upgrade your mainnet, it is good practice to upgrade your testnet(s). You can also use your mainnet state in a temporary testnet to test the computation needs of your state upgrade.

<!-- TODO at which versions does the below apply? Anyway we want to use the latest advised way -->

## Set up Cosmovisor

Cosmovisor is a piece of software that you need to [install](https://docs.cosmos.network/master/run-node/cosmovisor.html#installation) on your node computer. Its configuration is done via:

1. [Environment variables](https://docs.cosmos.network/master/run-node/cosmovisor.html#command-line-arguments-and-environment-variables).
2. [Configuration files and folders](https://docs.cosmos.network/master/run-node/cosmovisor.html#folder-layout) that are polled at interval and which you prepare by hand or via [a command](https://docs.cosmos.network/master/run-node/cosmovisor.html#initialization).

When starting you can pass it command-line arguments that it will pass on to the wrapped Cosmos chain executable. Typically, `cosmovisor run start`, where `start` is the same as in `myprojectd start`.

What Cosmovisor does when it launches is:

1. Start and launch your node executable, say `myprojectd`.
2. Poll regularly, for instance in `.myprojectd/data/upgrade-info.json`, for potential upgrade information. Note how this file is in the `data` folder and created by the [`x/upgrade` module](https://docs.cosmos.network/master/building-modules/upgrade.html) when appropriate.
3. When an upgrade information is available, it will wait for the executable to stop on its own, in effect after it has committed all state at the given block height.
4. If instructed to, it downloads the new executable, otherwise it looks for it in the configuration folder, for instance `.myprojectd/cosmovisor/upgrades/<name>/bin`.
5. Swaps out the symbolic link to the `current` executable to the new one.
6. Restarts the node.

The node, when restarting launches the [in-place migration](https://docs.cosmos.network/master/core/upgrade.html) process for all modules that have a [new version](https://docs.cosmos.network/master/core/upgrade.html#tracking-module-versions).

Downloading an executable is a potential security risk, so although you have the [choice of doing it](https://docs.cosmos.network/master/run-node/cosmovisor.html#auto-download) automatically, this is not the default behavior.

Earlier, you may have set up your node executable as a service. If you use Cosmovisor, you can in fact replace your node executable in the declaration of your node service. Update its ``/etc/systemd/system/myprojectd.service`` service declaration as such:

```ini
[Unit]
Description=My Project Chain Daemon
After=network-online.target

[Service]
User=chainuser
ExecStart=$(which cosmovisor) run start
Restart=always
RestartSec=3
LimitNOFILE=4096

Environment="DAEMON_HOME=$HOME/.myprojectd"
Environment="DAEMON_NAME=myprojectd"
Environment="DAEMON_ALLOW_DOWNLOAD_BINARIES=false"
Environment="DAEMON_RESTART_AFTER_UPGRADE=true"

[Install]
WantedBy=multi-user.target
```

After which, you can relaunch your node with:

```sh
$ sudo systemctl restart myprojectd
```

## Upgrade manually

Cosmovisor is here to help you migrate fast. You can still do it [by hand](https://hub.cosmos.network/main/hub-tutorials/upgrade-node.html#manual-software-upgrade).

## Migrate

Idea: https://www.getoutsidedoor.com/2022/07/05/cosmos-dev-series-cosmos-blockchain-upgrade/

https://hub.cosmos.network/main/hub-tutorials/upgrade-node.html

In place migration: https://github.com/cosmos/cosmos-sdk/blob/main/docs/core/upgrade.md