---
title: "Custom Messages for Your Checkers Blockchain"
order: 3
description: Introduce the message to create a game
tags: 
  - guided-coding
  - cosmos-sdk
  - cosm-js
---

# Custom Messages for Your Checkers Blockchain

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [CosmJS](../xl-cosmjs/intro.md).
* You have generated the necessary TypeScript types in [the previous tutorial](./cosmjs-objects.md).
* You have the finished the checkers blockchain exercise. If not, you can follow that tutorial [here](./index.md) or just clone and checkout the [relevant branch](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-wager-denomination) that contains the final version.

</HighlightBox>

In the previous section, you created the objects that allow you to **query** your Checkers blockchain. Now, you will create the elements that allow you to **send transactions** to it.

## Encodable messages

Previously you defined in Protobuf three messages and their respective responses. You had Protobuf [compile them](https://github.com/cosmos/academy-checkers-ui/blob/generated/src/types/generated/checkers/tx.ts). Now you will create a few instances of `EncodeObject`, similar to how this is done in CosmJS's [bank module](https://github.com/cosmos/cosmjs/blob/13ce43c/packages/stargate/src/modules/bank/messages.ts). First, collect their names and Protobuf packages. Each Protobuf type identifier is assigned its encodable type:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/src/types/checkers/messages.ts#L11-L25]
export const typeUrlMsgCreateGame = "/alice.checkers.checkers.MsgCreateGame"
export const typeUrlMsgCreateGameResponse = "/alice.checkers.checkers.MsgCreateGameResponse"
export const typeUrlMsgPlayMove = "/alice.checkers.checkers.MsgPlayMove"
export const typeUrlMsgPlayMoveResponse = "/alice.checkers.checkers.MsgPlayMoveResponse"
export const typeUrlMsgRejectGame = "/alice.checkers.checkers.MsgRejectGame"
export const typeUrlMsgRejectGameResponse = "/alice.checkers.checkers.MsgRejectGameResponse"

export const checkersTypes: ReadonlyArray<[string, GeneratedType]> = [
    [typeUrlMsgCreateGame, MsgCreateGame],
    [typeUrlMsgCreateGameResponse, MsgCreateGameResponse],
    [typeUrlMsgPlayMove, MsgPlayMove],
    [typeUrlMsgPlayMoveResponse, MsgPlayMoveResponse],
    [typeUrlMsgRejectGame, MsgRejectGame],
    [typeUrlMsgRejectGameResponse, MsgRejectGameResponse],
]
```

Next proceed with the declarations. As with CosmJS, you can add an `isMsgXX` helper for each:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/src/types/checkers/messages.ts#L27-L47]
export interface MsgCreateGameEncodeObject extends EncodeObject {
    readonly typeUrl: "/alice.checkers.checkers.MsgCreateGame"
    readonly value: Partial<MsgCreateGame>
}

export function isMsgCreateGameEncodeObject(
    encodeObject: EncodeObject,
): encodeObject is MsgCreateGameEncodeObject {
    return (
        (encodeObject as MsgCreateGameEncodeObject).typeUrl === typeUrlMsgCreateGame
    )
}

export interface MsgCreateGameResponseEncodeObject... {}
export function isMsgCreateGameResponseEncodeObject(...)...
export interface MsgPlayMoveEncodeObject... {}
...
```

This needs to be repeated for each of the messages that you require. To refresh your memory, that is:

* `MsgCreateGame`
* `MsgCreateGameResponse`
* `MsgPlayMove`
* `MsgPlayMoveResponse`
* `MsgRejectGame`
* `MsgRejectGameResponse`

## A signing Stargate for Checkers

This process again takes inspiration from [`SigningStargateClient`](https://github.com/cosmos/cosmjs/blob/13ce43c/packages/stargate/src/signingstargateclient.ts#L53-L66). Prepare by registering your new types in addition to the others, so that your client knows them all:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/src/checkers_signingstargateclient.ts#L24-L31]
import { defaultRegistryTypes } from "@cosmjs/stargate"

export const checkersDefaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
    ...defaultRegistryTypes,
    ...checkersTypes,
]

function createDefaultRegistry(): Registry {
    return new Registry(checkersDefaultRegistryTypes)
}
```

Similar to the read-only `StargateClient`, create a `CheckersSigningStargateClient` that inherits from `SigningStargateClient`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/src/checkers_signingstargateclient.ts#L33-L57]
export class CheckersSigningStargateClient extends SigningStargateClient {
    public readonly checkersQueryClient: CheckersExtension | undefined

    public static async connectWithSigner(
        endpoint: string,
        signer: OfflineSigner,
        options: SigningStargateClientOptions = {},
    ): Promise<CheckersSigningStargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint)
        return new CheckersSigningStargateClient(tmClient, signer, {
            registry: createDefaultRegistry(),
            ...options,
        })
    }

    protected constructor(
        tmClient: Tendermint34Client | undefined,
        signer: OfflineSigner,
        options: SigningStargateClientOptions,
    ) {
        super(tmClient, signer, options)
        if (tmClient) {
            this.checkersQueryClient = QueryClient.withExtensions(tmClient, setupCheckersExtension)
        }
    }
}
```

Note the use of `createDefaultRegistry` as the default registry, if nothing was passed via the options.

## The action methods

Finally you must add the methods that allow you to interact with the blockchain. Taking inspiration from [`sendTokens`](https://github.com/cosmos/cosmjs/blob/13ce43c/packages/stargate/src/signingstargateclient.ts#L176-L192), create one function for each of your messages:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/src/checkers_signingstargateclient.ts#L59-L117]
public async createGame(
    creator: string,
    black: string,
    red: string,
    token: string,
    wager: Long,
    fee: StdFee | "auto" | number,
    memo = "",
): Promise<DeliverTxResponse> {
    const createMsg: MsgCreateGameEncodeObject = {
        typeUrl: typeUrlMsgCreateGame,
        value: {
            black: black,
            red: red,
            creator: creator,
            token: token,
            wager: wager,
        },
    }
    return this.signAndBroadcast(creator, [createMsg], fee, memo)
}

public async playMove(
    creator: string,
    gameId: string,
    from: Pos,
    to: Pos,
    fee: StdFee | "auto" | number,
    memo = "",
): Promise<DeliverTxResponse> {
    const playMoveMsg: MsgPlayMoveEncodeObject = {
        typeUrl: typeUrlMsgPlayMove,
        value: {
            creator: creator,
            idValue: gameId,
            fromX: Long.fromNumber(from.x),
            fromY: Long.fromNumber(from.y),
            toX: Long.fromNumber(to.x),
            toY: Long.fromNumber(to.y),
        },
    }
    return this.signAndBroadcast(creator, [playMoveMsg], fee, memo)
}

public async rejectGame(
    creator: string,
    gameId: string,
    fee: StdFee | "auto" | number,
    memo = "",
): Promise<DeliverTxResponse> {
    const rejectGameMsg: MsgRejectGameEncodeObject = {
        typeUrl: typeUrlMsgRejectGame,
        value: {
            creator: creator,
            idValue: gameId,
        },
    }
    return this.signAndBroadcast(creator, [rejectGameMsg], fee, memo)
}
```

## Test your signing client

For live testing, reuse the `experiment.ts` file created in the [previous section](./cosmjs-objects.md). This time you first need to provide a signer. You learned how to do this in the [CosmJS introduction section](../xl-cosmjs/first-steps.md).

### Key preparation with a mnemonic

If you do your experimentation while starting the chain with `ignite chain serve`, you can reuse the mnemonics that Ignite CLI gives you with this function:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/test/live/experiment.ts#L14-L18]
const getSignerFromMnemonic = async (filePath: string): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic((await readFile(filePath)).toString(), {
        prefix: "cosmos",
    })
}
```

Note that this works as long as you have a mnemonic. If you're running your chain locally over Ignite CLI, start the chain with:

```sh
$ ignite chain serve --reset-once
```

Save the mnemonics of Alice and Bob in their own `alice.key` and `bob.key` right next to `experiment.ts`:

* Do not add any [extra character](https://github.com/cosmos/b9-checkers-academy-draft/blob/dab7dd4/client/test/live/alice.key.sample) in the files.
* Add [`*.key` to `.gitignore`](https://github.com/cosmos/b9-checkers-academy-draft/blob/dab7dd4/.gitignore#L2) so as not to commit these test files by mistake.

### Key preparation with a private key

If you do your experimentation in another way without a mnemonic (in particular if you only have access to the raw private key), use this function instead:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/test/live/experiment.ts#L20-L22]
const getSignerFromPriKey = async (filePath: string): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1Wallet.fromKey(fromHex((await readFile(filePath)).toString()), "cosmos")
}
```

Also use the `.gitignore` file to avoid committing key files.

### Client preparation

In `experiment.ts` create clients for Alice and Bob. For example, for Alice:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/test/live/experiment.ts#L42-L47]
const aliceSigner: OfflineDirectSigner = await getSignerFromMnemonic(`${__dirname}/alice.key`)
const alice: string = (await aliceSigner.getAccounts())[0].address
const aliceSigningClient: CheckersSigningStargateClient =
    await CheckersSigningStargateClient.connectWithSigner(process.env.RPC_URL, aliceSigner, {
        gasPrice: GasPrice.fromString("1stake"),
    })
```

Note the use of a default gas price so that you can use `"auto"` later on. You do not need to input a high price because you are on your local machine or a test net for this `experiment.ts`.

### Create a game

Create a game with a small wager:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/test/live/experiment.ts#L56-L64]
const createResponse: DeliverTxResponse = await aliceSigningClient.createGame(
    alice,
    bob,
    alice,
    "stake",
    Long.fromNumber(5),
    "auto",
)
console.log(createResponse)
```

Which returns something like:

```json
{
  code: 0,
  height: 348,
  rawLog: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"CreateGame"},{"key":"module","value":"checkers"},{"key":"action","value":"NewGameCreated"},{"key":"Creator","value":"cosmos19vupsqcmghwwn4cf8qf2ec9wd7tdrz0vetw5fs"},{"key":"Index","value":"1"},{"key":"Red","value":"cosmos19vupsqcmghwwn4cf8qf2ec9wd7tdrz0vetw5fs"},{"key":"Black","value":"cosmos1e0ewpn5a4zmlu945eqem8p4q4l04wpgly70kvj"},{"key":"Wager","value":"5"},{"key":"Token","value":"stake"}]}]}]',
  transactionHash: '50D3362AE46A04D4D84C266535F8165C9C42DAA941DFE5DF3EA47F959238BA49',
  gasUsed: 64190,
  gasWanted: 71152
}
```

You can also create a small utility to extract the index of the game just created:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/src/types/checkers/events.ts#L3-L7]
export const getCreatedGameId = (createResponse: DeliverTxResponse, msgIndex: number): string => {
    return JSON.parse(createResponse.rawLog!)[0].events[msgIndex].attributes.find(
        (eventInfo: { key: string }) => eventInfo.key == "Index",
    ).value
}
```

