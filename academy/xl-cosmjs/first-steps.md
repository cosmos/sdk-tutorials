---
title: "Bank - Send Tokens"
order: 2
description: Interacting with a Cosmos SDK chain through CosmJs
tag: deep-dive
---

# Bank - Send Tokens

Now that you know what CosmJs is, you should take your first steps in using it. A basic feature of a Cosmos chain is the ability to send tokens via the `bank` module. CosmJs naturally offers functions to cover this facility. That's what you are going to use:

1. Use an existing test net with a key of your own.
2. Run basic CosmJs commands in a CLI script.

Afterwards, if you want, you can choose to:

1. Start a local chain that exposes RPCs.
2. Run the same basic CosmJs commands, but for this local chain.

## Prepare your script

There exists a small ready-made repository to experiment with CosmJs. Clone it from [here](https://github.com/deus-labs/cosmjs-template). You need [NodeJs](https://nodejs.org/en/download/). Then, in the folder, you need to install the required modules:

```sh
$ npm install
```

Your inspiration for this exercise is the [`index.ts`](https://github.com/deus-labs/cosmjs-template/blob/main/index.ts) file. It is written in Typescript, which is [compiled into Javascript](https://github.com/deus-labs/cosmjs-template/blob/main/tsconfig.json#L3) before [being interpreted](https://github.com/deus-labs/cosmjs-template/blob/main/package.json#L25) by NodeJs. If you open the folder in [Visual Studio Code](https://code.visualstudio.com/Download), the IDE should give you all the coding help you expect.

This specific `index.ts` example makes use of the CosmJs client for CosmWasm. However, for the exercise, you need a _regular_ client. So create a new file `experiment.ts`, and add it as a run target in `package.json`:

```json
...
    "scripts": {
        ...
        "experiment": "npx ts-node experiment.ts"
    }
...
```

In the same `.ts` file add a `runAll` function and have it be called:

```typescript
const runAll = async(): Promise<void> => {
    console.log("TODO")
}

runAll()
```

You can already confirm that it does what you want:

```sh
$ npx yarn experiment
```

Which returns:

```
yarn run v1.22.17
$ npx ts-node experiment.ts
TODO
✨  Done in 6.07s.
```

Below you make this script more meaningful. With the barebones script ready, you need to prepare some elements.

## Test net preparation

Cosmos Hub's Vega test net is as good as any other test net. Its parameters for this exercise are [here](https://github.com/cosmos/vega-test/tree/master/public-testnet#peers-and-endpoints):

```
RPC: 198.50.215.1:46657
```

If you don't have a Vega account yet, you need to create your 24-word mnemonic. If you already have a preferred method for creating your mnemonic, use it, otherwise, you can use CosmJs to generate a new one. In the latter case, create a new file `generate_mnemonic.ts` with:

```typescript
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"

DirectSecp256k1HdWallet.generate(24)
    .then(wallet => {
        console.log(wallet.mnemonic)
        return wallet.getAccounts()
    })
    .then(accounts => console.error("Mnemonic with 1st account:", accounts[0].address))
```

That done, you can create your key:

```sh
$ npx ts-node generate_mnemonic.ts > vega.alice.mnemonic.key
```

It takes a couple of seconds. When done, it should also tell you the address of the first account:

```
Mnemonic with 1st account: cosmos1fyv2j2zuxesrjaqev0vtckys528wnx459e3c0d
```

Keep this address for convenience. You can always have CosmJs recalculate it from the mnemonic. Away from prying eyes, examine the file to confirm it contains your 24 words.

<HighlightBox type="warn">

1. Adjust the `.gitignore` file to not commit this file by mistake:

    ```
    node_modules
    *.key
    ```
2. Also be careful not to add any empty lines or any other character in this file, as may happen with VSCode under certain conditions. If you add any characters, ComsJs may not be able to parse it.

</HighlightBox>

## Add your imports

What you are creating now is a very small interface to a blockchain; an interface that could eventually have users. A good practice is to refrain from requesting a user address until the point where it is necessary, e.g. if they clicked a relevant button. You observe this practice in `experiment.ts` by first using the read-only client. Import it:

```typescript
import { StargateClient } from "@cosmjs/stargate"
```

<HighlightBox type="info">

Notice how VSCode assists you to auto-complete [`StargateClient`](https://github.com/cosmos/cosmjs/blob/0f0c9d8a754cbf01e17acf51d3f2dbdeaae60757/packages/stargate/src/stargateclient.ts#L139) if you do <kbd>CTRL-Space</kbd> inside the `{}` of the `import` line.

</HighlightBox>

## Define your connection

Next, you need to tell the client how to connect to the RPC port of your blockchain:

```typescript
const rpc = "http://198.50.215.1:46657"
```

Now inside your `runAll` function, you can initialize the connection and immediately check you connected to the right place:

```typescript
const runAll = async(): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("chain id:", await client.getChainId(), ", height:", await client.getHeight())
}
```

Run again to check with `npx yarn experiment`, and you get:

```
chain id: vega-testnet , height: 8727566
```

## Get a balance

In a normal situation you would not, at this point, have access to your user's address. However, for this exercise, you need to know how many tokens Alice has. Add a temporary new command inside `runAll`:

```typescript
console.log("Alice balance:", await client.getBalance("cosmos1fyv2j2zuxesrjaqev0vtckys528wnx459e3c0d", "stake"))
```

When you run it again, you get:

```
Alice balance: { denom: 'stake', amount: '0' }
```

If you just created this account, Alice's balance is, of course, zero. Alice will need tokens to be able to send transactions. Head to the faucet and get some tokens for Alice. TODO

Check that Alice got them with `npx yarn experiment`, which should return:

```
Alice balance: { denom: 'stake', amount: '1000000000' } TODO
```

With this confirmation, you can comment out the balance query. For the exercise, you are going to have Alice send some tokens back to the faucet. So add the faucet's address:

```typescript
const faucet = "TODO"
```

In case you are curious, add a line to peek at the faucet's balance. When running, you should get:

```
Faucet balance: { denom: 'stake', amount: '0' } TODO
```

These actions are example uses of the read-only `StargateClient`.

Alright, time for Alice to send some tokens back to the faucet.

## Prepare a signing client

Alice cannot send tokens with the read-only `StargateClient`. She needs to use a client that lets her sign transactions, a signing client. Update your import line:

```typescript
import { StargateClient, SigningStargateClient } from "@cosmjs/stargate"
```

You can again use VSCode's auto-complete to assist you. When you instantiate this new client, you need to pass it a **signer**, implementing the `OfflineDirectSigner` interface. And this signer needs access to Alice's **private key** in one way or another. There are several ways to accomplish this. In this example, you are going to use Alice's saved mnemonic.

You need to load the mnemonic as text in your code so add this import:

```typescript
import { readFile } from "fs/promises"
```

What implementation of `OfflineDirectSigner` to use? If you right-click on `OfflineDirectSigner` in VSCode and select <kbd>Find All Implementations</kbd>, you see that `DirectSecp256k1HdWallet` seems the most appropriate for this situation. Add the import:

```typescript
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
```

Its `fromMnemonic` factory function needs a string. So create a new function that returns an `OfflineDirectSigner`:

```typescript
const getAliceSignerFromMnemonic = async(): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(
        (await readFile("./vega.alice.mnemonic.key")).toString(),
        {
            prefix: "cosmos",
        }
    )
}
```

Vega uses the `cosmos` address prefix. It is the default, and you can also mention it as shown. Now you can add in `runAll`:

```typescript
const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
const signingClient = await SigningStargateClient.connectWithSigner(
    rpc,
    aliceSigner,
    {
        gasPrice: GasPrice.fromString("1stake"),
    }
)
```

Here is a little trick for convenience. Set the gas price in the client so that you can later put `"auto"` for gas.

Check that it works just like the read-only client, from which [it inherits](https://github.com/cosmos/cosmjs/blob/0f0c9d8a754cbf01e17acf51d3f2dbdeaae60757/packages/stargate/src/signingstargateclient.ts#L147), by adding:

```typescript
console.log("chain id:", await signingClient.getChainId(), ", height:", await signingClient.getHeight())
```

And running it.

## Send tokens

Alice can now send some tokens back to the faucet. Further add:

```typescript
const alice = (await aliceSigner.getAccounts())[0].address
console.log("Alice balance before:", await client.getBalance(alice, "stake"))
console.log("Faucet balance before:", await client.getBalance(faucet, "stake"))
const result = await signingClient.sendTokens(
    alice,
    faucet,
    [
        {
            denom: "stake",
            amount: "10000000",
        }
    ],
    "auto",
)
console.log("Transfer result:", result)
```

And to confirm it worked, add a balance check:

```typescript
console.log("Alice balance after:", await client.getBalance(alice, "stake"))
console.log("Faucet balance after:", await client.getBalance(faucet, "stake"))
```

Now, run it with `npx yarn experiment` and you should get:

```
...
Transfer result: {
  code: 0,
  height: 1892,
  rawLog: '[{"events":[{"type":"coin_received","attributes":[{"key":"receiver","value":"cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"},{"key":"amount","value":"10000000stake"}]},{"type":"coin_spent","attributes":[{"key":"spender","value":"cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"},{"key":"amount","value":"10000000stake"}]},{"type":"message","attributes":[{"key":"action","value":"/cosmos.bank.v1beta1.MsgSend"},{"key":"sender","value":"cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"},{"key":"module","value":"bank"}]},{"type":"transfer","attributes":[{"key":"recipient","value":"cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"},{"key":"sender","value":"cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"},{"key":"amount","value":"10000000stake"}]}]}]',
  transactionHash: '803CE25CF87E210E2935180DE845DB5C5BB839406900898B6F8203E16571890F',
  gasUsed: 84521,
  gasWanted: 97165
}
Alice's balance after: { denom: 'stake', amount: '19902835' }
Bob's balance after: { denom: 'stake', amount: '10000000' }
✨  Done in 11.46s.
```

That's correct. The faucet got its 10M stake and Alice also paid some gas.

<ExpansionPanel title="The experiment.ts file">

For your convenience, here is the complete file:

```typescript
import { readFile } from "fs/promises"
import { StargateClient, SigningStargateClient, GasPrice } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"

const rpc = "http://198.50.215.1:46657"
const faucet = "cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"

const getAliceSignerFromMnemonic = async(): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(
        (await readFile("./vega.alice.mnemonic.key")).toString(),
        {
            prefix: "cosmos",
        }
    )
}

const runAll = async(): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("chain id:", await client.getChainId(), ", height:", await client.getHeight())
    // console.log("Alice balance:", await client.getBalance("cosmos1fyv2j2zuxesrjaqev0vtckys528wnx459e3c0d", "stake"))
    console.log("Faucet balance:", await client.getBalance(faucet, "stake"))

    const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
    const signingClient = await SigningStargateClient.connectWithSigner(
        rpc,
        aliceSigner,
        {
            gasPrice: GasPrice.fromString("1stake"),
        }
        )
    console.log("chain id:", await signingClient.getChainId(), ", height:", await signingClient.getHeight())

    const alice = (await aliceSigner.getAccounts())[0].address
    console.log("Alice balance before:", await client.getBalance(alice, "stake"))
    console.log("Faucet balance before:", await client.getBalance(faucet, "stake"))
    const result = await signingClient.sendTokens(
        alice,
        faucet,
        [
            {
                denom: "stake",
                amount: "10000000",
            },
        ],
        "auto",
    )
    console.log("Transfer result:", result)
    console.log("Alice balance after:", await client.getBalance(alice, "stake"))
    console.log("Faucet balance after:", await client.getBalance(faucet, "stake"))
}

runAll()
```

</ExpansionPanel>

This concludes your first use of CosmJs.

You connected to a running test net. Therefore, you depended on the kindness of strangers to have a blockchain running, and to open a publicly available RPC port and faucet.

What if you wanted to try with your own blockchain?

## With a locally started chain

The easiest way is to reuse the `simd` chain that you started in a [previous module](../3-running-a-chain/node-api-and-cli.md). Make sure that you have created two accounts, Alice and Bob. Be sure to credit enough tokens to Alice.

As you recall, in the earlier section, you also sent tokens, using `simd` itself.

When you finally launch `simd`, you see the line:

```sh
$ ./build/simd start
...
4:37PM INF Starting RPC HTTP server on 127.0.0.1:26657 module=rpc-server
...
```

This is the port to which you connect CosmJs.

## Prepare for `simd`

You can reuse your `experiment.ts` script, given some adjustments. First off, although you have Alice's address, you may not have her mnemonic or private key. The private key is stored in your operating system's keyring backend, and you can extract it. This is an unsafe operation, but you will tolerate it for this exercise:

```sh
$ ./build/simd keys export alice --unsafe --unarmored-hex
```

You get a 64-digit-long hex value. Copy-paste it into a new `simd.alice.private.key` file into your `cosmjs-template` folder. The `.gitignore` was already configured earlier to ignore it, that mitigates your risk.

<HighlightBox type="tip">

If you cannot remember which alias you gave your keys, just `list` them:

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

With the new elements in place, you can update your script. First change `rpc`, and set `faucet` to Bob's address:

```typescript
const rpc = "http://127.0.0.1:26657"
const faucet = "cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"
```

Next, add a function to create Alice's signer. If you right-click again on `OfflineDirectSigner` in VSCode and select <kbd>Find All Implementations</kbd>, you see that `DirectSecp256k1Wallet` seems the more appropriate choice this time. 

Add the import:

```typescript
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
```

`DirectSecp256k1Wallet`'s `fromKey` factory function needs a `Uint8Array`. Fortunately, CosmJs includes a utility to convert a hexadecimal string into a `Uint8Array`. Import it:

```typescript
import { fromHex } from "@cosmjs/encoding"
```

With this, you can create a new function to get a signer:

```typescript
const getAliceSignerFromPriKey = async(): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1Wallet.fromKey(
        fromHex((await readFile("./simd.alice.private.key")).toString()),
        "cosmos",
    )
}
```

The address prefix is `"cosmos"` as can be seen in Alice's address. Insert it in place of the previously used `getAliceSignerFromMnemonic`. Run it and confirm the output is as expected.

<ExpansionPanel title="The updated experiment.ts file">

For your convenience, here is the complete file:

```typescript
import { readFile } from "fs/promises"
import { StargateClient, SigningStargateClient, GasPrice } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { fromHex } from "@cosmjs/encoding"

// const rpc = "http://198.50.215.1:46657" / /vega
const rpc = "http://localhost:127.0.0.1:26657" // simd
// const faucet = "cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple" // vega
const faucet = "cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple" // simd

const getAliceSignerFromMnemonic = async(): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(
        (await readFile("./vega.alice.mnemonic.key")).toString(),
        {
            prefix: "cosmos",
        }
    )
}

const getAliceSignerFromPriKey = async(): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1Wallet.fromKey(
        fromHex((await readFile("./simd.alice.private.key")).toString()),
        "cosmos",
    )
}

const runAll = async(): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("chain id:", await client.getChainId(), ", height:", await client.getHeight())
    // console.log("Alice balance vega:", await client.getBalance("cosmos1fyv2j2zuxesrjaqev0vtckys528wnx459e3c0d", "stake"))
    console.log("Alice balance simd:", await client.getBalance("cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je", "stake"))
    console.log("Faucet balance:", await client.getBalance(faucet, "stake"))

    const aliceSigner: OfflineDirectSigner = await getAliceSignerFromPriKey()
    const signingClient = await SigningStargateClient.connectWithSigner(
        rpc,
        aliceSigner,
        {
            gasPrice: GasPrice.fromString("1stake"),
        }
        )
    console.log("chain id:", await signingClient.getChainId(), ", height:", await signingClient.getHeight())

    const alice = (await aliceSigner.getAccounts())[0].address
    console.log("Alice balance before:", await client.getBalance(alice, "stake"))
    console.log("Faucet balance before:", await client.getBalance(faucet, "stake"))
    const result = await signingClient.sendTokens(
        alice,
        faucet,
        [
            {
                denom: "stake",
                amount: "10000000",
            },
        ],
        "auto",
    )
    console.log("Transfer result:", result)
    console.log("Alice balance after:", await client.getBalance(alice, "stake"))
    console.log("Faucet balance after:", await client.getBalance(faucet, "stake"))
}

runAll()
```

</ExpansionPanel>

And with this, you have used CosmJs's bank module on a locally running Cosmos blockchain.
