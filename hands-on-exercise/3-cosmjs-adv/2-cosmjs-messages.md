---
title: "Create Custom Messages"
order: 3
description: Introduce the message to create a game in your checkers blockchain
tags: 
  - guided-coding
  - cosmos-sdk
  - cosm-js
---

# Create Custom Messages

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [CosmJS](/tutorials/7-cosmjs/1-cosmjs-intro.md).
* You have generated the necessary TypeScript types in [the previous tutorial](./1-cosmjs-objects.md).
* You have the finished the checkers blockchain exercise. If not, you can follow that tutorial [here](/hands-on-exercise/1-ignite-cli/index.md) or just clone and checkout the [relevant branch](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-wager-denomination) that contains the final version.

</HighlightBox>

In the previous section, you created the objects that allow you to **query** your checkers blockchain. Now, you will create the elements that allow you to **send transactions** to it.

## Encodable messages

Previously you defined in Protobuf three messages and their respective responses. You had Protobuf [compile them](https://github.com/cosmos/academy-checkers-ui/blob/generated/src/types/generated/checkers/tx.ts). Now you will create a few instances of `EncodeObject`, similar to how this is done in CosmJS's [bank module](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/stargate/src/modules/bank/messages.ts). First, collect their names and Protobuf packages. Each Protobuf type identifier is assigned its encodable type:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/messages.ts#L11-L25]
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

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/messages.ts#L27-L47]
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

* [`MsgCreateGame`](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/messages.ts#L27-L36)
* [`MsgCreateGameResponse`](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/messages.ts#L38-L47)
* [`MsgPlayMove`](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/messages.ts#L49-L58)
* [`MsgPlayMoveResponse`](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/messages.ts#L60-L69)
* [`MsgRejectGame`](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/messages.ts#L71-L80)
* [`MsgRejectGameResponse`](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/messages.ts#L82-L91)

## A signing Stargate for Checkers

This process again takes inspiration from [`SigningStargateClient`](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/stargate/src/signingstargateclient.ts#L55-L69). Prepare by registering your new types in addition to the others, so that your client knows them all:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/checkers_signingstargateclient.ts#L24-L31]
import { defaultRegistryTypes } from "@cosmjs/stargate"

export const checkersDefaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
    ...defaultRegistryTypes,
    ...checkersTypes,
]

function createDefaultRegistry(): Registry {
    return new Registry(checkersDefaultRegistryTypes)
}
```

Similar to the read-only `CheckersStargateClient`, create a `CheckersSigningStargateClient` that inherits from `SigningStargateClient`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/checkers_signingstargateclient.ts#L33-L57]
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

Finally you ought to add the methods that allow you to interact with the blockchain. They also help advertise how to craft messages for your client. Taking inspiration from [`sendTokens`](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/stargate/src/signingstargateclient.ts#L180-L197), create one function for each of your messages:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/checkers_signingstargateclient.ts#L59-L117]
public async createGame(
    creator: string,
    black: string,
    red: string,
    denom: string,
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
            denom: denom,
            wager: wager,
        },
    }
    return this.signAndBroadcast(creator, [createMsg], fee, memo)
}

public async playMove(
    creator: string,
    gameIndex: string,
    from: Pos,
    to: Pos,
    fee: StdFee | "auto" | number,
    memo = "",
): Promise<DeliverTxResponse> {
    const playMoveMsg: MsgPlayMoveEncodeObject = {
        typeUrl: typeUrlMsgPlayMove,
        value: {
            creator: creator,
            gameIndex: gameIndex,
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
    gameIndex: string,
    fee: StdFee | "auto" | number,
    memo = "",
): Promise<DeliverTxResponse> {
    const rejectGameMsg: MsgRejectGameEncodeObject = {
        typeUrl: typeUrlMsgRejectGame,
        value: {
            creator: creator,
            gameIndex: gameIndex,
        },
    }
    return this.signAndBroadcast(creator, [rejectGameMsg], fee, memo)
}
```

## Integration tests

You can reuse the setup you prepared in the previous section. There is an added difficulty: because you send transactions, your tests need access to keys. How do you provide them in a testing context?

### Key preparation

You would not treat mainnet keys in this way, but here you save testing keys on disk. Update `.env` with the test mnemonics of your choice:

```txt [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/.env#L3-L6]
MNEMONIC_TEST_ALICE="theory arrow blue much illness carpet arena thought clay office path museum idea text foot bacon until tragic inform stairs pitch danger spatial slight"
ADDRESS_TEST_ALICE="cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql"
MNEMONIC_TEST_BOB="apple spoil melody venture speed like dawn cherry insane produce carry robust duck language next electric episode clinic acid sheriff video knee spoil multiply"
ADDRESS_TEST_BOB="cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22"
```

If you use different mnemonics and do not yet know the corresponding addresses, you can get them from the `before` action (below) when it fails. Also adjust `environment.d.ts` to inform the TypeScript compiler:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/environment.d.ts#L6-L9]
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ...
            MNEMONIC_TEST_ALICE: string
            ADDRESS_TEST_ALICE: string
            MNEMONIC_TEST_BOB: string
            ADDRESS_TEST_BOB: string
        }
    }
}
...
```

In a new separate file, define how you build a signer from the mnemonic:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/util/signer.ts#L1-L8]
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"

export const getSignerFromMnemonic = async (mnemonic: string): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: "cosmos",
    })
}
```

Create a new `stored-game-action.ts` integration test file, modeled on `stored-game.ts`, that starts by preparing the signers and confirms the match between mnemonics and first addresses:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L30-L38]
const { RPC_URL, ADDRESS_TEST_ALICE: alice, ADDRESS_TEST_BOB: bob } = process.env
let aliceSigner: OfflineDirectSigner, bobSigner: OfflineDirectSigner

before("create signers", async function () {
    aliceSigner = await getSignerFromMnemonic(process.env.MNEMONIC_TEST_ALICE)
    bobSigner = await getSignerFromMnemonic(process.env.MNEMONIC_TEST_BOB)
    expect((await aliceSigner.getAccounts())[0].address).to.equal(alice)
    expect((await bobSigner.getAccounts())[0].address).to.equal(bob)
})
```

These early test do not need any running chain, so go ahead and make sure they pass. Add a temporary empty `it` test and run:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/client -w /client node:18.7 npm test
```

</CodeGroupItem>

</CodeGroup>

With this confirmation, you can add another `before` that creates the signing clients:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L40-L52]
let aliceClient: CheckersSigningStargateClient,
    bobClient: CheckersSigningStargateClient,
    checkers: CheckersExtension["checkers"]

before("create signing clients", async function () {
    aliceClient = await CheckersSigningStargateClient.connectWithSigner(RPC_URL, aliceSigner, {
        gasPrice: GasPrice.fromString("0stake"),
    })
    bobClient = await CheckersSigningStargateClient.connectWithSigner(RPC_URL, bobSigner, {
        gasPrice: GasPrice.fromString("0stake"),
    })
    checkers = aliceClient.checkersQueryClient!.checkers
})
```

If the running chain allows it, and to make your life easier, you can set the gas price to `0`. If not, set it as low as possible.

### Token preparation

Just saving keys on disk does not magically make these keys hold tokens on your test blockchain. You need to fund them at their addresses using the funds of other addresses of your running chain. If you use Ignite, it has created a faucet end point for you at port `4500`. The page `http://localhost:4500` explains how to make the calls. Use that.

Add the faucet address in `.env`:

```txt [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/.env#L2]
FAUCET_URL="http://localhost:4500"
```

Also add the faucet address to `environment.d.ts`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/environment.d.ts#L5]
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            RPC_URL: string
            FAUCET_URL: string
            ...
        }
    }
}
...
```

In a new separate file, add two helper functions to easily call the faucet:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/util/faucet.ts#L4-L28]
export const httpRequest = async (url: string | URL, options: RequestOptions, postData: string) => {
    return new Promise((resolve, reject) => {
        let all = ""
        const req = http.request(url, options, (response: IncomingMessage) => {
            response.setEncoding("utf8")
            response.on("error", reject)
            response.on("end", () => resolve(all))
            response.on("data", (chunk) => (all = all + chunk))
        })
        req.write(postData)
        req.end()
    })
}

export const askFaucet = async (address: string, tokens: { [key: string]: number }) =>
    httpRequest(
        process.env.FAUCET_URL,
        {
            method: "POST",
        },
        JSON.stringify({
            address: address,
            coins: Object.entries(tokens).map(([key, value]) => value + key),
        }),
    )
```

