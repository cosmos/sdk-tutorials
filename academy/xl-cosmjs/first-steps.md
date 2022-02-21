---
title: "Bank - Send Tokens"
order: 2
description: Interacting with a Cosmos SDK chain through CosmJs
tag: deep-dive
---

# Bank - Send Tokens

Now that you know what CosmJs is, you should take your first steps in using it. A basic feature of a Cosmos chain is the ability to send tokens via the `bank` module. That's what you are going to do:

1. Start a chain that exposes RPCs.
2. Run basic CosmJs commands in a CLI script.

## Start the chain

To start the chain, the easiest way is to reuse the `simd` chain that you started in a [previous module](../3-running-a-chain/node-api-and-cli.md). Make sure that you have created two accounts, Alice and Bob. And credit enough to Alice.

As you recall, in this earlier section, you also sent tokens, using `simd` itself.

When you finally launch `simd`, you see the line:

```sh
$ ./build/simd start
...
4:37PM INF Starting RPC HTTP server on 127.0.0.1:26657 module=rpc-server
...
```

This is the port to which you connect CosmJs.

## Prepare your scripts

There is a small ready-made repository to experiment with CosmJs. Clone it from [here](https://github.com/deus-labs/cosmjs-template). You need [NodeJs](https://nodejs.org/en/download/). Then, in the folder, you can install the required modules:

```sh
$ npm install
```

Your inspiration for this exercise is the [`index.ts`](https://github.com/deus-labs/cosmjs-template/blob/main/index.ts) file. It is written in Typescript, which is [compiled into Javascript](https://github.com/deus-labs/cosmjs-template/blob/main/tsconfig.json#L3) before [being interpreted](https://github.com/deus-labs/cosmjs-template/blob/main/package.json#L25). If you open the folder in [Visual Studio Code](https://code.visualstudio.com/Download), the IDE should give you all the coding help you expect.

This specific `index.ts` example makes use of CosmWasm. However, here, you need a regular client. So create a new file `experiment.ts`, and add it as a run target in `package.json`:

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
const runAll = async() => {
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

## Add your imports

What you are creating now is a very small interface to your `simd` blockchain. An interface that could have users. A good practice is to not ask their address until the point where it is necessary, e.g. if they clicked a relevant button. You mimic the behavior in `experiment.tx` by first importing the read-only client:

```typescript
import { StargateClient } from "@cosmjs/stargate"
```

Notice how VSCode assists you to auto-complete [`StargateClient`](https://github.com/cosmos/cosmjs/blob/0f0c9d8a754cbf01e17acf51d3f2dbdeaae60757/packages/stargate/src/stargateclient.ts#L139) if you do <kbd>CTRL-Space</kbd> inside the `{}` of the `import` line.

## Define your connection

Next, you need to tell the client how to connect to the RPC port of your blockchain:

```typescript
const SIMD_RPC = "http://127.0.0.1:26657"
```

Now inside your `runAll` function, you can initialize the connection and immediately check you connected to the right place:

```typescript
const runAll = async() => {
    const client = await StargateClient.connect(SIMD_RPC)
    console.log("chain id:", await client.getChainId())
}
```

Run again to check with `npx yarn experiment`, and you get:

```
chain id: demo
```

## Get a balance

How many `stake` does Alice have? Add a new command inside `runAll`:

```typescript
const ALICE = "cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"
console.log("Alice's balance:", await client.getBalance(ALICE, "stake"))
```

When you run it again, you get:

```
Alice's balance: { denom: 'stake', amount: '30000000' }
```

This is correct, because Alice staked 70M stake in the genesis. You can check for Bob too:

```
Bob's balance: { denom: 'stake', amount: '0' }
```

Alright, time for Alice to send some to Bob.

## Prepare a signing client

Alice cannot send tokens with the read-only `StargateClient`. She needs to use a signing client. Update your import line:

```typescript
import { StargateClient, SigningStargateClient } from "@cosmjs/stargate"
```

You can use VSCode's auto-complete to assist you this time again. When you instantiate this new client, you need to pass it a **signer**, implementing the `OfflineDirectSigner` interface. And this signer needs access to Alice's **private key** in one way or another. Because you created your test keys in the OS keyring backend, you are going to export them wholesale. This is an unsafe operation that you shall tolerate for this exercise.

```sh
$ ./build/simd keys export alice --unsafe --unarmored-hex > alice.key
```

If you look into the new `alice.key` file, you should see a 64-digit-long hex value. Move this file to your `cosmjs-template` folder and adjust the `.gitignore` file:

```
node_modules
*.key
```

You need to load the key as text in your code, so add these imports:

```typescript
import { readFile as readFileAsync } from "fs"
import { promisify } from "util"
const readFile = promisify(readFileAsync)
```

What implementation of `OfflineDirectSigner` to use? If you right-click on `OfflineDirectSigner` in VSCode and select <kbd>Find All Implementations</kbd>, you see that `DirectSecp256k1Wallet` seems the more appropriate in the current situation. Add the import:

```typescript
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing"
```

Its `fromKey` factory function needs a `Uint8Array`. Fortunately, CosmJs includes a utility to convert a hexadecimal string into a `Uint8Array`. Import it:

```typescript
import { fromHex } from "@cosmjs/encoding"
```

Now you can add in `runAll`:

```typescript
const signingClient = await SigningStargateClient.connectWithSigner(
    SIMD_RPC,
    await DirectSecp256k1Wallet.fromKey(
        fromHex((await readFile("./alice.key")).toString()),
        "cosmos"
    ),
    {
        gasPrice: GasPrice.fromString("1stake")
    }
)
```

The prefix is `"cosmos"` as can be seen in Alice's address `"cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"`. Small trick, set the gas price in the client so that you can later put `"auto"` for gas.

Check it works by adding:

```typescript
console.log("chain id:", await signingClient.getChainId())
```

And running it.

## Send tokens

Alice can now send some tokens to Bob. Further add:

```typescript
const result = await signingClient.sendTokens(
    ALICE,
    BOB,
    [
        {
            denom: "stake",
            amount: "10000000",
        }
    ],
    "auto"
)
console.log("Transfer result:", result)
```

And to confirm it worked, add a balance check:

```typescript
console.log("Alice's balance after:", await client.getBalance(ALICE, "stake"))
console.log("Bob's balance after:", await client.getBalance(BOB, "stake"))
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

That's correct, Bob got his 10M stake and Alice also paid some gas.

<ExpansionPanel title="The experiment.ts file">

For your convenience, here is the complete file:

```typescript
import { readFile as readFileAsync } from "fs"
import { promisify } from "util"
import { StargateClient, SigningStargateClient, GasPrice } from "@cosmjs/stargate"
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing"
import { fromHex } from "@cosmjs/encoding"

const readFile = promisify(readFileAsync)

const SIMD_RPC = "http://127.0.0.1:26657"
const ALICE = "cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"
const BOB = "cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"

const runAll = async() => {
    const client = await StargateClient.connect(SIMD_RPC)
    console.log("chain id:", await client.getChainId())
    console.log("Alice's balance:", await client.getBalance(ALICE, "stake"))
    console.log("Bob's balance:", await client.getBalance(BOB, "stake"))

    const signingClient = await SigningStargateClient.connectWithSigner(
        SIMD_RPC,
        await DirectSecp256k1Wallet.fromKey(
            fromHex((await readFile("./alice.key")).toString()),
            "cosmos",
        ),
        {
            gasPrice: GasPrice.fromString("1stake"),
        },
    )
    console.log("chain id:", await signingClient.getChainId())

    const result = await signingClient.sendTokens(
        ALICE,
        BOB,
        [
            {
                denom: "stake",
                amount: "10000000",
            },
        ],
        "auto",
    )
    console.log("Transfer result:", result)
    console.log("Alice's balance after:", await client.getBalance(ALICE, "stake"))
    console.log("Bob's balance after:", await client.getBalance(BOB, "stake"))
}

runAll()
```

</ExpansionPanel>