Now use it:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/test/live/experiment.ts#L65]
const createdGameId: string = getCreatedGameId(createResponse, 0)
```

### Playing a move

Before Bob plays it would be good to know if his move is possible. This query does not need any signer, so use the read-only client:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/test/live/experiment.ts#L68-L74]
const canPlay: QueryCanPlayMoveResponse = await client.checkersQueryClient.checkers.canPlayMove(
    createdGameId,
    "b",
    { x: 1, y: 2 },
    { x: 2, y: 3 },
)
console.log(canPlay)
```

Which prints:

```json
{ possible: true, reason: 'ok' }
```

With this assurance, you can send the transaction:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/test/live/experiment.ts#L76-L83]
const playResponse: DeliverTxResponse = await bobSigningClient.playMove(
    bob,
    createdGameId,
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    "auto",
)
console.log(playResponse)
```

Which prints something like:

```json
{
  code: 0,
  height: 350,
  rawLog: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"PlayMove"},{"key":"sender","value":"cosmos1e0ewpn5a4zmlu945eqem8p4q4l04wpgly70kvj"},{"key":"module","value":"checkers"},{"key":"action","value":"MovePlayed"},{"key":"Creator","value":"cosmos1e0ewpn5a4zmlu945eqem8p4q4l04wpgly70kvj"},{"key":"IdValue","value":"1"},{"key":"CapturedX","value":"-1"},{"key":"CapturedY","value":"-1"},{"key":"Winner","value":"NO_PLAYER"}]},{"type":"transfer","attributes":[{"key":"recipient","value":"cosmos16xx0e457hm8mywdhxtmrar9t09z0mqt9x7srm3"},{"key":"sender","value":"cosmos1e0ewpn5a4zmlu945eqem8p4q4l04wpgly70kvj"},{"key":"amount","value":"5stake"}]}]}]',
  transactionHash: 'D0FDC154F3E846831442283F411B6E1B86E3E0B23D6020F601936C1CA7AD641F',
  gasUsed: 90297,
  gasWanted: 104866
}
```

Look carefully in the `rawLog` and you can find the wager payment event:

```json
{
    "type": "transfer",
    "attributes": [
        {
            "key": "recipient",
            "value": "cosmos16xx0e457hm8mywdhxtmrar9t09z0mqt9x7srm3"
        },
        {
            "key": "sender",
            "value": "cosmos1e0ewpn5a4zmlu945eqem8p4q4l04wpgly70kvj"
        },
        {
            "key": "amount",
            "value": "5stake"
        }
    ]
}
```

You can see that the escrow address of the checkers module is `cosmos16xx0e...7srm3`.

### Reject the game

To test this feature, have Alice reject the game:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/test/live/experiment.ts#L86-L91]
const rejectResponse: DeliverTxResponse = await aliceSigningClient.rejectGame(
    alice,
    createdGameId,
    "auto",
)
console.log(rejectResponse)
```