You will find out with practice how many tokens your accounts need for the tests. Start with any value. Create another `before` that will credit Alice and Bob from the faucet and confirm that they are rich enough to continue:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L54-L79]
const aliceCredit = {
        stake: 100,
        token: 1,
    },
    bobCredit = {
        stake: 100,
        token: 1,
    }

before("credit test accounts", async function () {
    this.timeout(10_000)
    await askFaucet(alice, aliceCredit)
    await askFaucet(bob, bobCredit)
    expect(parseInt((await aliceClient.getBalance(alice, "stake")).amount, 10)).to.be.greaterThanOrEqual(
        aliceCredit.stake,
    )
    expect(parseInt((await aliceClient.getBalance(alice, "token")).amount, 10)).to.be.greaterThanOrEqual(
        aliceCredit.token,
    )
    expect(parseInt((await bobClient.getBalance(bob, "stake")).amount, 10)).to.be.greaterThanOrEqual(
        bobCredit.stake,
    )
    expect(parseInt((await bobClient.getBalance(bob, "token")).amount, 10)).to.be.greaterThanOrEqual(
        bobCredit.token,
    )
})
```

<HighlightBox type="note">

The extra 10 seconds given for this potentially slower process: `this.timeout(10_000)`. Your accounts are now ready to proceed with the tests proper.

</HighlightBox>

### Adding tests

Since these integration tests make calls to a running chain, they need to run one after the other. And if one `it` fails, all the `it` tests that come after will fail too. This is not ideal but is how these examples will work.

With a view to reusing them, add convenience methods that encapsulate the extraction of information from the events:

* To get the id of the game created:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/events.ts#L4-L10]
    export type GameCreatedEvent = Event

    export const getCreateGameEvent = (log: Log): GameCreatedEvent | undefined =>
        log.events!.find((event: Event) => event.type === "new-game-created")

    export const getCreatedGameId = (createdGameEvent: GameCreatedEvent): string =>
        createdGameEvent.attributes.find((attribute: Attribute) => attribute.key == "game-index")!.value
    ```

