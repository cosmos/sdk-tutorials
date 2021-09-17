---
parent:
  title: Understanding the Liquidity Module
order: 0
description: Use the Tendermint liquidity module to create pools, deposit to pools, and withdraw from pools with tokens sent using IBC.
---

# Liquidity Module

The liquidity module, known on the Cosmos Hub as Gravity DEX, enables users to create liquidity pools and swap tokens. 

## Use Liquidity Pools to Trade Tokens

When using your Cosmos SDK-based blockchains, you want to enable users to trade tokens. You can have multiple tokens on your blockchain or have tokens from external blockchains sent to your blocking using inter-blockchain communication protocol (IBC). 

The liquidity module allows users to use pools to trade those tokens on your blockchain. Each pool represents a token pair and allows the user to swap from one token to the other token.

In this tutorial, you create your own blockchain, send tokens to another blockchain, create a pool, deposit to a pool, withdraw from a pool, and swap tokens.

You can follow the [code with us session](https://www.youtube.com/watch?v=GxaqpzMk0jk&t=978s) for hands-on experience

**Important** In the code examples throughout this tutorial, when you see username be sure to substitute your username. 

**You will learn how to:**

- Create a blockchain with Starport
- Create your own token on your blockchain
- Connect your blockchain to the testnet
- Send your own token with IBC to the testnet
- Create a pool with your token
- Use the pool with your token


## Requirements

Before you start the tutorial, install the prerequisite software. 

- [Install Starport](../starport/index.md) v0.17.3 or later

    **Important** This tutorial uses [Starport](https://github.com/tendermint/starport) v0.16.2. The tutorial is based on this specific version of Starport and is not supported for older versions.

- Install the Gravity DEX binary

    - Clone the repo:

    ```bash
    git clone https://github.com/cosmos/gaia && cd gaia
    ```
    
    - Check the current version 

    ```bash
    git checkout v5.0.5
    ```
    
    Note: You can find latest version here - https://github.com/cosmos/gaia/releases
    
    - Install the software:
    
    ```bash
    make install
    ```

    - Verify the gaiad version:  

    ```bash
    gaiad version
    ```

    The output of `gaiad version` prints something like:
    
    ```bash
    v5.0.5
    ```

## Create the Blockchain

Scaffold a new blockchain called `myblockchain`:

```bash
starport scaffold chain github.com/username/myblockchain
```
Change to the blockchain directory:

```bash
cd myblockchain
```

## Add Your Token in the Configuration

Navigate to the top-level folder of your app directory `myblockchain` and use any text editor to edit the `config.yml` file. 

For the `accounts` parameter, add your username and your new token:

```yml
accounts:
  - name: username
    coins: ["10000token", "50000000stake", "1000000000000mytoken"]
```

**Tip** To add your coins, use a list of strings for the initial coins with denominations. You can follow the `.yml` syntax for the auto-generated users `alice` and `bob`.

The minimum reserve coin amount for a pool in the liquidity module is 1,000,000. Make sure you create enough tokens for your liquidity pools. This entry creates enough tokens to create 10 liquidity pools (1000000000000).

## Start Your Blockchain

To start your blockchain, run this command in your local terminal:

```bash
starport chain serve
```

You see output similar to the following output, but with different account passphrases and addresses:

```bash
Cosmos SDK's version is: Stargate v0.40.0 (or later)

🔄 Resetting the app state...
🛠️  Building proto...
📦 Installing dependencies...
🛠️  Building the blockchain...
💿 Initializing the app...
🙂 Created account "alice" with address "cosmos1qur6tvu7p4khtr5zzcx0uk5fq06hfk5xflw83e" with mnemonic: "tank film icon helmet myth devote velvet rib behind exhaust move pass endless combine bag congress pool bean shoulder issue trouble banner best nice"
🙂 Created account "bob" with address "cosmos1w8w3t8rhv5zpvdscy9332wp4tugkg0ezskf95u" with mnemonic: "attract shoulder person upset dream category finish detect country track edge planet crack gloom soldier together hockey arena panel horn rapid zero common marriage"
🙂 Created account "username" with address "cosmos1mr3ss57xexzg7j377vfd24d3vv3vy0e3mpuj6y" with mnemonic: "parent butter piece picnic north thumb knife denial toy silk juice diary cruise idle pink repair radar brisk decide sugar gap joke palm day"
Genesis transaction written to "/Users/joy20/.myblockchaind/config/gentx/gentx-2e8a6a680b4f9adaecfafbc6ecad8b96ef8b9157.json"
🌍 Tendermint node: http://0.0.0.0:26657
🌍 Blockchain API: http://0.0.0.0:1317
🌍 Token faucet: http://0.0.0.0:4500
```

Be patient, using the `starport chain serve` command is powerful and takes a few minutes. You are starting your sovereign application-specific blockchain in development and this command is doing all the work for you. Everything you need is being scaffolded so you can focus on business logic.

## Configure the Relayer

A relayer is software to connect two blockchains. Configure the relayer with your endpoints to create a connection between your blockchain and the testnet. After the connection is established, you can send tokens from one blockchain to the other blockchain.

### Remove Existing Relayer and Starport Configurations

If you previously used the relayer, follow these steps to remove exiting relayer and Starport configurations:

- Delete previous configuration files:

    ```
    rm -r $HOME/.starport/*
    ```

If existing configurations do not exist, the command returns `no matches found` and no action is taken.

### Create Your Connection 

Configure the relayer to create a connection between your local chain and the chain you want to connect to. In this example, the chain you want to connect to is the Gravity DEX testnet.

```markdown
starport relayer configure
```

- For the local `source` chain, use the default values.
- For the testnet `target` chain, use the following values.


- Target RPC: [https://rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network:443)

- Target Token Faucet: [https://faucet.testnet.cosmos.network:443](https://faucet.testnet.cosmos.network:443)

- Target Gas Price (0.025uatom): 0.025uphoton

When everything runs successfully, you see the following output with a different account address:

```bash
🔐  Account on "source" is "cosmos174n26d8n223aje53dznlfahpv54np970wr3ae7"
 
 |· received coins from a faucet
 |· (balance: 100000stake,5token)

🔐  Account on "target" is "cosmos174n26d8n223aje53dznlfahpv54np970wr3ae7"
 
 |· received coins from a faucet
 |· (balance: 10000000stake,10000000uphoton)

⛓  Configured chains: myblockchain-cosmoshub-testnet
```

Connect the chains:

```markdown
starport relayer connect
```

As your two blockchains start to connect, you see output like:

```bash
◣ Linking paths between chains... 
```

When successful, your output shows:

```bash

---------------------------------------------
Linking chains
---------------------------------------------

✓ Linked chains with 1 paths.
  - myblockchain-cosmoshub-testnet

Continuing with 1 paths...

---------------------------------------------
Chains by paths
---------------------------------------------

myblockchain-cosmoshub-testnet:
    myblockchain      > (port: transfer) (channel: channel-0)
    cosmoshub-testnet > (port: transfer) (channel: channel-9)

---------------------------------------------
Listening and relaying packets between chains...
---------------------------------------------
```

## Get Token From the Faucet

From the terminal output that `starport chain serve` created for you, use the `username` account address to claim tokens from the faucet.

```markdown
curl -X POST -d '{"address": "cosmosxxxxx"}' https://faucet.testnet.cosmos.network

- Make sure to add your account address into the `address` field
- Replace `cosmosxxxxx` with the address you saw in your user account on running `starport chain serve`.
```

After you see the success message, you can check your balance. 

See your balance at [https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxxxx). Make sure to replace `cosmosxxxxx` with your address from the previous step.

## Send Your Own Token to the Testnet

Now that your account on testnet is funded with testnet tokens, you can send your own token to the testnet. 

At your local terminal, enter the IBC module command to transfer your token to the testnet. 
Make sure to replace `cosmosxxxxx` with your address, `mytoken` with your token name, `username` with your username and `channel-0` with channel

**Note:** Make sure to use *channel* as shown in terminal when you run `starport relayer connect`

```bash
myblockchaind tx ibc-transfer transfer transfer channel-0 cosmosxxxxx "15000000mytoken" --from username
```

After your transaction is complete, check your balance on the Gravity DEX testnet to confirm your token transfer.

Make sure to replace `cosmosxxxxx` with your address.

**Tip:** Sometimes transactions don't go through on the first try. Make sure you check the terminal window that shows the relayer process and verify that you see output similar to the following output:

 ```markdown
 Relay 1 packets from myblockchain => cosmoshub-testnet
 Relay 1 packets from myblockchain => cosmoshub-testnet
 Relay 1 acks from cosmoshub-testnet => myblockchain
 Relay 1 acks from cosmoshub-testnet => myblockchain
 ```

See your balance at [https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxxxx).

Take a closer look at the `ibc/denomhash` denominator. When you create a new pool, you in put this denom to make a pair with one of the existing native token. On the testnet, create a pair with `uphoton`.

**Tip:** See the balance of `uphoton` and `ibc/denomhash` on terminal:
```bash
gaiad query bank balances cosmosxxxx --node https://testnet.cosmos.network:443
```

After you successfully query the balance, you will see an output similar to:
```markdown
balances:
- amount: "13500000"
  denom: ibc/2A399B0A1E83C2929B7C07E12B86F72EF4B4252ECB95A895BB51C2C00A106370
- amount: "258850000"
  denom: uphoton
pagination:
  next_key: null
  total: "0"
```

## Create a Pool with My Token

With the liquidity module and gaiad binary installed, use these links to explore your app:

- RPC [https://rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network/)

- API [https://api.testnet.cosmos.network:443](https://api.testnet.cosmos.network/)

- gRPC [https://grpc.testnet.cosmos.network:443](https://grpc.testnet.cosmos.network/)

- Token faucet [https://faucet.testnet.cosmos.network:443](https://faucet.testnet.cosmos.network/)

### Verify Your Token Supply 

You can view all available tokens. You can see your token, because your token is now listed! 

Check the following resources to get an overview of the activity on the testnet and find your token.

- https://api.testnet.cosmos.network/cosmos/bank/v1beta1/supply

- https://api.testnet.cosmos.network/ibc/applications/transfer/v1beta1/denom_traces

## Add your Starport blockchain account to gaiad

To access Starport `username` account on `gaiad`, add the `username` account to the keychain:

```bash
gaiad keys add username --recover
```

You are prompted for your passphrase:

```bash
> Enter your bip39 mnemonic
```

Remember, you can see the `username` mnemonic passphrase in the terminal window where you ran the `starport chain serve` command on your `myblockchaind`. 

After you successfully enter your mnemonic, you see output similar to:

```bash
- name: username
  type: local
  address: cosmos1780t4erzwrvr9x6jvqjxduwkuk3ex3fnhqzza5
  pubkey: cosmospub1addwnpepqfs05yqcjghqzct5y39r33r5ew47pjqkvcj7ezngufazy0eqsyx65vtut0h
  mnemonic: ""
  threshold: 0
  pubkeys: []
```

## Create a Liquidity Pool

To: create a liquidity pool with the `gaiad tx liquidity create-pool` command:

```bash
gaiad tx liquidity create-pool 1 1100000uphoton,1500000ibc/longibchash --from username --chain-id cosmoshub-testnet --gas-prices "0.025uphoton" --node https://rpc.testnet.cosmos.network:443 --gas 2000000
```

For this example command, be sure to:

- Replace `longibchash` with the hash denom that you received on the previous step
- Replace `username` with your account username

To confirm the pool has been created:

- Visit [https://api.testnet.cosmos.network/cosmos/liquidity/v1beta1/pools](https://api.testnet.cosmos.network/cosmos/liquidity/v1beta1/pools)

**Tip:** Verify the pool created on terminal:
```bash
gaiad query liquidity pools
```

After you successfully query the pool you should see an output similar to:
```markdown
- id: "1"
  pool_coin_denom: poolF4E2371BB7E34567B5A91A44808B8470BFAE0ABD606D707A8F1D59A3EB164816
  reserve_account_address: cosmos17n3rwxahudzk0ddfrfzgpzuywzl6uz4alp5z2l
  reserve_coin_denoms:
  - ibc/32023ECF96BB757261CB59A37F9013D012969795D12D24FCCE50CBE5F879C920
  - uphoton
  type_id: 1
  .
  .
  .
- id: "6"
  pool_coin_denom: poolFE384B6C9AE769A67754EAD275832A5A6DAA6E2C769A1E1D281E596DD47AA36D
  reserve_account_address: cosmos1lcuykmy6ua56va65atf8tqe2tfk65m3v58zq6n
  reserve_coin_denoms:
  - ibc/2A399B0A1E83C2929B7C07E12B86F72EF4B4252ECB95A895BB51C2C00A106370
  - uphoton
  type_id: 1
```

You can also query a specific pool by `pool id` using the following command:
```bash
gaiad query liquidity pool 6
```
Make sure to replace `6` with your `pool id`

## Swap Token

You are ready to swap tokens! You now have uphoton token in your account and want to swap for the new IBC coin:

```bash
gaiad tx liquidity swap 1 1 100000uphoton ibc/longibchash 0.1 0.003 --from username --chain-id cosmoshub-testnet --gas-prices "0.025uphoton" --node https://rpc.testnet.cosmos.network:443
```

Make sure to replace the first `1` with your `pool id` obtained in previous step.

Check the balance on the new account that made the trade:

[https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxx](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxx)

Make sure to replace `cosmosxxxxx` with your address.

## Deposit Token

You can deposit tokens to the pool you have created.

```bash
gaiad tx liquidity deposit 1 100uphoton,100ibc/longibchash --from username --chain-id cosmoshub-testnet --gas-prices "0.025uphoton" --node https://rpc.testnet.cosmos.network:443
```

Make sure to replace the first `1` with your `pool id` obtained in previous step.


**Note:** Deposits must be the same coin denoms as the reserve coins.

Check the balance on the new deposit that you made:

- [https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxx](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxx)

Make sure to replace `cosmosxxxxx` with your address.

## Withdraw Token

You can also withdraw tokens from the pool you have created.

```bash
gaiad tx liquidity withdraw 1 100pool-id --from username --chain-id cosmoshub-testnet --gas-prices "0.025uphoton" --node https://rpc.testnet.cosmos.network:443
```

Make sure to replace the first `1` with your `pool id` obtained in previous step.

- Replace `pool-id` with the id that you can see on [https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxx](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxx)

You will see something similar to `poolFE384B6C9AE769A67754EAD275832A5A6DAA6E2C769A1E1D281E596DD47AA36D`
- Replace `cosmosxxxxx` with your address


Check the balance on the new withdrawal that you made:

[https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxx](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxx)


## 🎉 Congratulations 🎉

By completing this tutorial you have learned how to use liquidity module.

Here’s what you accomplished in this tutorial:

- Created a blockchain with Starport and connecting to testnet
- Created a liquidity pool with IBC token
- Swapped tokens within the pool
- Deposited tokens to the pool
- Withdrew tokens from the pool
