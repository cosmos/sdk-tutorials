# Simulation of Auction Front-Running

As we mentioned in the previous section we are exploring in this section front-running in the context of namespace auctions. Here we will simulate front-running using the namespace-auction module. 

Before we start, we need to navigate to `scripts/single_node`. Here we will set up a single node blockchain for local testing. This can be done by running the `setup.sh` script located in the `scripts/single_node` directory. This script initialises a new blockchain and creates three accounts (val1, alice, bob) with initial balances.

```shell
bash ./scripts/single_node/setup.sh
```

Following running this script, your local testing environment should be ready and you can proceed with the next steps.

Here's how you can do it:

1. Run the front-running script: 

```shell
bash ./scripts/single_node/frontrun.sh.
``` 

This script simulates a transaction where a user tries to reserve a namespace before another user does. When running the script we see alice attempts to reserve the namespace `bob.cosmos`.

2. Open the log file of the validator node. The location of this file can vary depending on your setup, but it's typically located in a directory like `$HOME/cosmos/nodes/#{validator}/logs`. The directory in this case will be under the validator so, `beacon` `val1` or `val2`.

```shell
tail -f $HOME/cosmos/nodes/#{validator}/logs
```

3. Search for the log message `💨 :: Found a Bid to Snipe`. You can do this manually or use a command like grep if you're using a Unix-like operating system.

If you find instances of `💨 :: Found a Bid to Snipe`, it indicates that the validator has identified a bid to potentially front-run. This is the desired behavior in this scenario, demonstrating that front-running has occurred.

Remember, this is a demonstration of potential malicious behavior by a validator and is not a recommended practice in a real-world application. The purpose of this exercise is to understand the potential issues and how to mitigate them.

An example of what you might see in the logs is:

```shell
5:46PM INF 💨 :: Found a Bid to Snipe module=server
```

If the log message `💨 :: Found a Bid to Snipe` is not present after running the front-running script, ensure there are bid transactions in the mempool and that your logging level includes Info messages. If these conditions are met and the message is still absent, it indicates that no bids were identified for potential front-running during the proposal building process.

Next, to verify the status of the namespace `bob.cosmos`, we perform the following command:

```shell 
./build/cosmappd query ns whois bob.cosmos
```

You should receive something like this:

```shell
name:
  amount:
  - amount: "2000"
    denom: uatom
  name: bob.cosmos
  owner: cosmos185gc7c296w0xjlq9kjdt6gghnqvdmyckv64e7a
  resolve_address: cosmos185gc7c296w0xjlq9kjdt6gghnqvdmyckv64e7a
```

The owner address corresponds to Alice (`val1` in the keyring)