* To get the captured position and the winner if they exist:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/events.ts#L12-L33]
    export type MovePlayedEvent = Event

    export const getMovePlayedEvent = (log: Log): MovePlayedEvent | undefined =>
        log.events!.find((event: Event) => event.type === "move-played")

    export const getCapturedPos = (movePlayedEvent: MovePlayedEvent): Pos | undefined => {
        const x: number = parseInt(
            movePlayedEvent.attributes.find((attribute: Attribute) => attribute.key == "captured-x")!.value,
            10,
        )
        const y = parseInt(
            movePlayedEvent.attributes.find((attribute: Attribute) => attribute.key == "captured-y")!.value,
            10,
        )
        if (isNaN(x) || isNaN(y)) return undefined
        return { x, y }
    }

    export const getWinner = (movePlayedEvent: MovePlayedEvent): GamePiece | undefined =>
        movePlayedEvent.attributes.find((attribute: Attribute) => attribute.key == "winner")!.value as
            | GamePiece
            | undefined
    ```

    Here you also define `GamePiece` as:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/player.ts#L2]
    export type GamePiece = Player | "*"
    ```

### Create and Play

Start by creating a game, extracting its index from the logs, and confirming that you can fetch it.

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L81-L104]
let gameIndex: string

it("can create game with wager", async function () {
    this.timeout(5_000)
    const response: DeliverTxResponse = await aliceClient.createGame(
        alice,
        alice,
        bob,
        "token",
        Long.fromNumber(1),
        "auto",
    )
    const logs: Log[] = JSON.parse(response.rawLog!)
    expect(logs).to.be.length(1)
    gameIndex = getCreatedGameId(getCreateGameEvent(logs[0])!)
    const game: StoredGame = (await checkers.getStoredGame(gameIndex))!
    expect(game).to.include({
        index: gameIndex,
        black: alice,
        red: bob,
        denom: "token",
    })
    expect(game.wager.toNumber()).to.equal(1)
})
```

Next, add a test that confirms that the wager tokens are consumed on first play:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L106-L118]
it("can play first moves and pay wager", async function () {
    this.timeout(10_000)
    const aliceBalBefore = parseInt((await aliceClient.getBalance(alice, "token")).amount, 10)
    await aliceClient.playMove(alice, gameIndex, { x: 1, y: 2 }, { x: 2, y: 3 }, "auto")
    expect(parseInt((await aliceClient.getBalance(alice, "token")).amount, 10)).to.be.equal(
        aliceBalBefore - 1,
    )
    const bobBalBefore = parseInt((await aliceClient.getBalance(bob, "token")).amount, 10)
    await bobClient.playMove(bob, gameIndex, { x: 0, y: 5 }, { x: 1, y: 4 }, "auto")
    expect(parseInt((await aliceClient.getBalance(bob, "token")).amount, 10)).to.be.equal(
        bobBalBefore - 1,
    )
})
```

