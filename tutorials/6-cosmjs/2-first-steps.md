---
title: "Your First CosmJS Actions"
order: 3
description: Interact with a Cosmos SDK chain through CosmJS
tags: 
  - tutorial
  - cosm-js
  - dev-ops
---

# Your First CosmJS Actions

<HighlightBox type="learning">

Take your first steps with CosmJS. Use it to send some simple transactions.
<br/><br/>
In this section, you will:

* Download and install CosmJS.
* Create a small experiment.
* Prepare a simple testnet.
* Establish your connection.
* Inspect a balance.
* Send transactions.

</HighlightBox>

Now that you know what CosmJS is, you should take your first steps in using it. A basic feature of a Cosmos chain is the ability to send tokens via the `bank` module. CosmJS naturally offers functions to cover this facility. You are going to:

1. Use an existing test network (testnet) with a key of your own.
2. Run basic CosmJS commands in a script that you run using the CLI.

Additionally, you can choose to:

1. Start a local chain that exposes RPCs instead of using a testnet.
2. Run the same basic CosmJS commands, but for this local chain.

Along the way, you learn the basic CosmJS concepts needed to start interacting with the Cosmos Ecosystem.

## Script preparation

A small, ready-made repository exists so you can experiment with CosmJS. Clone it from [here](https://github.com/b9lab/cosmjs-sandbox). You need [NodeJs](https://nodejs.org/en/download/). If you open the folder in [Visual Studio Code](https://code.visualstudio.com/Download), the IDE should give you all the coding help you require. In the cloned folder you need to install the required modules:

```sh
$ npm install
```

Create a new file named `experiment.ts`. In it, put these lines to confirm it works:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/3fe8942/experiment.ts#L1-L5]
const runAll = async(): Promise<void> => {
    console.log("TODO")
}

runAll()
```

To execute, this TypeScript file needs to be compiled into JavaScript before being interpreted by NodeJs. Add this as a run target in `package.json`:

```json [https://github.com/b9lab/cosmjs-sandbox/blob/3fe8942/package.json#L7]
...
    "scripts": {
        ...
        "experiment": "ts-node experiment.ts"
    }
...
```

Confirm that it does what you want:

```sh
$ npm run experiment
```

This returns:

```txt
> cosmjs-sandbox@1.0.0 experiment
> ts-node experiment.ts

TODO
```

You will soon make this script more meaningful. With the basic script ready, you need to prepare some elements.

## Testnet preparation

The Cosmos Ecosystem has a number of testnets running. The Cosmos Hub is currently running a [public testnet](https://github.com/cosmos/testnets/tree/master/public) for the Theta upgrade that you are connecting to and running your script on. You need to connect to a public node so that you can query information and broadcast transactions. One of the available nodes is:

```[https://github.com/cosmos/testnets/tree/master/public#endpoints]
RPC: https://rpc.sentry-01.theta-testnet.polypore.xyz
```

You need a wallet address on the testnet and you must create a 24-word mnemonic in order to do so. CosmJS can generate one for you. Create a new file `generate_mnemonic.ts` with the following script:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/generate_mnemonic.ts#L1-L10]
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"

const generateKey = async (): Promise<void> => {
    const wallet: DirectSecp256k1HdWallet = await DirectSecp256k1HdWallet.generate(24)
    process.stdout.write(wallet.mnemonic)
    const accounts = await wallet.getAccounts()
    console.error("Mnemonic with 1st account:", accounts[0].address)
}

generateKey()
```

Now create a **key** for our imaginary user **Alice**:

```sh
$ npx ts-node generate_mnemonic.ts > testnet.alice.mnemonic.key
```

<HighlightBox type="Note">

You likely need to update Node.js to a later version if this fails. Find a guide [here](https://phoenixnap.com/kb/update-node-js-version).

</HighlightBox>

When done, it should also tell you the address of the first account:

```txt
Mnemonic with 1st account: cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf
```

Temporarily keep this address for convenience, although CosmJS can always recalculate it from the mnemonic. Privately examine the file to confirm it contains your 24 words.

<HighlightBox type="warn">

Important considerations:

1. `process.stdout.write` was used to avoid any line return. Be careful not to add any empty lines or any other character in your `.key` file (this occurs with VSCode under certain conditions). If you add any characters, ComsJs may not be able to parse it.
2. Adjust the `.gitignore` file to not commit your `.key` file by mistake:

    ``` [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/.gitignore#L2]
    node_modules
    *.key
    ```

</HighlightBox>

<HighlightBox type="tip">

For your convenience, we have a branch available [here](https://github.com/b9lab/cosmjs-sandbox/tree/file-preparation) that contains all the code and files you've added so far.

</HighlightBox>

## Add your imports

You need a small, simple interface to a blockchain, one which could eventually have users. Good practice is to refrain from requesting a user address until necessary (e.g. when a user clicks a relevant button). Therefore, in `experiment.ts` you first use the read-only client. Import it at the top of the file:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L1]
import { StargateClient } from "@cosmjs/stargate"
```

<HighlightBox type="info">

Note that VSCode assists you to auto-complete [`StargateClient`](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/stargate/src/stargateclient.ts#L139) if you type <kbd>CTRL-Space</kbd> inside the `{}` of the `import` line.

</HighlightBox>

## Define your connection

Next, you need to tell the client how to connect to the RPC port of your blockchain:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L5]
const rpc = "rpc.sentry-01.theta-testnet.polypore.xyz:26657"
```

Inside the `runAll` function you [initialize the connection](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/stargate/src/stargateclient.ts#L146) and immediately [check](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/stargate/src/stargateclient.ts#L194) you connected to the right place:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L8-L9]
const runAll = async(): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight())
}
```

Run again to check with `npm run experiment`, and you get:

```txt
With client, chain id: theta-testnet-001 , height: 9507032
```

## Get a balance

Normally you would not yet have access to your user's address. However, for this exercise you need to know how many tokens Alice has, so add a temporary new command inside `runAll`:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L10-L13]
console.log(
    "Alice balances:",
    await client.getAllBalances("cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf"), // <-- replace with your generated address
)
```

`getAllBalances` is used because the default token name is not yet known. When you run it again, you get:

```txt
Alice balances: []
```

If you just created this account, Alice's balance is zero. Alice needs tokens to be able to send transactions and participate in the network. A common practice with testnets is to expose **faucets** (services that send you test tokens for free, within limits).

The Cosmos Hub Testnet faucet has a dedicated [Discord channel](https://discord.com/channels/669268347736686612/953697793476821092/958291295741313024) where you can ask for tokens once per day _per Discord user_.

Go to the faucet channel and request tokens for Alice by entering this command in the channel:

```txt
$request [Alice's address] theta

// For example:
$request cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf theta
```

The faucet bot replies with a link to the transaction from the block explorer:

```txt
✅  https://explorer.theta-testnet.polypore.xyz/transactions/540484BDD342702F196F84C2FD42D63FA77F74B26A8D7383FAA5AB46E4114A9B
```

Check that Alice received the tokens with `npm run experiment`, which should return:

```txt
Alice balances: [ { denom: 'uatom', amount: '10000000' } ]
```

`uatom` is the indivisible token unit on the Testnet. It is short for micro-ATOM, or µ-ATOM. So 10 million `uatom` equal 10 ATOM. After this confirmation you can comment out the balance query.

## Get the faucet address

As an exercise you want Alice to send some tokens back to the faucet, so you need its address. You can request this from the faucet bot, but it is also possible to get it using the transaction hash in `experiment.ts`.

First you need to get the transaction.

Add the necessary import at the top:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L1]
import { IndexedTx, StargateClient } from "@cosmjs/stargate"
```

Then, make sure you replace the hash with the one you received from the faucet bot.

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L14-L16]
const faucetTx: IndexedTx = (await client.getTx(
    "540484BDD342702F196F84C2FD42D63FA77F74B26A8D7383FAA5AB46E4114A9B",
))!
```

### Deserialize the transaction

What does `faucetTx` contain? Add the following line to find out:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L17]
console.log("Faucet Tx:", faucetTx)
```

Then run the script again using `npm run experiment`. You find the following output, which in your case contains different values:

```json
Faucet Tx: {
  height: 9487785,
  hash: '540484BDD342702F196F84C2FD42D63FA77F74B26A8D7383FAA5AB46E4114A9B',
  code: 0,
  rawLog: '[{"events":[{"type":"coin_received","attributes":[{"key":"receiver","value":"cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf"},{"key":"amount","value":"10000000uatom"}]},{"type":"coin_spent","attributes":[{"key":"spender","value":"cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he"},{"key":"amount","value":"10000000uatom"}]},{"type":"message","attributes":[{"key":"action","value":"/cosmos.bank.v1beta1.MsgSend"},{"key":"sender","value":"cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he"},{"key":"module","value":"bank"}]},{"type":"transfer","attributes":[{"key":"recipient","value":"cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf"},{"key":"sender","value":"cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he"},{"key":"amount","value":"10000000uatom"}]}]}]',
  tx: Uint8Array(321) [
     10, 148,   1,  10, 145,   1,  10,  28,  47,  99, 111, 115,
    109, 111, 115,  46,  98,  97, 110, 107,  46, 118,  49,  98,
    101, 116,  97,  49,  46,  77, 115, 103,  83, 101, 110, 100,
     18, 113,  10,  45,  99, 111, 115, 109, 111, 115,  49,  53,
     97, 112, 116, 100, 113, 109, 109,  55, 100, 100, 103, 116,
     99, 114, 106, 118,  99,  53, 104, 115,  57,  56,  56, 114,
    108, 114, 107, 122, 101,  52,  48, 108,  52, 113,  48, 104,
    101,  18,  45,  99, 111, 115, 109, 111, 115,  49,  55, 116,
    118, 100,  52, 104,
    ... 221 more items
  ],
  gasUsed: 76657,
  gasWanted: 200000
}
```

The structure of this output is JSON. There is a serialized `faucetTx.tx` of the type `Uint8Array`. The serialized transaction are the bytes (i.e. `Uint8`) of the actual transaction that was sent over the testnet by the faucet. It is unintelligible to humans until you deserialize it properly. Use the methods offered by `cosmjs-types` [`Tx`](https://github.com/confio/cosmjs-types/blob/a14662d/src/cosmos/tx/v1beta1/tx.ts#L230) to deserialize it.

Add the necessary import at the top:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L3]
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx"
```

Then deserialize the transaction:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L18-L19]
const decodedTx: Tx = Tx.decode(faucetTx.tx)
console.log("DecodedTx:", decodedTx)
```

Which, on your next `npm run experiment`, prints:

```json
DecodedTx: {
  signatures: [
    Uint8Array(64) [
      106, 244,  26, 232, 175,  96, 235, 168,  96,  55, 157,
      222,  49, 142,  64, 207,  67, 109,  40,  45, 153, 232,
      112, 134, 251,  97,  72, 162, 169,  62, 245, 134,  59,
      241,  75,  31, 146,  11, 176, 159, 185,  41, 100, 171,
      175,  78, 120, 186,  24, 136, 103, 160, 205,  64, 180,
      131,   9, 137, 178, 221,  68,  28, 122, 169
    ]
  ],
  body: {
    memo: '',
    timeoutHeight: Long { low: 0, high: 0, unsigned: true },
    messages: [ [Object] ],
    extensionOptions: [],
    nonCriticalExtensionOptions: []
  },
  authInfo: {
    signerInfos: [ [Object] ],
    fee: { gasLimit: [Long], payer: '', granter: '', amount: [Array] }
  }
}
```

The faucet address information you are looking for is inside the `body.messages`, and must be printed. Add:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L20]
console.log("Decoded messages:", decodedTx.body!.messages)
```

Which, on your next `npm run experiment`, prints:

```json
Decoded messages: [
  {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: Uint8Array(113) [
       10,  45,  99, 111, 115, 109, 111, 115,  49,  53,  97, 112,
      116, 100, 113, 109, 109,  55, 100, 100, 103, 116,  99, 114,
      106, 118,  99,  53, 104, 115,  57,  56,  56, 114, 108, 114,
      107, 122, 101,  52,  48, 108,  52, 113,  48, 104, 101,  18,
       45,  99, 111, 115, 109, 111, 115,  49,  55, 116, 118, 100,
       52, 104,  99, 115, 122, 113,  55, 108,  99, 120, 117, 119,
      122, 114, 113, 107, 101, 112, 117,  97, 117,  57, 102, 121,
      101,  51, 100,  97, 108,  54,  48,  54, 122, 102,  26,  17,
       10,   5, 117,  97,
      ... 13 more items
    ]
  }
]
```

Deserializing the transaction has not fully deserialized any messages that it contains, nor their `value`, which is again a `Uint8Array`. The transaction deserializer knows how to properly decode any transaction, but it does not know how to do the same for messages. Messages can in fact be of any type, and each type has its own deserializer. This is not something that the `Tx.decode` transaction deserializer function knows.

### What is this long string?

Note the `typeUrl: "/cosmos.bank.v1beta1.MsgSend"` string. This comes from the [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md) definitions and is a mixture of:

1. The `package` where `MsgSend` is initially declared:

    ```protobuf [https://github.com/cosmos/cosmos-sdk/blob/3a1027c/proto/cosmos/bank/v1beta1/tx.proto#L2]
    package cosmos.bank.v1beta1;
    ```

2. And the name of the message itself, `MsgSend`:

    ```protobuf [https://github.com/cosmos/cosmos-sdk/blob/3a1027c/proto/cosmos/bank/v1beta1/tx.proto#L22]
    message MsgSend {
        ...
    }
    ```

This `typeUrl` string you see in the decoded message is the canonical identifier of the type of message that's serialized under the `value` array. There are many different message types, each coming from different modules or base layers from the Cosmos SDK, and you can find an overview of them [here](https://buf.build/cosmos/cosmos-sdk).

The blockchain client itself knows how to serialize or deserialize it only because this `"/cosmos.bank.v1beta1.MsgSend"` string is passed along. With this `typeUrl`, the blockchain client and CosmJS are able to pick the right deserializer. This object is also named `MsgSend` in `cosmjs-types`. But in this tutorial, you have picked the deserializer manually.

<HighlightBox type="info">

To learn how to make your own types for your own blockchain project, head to [Create Custom CosmJS Interfaces](./5-create-custom.md).

</HighlightBox>

### Deserialize the message

Now that you know the only message in the transaction is a `MsgSend`, you need to deserialize it. First add the necessary import at the top:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L2]
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
```

Then you deserialize the message. Add:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L2]
const sendMessage: MsgSend = MsgSend.decode(decodedTx.body!.messages[0].value)
console.log("Sent message:", sendMessage)
```

