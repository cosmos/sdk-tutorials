---
title: CosmJs - Create the messages for your GUI
order: 20
description: Create the messages that your GUI will use
tag: deep-dive
---

# CosmJs - Create the messages for your GUI

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [CosmJs](TODO).
* Have Go installed.
* The checkers blockchain codebase up to the CosmJs objects. You can get there by following the [previous steps](./cosmjs-objects.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/cosmjs-elements).

</HighlightBox>

In the previous section, you created the objects that allow you to **query** your Checkers blockchain. Now, you create the elements that will allow you to **send transactions** to it.

## Encodable messages

As you recall, you defined in Protobuf three messages and their respective responses. You had Protobuf compile [them](https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/src/types/generated/checkers/tx.ts). Now you are going to create `EncodeObject` along the lines of [CosmJs]https://github.com/cosmos/cosmjs/blob/13ce43c/packages/stargate/src/modules/bank/messages.ts. First you collect their names and Protobuf packages. Each Protobuf type identifier is assigned its encodable type:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/src/types/checkers/messages.ts#L11-L25]
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

Then you proceed with the declarations. And like CosmJs, you can add an `isMsgXX` helper for each:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/src/types/checkers/messages.ts#L27-L47]
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

## A signing Stargate for Checkers

Once more taking [inspiration from `SigningStargateClient`](https://github.com/cosmos/cosmjs/blob/13ce43c/packages/stargate/src/signingstargateclient.ts#L53-L66). you prepare the ground by registering your new types, on top of others, so that the client knows them all:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/src/checkers_signingstargateclient.ts#L24-L31]
import { defaultRegistryTypes } from "@cosmjs/stargate"

export const checkersDefaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
    ...defaultRegistryTypes,
    ...checkersTypes,
]

function createDefaultRegistry(): Registry {
    return new Registry(checkersDefaultRegistryTypes)
}
```

With this preparation, along the lines of what you did for a readonly `StargateClient`, you create a `CheckersSigningStargateClient` that inherits from `SigningStargateClient`:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/src/checkers_signingstargateclient.ts#L33-L57]
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

Notice above, the use of `createDefaultRegistry` as the default registry, if none was passed via the options.

## The action methods

What is left is to add the methods that will let you interact with the blockchain. Taking inspiration from [`sendTokens`](https://github.com/cosmos/cosmjs/blob/13ce43c/packages/stargate/src/signingstargateclient.ts#L176-L192), you create one function for each of your messages:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/src/checkers_signingstargateclient.ts#L59-L118]
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

To do some live testing, you can reuse the `experiment.ts` file you created in the [previous section](./cosmjs-objects.md). It is a little bit more involved because you first need to provide a signer. You learned how to do this in the [CosmJs introduction section](TODO).

### Key preparation

Since you do your experimentation while starting the chain with `starport chain serve`, you can reuse the mnemonics Starport gives you with the function:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/experiment.ts#L11-L15]
const getSignerFromMnemonic = async (filePath: string): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic((await readFile(filePath)).toString(), {
        prefix: "cosmos",
    })
}
```

Start the chain with:

```sh
$ starport chain serve --reset-once
```

Save Alice's and Bob's mnemonics in their own `alice.key` and `bob.key` right next to `experiment.ts`. Make sure to:

* Not add any [extra character](https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/alice.key.sample) in the files.
* Add [`*.key` to `.gitignore`](https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/.gitignore#L5) so as not to commit these test files by mistake.

Create Alice and Bob's clients. Here is for Alice:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/experiment.ts#L41-L52]
const aliceSigner: OfflineDirectSigner = await getSignerFromMnemonic(`${__dirname}/alice.key`)
const alice: string = (await aliceSigner.getAccounts())[0].address
const aliceSigningClient: CheckersSigningStargateClient =
    await CheckersSigningStargateClient.connectWithSigner(starportEndpoint, aliceSigner, {
        gasPrice: GasPrice.fromString("1stake"),
    })
```

Notice the use of a default gas price so that you can use `"auto"` later on. You do not need to put a high price because you are on your local machine anyway.

### Create a game

Create a game with a small wager:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/experiment.ts#L55-L63]
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

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/experiment.ts#L17-L21]
const getGameId = (createResponse: DeliverTxResponse): string => {
    return JSON.parse(createResponse.rawLog!)[0].events[0].attributes.find(
        (eventInfo) => eventInfo.key == "Index",
    ).value
}
```

And use it:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/experiment.ts#L64]
const createdGameId = getGameId(createResponse)
```

### Play on the game

Before you have Bob play, it would be a good idea to see if his move is possible. This query does not need any signer, so to prove the point you use the read-only client:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/experiment.ts#L67-L73]
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

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/experiment.ts#L75-L82]
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

In particular, we learn that the checkers module's escrow address is `cosmos16xx0e...7srm3`.

### Reject the game

And to test that too, why not have Alice reject the game?

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/experiment.ts#L85-L90]
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

Which is good news, if expected.

## Conclusion

You can modify this test file, in particular choose not to reject the game, but instead to list it in the next test run, thanks to the [`getAllStoredGames` call](https://github.com/cosmos/b9-checkers-academy-draft/blob/7b6febc/client/test/live/experiment.ts#L32).

You have now included the elements and messages that allow you to interact with the Checkers blockchain. You have confirmed that with a small NodeJs experimentation file. The _only_ thing that remains now is to have a GUI in which to plug the elements you created. That is the object of the [next section](TODO).