These first tests demonstrate the use of the `createGame` and `playMove` functions you created. These functions send a single message per transaction, and wait for the transaction to be included in a block before moving on.

In the next paragraphs you:

1. Will send many transactions in a single block.
2. Will send a transaction with more than one message in it.

The transaction with more than one message that you will send is where Alice, the black player, [captures two red pieces in two successive moves](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/player.ts#L39-L41). The checkers rules allow this.

The many transactions per block will be those that make the game reach that point.

Prepare the game moves of a complete game:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/player.ts#L8-L56]
export interface GameMove {
    player: Player
    from: Pos
    to: Pos
}

export const completeGame: GameMove[] = [
    { player: "b", from: { x: 1, y: 2 }, to: { x: 2, y: 3 } },
    { player: "r", from: { x: 0, y: 5 }, to: { x: 1, y: 4 } },
    { player: "b", from: { x: 2, y: 3 }, to: { x: 0, y: 5 } },
    { player: "r", from: { x: 4, y: 5 }, to: { x: 3, y: 4 } },
    { player: "b", from: { x: 3, y: 2 }, to: { x: 2, y: 3 } },
    { player: "r", from: { x: 3, y: 4 }, to: { x: 1, y: 2 } },
    { player: "b", from: { x: 0, y: 1 }, to: { x: 2, y: 3 } },
    { player: "r", from: { x: 2, y: 5 }, to: { x: 3, y: 4 } },
    { player: "b", from: { x: 2, y: 3 }, to: { x: 4, y: 5 } },
    { player: "r", from: { x: 5, y: 6 }, to: { x: 3, y: 4 } },
    { player: "b", from: { x: 5, y: 2 }, to: { x: 4, y: 3 } },
    { player: "r", from: { x: 3, y: 4 }, to: { x: 5, y: 2 } },
    { player: "b", from: { x: 6, y: 1 }, to: { x: 4, y: 3 } },
    { player: "r", from: { x: 6, y: 5 }, to: { x: 5, y: 4 } },
    { player: "b", from: { x: 4, y: 3 }, to: { x: 6, y: 5 } },
    { player: "r", from: { x: 7, y: 6 }, to: { x: 5, y: 4 } },
    { player: "b", from: { x: 7, y: 2 }, to: { x: 6, y: 3 } },
    { player: "r", from: { x: 5, y: 4 }, to: { x: 7, y: 2 } },
    { player: "b", from: { x: 4, y: 1 }, to: { x: 3, y: 2 } },
    { player: "r", from: { x: 3, y: 6 }, to: { x: 4, y: 5 } },
    { player: "b", from: { x: 5, y: 0 }, to: { x: 4, y: 1 } },
    { player: "r", from: { x: 2, y: 7 }, to: { x: 3, y: 6 } },
    { player: "b", from: { x: 0, y: 5 }, to: { x: 2, y: 7 } },
    { player: "r", from: { x: 4, y: 5 }, to: { x: 3, y: 4 } },
    { player: "b", from: { x: 2, y: 7 }, to: { x: 4, y: 5 } },
     // player captures again
    { player: "b", from: { x: 4, y: 5 }, to: { x: 2, y: 3 } },
    { player: "r", from: { x: 6, y: 7 }, to: { x: 5, y: 6 } },
    { player: "b", from: { x: 2, y: 3 }, to: { x: 3, y: 4 } },
    { player: "r", from: { x: 0, y: 7 }, to: { x: 1, y: 6 } },
    { player: "b", from: { x: 3, y: 2 }, to: { x: 4, y: 3 } },
    { player: "r", from: { x: 7, y: 2 }, to: { x: 6, y: 1 } },
    { player: "b", from: { x: 7, y: 0 }, to: { x: 5, y: 2 } },
    { player: "r", from: { x: 1, y: 6 }, to: { x: 2, y: 5 } },
    { player: "b", from: { x: 3, y: 4 }, to: { x: 1, y: 6 } },
    { player: "r", from: { x: 4, y: 7 }, to: { x: 3, y: 6 } },
    { player: "b", from: { x: 4, y: 3 }, to: { x: 3, y: 4 } },
    { player: "r", from: { x: 5, y: 6 }, to: { x: 4, y: 5 } },
    { player: "b", from: { x: 3, y: 4 }, to: { x: 5, y: 6 } },
    { player: "r", from: { x: 3, y: 6 }, to: { x: 2, y: 5 } },
    { player: "b", from: { x: 1, y: 6 }, to: { x: 3, y: 4 } },
]
```

<HighlightBox type="note">

Note how you already played the first two.

</HighlightBox>

### Multiple transactions in a block

You are going to send [22 transactions](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/player.ts#L17-L38) in as quick a succession as possible. If you waited for each to be included in a block, it would take you in the order of `22*5 == 110` seconds. That's very long for a test. It is better to find a way to include more transactions per block.

You will face several difficulties when you want to send multiple transactions in a single block. The **first difficulty** is as follows:

1. Each transaction signed by an account must mention the correct `sequence` of that account at the time of inclusion in the block. This is to make sure transactions are added in the right order and to prevent transaction replay.
2. After each transaction, this `sequence` number increments, ready to be used for the next transaction of the account.
3. The signing client's [`signAndbroadcast`](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/stargate/src/signingstargateclient.ts#L280) function [fetches the `sequence`](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/stargate/src/signingstargateclient.ts#L318-L325) number from the blockchain.

In other words, the signing client can only know about the transactions that have been included in a block. It has no idea whether there are already pending transactions with a higher `sequence` that would result in the account's `sequence` being higher when your poorly crafted transaction is checked, therefore causing it to be rejected.

Fortunately, the [`sign`](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/stargate/src/signingstargateclient.ts#L310) function can take [any sequence number](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/stargate/src/signingstargateclient.ts#L315). You will therefore force the sequence number to the one you know to be right eventually:

1. It will start at the number as fetched from the blockchain.
2. Whenever you sign a new transaction you will increment this sequence number and keep track of it in your own variable.

Because JavaScript has low assurances when it comes to threading, you need to make sure that each `sign` command happens after the previous one, or your `sequence` incrementing may get messed up. For that, you should not use `Promise.all`, or something like `array.forEach(() => { await })`, which fire all promises roughly at the same time. Instead you will use a `while() { await }` pattern.

There is a **second difficulty** when you want to send that many signed transactions. The client's `broadcastTx` function [waits for it](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/stargate/src/stargateclient.ts#L420-L424) to be included in a block, which would defeat the purpose of signing separately. Fortunately, if you look into its content, you can see that it calls [`this.forceGetTmClient().broadcastTxSync`](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/stargate/src/stargateclient.ts#L410). This Tendermint client function returns only [the hash](https://github.com/cosmos/cosmjs/blob/v0.28.11/packages/tendermint-rpc/src/tendermint34/tendermint34client.ts#L172), that is _before any inclusion in a block_.

On the other hand, you want the last transaction to be included in the block so that when you query for the stored game you get the expected values. Therefore you will:

1. Send the first 21 signed transactions with the _fast_ `this.forceGetTmClient().broadcastTxSync`.
2. Send the last transaction with a _slow_ client `broadcastTx`.

Here again, you need to make sure that you submit all transactions in sequential manner, otherwise a player may in effect try to play before their turn. At this point, you trust that Tendermint includes the transactions in the order in which they were submitted. If Tendermint does any shuffling between Alice and Bob, you may end up with a "play before their turn" error.

With luck, all transactions may end up in a single block, which would make the test 22 times faster than if you had waited for each transaction to get into its own block.

<HighlightBox type="learning">

You would use the same techniques if you wanted to stress test your blockchain. This is why these paragraphs are more than just entertainment.

</HighlightBox>

Add a way to track the sequences of Alice and Bob:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L120-L130]
interface ShortAccountInfo {
    accountNumber: number
    sequence: number
}
const getShortAccountInfo = async (who: string): Promise<ShortAccountInfo> => {
    const accountInfo: Account = (await aliceClient.getAccount(who))!
    return {
        accountNumber: accountInfo.accountNumber,
        sequence: accountInfo.sequence,
    }
}
```

Add helpers to pick the right Alice or Bob values:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L131-L132]
const whoseClient = (who: Player) => (who == "b" ? aliceClient : bobClient)
const whoseAddress = (who: Player) => (who == "b" ? alice : bob)
```

Add a function to your client to give you access to Tendermint's `broadcastTxSync`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/checkers_stargateclient.ts#L23-L25]
public async tmBroadcastTxSync(tx: Uint8Array): Promise<BroadcastTxSyncResponse> {
    return this.forceGetTmClient().broadcastTxSync({ tx })
}
```