In its print, you can also find the escrow refund event of the form:

```json
{
    "type": "transfer",
    "attributes": [
        {
            "key": "recipient",
            "value": "cosmos1e0ewpn5a4zmlu945eqem8p4q4l04wpgly70kvj"
        },
        {
            "key": "sender",
            "value": "cosmos16xx0e457hm8mywdhxtmrar9t09z0mqt9x7srm3"
        },
        {
            "key": "amount",
            "value": "5stake"
        }
    ]
}
```

This is great news!

With the [`getAllStoredGames` call](https://github.com/cosmos/academy-checkers-ui/blob/dab7dd4/test/live/experiment.ts#L33) you can modify this test file, in particular by choosing not to reject the game but instead to list it in the next test run.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to create the elements necessary for you to begin sending transactions to your Checkers blockchain, including encodable messages, a signing client, and action methods that permit interaction with the blockchain.
* How to test your signing client, including key preparation (with either a mnemonic or a private key) and client preparation, followed by functions such as creating a game, rejecting a game, or playing a move.

</HighlightBox>

<!--## Next up

You now included elements and messages that allow you to interact with the checkers blockchain. You confirmed this with a small Node.js experimentation file. The only things that remain to do are adding any [server-side scripts](./server-side.md) and plugging the elements you have created into [a graphical user interface](./external-gui.md).

Head to the [next chapter](INCLUDE URL AFTER NEW STRUCTURE IS IMPLEMENTED) on CosmJS to work on the GUI and backend script for your checkers blockchain.-->
