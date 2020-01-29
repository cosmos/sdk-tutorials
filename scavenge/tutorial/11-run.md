---
order: 11
---

# Run

Now that our module is built and our app is configured to use it we can start running our application! The first thing to do is make sure that the `go.mod` is correct. If you're using an IDE like vscode with `golang` extensions enabled, this should be done automatically for you after saving each file. You can also make sure all dependencies are present by running `go mod tidy`.

Once your dependencies are set, run `make` to build your binaries! You will be creating two binaries. One is the `scavengeD` which is a daemon that runs your actual application. The other binary is `scavengeCLI` which is a tool for interacting with your running application.

After you run `make` you want to make sure you have access to both of those binaries. You can do this by running the `scavengeD --help`, where you should see the following:

```bash
Scavenge Daemon (server)

Usage:
  scavengeD [command]

Available Commands:
  init                Initialize private validator, p2p, genesis, and application configuration files
  collect-gentxs      Collect genesis txs and output a genesis.json file
  gentx               Generate a genesis tx carrying a self delegation
  validate-genesis    validates the genesis file at the default location or at the location passed as an arg
  add-genesis-account Add genesis account to genesis.json
  start               Run the full node
  unsafe-reset-all    Resets the blockchain database, removes address book files, and resets priv_validator.json to the genesis state
                      
  tendermint          Tendermint subcommands
  export              Export state to JSON
                      
  version             Print the app version
  help                Help about any command

Flags:
  -h, --help                    help for scavengeD
      --home string             directory for config and data (default "/home/billy/.scavengeD")
      --inv-check-period uint   Assert registered invariants every N blocks
      --log_level string        Log level (default "main:info,state:info,*:error")
      --trace                   print out full stack trace on errors

Use "scavengeD [command] --help" for more information about a command.
```

You should also be able to run `scavengeCLI --help` which should result in the following screen:
```bash
Scavenge Client

Usage:
  scavengeCLI [command]

Available Commands:
  status      Query remote node for status
  config      Create or query an application CLI configuration file
  query       Querying subcommands
  tx          Transactions subcommands
              
  rest-server Start LCD (light-client daemon), a local REST server
              
  keys        Add or view local private keys
              
  version     Print the app version
  help        Help about any command

Flags:
      --chain-id string   Chain ID of tendermint node
  -e, --encoding string   Binary encoding (hex|b64|btc) (default "hex")
  -h, --help              help for scavengeCLI
      --home string       directory for config and data (default "/home/billy/.scavengeCLI")
  -o, --output string     Output format (text|json) (default "text")
      --trace             print out full stack trace on errors

Use "scavengeCLI [command] --help" for more information about a command.
```

Now we should create some users within our app that have some initial coins that can be used as bounties for other players. First we create two users with the following commands:
```bash
scavengeCLI keys add me
scavengeCLI keys add you
```
Each command will come with a prompt to set a password to secure the account. I usually use `1234567890` when I'm developing so that I don't forget.

Next you need to initialize your application using the Daemon command with a `<moniker>` (which is just a nickname for your machine) and a `<chain-id>` which will be a way to identify your application.

```bash
scavengeD init mynode --chain-id scavenge
```
Now you can add your two accounts to the initial state of the application, called the Genesis, using the following commands:
```bash
scavengeD add-genesis-account $(scavengeCLI keys show me -a) 1000foo,100000000stake
scavengeD add-genesis-account $(scavengeCLI keys show you -a) 1foo
```
Notice we've combined two commands, which includes one from the Daemon and one from the CLI. The CLI command queries the accounts that we created but displays just their addresses. **Addresses are a bit like user IDs**. You'll also notice that we added some coins to the different users. For the user `me` we added some token called `foo` as well as some token called `stake`. We will be using `stake` within the Proof-Of-Stake validation process. Since the user `me` is the only user with `stake`, they will be the only **Validator** interacting with this application. That's great for our purposes since we're just playing around but if you were to run an application in production you might want to have a more Validators helping to make sure your app runs correctly.

Before we start the application it's good to configure your CLI to know that it will be interacting with this app, and not any other one. These commands will tell the CLI to talk to just this application:

```bash
scavengeCLI config chain-id scavenge
scavengeCLI config output json
scavengeCLI config indent true
scavengeCLI config trust-node true
```

Now we want to let the application know that it will be the user `me` who will be validating so we run this command:
```bash
scavengeD gentx --name me
```
This command will ask for the password, which if you're like me is just `1234567890`.

Our finaly step is to tell the application that we're done configuring it. This will collect all of our initial configuraiton and prepare the application to begin:
```bash
scavengeD collect-gentxs
```

I usually combine all of these commands into a single executable file so that if I make changes to the application I don't have to run each one manually. Since some of the commands require a password to be entered I use bash piping to feed in my `1234567890` password. I put everything into a file called `./init.sh` so that it looks like so:

<<< @/scavenge/init.sh

**Now, _finally_, you can run your APPLICATION!** 

To do so open a new terminal window and type the following:
```bash
scavengeD start
```
That's it! You're up and running!

To play with your application take a look at the example commands used to create and solve scavenges.