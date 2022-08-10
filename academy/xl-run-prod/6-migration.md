---
title: Prepare and do migrations
order: 6
description: Keep your software and network up to date
tag: deep-dive
---

# Prepare and do migrations

Your software is now running, that is good. Time passes and a software upgrade vote proposal passed. You need to upgrade your node to the next version. The state may need to migrate too. When the state needs to migrate, it is also said that there are _breaking changes_. This state migration is the upgrade step that takes most of the time.

You can do the whole process somewhat manually or use a tool to assist you do it smoothly and fast. This is not an unreasonable concern since, when you upgrade, all nodes are simultaneously down.

The main tool is [Cosmovisor](https://hub.cosmos.network/main/hub-tutorials/upgrade-node.html). It is a wrapper executable that in turn launches your node as a subprocess and can be configured to stop at a certain point, of time or of block height.

Before you upgrade your mainnet, it is good practice to upgrade your testnet(s), if only to practice. You can also use your mainnet state in a temporary testnet to test the state upgrade.

## Set up Cosmovisor

Cosmovisor is a piece of software that you need to install on your node computer. Its configuration is done via:

1. Environment variables.
2. Configuration files that are polled at interval.

What Cosmovisor does when it launches is:

1. Start and launch your node executable, say `myprojectd`.
2. Poll regularly, for instance in `.myprojectd/data/upgrade-info.json`, for potential upgrade information.
3. When an upgrade information is available, it will take note of the block at which to stop.
4. If instructed to, it downloads the new executable, otherwise it looks for it in the configuration folder, for instance `.myprojectd/cosmovisor/upgrades/<name>/bin`.
5. Stops your node executable after it has committed all state at the given block height.
6. Starts the state export and conversion into a new genesis.
7. Swaps out the node executables.
8. Restarts the node.

Downloading an executable is a potential security risk, so you have the choice of not doing it automatically.

Cosmovisor can in fact replace your node executable in the declaration of your node service. You can update its ``/etc/systemd/system/myprojectd.service`` service declaration as such:

```ini
[Unit]
Description=My Project Chain Daemon
After=network-online.target

[Service]
User=chainuser
ExecStart=$(which cosmovisor) start
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