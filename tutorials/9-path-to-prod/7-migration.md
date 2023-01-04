---
title: Prepare and Do Migrations
order: 8
description: Keep your software and network up to date
tags:
  - guided-coding
  - cosmos-sdk
  - dev-ops
---

# Prepare and Do Migrations

Your software is now running, which is good, but perhaps over time, a software upgrade vote proposal is passed. You now need to upgrade your node to the next version. The state may need to migrate too. When the state needs to migrate, it is also said that there are _breaking changes_. This state migration is the upgrade step that takes most of the time.

You can do this whole process somewhat manually, or use a tool to assist you to do it smoothly and fast. This is not an unreasonable concern, since when you perform an upgrade all nodes are simultaneously down.

The main tool is [Cosmovisor](https://docs.cosmos.network/main/tooling/cosmovisor). This is a wrapper executable that in turn launches your node as a subprocess. It watches out for when the node stops and drops upgrade information.

Before you upgrade your mainnet, it is good practice to upgrade your testnet(s). You can also use your mainnet state in a temporary testnet to test the computation needs of your state upgrade.

<!-- TODO at which versions does the below apply? Anyway we want to use the latest advised way -->

## Set up Cosmovisor

Cosmovisor is a piece of software that you need to [install](https://docs.cosmos.network/main/tooling/cosmovisor.html#installation) on your node computer. Its configuration is done via:

1. [Environment variables](https://docs.cosmos.network/main/tooling/cosmovisor.html#command-line-arguments-and-environment-variables).
2. [Configuration files and folders](https://docs.cosmos.network/main/tooling/cosmovisor.html#folder-layout) that are polled at intervals and which you prepare by hand or via [a command](https://docs.cosmos.network/main/tooling/cosmovisor.html#cosmovisor).

When starting you can pass Cosmovisor command-line arguments that it will pass on to the wrapped Cosmos chain executable. Typically, you use `cosmovisor run start`, where `start` is the same as in `myprojectd start`.

### The process

When it launches, Cosmovisor does the following:

1. Starts and launches your node executable, for, example `myprojectd`.
2. Polls regularly for potential upgrade information, for instance in `.myprojectd/data/upgrade-info.json`.

  <HighlightBox type="note">

  Note how this file is in the `data` folder and created by the [`x/upgrade` module](https://docs.cosmos.network/main/building-modules/upgrade.html) when appropriate.

  </HighlightBox>

3. When `upgrade-info.json` is available, waits for the executable to stop on its own, in effect after it has committed all states at the given block height.
4. If instructed to by the configuration, downloads the new executable as described in `upgrade-info.json`. Otherwise looks for it in the configuration folder, for instance `.myprojectd/cosmovisor/upgrades/<name>/bin`. In this case `<name>` is picked from `upgrade-info.json` too.
5. Exchanges the symbolic link to the `current` executable for the new one.
6. Restarts the node.

When restarting, the node launches its [in-place migration](https://docs.cosmos.network/main/core/upgrade.html) process for all modules that have a [new version](https://docs.cosmos.network/main/core/upgrade.html#tracking-module-versions).

Downloading an executable is a potential security risk, so although you have the [choice of doing it](https://docs.cosmos.network/main/tooling/cosmovisor.html#auto-download) automatically, this is not the default behavior.

Previously, you may have set up your node executable as a service. If you use Cosmovisor, you can in fact replace your node executable in the declaration of your node service. Update its ``/etc/systemd/system/myprojectd.service`` service declaration as follows:

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

<HighlightBox type="synopsis">

To summarize, this section has explored:

* The implications of an eventual need to upgrade or migrate a running network, with the attendant necessity of all its nodes being simultaneously down.
* How to install and set up **Cosmovisor**, a tool used to reduce downtime and improve the smoothness of an upgrade or migration (by comparison with a "manual" process).
* How to practice using Cosmovisor by upgrading your testnet(s) before you attempt to upgrade your mainnet.

</HighlightBox>
