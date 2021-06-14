---
parent:
  title: Publish your Starport app on Digital Ocean
order: 0
description: Publish the Starport blockchain application on an Ubuntu 20.04 droplet on Digital Ocean.
---

# Publish your Starport blockchain app on Digital Ocean

In this tutorial you will learn how to publish your blockchain application on Digital Ocean.

In the first chapter, create a new Cosmos SDk blockchain with Starport.
Upload it to Digital Ocean and access the app on the web.

This guide can be helpful with other cloud services, some details might change.
To have the best experience following this tutorial, it is recommended to use Digital Ocean. As operating system from your side, we expect MacOS or a Linux distribution. Be aware when using Windows, some steps might change significantly.

**You will learn how to**

- Create a Cosmos SDK blockchain app with starport
- Create a Droplet on Digital Ocean
- Upload your app to the Droplet
- Run the app on the Droplet

## Create your Starport app

To create a starport app, make sure Go and Starport are installed. Afterwards, create a Starport blockchain app with a few commands.

### Installing Go

Before you start using Starport, you should check that your system has Go installed. To do so run:

```
go version
```

If you see `go1.16` (or higher), then you have the right version of Go installed. If the output is `command not found` or installed version of Go is older than 1.16, [install or upgrade Go](https://golang.org/doc/install).

### Installing Starport CLI

To install Starport run the following command:

```
curl https://get.starport.network/starport! | bash
```

This command will fetch the `starport` binary and install it into `/usr/local/bin`. If this command throws a permission error, lose `!` and it will download the binary in the current directory, you can then move it manually into your `$PATH`.

Create the Starport application on your local computer, which we want to upload to our droplet.
Create a new directory and run Starport to create a new Cosmos SDK blockchain app.

On your local computer, in the terminal run

```bash
mkdir digitalocean
cd digitalocean
starport app github.com/<username>/<appname>
```

This creates a blockchain app with backend and frontend. The default scaffold is a working blockchain app with the functionality similar to the Cosmos Hub ($ATOM). Learn about the [Cosmos Hub](https://hub.cosmos.network/main/hub-overview/overview.html) or [ATOM](https://cosmos.network/features).

If you want to change any parameters of the blockchain, [learn how to configure](https://docs.starport.network/configure/) your blockchain app with Starport.

## Host your app on Digital Ocean

Digital Ocean offers cloud server. We will use the Digital Ocean infrastructure to publish a Cosmos SDK blockchain application. This will ensure the app will run permanently and is accessible on the web. 
To have the app accessible on the web will allow other apps or new nodes to connect to your blockchain network.

### Prerequisites

You will need an account with [Digital Ocean](https://cloud.digitalocean.com/). If you do not have one, the first Droplet should come for free, as you get a sign-up bonus from Digital Ocean.

## Create a new Droplet on Digital Ocean

Log into your Digital Ocean account, go to the [cloud](https://cloud.digitalocean.com/).
Click on Create in the top bar and then `Droplet`.

We will choose Ubuntu 20.04 (LTS) x64 as image.

![Ubuntu 20.04 Image](./do-ubuntu-image.png "Choose Ubuntu 20.04")

In the next step you can choose the size of an image. For a regular (not computing intense) blockchain app, 2GB Ram and 1 CPU are sufficient in size. This Droplet comes with a cost of 10 USD per month.

![Digital Ocean Droplet Size](./do-droplet-size.png "Digital Ocean Droplet Size")

As Authentication, access via ssh key is recommended. [Learn how to setup your SSH key](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-2) and use it as authentication method to access your Droplet.

Optionally add a Droplet name and click "Create Droplet".

In the list of your Droplets you see your new Droplet. Copy the IP address and open your terminal.

In your terminal, you type `ssh root@<IP address>` to access your new node.

### Setup Your Server

First, create a new user that will run the blockchain. You can choose a username, in this example you can use `appuser` as username.

```bash
adduser appuser
```

You will be prompted to enter a new password for appuser. After entering a password, you will be asked for Full Name, Room Number, Work Phone, Home Phone or Others, hit ENTER to use the default values.

The new user is created, to have it all the rights in the system you will need to add it to the `sudo` group.

```bash
usermod -aG sudo appuser
```

To be able to login as the new user, copy your ssh public key to the new users home directory

```bash
rsync --archive --chown=appuser:appuser ~/.ssh /home/appuser
```

To setup your server to install and run the starport app, we will need to install a few tools which will help us to publish your blockchain app.

Install [Go](https://golang.org/dl/).

At the time of writing the version is 1.16.5.

```bash
cd ~
wget https://golang.org/dl/go1.16.5.linux-amd64.tar.gz
sha256sum go1.16.5.linux-amd64.tar.gz
# b12c23023b68de22f74c0524f10b753e7b08b1504cb7e417eccebdd3fae49061  go1.16.5.linux-amd64.tar.gz
```

Extract the archive and keep it in /usr/local

```bash
sudo tar -xvf go1.16.5.linux-amd64.tar.gz -C /usr/local
```

You will now have a directory called go in the /usr/local directory. Next, recursively change this directory’s owner and group to appuser:

```bash
sudo chown -R appuser:appuser /usr/local/go
```

Add the go paths to your profile

```bash
nano ~/.profile
```

At the end of the file, add the following two lines

```bash
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin:/usr/local/go/bin
```

To update your profile

```bash
source ~/.profile
```

Now you can verify your go installation with 

```bash
go version
```

which should print

```bash
go version go1.16.5 linux/amd64
```

To use Starport, install the Starport CLI.

```bash
curl https://get.starport.network/starport! | sudo bash
``` 

## Upload your app to the Droplet

There are a few methods available to upload your app to the Droplet. One convinient way might be to upload the app to GitHub and then download it on your Droplet again. Starport creates a new GitHub repository for you to make it convinient to add it to your repositories.

We will upload the files now with `scp`, to avoid a few extra steps. 

On your local machine, use the following command to upload the app directory to your server.

`scp -r <appname> appuser@<IP address>:/home/appuser/`

This uploads your local app to your Digital Ocean droplet, into the `/home/appuser` directory, the home directory of the `appuser`.

After the upload finished, navigate on your Droplet into the `/home/appuser/<appname>` directory.

## Install your app

To install your app and configuration, use the Starport CLI

```bash
cd /home/appuser/<appname>
starport serve
```

This will build your Starport app, create a genesis file and your configuration.
You will see an output similar to

```bash
Cosmos SDK's version is: Stargate v0.40.0 (or later)

🛠️  Building proto...
📦 Installing dependencies...
🛠️  Building the blockchain...
💿 Initializing the app...
🙂 Created account "alice" with address "cosmos1sucepwrvgkud7fc6ftne8s2glzjpqx4zsl6zxa" with mnemonic: "expect goddess business detail loud know broom trial deliver board victory despair tackle ripple body weapon runway lawn roast cactus attitude midnight town fox"
🙂 Created account "bob" with address "cosmos15jayucugyfnlj4tu7xhutnufxr4qd8j6qjmekk" with mnemonic: "mouse lamp excuse young top century empower afford oven grass pass heavy evil sample lake trick leisure aisle bird dumb radio learn ecology stamp"
Genesis transaction written to "/home/appuser/.digitalocean/config/gentx/gentx-85ef06cb86aa501cceb9ed0a497a02503f5aa57f.json"
🌍 Tendermint node: http://0.0.0.0:26657
🌍 Blockchain API: http://0.0.0.0:1317
🌍 Token faucet: http://0.0.0.0:4500
```

Abort the running process with the shortcut ctrl+c

When everything worked fine, you can confirm the installation with 

```bash
digitaloceand
```

and it prints

```bash
Stargate CosmosHub App

Usage:
  digitaloceand [command]

Available Commands:


  add-genesis-account Add a genesis account to genesis.json
  collect-gentxs      Collect genesis txs and output a genesis.json file
  debug               Tool for helping with debugging your application
  export              Export state to JSON
  gentx               Generate a genesis tx carrying a self delegation
  help                Help about any command
  init                Initialize private validator, p2p, genesis, and application configuration files
  keys                Manage your application's keys
  migrate             Migrate genesis to a specified target version
  query               Querying subcommands
  start               Run the full node
  status              Query remote node for status
  tendermint          Tendermint subcommands
  tx                  Transactions subcommands
  unsafe-reset-all    Resets the blockchain database, removes address book files, and resets data/priv_validator_state.json to the genesis state
  validate-genesis    validates the genesis file at the default location or at the location passed as an arg
  version             Print the application binary version information

Flags:
  -h, --help                help for digitaloceand
      --home string         directory for config and data (default "/home/appuser/.digitalocean")
      --log_format string   The logging format (json|plain) (default "plain")
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic) (default "info")
      --trace               print out full stack trace on errors

Use "digitaloceand [command] --help" for more information about a command.
```

## Create a Systemd process

The `starport serve` command helps installing, building and configuring your app for a new blockchain. You received tokens on newly created accounts.
It is not meant to be run for a long time in production. In order for the app to run for a longer time, a systemd process is recommended.

Create the log files and a systemd file to manage your process while you can log off from the terminal and be confident it keeps running, even when the server restarts.

```bash
sudo mkdir -p /var/log/digitaloceand
sudo touch /var/log/digitaloceand/digitaloceand.log
sudo touch /var/log/digitaloceand/digitaloceand_error.log
sudo touch /etc/systemd/system/digitaloceand.service
```

Now enter the systemd service file with nano and fill in your application details

```bash
sudo nano /etc/systemd/system/digitaloceand.service
```


Add the following content to the file

```bash
[Unit]
Description=digitalocean daemon
After=network-online.target
[Service]
User=appuser
ExecStart=/home/appuser/go/bin/digitaloceand start --home=/home/appuser/.digitalocean
WorkingDirectory=/home/appuser/go/bin
StandardOutput=file:/var/log/digitaloceand/digitaloceand.log
StandardError=file:/var/log/digitaloceand/digitaloceand_error.log
Restart=always
RestartSec=3
LimitNOFILE=4096
[Install]
WantedBy=multi-user.target
```

Close and save the file with the shortcut ctrl+x, then type Y and press Enter

Next step is to enable the file, to be available even after a system start.

```bash
sudo systemctl enable digitaloceand.service
```

Now start the process

```bash
sudo systemctl start digitaloceand.service
```

Check the logs with

```bash
sudo journalctl -u digitaloceand -f
```

Your app is now running on Digital Ocean.

## Connect your local running chain to the published chain

To connect your local running chain with the published app, you have to find the node you just created with the IP. Then download the genesis file and configure your app to connect to the published node.

On your Digital Ocean droplet, find the hash of the node by typing

```bash
digitaloceand tendermint show-node-id
# e.g. 85ef06cb86aa501cceb9ed0a497a02503f5aa57f
```

Each node will have a different node id. 
Back on your local machine, initialise your blockchain with

```bash
digitaloceand init localnode
```

Now download the `genesis.json` file from your node

```bash
scp appuser@<IP address>:/home/appuser/.digitalocean/config/genesis.json ~/.digitalocean/config/
```

Now add the published node ID and IP into the configuration file.

```bash
nano ~/.digitalocean/config/config.toml
```

Use the node-id we had before, together with the IP and default port.

```bash
# Comma separated list of nodes to keep persistent connections to
persistent_peers = "85ef06cb86aa501cceb9ed0a497a02503f5aa57f@<IP address>:26656"
```

Start the node 

```bash
digitaloceand start
```

You can use a tool like `gex` to see if you are connected to a node. You can install this on your remote and local machine with

```bash
go get -u github.com/cosmos/gex
```

Afterwards start it with

```bash
gex
```

When it says `1` in the `Connected Peers` box, then everything is setup successfully.

## Optional: Setup a firewall on your Droplet

In order to reduce load and attacks to your droplet, you can setup a firewall.
Digital Ocean does provide a nice UI for creating a firewall and you can use the one Digital Ocean provides as well. In this tutorial it will be a bit more generalistic approach and use the `ufw` firewall to block anything that is not related to your blockchain app.

Setup the following rules for ufw, to make it work with your blockchain app.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 60000:61000/udp
sudo ufw allow 26657/tcp
sudo ufw allow 1317/tcp
sudo ufw allow 8080/tcp
sudo ufw --force enable
```