Create your `it` test with the necessary initializations:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L134-L141]
it("can continue the game up to before the double capture", async function () {
    this.timeout(10_000)
    const client: CheckersStargateClient = await CheckersStargateClient.connect(RPC_URL)
    const chainId: string = await client.getChainId()
    const accountInfo = {
        b: await getShortAccountInfo(alice),
        r: await getShortAccountInfo(bob),
    }
    // TODO
}
```

Now get all 22 signed transactions, from index 2 to index 23:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L142-L175]
const txList: TxRaw[] = []
let txIndex: number = 2
while (txIndex < 24) {
    const gameMove: GameMove = completeGame[txIndex]
    txList.push(
        await whoseClient(gameMove.player).sign(
            whoseAddress(gameMove.player),
            [
                {
                    typeUrl: typeUrlMsgPlayMove,
                    value: {
                        creator: whoseAddress(gameMove.player),
                        gameIndex: gameIndex,
                        fromX: gameMove.from.x,
                        fromY: gameMove.from.y,
                        toX: gameMove.to.x,
                        toY: gameMove.to.y,
                    },
                },
            ],
            {
                amount: [{ denom: "stake", amount: "0" }],
                gas: "500000",
            },
            `playing move ${txIndex}`,
            {
                accountNumber: accountInfo[gameMove.player].accountNumber,
                sequence: accountInfo[gameMove.player].sequence++,
                chainId: chainId,
            },
        ),
    )
    txIndex++
}
```

<HighlightBox type="note">

Note how:

1. The moves [`0` and `1`](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/player.ts#L15-L16) already took place in the previous `it` test.
2. The gas fee can no longer be `"auto"` and has to be set, here at a price of `0`. You may have to adjust this depending on your running chain.
3. The sequence number of the signer is increased **after** it has been used: `.sequence++`.

</HighlightBox>

With all the transactions signed, you can _fire_ broadcast the first 21 of them:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L177-L183]
const hashes: BroadcastTxSyncResponse[] = []
txIndex = 0
while (txIndex < txList.length - 1) {
    const txRaw: TxRaw = txList[txIndex]
    hashes.push(await client.tmBroadcastTxSync(TxRaw.encode(txRaw).finish()))
    txIndex++
}
```

You now _normally_ broadcast the last one:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L185-L187]
const lastDeliver: DeliverTxResponse = await client.broadcastTx(
    TxRaw.encode(txList[txList.length - 1]).finish(),
)
```

If you are interested, you can log the blocks in which the transactions were included:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L189-L195]
console.log(
    txList.length,
    "transactions included in blocks from",
    (await client.getTx(toHex(hashes[0].hash)))!.height,
    "to",
    lastDeliver.height,
)
```

Lastly, make sure that the game has the expected board:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L197-L198]
const game: StoredGame = (await checkers.getStoredGame(gameIndex))!
expect(game.board).to.equal("*b*b***b|**b*b***|***b***r|********|***r****|********|***r****|r*B*r*r*")
```

