---
title: "Bank - Send Tokens"
order: 2
description: Interacting with a Cosmos SDK chain through CosmJS
tag: deep-dive
---

# Bank - Send Tokens

Now that you know what CosmJS is, you should take your first steps in using it. A basic feature of a Cosmos chain is the ability to send tokens via the `bank` module. CosmJS naturally offers functions to cover this facility. You are going to:

1. Use an existing test network (testnet) with a key of your own.
2. Run basic CosmJS commands in a CLI script.

Additionally, you can choose to:

1. Start a local chain that exposes RPCs.
2. Run the same basic CosmJS commands, but for this local chain.

## Prepare your script

A small, ready-made repository exists so you can experiment with CosmJS. Clone it from [here](https://github.com/deus-labs/cosmjs-template), and you will need [NodeJs](https://nodejs.org/en/download/). In the cloned folder you need to install the required modules:

```sh
$ npm install
```

Your inspiration for this exercise is the [`index.ts`](https://github.com/deus-labs/cosmjs-template/blob/main/index.ts) file. It is written in Typescript, which is [compiled into Javascript](https://github.com/deus-labs/cosmjs-template/blob/main/tsconfig.json#L3) before [being interpreted](https://github.com/deus-labs/cosmjs-template/blob/main/package.json#L25) by NodeJs. If you open the folder in [Visual Studio Code](https://code.visualstudio.com/Download), the IDE should give you all the coding help you require.

This specific `index.ts` example makes use of the CosmJS client for CosmWasm. However, for the exercise you need a _regular_ client. Create a new file `experiment.ts` and add it as a run target in `package.json`:

```json
...
    "scripts": {
        ...
        "experiment": "npx ts-node experiment.ts"
    }
...
```

In `experiment.ts` file add a `runAll` function as follows:

```typescript
const runAll = async(): Promise<void> => {
    console.log("TODO")
}

runAll()
```

Confirm that it does what you want:

```sh
$ npx yarn experiment
```

This returns:

```
yarn run v1.22.17
$ npx ts-node experiment.ts
TODO
✨  Done in 6.07s.
```

You will soon make this script more meaningful. With the basic script ready, you need to prepare some elements.

## Testnet preparation

The Cosmos ecosystem has a [number of testnets](https://github.com/cosmos/testnets), for example the Cosmos Hub's Testnet, named Theta at the time of writing. In fact there are two Cosmos Hub testnets: one targeted at [validators and application developers like you](https://github.com/cosmos/testnets/tree/master/v7-theta#theta-public-testnet), the other at [Cosmos SDK developers](https://github.com/cosmos/testnets/tree/master/v7-theta#theta-developer-testnet). Pick the former. Its parameters for this exercise are, for instance:

```[https://github.com/cosmos/testnets/tree/master/v7-theta#endpoints-1]
RPC: https://rpc.sentry-01.theta-testnet.polypore.xyz
```

If you don't have a testnet account yet, you must create your 24-word mnemonic. If you already have a preferred method for creating your mnemonic, use that; otherwise CosmJS can generate a new one. In the latter case, create a new file `generate_mnemonic.ts`:

```typescript
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"

DirectSecp256k1HdWallet.generate(24)
    .then(wallet => {
        console.log(wallet.mnemonic)
        return wallet.getAccounts()
    })
    .then(accounts => console.error("Mnemonic with 1st account:", accounts[0].address))
```

Now create a key for our imaginary user "Alice":

```sh
$ npx ts-node generate_mnemonic.ts > testnet.alice.mnemonic.key
```

When done, it should also tell you the address of the first account:

```
Mnemonic with 1st account: cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf
```

Keep this address for convenience, although CosmJS can always recalculate it from the mnemonic. Privately examine the file to confirm it contains your 24 words.

<HighlightBox type="warn">

1. Be careful not to add any empty lines or any other character in your `.key` file (this occurs with VSCode under certain conditions). If you add any characters, ComsJs may not be able to parse it.
2. Adjust the `.gitignore` file to not commit your `.key` file by mistake:

    ```
    node_modules
    *.key
    ```

</HighlightBox>

## Add your imports

You need a small, simple interface to a blockchain, one which could eventually have users. Good practice is to refrain from requesting a user address until necessary (e.g. when a user clicks a relevant button). Therefore, in `experiment.ts` you will first use the read-only client. Import it at the top of the file:

```typescript
import { StargateClient } from "@cosmjs/stargate"
```

<HighlightBox type="info">

Note that VSCode assists you to auto-complete [`StargateClient`](https://github.com/cosmos/cosmjs/blob/0f0c9d8a754cbf01e17acf51d3f2dbdeaae60757/packages/stargate/src/stargateclient.ts#L139) if you type <kbd>CTRL-Space</kbd> inside the `{}` of the `import` line.

</HighlightBox>

## Define your connection

Next, you need to tell the client how to connect to the RPC port of your blockchain:

```typescript
const rpc = "https://rpc.sentry-01.theta-testnet.polypore.xyz"
```

Inside the `runAll` function you can initialize the connection and immediately check you connected to the right place:

```typescript
const runAll = async(): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("chain id:", await client.getChainId(), ", height:", await client.getHeight())
}
```

Run again to check with `npx yarn experiment`, and you get:

```
chain id: theta-testnet-001 , height: 9507032
```

## Get a balance

Normally you would not yet have access to your user's address. However, for this exercise you need to know how many tokens Alice has, so add a temporary new command inside `runAll`:

```typescript
console.log(
    "Alice balances:",
    await client.getAllBalances("cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf"),
)
```

`getAllBalances` is used because the default token name is not yet known. When you run it again, you get:

```
Alice balances: []
```

If you just created this account, Alice's balance is zero. Alice will need tokens to be able to send transactions. A common practice with testnets is to expose faucets (services that send you test tokens for free, within limits).

The Cosmos Hub testnet has a dedicated [Discord channel](https://discord.com/channels/669268347736686612/953697793476821092/958291295741313024) where you can ask for tokens once per day _per Discord user_.

Go to the faucet channel and request tokens for Alice by entering this command in the channel:

```
$ request [Alice's address] theta
# For instance:
$ request cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf theta
```

The faucet bot replies with a link to the transaction from the block explorer:

```
✅  https://testnet.cosmos.bigdipper.live/transactions/540484BDD342702F196F84C2FD42D63FA77F74B26A8D7383FAA5AB46E4114A9B
```

Check that Alice received the tokens with `npx yarn experiment`, which should return:

```
Alice balances: [ { denom: 'uatom', amount: '10000000' } ]
```

That's 10 ATOM. After this confirmation you can comment out the balance query.

## Get the faucet address

As an exercise you want Alice to send some tokens back to the faucet, so you will need its address. You can request this from the faucet bot, but it is also possible to get it using the transaction hash in `experiment.ts`.

First you need to get the transaction. Make sure you replace the hash with the one you received from the faucet bot.

```typescript
const faucetTx: IndexedTx = (await client.getTx(
    "540484BDD342702F196F84C2FD42D63FA77F74B26A8D7383FAA5AB46E4114A9B",
))!
```

Here you see that there is a serialized `faucetTx.tx`. The serialized transaction are the bytes that were sent over the testnet by the faucet. It is unintelligible to humans until you deserialize it properly. Since it is a serialized transaction, use the methods offered by `cosmjs-types` [`Tx`](https://github.com/confio/cosmjs-types/blob/a14662d/src/cosmos/tx/v1beta1/tx.ts#L230) to deserialize it:

```typescript
// import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx"

const decodedTx: Tx = Tx.decode(faucetTx.tx)
```

Next you need to deserialize the only message in it:

```typescript
// import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"

const sendMessage: MsgSend = MsgSend.decode(decodedTx.body!.messages[0].value)
```

In this message, the `fromAddress` is the faucet:

```typescript
const faucet = sendMessage.fromAddress
```

Similar to how you got the balance for Alice, you can get the faucet's balance as well. Have a go at trying this yourself by copying the code to print Alice's balances. When running, you should get:

```
Faucet balances: [ { denom: 'uatom', amount: '867777337235' } ]
```

<ExpansionPanel title="Getting the faucet address another way">

Instead of using the `decode` functions that come with the `Tx` and `MsgSend` imports, you're able to process the data yourself via alternative means. If you'd like to experiment more, you can parse the `rawLog` as opposed to deserializing the transaction as suggested above.

Note the conceptual difference between`Tx` and the `rawLog`. The `Tx`, or `MsgSend`, object is an input to the computation that takes place when the transaction is included in a block. The `rawLog` is a resultant output of said computation.

From the `IndexedTx` you see that there is a [`rawLog`](https://github.com/cosmos/cosmjs/blob/13ce43c/packages/stargate/src/stargateclient.ts#L64), which happens to be a stringified JSON.

```typescript
const rawLog = JSON.parse(faucetTx.rawLog)
console.log(JSON.stringify(rawLog, null, 4))
```

The structure of the raw log is not always obvious, but in this example it contains:

```json
[
    {
        "events": [
            ...
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "spender",
                        "value": "cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he"
                    },
                    ...
                ]
                ...
            }
            ...
        ]
    }
]
```

Because this is a JSON file, you're able to fetch the faucet's address as follows:

```typescript
const faucet = rawLog[0].events[1].attributes[0].value
```

</ExpansionPanel>

These actions are example uses of the read-only `StargateClient`.

Now it is time for Alice to send some tokens back to the faucet.

## Prepare a signing client

If you go through `StargateClient`'s methods, you see that it has only query-type methods. None about sending transactions.

Now, for Alice to send transactions, she needs to be able to sign them. And to be able to sign transactions, she needs access to _keys_ or _mnemonics_. Or rather she needs a client that has access to those. That is where `SigningStargateClient` comes in. Conveniently, `SigningStargateClient` inherits from `StargateClient`.

Update your import line:

```typescript
import { IndexedTx, SigningStargateClient, StargateClient } from "@cosmjs/stargate"
```

VSCode's auto-complete can assist you again with this `import` line, by clicking <kbd>CTRL-SPACE</kbd> between `{` and `}`. To see its declaration, you can then right-click on the name and choose <kbd>Go to Definition</kbd>. In particular the `connectWithSigner` method is informative.

When you instantiate `SigningStargateClient`, you need to pass it a **signer**, implementing the `OfflineDirectSigner` interface. The signer needs access to Alice's **private key**, and there are several ways to accomplish this. In this example, you will use Alice's saved **mnemonic**.

Load the mnemonic as text in your code with this import:

```typescript
import { readFile } from "fs/promises"
```

There are several implementations of `OfflineDirectSigner` available. Right-click on `OfflineDirectSigner` in VSCode and select <kbd>Find All Implementations</kbd>: `DirectSecp256k1HdWallet`, with its `fromMnemonic` method, is the most appropriate for this situation. Add the import:

```typescript
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
```

The `fromMnemonic` factory function needs a string. Create a new function that returns an `OfflineDirectSigner`:

```typescript
const getAliceSignerFromMnemonic = async(): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(
        (await readFile("./testnet.alice.mnemonic.key")).toString(),
        {
            prefix: "cosmos",
        }
    )
}
```

The Cosmos Hub Testnet uses the `cosmos` address prefix. This is the default used by `DirectSecp256k1HdWallet`, but you are encouraged to explicitly define it as you might be working with different prefixes on different blockchains. Now you can add in `runAll`:

```typescript
const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
```

Check that it works like the read-only client that you used earlier, and from which [it inherits](https://github.com/cosmos/cosmjs/blob/0f0c9d8a754cbf01e17acf51d3f2dbdeaae60757/packages/stargate/src/signingstargateclient.ts#L147), by adding:

```typescript
console.log("chain id:", await signingClient.getChainId(), ", height:", await signingClient.getHeight())
```

Run it, and confirm that it recovers Alice's address as expected:

```typescript
const alice = (await aliceSigner.getAccounts())[0].address

```

## Send tokens

Alice can now send some tokens back to the faucet, but to do so she will also need to pay the network gas fee. If she wants to send back 1% of her holdings (`100000uatom`), how much gas should she put, and at what price?

She can copy what the faucet did. To discover this, run:

```typescript
console.log("Gas fee:", decodedTx.authInfo!.fee!.amount)
console.log("Gas limit:", decodedTx.authInfo!.fee!.gasLimit.toString(10))
```

This prints:

```
Gas fee: [ { denom: 'uatom', amount: '500' } ]
Gas limit: 200000
```

Alice can reuse this information. Add the command:

```typescript
console.log("Alice balance before:", await client.getAllBalances(alice))
console.log("Faucet balance before:", await client.getAllBalances(faucet))
const result = await signingClient.sendTokens(
    alice,
    faucet,
    [
        {
            denom: "uatom",
            amount: "100000",
        }
    ],
    {
        amount: [{ denom: "uatom", amount: "500" }],
        gas: "200000",
    },
)
console.log("Transfer result:", result)
```

To confirm it worked, add a balance check:

```typescript
console.log("Alice balance after:", await client.getAllBalances(alice))
console.log("Faucet balance after:", await client.getAllBalances(faucet))
```

Run this with `npx yarn experiment` and you should get:

```
...
Transfer result: {
  code: 0,
  height: 9507151,
  rawLog: '[{"events":[{"type":"coin_received","attributes":[{"key":"receiver","value":"cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he"},{"key":"amount","value":"100000uatom"}]},{"type":"coin_spent","attributes":[{"key":"spender","value":"cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf"},{"key":"amount","value":"100000uatom"}]},{"type":"message","attributes":[{"key":"action","value":"/cosmos.bank.v1beta1.MsgSend"},{"key":"sender","value":"cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf"},{"key":"module","value":"bank"}]},{"type":"transfer","attributes":[{"key":"recipient","value":"cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he"},{"key":"sender","value":"cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf"},{"key":"amount","value":"100000uatom"}]}]}]',
  transactionHash: '7F770F24CB3C805FE45A8D26DD5EC5AA3F7B906AA7D6CB1F3FE8B554CBA93E12',
  gasUsed: 74190,
  gasWanted: 200000
}
Alice balance after: [ { denom: 'uatom', amount: '9899500' } ]
Faucet balance after: [ { denom: 'uatom', amount: '867777437235' } ]
✨  Done in 26.71s.
```

The faucet received `100000uatom` and Alice also paid `500uatom` gas.

<ExpansionPanel title="The experiment.ts file">

For your convenience, here is the complete file:

```typescript
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { IndexedTx, SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import { readFile } from "fs/promises"

const rpc = "https://rpc.sentry-01.theta-testnet.polypore.xyz"

const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(
        (await readFile("./testnet.alice.mnemonic.key")).toString(),
        {
            prefix: "cosmos",
        },
    )
}

const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("chain id:", await client.getChainId(), ", height:", await client.getHeight())
    // console.log(
    //     "Alice balances:",
    //     await client.getAllBalances("cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf"),
    // )
    const faucetTx: IndexedTx = (await client.getTx(
        "540484BDD342702F196F84C2FD42D63FA77F74B26A8D7383FAA5AB46E4114A9B",
    ))!
    const decodedTx: Tx = Tx.decode(faucetTx.tx)
    const sendMessage: MsgSend = MsgSend.decode(decodedTx.body!.messages[0].value)
    const faucet = sendMessage.fromAddress

    // By looking at the log
    const rawLog = JSON.parse(faucetTx.rawLog)
    // console.log(JSON.stringify(rawLog, null, 4))
    // const faucet = rawLog[0].events[1].attributes[0].value

    console.log("Faucet:", faucet)
    console.log("Faucet balances:", await client.getAllBalances(faucet))

    const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
    const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
    console.log(
        "chain id:",
        await signingClient.getChainId(),
        ", height:",
        await signingClient.getHeight(),
    )
    const alice = (await aliceSigner.getAccounts())[0].address
    console.log("Alice:", alice)

    console.log("Gas fee:", decodedTx.authInfo!.fee!.amount)
    console.log("Gas limit:", decodedTx.authInfo!.fee!.gasLimit.toString(10))

    console.log("Alice balance before:", await client.getAllBalances(alice))
    console.log("Faucet balance before:", await client.getAllBalances(faucet))
    const result = await signingClient.sendTokens(
        alice,
        faucet,
        [
            {
                denom: "uatom",
                amount: "100000",
            },
        ],
        {
            amount: [{ denom: "uatom", amount: "500" }],
            gas: "200000",
        },
    )
    console.log("Transfer result:", result)
    console.log("Alice balance after:", await client.getAllBalances(alice))
    console.log("Faucet balance after:", await client.getAllBalances(faucet))
}

runAll()
```

</ExpansionPanel>

This concludes your first use of CosmJS.

Note that you connected to a running testnet. Therefore, you depended on someone else to have a blockchain running, and to open a publicly available RPC port and faucet. What if you wanted to try with your own blockchain?

## With a locally started chain

The easiest option is to reuse the `simd` chain that you started in a [previous module](../3-running-a-chain/node-api-and-cli.md). Make sure that you have created two accounts, Alice and Bob. You also sent tokens using `simd`. Be sure to credit enough tokens to Alice.

When you finally launch `simd`, you see the line:

```sh
$ ./build/simd start
...
4:37PM INF Starting RPC HTTP server on 127.0.0.1:26657 module=rpc-server
...
```

Port `26657` is the default port for RPC endpoints built with the SDK, unless otherwise configured in `~/.simapp/config/config.toml`. `127.0.0.1:26657` will be the URL you'll need to add to your script later.

## Preparing your keys

You can reuse your `experiment.ts` script, with some adjustments. Although you have Alice's address, you may not have her mnemonic or private key. The private key is stored in your operating system's keyring backend. For the purpose of this exercise you can extract it, but generally this is an unsafe operation:

```sh
$ ./build/simd keys export alice --unsafe --unarmored-hex
```

You get a 64-digit-long hex value. Copy-paste it into a new `simd.alice.private.key` file in your `cosmjs-template` folder. The `.gitignore` was already configured earlier to ignore it, which mitigates the risk.

<HighlightBox type="tip">

If you cannot remember which alias you gave your keys, `list` them:

```sh
$ ./build/simd keys list
- address: cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je
  name: alice
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"AhR7SWWDsaSxBD9r/mIhbVOWap70jA3WpBIqjOJo4Dwp"}'
  type: local
- address: cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple
  name: bob
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"Av1VW23/laXWtbwWwOUHCvjjeLLqbdzazRneeRsE/shL"}'
  type: local
```

</HighlightBox>

## Update your script

With the new elements in place, you can update your script. Change `rpc` and set `faucet` to Bob's address:

```typescript
const rpc = "http://127.0.0.1:26657"
const faucet = "cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"
```

Next, add a function to create Alice's signer. In VSCode, right-click on `OfflineDirectSigner` again and select <kbd>Find All Implementations</kbd>: `DirectSecp256k1Wallet`, with it `fromKey` method, is the more appropriate choice this time.

Add the import:

```typescript
import { DirectSecp256k1Wallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
```

In `DirectSecp256k1Wallet` the `fromKey` factory function needs a `Uint8Array`. Fortunately, CosmJS includes a utility to convert a hexadecimal string into a `Uint8Array`. Import it:

```typescript
import { fromHex } from "@cosmjs/encoding"
```

Now create a new function to get a signer:

```typescript
const getAliceSignerFromPriKey = async(): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1Wallet.fromKey(
        fromHex((await readFile("./simd.alice.private.key")).toString()),
        "cosmos",
    )
}
```

The address prefix is `"cosmos"`, as can be seen in Alice's address. Insert it to replace `getAliceSignerFromMnemonic`. Also change the token unit from `uatom` to `stake`, because this is the default token when using `simapp`. Experiment with adjusting the values as desired. Run it and confirm the output is as expected.

<ExpansionPanel title="The updated experiment.ts file">

For your convenience, here is the complete file:

```typescript
import { fromHex } from "@cosmjs/encoding"
import { DirectSecp256k1Wallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import { readFile } from "fs/promises"

const rpc = "http://127.0.0.1:26657"

const getAliceSignerFromPriKey = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1Wallet.fromKey(
        fromHex((await readFile("./simd.alice.private.key")).toString()),
        "cosmos",
    )
}

const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("chain id:", await client.getChainId(), ", height:", await client.getHeight())
    console.log(
        "Alice balances:",
        await client.getAllBalances("cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"),
    )

    const faucet = "cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"

    const aliceSigner: OfflineDirectSigner = await getAliceSignerFromPriKey()
    const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
    console.log(
        "chain id:",
        await signingClient.getChainId(),
        ", height:",
        await signingClient.getHeight(),
    )
    const alice = (await aliceSigner.getAccounts())[0].address
    console.log("Alice:", alice)

    console.log("Alice balance before:", await client.getAllBalances(alice))
    console.log("Faucet balance before:", await client.getAllBalances(faucet))
    const result = await signingClient.sendTokens(
        alice,
        faucet,
        [
            {
                denom: "stake",
                amount: "10000",
            },
        ],
        {
            amount: [{ denom: "stake", amount: "500" }],
            gas: "200000",
        },
    )
    console.log("Transfer result:", result)
    console.log("Alice balance after:", await client.getAllBalances(alice))
    console.log("Faucet balance after:", await client.getAllBalances(faucet))
}

runAll()
```

</ExpansionPanel>

You have now used CosmJS's bank module on a locally running Cosmos blockchain.