Which, on your next `npm run experiment`, prints:

```json
Sent message: {
  fromAddress: 'cosmos15aptdqmm7ddgtcrjvc5hs988rlrkze40l4q0he',
  toAddress: 'cosmos17tvd4hcszq7lcxuwzrqkepuau9fye3dal606zf',
  amount: [ { denom: 'uatom', amount: '10000000' } ]
}
```

In this message, the `fromAddress` is that of the faucet:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L23]
const faucet: string = sendMessage.fromAddress
```

Similar to how you got the balance for Alice, you get the faucet's balance as well. Try this by [copying](https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L24) the code to print Alice's balances. When running, you should get:

```txt
Faucet balances: [ { denom: 'uatom', amount: '867777337235' } ]
```

<ExpansionPanel title="Getting the faucet address another way">

Instead of using the `decode` functions that come with the `Tx` and `MsgSend` imports, you process the data yourself via alternative means. If you would like to experiment more, parse the `rawLog` manually as opposed to deserializing the transaction as suggested previously.
<br/><br/>
Note the conceptual difference between `Tx` and the `rawLog`. The `Tx`, or `MsgSend`, object is an input to the computation that takes place when the transaction is included in a block. The `rawLog` is the resulting output of said computation and its content depends on what the blockchain code emitted when executing the transaction.

From the `IndexedTx` you see that there is a [`rawLog`](https://github.com/cosmos/cosmjs/blob/13ce43c/packages/stargate/src/stargateclient.ts#L64), which happens to be a stringified JSON.

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L28-L29]
const rawLog = JSON.parse(faucetTx.rawLog)
console.log("Raw log:", JSON.stringify(rawLog, null, 4))
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

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/723d2a9/experiment.ts#L30-L32]
const faucet: string = rawLog[0].events
    .find((eventEl: any) => eventEl.type === "coin_spent")
    .attributes.find((attribute: any) => attribute.key === "spender").value
```

