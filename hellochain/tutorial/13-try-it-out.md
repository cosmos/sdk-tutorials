---
order: 4
---

# Try It Out

We are almost finished but lets take a quick moment to try out the parts
we've built to see how they work.

Run these commands and take a looks at the help text for the subcommands they
support.

```bash
$ hcd
$ hccli
```

### Init

Look interesting? Ok lets start our first chain. All chain data and
configuration are stored in a default dir `~/.hellod` (set in the starter
package for now). Our new chain needs to be initialized with a "moniker". This
will auto-generate default config files and a `genesis.json` containing the
default genesis state of the modules we are using in our simple app.

```bash
$ hcd init hellochain
```

### Genesis

But what about coins? Let's seed our genesis.json with some accounts and
balances of coins for them to use (NOTE a Cosmos account does not exist until
it has been funded by a Tx).

First you need to create keys for your different accounts. Give them an easy
password you can remember.

```bash

$ hccli keys add alice

$ hccli keys add bob

```

Next we need to add these accounts to `genesis.json` with a corresponding
positive balance. The CLI package of `genutil` provides the command for us. We
will give each account plenty of "stake" which is the default denomination for
the bonding coin. We can also grant more coins of our own denomination. NOTE:
the "$()" syntax allows us to execute a subcommand within our shell command in
this case returning the address for a given account.

```bash
$ hcd add-genesis-account $(hccli keys show alice -a) 100000000000stake,100hello

$ hcd add-genesis-account $(hccli keys show bob -a) 100000000000stake,1000hello

```

Now start up your blockchain node. Don't worry it won't be able to find seeds.

```bash
$ hcd start
I[2019-08-06|16:59:15.977] Starting ABCI with Tendermint                module=main
E[2019-08-06|16:59:16.005] Couldn't connect to any seeds                module=p2p
I[2019-08-06|16:59:21.019] Executed block                               module=state height=2 validTxs=0 invalidTxs=0
I[2019-08-06|16:59:21.020] Committed state                              module=state height=2 txs=0 appHash=7377248821C962C10C81007882954D749BC65B1F458EFE40A844F78FBBD9F635
I[2019-08-06|16:59:26.029] Executed block                               module=state height=3 validTxs=0 invalidTxs=0
I[2019-08-06|16:59:31.037] Committed state                              module=state height=4 txs=0 appHash=7377248821C962C10C81007882954D749BC65B1F458EFE40A844F78FBBD9F635
I[2019-08-06|16:59:36.047] Executed block                               module=state height=5 validTxs=0 invalidTxs=0
...and watch the blocks roll by!
```

And in another window, lets now try to query our running node. Start with the
`status` query.

```bash
$ hccli status
```

Now lets check our account balances and try sending a few transactions. These
queries should return the account balances you set in the add-genesis-account
command.

``` bash
$ hccli query account $(hccli keys show alice -a)

$ hccli query account $(hccli keys show bob -a)
```

And to send coins from one account to another...

```bash
# Usage: hccli tx send [from_key_or_address] [to_address] [amount] [flags]

$ hccli tx send $(hccli keys show alice -a) $(hccli keys show bob -a) 50hello

```

These commands will print a JSON representation of the Tx for you to inspect
before entering your password to sign and broadcast it to your node. Query the
account afterward to see if the balance changed.

Ok well done, we now have a basic blockchain. It can send and receive coins,
big deal. Now lets add some functionality of our own making to see how flexible
the Cosmos SDK can be.