You have now brought the game up to the point just before the black player can capture two pieces in two moves.

### Combine messages

Alice, the black player can capture [two pieces in one turn](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/src/types/checkers/player.ts#L39-L41). The checkers rules allow that.

You are now ready to send that one transaction with the two messages with the use of `signAndBroadcast`. Add an `it` test with the right initializations:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L202-L204]
it("can send a double capture move", async function () {
    this.timeout(5_000)
    const firstCaptureMove: GameMove = completeGame[24]
    const secondCaptureMove: GameMove = completeGame[25]
    // TODO
}
```

In it, make the call with the correctly crafted messages.

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L205-L232]
const response: DeliverTxResponse = await aliceClient.signAndBroadcast(
    alice,
    [
        {
            typeUrl: typeUrlMsgPlayMove,
            value: {
                creator: alice,
                gameIndex: gameIndex,
                fromX: firstCaptureMove.from.x,
                fromY: firstCaptureMove.from.y,
                toX: firstCaptureMove.to.x,
                toY: firstCaptureMove.to.y,
            },
        },
        {
            typeUrl: typeUrlMsgPlayMove,
            value: {
                creator: alice,
                gameIndex: gameIndex,
                fromX: secondCaptureMove.from.x,
                fromY: secondCaptureMove.from.y,
                toX: secondCaptureMove.to.x,
                toY: secondCaptureMove.to.y,
            },
        },
    ],
    "auto",
)
```

Next, collect the events and confirm they match your expectations:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L233-L242]
const logs: Log[] = JSON.parse(response.rawLog!)
expect(logs).to.be.length(2)
expect(getCapturedPos(getMovePlayedEvent(logs[0])!)).to.deep.equal({
    x: 3,
    y: 6,
})
expect(getCapturedPos(getMovePlayedEvent(logs[1])!)).to.deep.equal({
    x: 3,
    y: 4,
})
```

<HighlightBox type="note">

Note how it checks the logs for the captured attributes. In effect, a captured piece has `x` and `y` as the average of the respective `from` and `to` positions' fields.

</HighlightBox>

Sending a single transaction with two moves is cheaper and faster, from the point of view of the player, than sending two separate ones for the same effect.

<HighlightBox type="note">

It is not possible for Alice, who is the creator and black player, to send in a single transaction a message for creation and a message to make the first move on it. That's because the index of the game is not known before the transaction has been included in a block, and with that the index computed.

</HighlightBox>

### Further tests

You can add further tests, for instance:

1. To see what happens when you continue playing the game [up to its completion](https://github.com/cosmos/academy-checkers-ui/blob/signing-stargate/test/integration/stored-game-action.ts#L245-L312).
2. To reject a game.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to create the elements necessary for you to begin sending transactions to your checkers blockchain, including encodable messages, a signing client, and action methods that permit interaction with the blockchain.
* How to test your signing client, including key preparation (with either a mnemonic or a private key) and client preparation, followed by functions such as creating a game, rejecting a game, or playing a move.

</HighlightBox>

<!--## Next up

You have now included elements and messages that allow you to interact with the checkers blockchain. You confirmed this with some integration tests. The only things that remain to do are adding any [server-side scripts](./5-server-side.md) and plugging the elements you have created into [a graphical user interface](./3-external-gui.md).

Head to the [next chapter](./3-external-gui.md) on CosmJS to work on the GUI and backend script for your checkers blockchain.-->