Although this is a perfectly valid way to extract specific values from a transaction's message, it is not the recommended way to do so. The benefit of importing the message types is that you do not have to manually dig through the raw log of each `Tx` you're looking to use in your application.

</ExpansionPanel>

These actions are example uses of the read-only `StargateClient` and of the serialization tools that come with CosmJS.

<HighlightBox type="tip">

Get the result of the above steps [here](https://github.com/b9lab/cosmjs-sandbox/tree/with-stargate-client).

</HighlightBox>

Now it is time for Alice to send some tokens back to the faucet.

## Prepare a signing client

If you go through the methods inside [`StargateClient`](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/stargate/src/stargateclient.ts#L139), you see that it only contains query-type methods and none for sending transactions.

Now, for Alice to send transactions, she needs to be able to sign them. And to be able to sign transactions, she needs access to her _private keys_ or _mnemonics_. Or rather she needs a client that has access to those. That is where [`SigningStargateClient`](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/stargate/src/signingstargateclient.ts#L147) comes in. Conveniently, `SigningStargateClient` inherits from `StargateClient`.

Update your import line:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/4168b97/experiment.ts#L3]
import { IndexedTx, SigningStargateClient, StargateClient } from "@cosmjs/stargate"
```

Look at its declaration by right-clicking on the `SigningStargateClient` in your imports and choosing <kbd>Go to Definition</kbd>.

When you instantiate `SigningStargateClient` by using the [`connectWithSigner`](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/stargate/src/signingstargateclient.ts#L156) method, you need to pass it a [**signer**](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/stargate/src/signingstargateclient.ts#L158). In this case, use the [`OfflineDirectSigner`](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/proto-signing/src/signer.ts#L21-L24) interface.

<HighlightBox type="info">

The recommended way to encode messages is by using `OfflineDirectSigner`, which uses Protobuf. However, hardware wallets such as Ledger do not support this and still require the legacy Amino encoder. If your app requires Amino support, you have to use the `OfflineAminoSigner`.
<br></br>
Read more about encoding [here](https://docs.cosmos.network/main/core/encoding.html).

</HighlightBox>

The signer needs access to Alice's **private key**, and there are several ways to accomplish this. In this example, use Alice's saved **mnemonic**. To load the mnemonic as text in your code you need this import:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/4168b97/experiment.ts#L1]
import { readFile } from "fs/promises"
```

There are several implementations of `OfflineDirectSigner` available. The [`DirectSecp256k1HdWallet`](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/proto-signing/src/directsecp256k1hdwallet.ts#L133) implementation is most relevant to us due to its [`fromMnemonic`](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/proto-signing/src/directsecp256k1hdwallet.ts#L140-L141) method. Add the import:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/4168b97/experiment.ts#L2]
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
```

The `fromMnemonic` factory function needs a string with the mnemonic. You read this string from the mnemonic file. Create a new top-level function that returns an `OfflineDirectSigner`:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/4168b97/experiment.ts#L9-L13]
const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic((await readFile("./testnet.alice.mnemonic.key")).toString(), {
        prefix: "cosmos",
    })
}

```

The Cosmos Hub Testnet uses the `cosmos` address prefix. This is the default used by `DirectSecp256k1HdWallet`, but you are encouraged to explicitly define it as you might be working with different prefixes on different blockchains. In your `runAll` function, add:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/4168b97/experiment.ts#L44]
const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
```

As a first step, confirm that it recovers Alice's address as expected:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/4168b97/experiment.ts#L45-L46]
const alice = (await aliceSigner.getAccounts())[0].address
console.log("Alice's address from signer", alice)
```

Now add the line that finally creates the signing client:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/4168b97/experiment.ts#L47]
const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
```

Check that it works like the read-only client that you used earlier, and from which [it inherits](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/stargate/src/signingstargateclient.ts#L147), by adding:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/4168b97/experiment.ts#L48-L53]
console.log(
    "With signing client, chain id:",
    await signingClient.getChainId(),
    ", height:",
    await signingClient.getHeight()
)
```

Run it with `npm run experiment`.

<HighlightBox type="tip">

Get the result of the previous steps [here](https://github.com/b9lab/cosmjs-sandbox/tree/with-signing-stargate-client).

</HighlightBox>

## Send tokens

Alice can now send some tokens back to the faucet, but to do so she also needs to pay the network's gas fee. How much gas should she use, and at what price?

She can copy what the faucet did. To discover this, add:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/2c7b137/experiment.ts#L55-L56]
console.log("Gas fee:", decodedTx.authInfo!.fee!.amount)
console.log("Gas limit:", decodedTx.authInfo!.fee!.gasLimit.toString(10))
```

When you run it, it prints:

```txt
Gas fee: [ { denom: 'uatom', amount: '500' } ]
Gas limit: 200000
```

With the gas information now decided, how does Alice structure her command so that she sends 1% of her holdings, i.e. `100000uatom`, back to the faucet? `SigningStargateClient`'s [`sendTokens`](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/stargate/src/signingstargateclient.ts#L217-L223) function takes a `Coin[]` as input. `Coin` is simply defined as:

```typescript [https://github.com/confio/cosmjs-types/blob/a14662d/src/cosmos/base/v1beta1/coin.ts#L13-L16]
export interface Coin {
    denom: string;
    amount: string;
}
```

Alice can pick any `denom` and any `amount` as long as she owns them, the signing client signs the transaction and broadcasts it. In this case it is:

```typescript
{ denom: "uatom", amount: "100000" }
```

With this gas and coin information, add the command:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/2c7b137/experiment.ts#L57-L63]
// Check the balance of Alice and the Faucet
console.log("Alice balance before:", await client.getAllBalances(alice))
console.log("Faucet balance before:", await client.getAllBalances(faucet))
// Execute the sendTokens Tx and store the result
const result = await signingClient.sendTokens(
    alice,
    faucet,
    [{ denom: "uatom", amount: "100000" }],
    {
        amount: [{ denom: "uatom", amount: "500" }],
        gas: "200000",
    },
)
// Output the result of the Tx
console.log("Transfer result:", result)
```

To confirm that it worked, add another balance check:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/2c7b137/experiment.ts#L64-L65]
console.log("Alice balance after:", await client.getAllBalances(alice))
console.log("Faucet balance after:", await client.getAllBalances(faucet))
```

Run this with `npm run experiment` and you should get:

```txt
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
```

According to the `rawLog`, the faucet received `100000uatom`. Since Alice ends up with `"9899500uatom"`, it means she also paid `500uatom` for gas.

This concludes your first use of CosmJS to send tokens.

<HighlightBox type="tip">

Find the result of all the previous steps [here](https://github.com/b9lab/cosmjs-sandbox/tree/send-tokens).

</HighlightBox>

<HighlightBox type="note">

You connected to a publicly running testnet. Therefore, you depended on someone else to have a blockchain running with an open and publicly available RPC port and faucet. What if you wanted to try connecting to your own locally running blockchain?

</HighlightBox>

## With a locally started chain

The easiest option is to reuse the `simd` chain that you started in a [previous module](/tutorials/3-run-node/index.md). Make sure that you have created two accounts, Alice and Bob. You also sent tokens using `simd`. Be sure to credit enough tokens to Alice.

When you finally launch `simd`:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd start
```

</CodeGroupItem>

<CodeGroupItem title="WSL2">

```sh
$ ./build/simd start --keyring-backend test
```

</CodeGroupItem>

</CodeGroup>

You see the line:

```txt
...
4:37PM INF Starting RPC HTTP server on 127.0.0.1:26657 module=rpc-server
...
```

Port `26657` is the default port for RPC endpoints built with the SDK, unless otherwise configured in `~/.simapp/config/config.toml`. `127.0.0.1:26657` is the URL you need to add to your script later.

Make a copy of your `experiment.ts` script, with some adjustments. Name it `experiment-local.ts`. Add a new run target in `package.json`:

```json [https://github.com/b9lab/cosmjs-sandbox/blob/8466986/package.json#L8]
{
    ...
    "scripts": {
        ...
        "experiment-local": "ts-node experiment-local.ts",
        ...
    }
}
```

## Preparing your keys

Although you have Alice's address, you may not have her mnemonic or private key. The private key is stored in your operating system's keyring backend. For the purpose of this exercise, extract it - generally this is an unsafe operation:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd keys export alice --unsafe --unarmored-hex
```

</CodeGroupItem>

<CodeGroupItem title="WSL2">

```sh
$ ./build/simd keys export alice --unsafe --unarmored-hex --keyring-backend test
```

</CodeGroupItem>

</CodeGroup>

You get a 64-digit-long hex value. Copy-paste it into a new `simd.alice.private.key` file in your `cosmjs-sandbox` folder. The `.gitignore` was already configured earlier to ignore it, which mitigates the risk.

<HighlightBox type="tip">

If you cannot remember which alias you gave your keys, `list` them:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd keys list
```

</CodeGroupItem>

<CodeGroupItem title="WSL2">

```sh
$ ./build/simd keys list --keyring-backend test
```

</CodeGroupItem>

</CodeGroup>

Which returns:

```yaml
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

With the new elements in place, update your `experiment-local.ts` script. Change `rpc`:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/8466986/experiment-local.ts#L6]
const rpc = "http://127.0.0.1:26657"
```

And skip the lengthy process to get the faucet address. Just set `faucet` to Bob's address:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/8466986/experiment-local.ts#L22]
const faucet: string = "cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"
```

Next, you need to replace the function to create Alice's signer because you're using a private key instead of a mnemonic, so the `fromMnemonic` method that comes with `DirectSecp256k1HdWallet` does not work. The [`fromKey`](https://github.com/cosmos/cosmjs/blob/0f0c9d8/packages/proto-signing/src/directsecp256k1wallet.ts#L21) method that comes with `DirectSecp256k1Wallet` is the more appropriate choice this time.

Adjust the import:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/8466986/experiment-local.ts#L3]
import { DirectSecp256k1Wallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
```

In `DirectSecp256k1Wallet` the `fromKey` factory function needs a `Uint8Array`. Fortunately, CosmJS includes a utility to convert a hexadecimal string into a `Uint8Array`. Import it:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/8466986/experiment-local.ts#L2]
import { fromHex } from "@cosmjs/encoding"
```

Now create a new function to get a signer to replace the previous one:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/8466986/experiment-local.ts#L8-L13]
const getAliceSignerFromPriKey = async(): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1Wallet.fromKey(
        fromHex((await readFile("./simd.alice.private.key")).toString()),
        "cosmos",
    )
}
```

Replace `getAliceSignerFromMnemonic` with the newly created `getAliceSignerFromPriKey`:

```typescript [https://github.com/b9lab/cosmjs-sandbox/blob/8466986/experiment-local.ts#L24]
const aliceSigner: OfflineDirectSigner = await getAliceSignerFromPriKey()
```

Also change the token unit from `uatom` [to `stake`](https://github.com/b9lab/cosmjs-sandbox/blob/8466986/experiment-local.ts#L37-L38) in your `sendTokens` transaction, because this is the default token when using `simapp`. Experiment with adjusting the values as desired. Run it with:

```sh
$ npm run experiment-local
```

And confirm the output is as expected. For instance something like:

```txt
> cosmjs-sandbox@1.0.0 experiment-local
> ts-node experiment-local.ts

With client, chain id: demo , height: 44883
Alice balances: []
Alice's address from signer cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je
With signing client, chain id: demo , height: 44883
Alice balance before: [ { denom: 'stake', amount: '19891835' } ]
Faucet balance before: [ { denom: 'stake', amount: '10010000' } ]
Transfer result: {
  code: 0,
  height: 44885,
  rawLog: '[{"events":[{"type":"coin_received","attributes":[{"key":"receiver","value":"cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"},{"key":"amount","value":"100000stake"}]},{"type":"coin_spent","attributes":[{"key":"spender","value":"cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"},{"key":"amount","value":"100000stake"}]},{"type":"message","attributes":[{"key":"action","value":"/cosmos.bank.v1beta1.MsgSend"},{"key":"sender","value":"cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"},{"key":"module","value":"bank"}]},{"type":"transfer","attributes":[{"key":"recipient","value":"cosmos1umpxwaezmad426nt7dx3xzv5u0u7wjc0kj7ple"},{"key":"sender","value":"cosmos1c3srguwnzah5nd4cn49shltvr6tsrcl2jwn8je"},{"key":"amount","value":"100000stake"}]}]}]',
  transactionHash: 'A49EBD41E37CDACF258F0BCD0954C52138FB5121C9A3B58138A2279EDB526B6D',
  gasUsed: 72702,
  gasWanted: 200000
}
Alice balance after: [ { denom: 'stake', amount: '19791335' } ]
Faucet balance after: [ { denom: 'stake', amount: '10110000' } ]
```

You have now used CosmJS's bank module on a locally running Cosmos blockchain.

<HighlightBox type="tip">

Find the complete set of files [here](https://github.com/b9lab/cosmjs-sandbox/tree/send-tokens-local).

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to gain familiarity with ComsJS by implementing a basic feature of the Cosmos Ecosystem, the ability to send tokens via the `bank` module.
* How to clone a ready-made test repository and install the required modules in order to experiment with CosmJS, for which NodeJs and Visual Studio Code will be required.
* How to connect to a public node in the Cosmos Ecosystem, acquire a wallet address on a testnet, and create a key for an imaginary user for the purposes of experimenting.
* How to add your imports, define your connection, get a balance, get the faucet address, prepare a signing client, and successfully send tokens on a chain being run by someone else.
* How to connect with your own locally running blockchain, including how to prepare your keys and update your script.

</HighlightBox>

<!--## Next up

You have sent a transaction with a single message. How about you send a transaction with more than one message? That is the object of the [next section](./3-multi-msg.md). Or skip ahead and send a simple transaction, but this time from a Web browser with the help of [Keplr](./4-with-keplr.md).-->
