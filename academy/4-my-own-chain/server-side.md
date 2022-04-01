---
title: Web 2.0 Server - Convenient information
order: 20
description: Introducing a Web2.0 server to track games per player
tag: deep-dive
---

# Web 2.0 Server - Convenient information

Your blockchain is complete and yet, there are extra data and services that would be welcome. These services can be about convenience, and ideally, they should not add more cost to the blockchain if the information can be verified in the blockchain.

An example of this is how do you list a given player's games. All of their games. As the chain has been developed, this information is not readily available. You can find the players of a given game, but not the games of a given player. You could choose to do this indexing on-chain, but it adds storage and computation costs.

## Server idea

Instead, you can choose to have a Web 2.0 server do that indexing for you. In broad terms, this is what this server would do:

1. Listen to updates from the Checkers chain:
    1. On a game creation event, it would add the game id under each player.
    2. On a game deletion event, it would remove it. This happens either because of a rejection, or in an end-block.
2. When asked about its status, it would return the latest block height up to which it has indexed players.
3. When asked about a given player, it would return the list of game ids of this player.
4. To palliate potential de-synchronization, it could be submitted a game id, and it would patch its information about it.

## Barebones server

Prepare your setup in a sub-directory of your Checkers folder, say `server2`. For convenience, create it side by side with the `vue` folder created by Starport. To make it quick and easy and to avoid getting overburdened with Web 2.0 server concepts, you:

1. Use the `express` Node.js module to create an HTTP REST API.
2. Use a local `db.json` as a _database_. In a production setting, you would use a proper database.
3. Poll the blockchain at regular intervals. As part of an advanced topic, you can use Web sockets.

```sh
$ cd server2
$ npm init --yes
$ npm install ts-node express @types/express
```

To keep the code type-safe, you can define the types of your `db.json` in `types.ts`:

```typescript
export interface LatestBlockStatus {
    height: number
}

export interface DbStatus {
    block: LatestBlockStatus
}

export interface PlayerInfo {
    gameIds: string[]
}

export interface PlayersInfo {
    [playerAddress: string]: PlayerInfo
}

export interface GameInfo {
    redAddress: string
    blackAddress: string
}

export interface GamesInfo {
    [gameId: string]: GameInfo
}

export interface DbType {
    status: DbStatus
    players: PlayersInfo
    games: GamesInfo
}
```

Notice that not only do you keep information about players, but you also keep a copy of games. This is to palliate a current limitation of CosmJs, whereby you cannot get information about a game that has just been erased from the state. In practice, you would need to query about this game at a sufficiently earlier block height, but this is not available yet. 

<HightlightBox type="info">
As a design hueristic to keep in mind, when "deleted" records are materially important, consider using a soft delete that removes them from the set of active records but doesn't terminate their existence. This principle helps ensure that historically important information is readily available at all times, at the latest block height.
</HighlightBox>

Such a barebones server without any Cosmos elements would be defined in an `indexer.ts`.

<ExpansionPanel title="indexer.ts initial content">

```typescript
import { writeFile } from "fs/promises"
import { Server } from "http"
import express, { Express, Request, Response } from "express"
import { DbType } from "./types"

export const createIndexer = async () => {
    const port = "3001"
    const dbFile = "./db.json"
    const db: DbType = require(dbFile)
    const pollIntervalMs = 5_000 // 5 seconds
    let timer: NodeJS.Timer | undefined

    const app: Express = express()
    app.get("/", (req: Request, res: Response) => {
        res.send({
            error: "Nothing here",
        })
    })

    app.get("/status", (req: Request, res: Response) => {
        res.json({
            block: {
                height: db.status.block.height,
            },
        })
    })

    app.get("/players/:playerAddress", (req: Request, res: Response) => {
        res.json({
            gameCount:
                db.players[req.params.playerAddress]?.gameIds?.length ?? 0,
                gameIds: db.players[req.params.playerAddress]?.gameIds ?? [],
        })
    })

    app.get(
        "/players/:playerAddress/gameIds", (req: Request, res: Response) => {
            res.json(db.players[req.params.playerAddress]?.gameIds ?? [])
        }
    )

    app.patch("/games/:gameId", (req: Request, res: Response) => {
        res.json({
            result: "thank you",
        })
    })

    const saveDb = async () => {
        await writeFile(dbFile, JSON.stringify(db, null, 4))
    }

    const init = async () => {
        setTimeout(poll, 1)
    }

    const poll = async () => {
        console.log(new Date(Date.now()).toISOString(), "TODO poll")
        timer = setTimeout(poll, pollIntervalMs)
    }

    process.on("SIGINT", () => {
        if (timer) clearTimeout(timer)
        saveDb()
            .then(() => {
                console.log(`${dbFile} saved`)
            })
            .catch(console.error)
            .finally(() => {
                server.close(() => {
                    console.log("server closed")
                    process.exit(0)
                })
            })
    })

    const server: Server = app.listen(port, () => {
        init()
            .catch(console.error)
            .then(() => {
                console.log(`\nserver started at http://localhost:${port}`)
            })
    })
}
```

</ExpansionPanel>

Notice how:

1. The timer is set at the end of the previous poll, just in case the indexing takes longer than the interval.
2. The _database_ is purely in memory as it runs and is saved on exit by catching the interruption signal.

Create an `index.ts` that describe how to run it:

```typescript
require("./indexer").createIndexer().then(console.log).catch(console.error)

```

And in `package.json`, add a `run` target:

```json
"scripts": {
    ...
    "dev": "npx ts-node index.ts"
}
```

Not to forget the _database_, `db.json`:

```json
{
    "status": {
        "block": {
            "height": -1
        }
    },
    "players": {},
    "games": {}
}
```

Make sure it works:

```sh
$ npm run dev
```

It should print:

```
> checkers-server@1.0.0 dev
> npx ts-node index.ts

server started at http://localhost:3001
```

Now you can test the endpoints. Omit the `| jq` beautifier if it is not installed on your system:

<CodeGroup>
<CodeGroupItem title="status" active>

```sh
$ curl localhost:3001/status | jq
```

It should return:

```json
{
  "block": {
    "height": -1
  }
}
```

</CodeGroupItem>
<CodeGroupItem title="player info">

```sh
$ curl localhost:3001/players/cosmos123 | jq
```

It should return:

```json
{
  "gameCount": 0,
  "gameIds": []
}
```

</CodeGroupItem>
<CodeGroupItem title="player games">

```sh
$ curl localhost:3001/players/cosmos123/gameIds | jq
```

It should return:

```json
[]
```

</CodeGroupItem>
<CodeGroupItem title="game update">

```sh
$ curl -X PATCH localhost:3001/games/445 | jq
```

It should return:

```json
{
  "result": "thank you"
}
```

</CodeGroupItem>
</CodeGroup>

---

## Add CosmJs `StargateClient`

In order to connect to your Checkers blockchain, you need to create a client. Yhe client only needs read-only functionality because this server does not intend to submit transactions. Also, add the CosmJs types, which will assist you with blocks, transactions and events:

```sh
$ npm install @cosmjs/stargate cosmjs-types
```

To keep it simple, you are going to connect to the RPC endpoint opened when you run `starport chain serve` on your local machine: `http://localhost:26657`.

Add to `indexer.ts`:

1. The declarations:

    ```typescript
    import { StargateClient } from "@cosmjs/stargate"

    const rpcPoint = "http://localhost:26657"
    let client: StargateClient
    ```
2. The modified `init`:

    ```typescript
    const init = async() => {
        client = await StargateClient.connect(rpcPoint)
        console.log("Connected to chain-id:", await client.getChainId())
        setTimeout(poll, 1)
    }
    ```
3. The modified `poll`:

    ```typescript
    const poll = async() => {
        const currentHeight = await client.getHeight()
        console.log(new Date(Date.now()).toISOString(), "Current heights:", db.status.block.height, "<=", currentHeight)
        timer = setTimeout(poll, pollIntervalMs)
    }
    ```

Relaunch `npm run dev`. You should see the current height going up.

## Handle blocks

To begin your journey of indexing games, you are going to take each block and listen to the relevant events. Here, relevant events are found in 3 locations:

1. A transaction with a `NewGameCreated` event.
2. A transaction with a `GameRejected` event.
3. An `EndBlock` with a `GameForfeited` event.

First, start by getting each block from your last saved state. Update `poll`:

```typescript
const poll = async () => {
    const currentHeight = await client.getHeight()
    if (db.status.block.height <= currentHeight - 100)
        console.log(
            `Catching up ${db.status.block.height}..${currentHeight}`
        )
    while (db.status.block.height < currentHeight) {
        const processing = db.status.block.height + 1
        process.stdout.cursorTo(0)
        // Get the block
        const block: Block = await client.getBlock(processing)
        process.stdout.write(
            `Handling block: ${processing} with ${block.txs.length} txs`
        )
        // Function yet to be declared
        await handleBlock(block)
        db.status.block.height = processing
    }
    await saveDb()
    timer = setTimeout(poll, pollIntervalMs)
}
```

This needs a new import:

```typescript
import { Block } from "@cosmjs/stargate"
```

As you can see:

* It declares a new function `handleBlock`. You can create it and put `console.log(block)` in it to get an idea of what this object is.
* It saves the `db` after a poll, mainly so that _you_ can watch it in real time.
* It uses `process.stdout.write` and `process.stdout.cursorTo(0)` so that the repetitive logging all happens on a single line.

Now, observe the relevant content in `handleBlock`. It has to:

1. Extract the events from transactions. Start with this bit.
2. Extract the events from `EndBlock`. Put this bit off till a bit later.

If you look directly into `block.txs` you will find transactions as they were posted. That is not good enough as it does not tell you any execution result. In particular, it does not tell you whether the transaction actually executed or what game id it used on the new game. To get the extra information:

1. You need to call `await client.getTx(txHash)`, which returns an `IndexedTx`.
2. But first you need to calculate `txHash` from the transaction you got.

So the `handleBlock` function can be:

```typescript
const handleBlock = async (block: Block) => {
    if (0 < block.txs.length) console.log("")
    let txIndex = 0
    while (txIndex < block.txs.length) {
        const txHash: string = toHex(
            sha256(block.txs[txIndex])
        ).toUpperCase()
        const indexed: IndexedTx | null = await client.getTx(txHash)
        if (!indexed) throw `Could not find indexed tx: ${txHash}`
        // Function yet to be declared
        await handleTx(indexed)
        txIndex++
    }
    // TODO handle EndBlock
}
```

This needs new imports:

```typescript
import { Block, IndexedTx } from "@cosmjs/stargate"
import { sha256 } from "@cosmjs/crypto"
import { toHex } from "@cosmjs/encoding"
```

Notice that:

* `while() {}` is there to simplify the syntax of `await`ing multiple times.
* The hash is calculated this way as per [here](https://github.com/cosmos/cosmjs/blob/902f21b/packages%2Fstargate%2Fsrc%2Fstargateclient.ts#L74).
* `console.log("")` is there to put a new line as `poll` does a `process.stdout.write` which adds no line.
* It does not yet handle the `EndBlock` part. More on that later.
* It uses a new function `handleTx`. You can create it and put `console.log(indexed)` in it to get an idea of what this object is.

## Handle a transaction

Define this `handleTx` function:

```typescript
const handleTx = async (indexed: IndexedTx) => {
    const events: StringEvent[] = JSON.parse(indexed.rawLog).flatMap(
        (log: ABCIMessageLog) => log.events
    )
    // Function yet to be declared
    await handleEvents(events)
}
```

Which needs new imports:

```typescript
import { ABCIMessageLog, StringEvent } from "cosmjs-types/cosmos/base/abci/v1beta1/abci"
```

Notice how:

* [`.flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) transforms an array of arrays into a flattened array.
* It uses a new function `handleEvents`. You can create it and put `console.log(events)` in it to get an idea of what this object is.

## Handle events

Drilling down into details, now it's time to define `handleEvents`:

```typescript
const handleEvents = async (events: StringEvent[]): Promise<void> => {
    try {
        const myEvents: StringEvent[] = events
            .filter((event: StringEvent) => event.type == "message")
            .filter((event: StringEvent) =>
                event.attributes.some(
                    (attribute: Attribute) =>
                        attribute.key == "module" &&
                        attribute.value == "checkers"
                )
            )
        let eventIndex = 0
        while (eventIndex < myEvents.length) {
            // Function yet to be declared
            await handleEvent(myEvents[eventIndex])
            eventIndex++
        }
    } catch (e) {
        // Skipping if the handling failed. Most likely the transaction failed.
    }
}
```

This needs a new import:

```typescript
import { ABCIMessageLog, Attribute, StringEvent } from "cosmjs-types/cosmos/base/abci/v1beta1/abci"
```

Notice how:

* It only keeps events that have a `message` type.
* It only keeps events that emanate from the `checkers` module.
* `while() {}` is there to simplify the syntax of `await`ing multiple times.
* It uses a new function `handleEvent`. You can create it and put `console.log(event)` in it to get an idea of what this object is.

## Handle one event

This rabbit hole goes deeper. You can define `handleEvent`:

```typescript
const handleEvent = async (event: StringEvent): Promise<void> => {
    const isActionOf = (actionValue: string): boolean =>
        event.attributes.some(
            (attribute: Attribute) =>
                attribute.key === "action" && attribute.value == actionValue
        )
    if (isActionOf("NewGameCreated")) {
        // Function yet to be declared
        await handleEventCreate(event)
    }
    if (isActionOf("GameRejected")) {
        // Function yet to be declared
        await handleEventReject(event)
    }
}
```

Notice how:

* You recognize `NewGameCreated` and `GameRejected` as constant values defined in your Go code. They were associated with t a `key` of `"action"`.
* It looks you will add `GameForfeited` at some point.
* Because events are arrays of key/value pairs, you need to go through them to find what you want. Unless you decide to proactively index your events as part of a later optimization.
* It uses two new functions `handleEventCreate` and `handleEventReject`. You can create them and put `console.log(event)` in them to explore what these objects are.

## Handle one create event

This is where you finally update your `db` with the information provided. But first, define a convenience function in `createIndexer`:

```typescript
const getAttributeValueByKey = (attributes: Attribute[], key: string): string | undefined => {
    return attributes.find((attribute: Attribute) => attribute.key == key)?.value
}
```

Now define `handleEventCreate` as:

```typescript
const handleEventCreate = async (event: StringEvent): Promise<void> => {
    const newId: string | undefined = getAttributeValueByKey(event.attributes, "Index")
    if (!newId) throw `Create event missing newId`
    const blackAddress: string | undefined = getAttributeValueByKey(event.attributes, "Black")
    if (!blackAddress) throw `Create event missing blackAddress`
    const redAddress: string | undefined = getAttributeValueByKey(event.attributes, "Red")
    if (!redAddress) throw `Create event missing redAddress`
    console.log(`New game: ${newId}, black: ${blackAddress}, red: ${redAddress}`)
    const blackInfo: PlayerInfo = db.players[blackAddress] ?? {
        gameIds: [],
    }
    const redInfo: PlayerInfo = db.players[redAddress] ?? {
        gameIds: [],
    }
    if (blackInfo.gameIds.indexOf(newId) < 0) blackInfo.gameIds.push(newId)
    if (redInfo.gameIds.indexOf(newId) < 0) redInfo.gameIds.push(newId)
    db.players[blackAddress] = blackInfo
    db.players[redAddress] = redInfo
    db.games[newId] = {
        redAddress: redAddress,
        blackAddress: blackAddress,
    }
}
```

Notice how:

* You recognize the `Index`, `Black` and `Red` constants.
* There is heavy error handling.
* It is careful not to double-add a given game id.
* It does not save `db` as this is under the purview of `poll()`.

## Handle one reject event

This is the counterpart of `handleEventCreate` as you now remove from the system.

```typescript
const handleEventReject = async (event: StringEvent): Promise<void> => {
    const rejectedId: string | undefined = getAttributeValueByKey(event.attributes, "IdValue")
    if (!rejectedId) throw `Reject event missing rejectedId`
    const blackAddress: string | undefined = db.games[rejectedId]?.blackAddress
    const redAddress: string | undefined = db.games[rejectedId]?.redAddress
    const blackGames: string[] = db.players[blackAddress]?.gameIds ?? []
    const redGames: string[] = db.players[redAddress]?.gameIds ?? []
    console.log(`Reject game: ${rejectedId}, black: ${blackAddress}, red: ${redAddress}`)
    const indexInBlack: number = blackGames.indexOf(rejectedId)
    if (0 <= indexInBlack) blackGames.splice(indexInBlack, 1)
    const indexInRed: number = redGames.indexOf(rejectedId)
    if (0 <= indexInRed) redGames.splice(indexInRed, 1)
}
```

Notice how:

* Here too there is some error handling.
* It keeps the game information in the `db`. This is a debatable choice.

## Test time

You can now test what happens when a game is created and rejected. Run:

* In terminal 1: `starport chain serve`.
* In terminal 2: `npm run dev`.

And in a terminal 3:

<CodeGroup>
<CodeGroupItem title="Create game">

```sh
$ checkersd tx checkers create-game $alice $bob 1 token --from $alice
```

It should update `db.json` to:

```json
{
    "status": {
        "block": {
            "height": 100
        }
    },
    "players": {
        "cosmos1ac6srz8wh848zc08wrfghyghuf5cf3tvd45pnw": {
            "gameIds": [
                "0"
            ]
        },
        "cosmos1t88fkwurlnusf6agvptsnm33t40kr4hlq6h08s": {
            "gameIds": [
                "0"
            ]
        }
    },
    "games": {
        "0": {
            "redAddress": "cosmos1t88fkwurlnusf6agvptsnm33t40kr4hlq6h08s",
            "blackAddress": "cosmos1ac6srz8wh848zc08wrfghyghuf5cf3tvd45pnw"
        }
    }
}
```

</CodeGroupItem>
<CodeGroupItem title="Reject game">


```sh
$ checkersd tx checkers reject-game 0 --from $bob -y
```

It should update `db.json` to:

```json
{
    "status": {
        "block": {
            "height": 100
        }
    },
    "players": {
        "cosmos1ac6srz8wh848zc08wrfghyghuf5cf3tvd45pnw": {
            "gameIds": []
        },
        "cosmos1t88fkwurlnusf6agvptsnm33t40kr4hlq6h08s": {
            "gameIds": []
        }
    },
    "games": {
        "0": {
            "redAddress": "cosmos1t88fkwurlnusf6agvptsnm33t40kr4hlq6h08s",
            "blackAddress": "cosmos1ac6srz8wh848zc08wrfghyghuf5cf3tvd45pnw"
        }
    }
}
```

</CodeGroupItem>
</CodeGroup>

---

What remains is handling the games that get removed or forfeited in `EndBlock`.

## Prepare for `EndBlock`

Nicely formatted `EndBlock` events are still missing from CosmJs, so you need to do a little extra work:

1. To get a block's `EndBlock` events, you need to ask for the block information from a Tendermint client. This client is a [`private` field](https://github.com/cosmos/cosmjs/blob/902f21b/packages%2Fstargate%2Fsrc%2Fstargateclient.ts#L140) of `StargateClient`.
2. The function to call is [`blockResults`](https://github.com/cosmos/cosmjs/blob/5ee3f82/packages/tendermint-rpc/src/tendermint34/tendermint34client.ts#L88).
3. It returns a [`BlockResultsResponse`](https://github.com/cosmos/cosmjs/blob/ca969f2/packages/tendermint-rpc/src/tendermint34/responses.ts#L55), of which `endBlockEvents: Event` is of interest.
4. This [`Event`](https://github.com/cosmos/cosmjs/blob/ca969f2/packages/tendermint-rpc/src/tendermint34/responses.ts#L182) type has `attributes: Attribute[]` of interest.
5. The [`Attribute`](https://github.com/cosmos/cosmjs/blob/ca969f2/packages/tendermint-rpc/src/tendermint34/responses.ts#L177-L180) type is coded as `Uint8Array`.

So, you can encapsulate what needs to be done in a new `MyStargateClient`. Create `mystargateclient.ts` with:

```typescript
import { fromUtf8 } from "@cosmjs/encoding"
import { Attribute as TendermintAttribute, BlockResultsResponse, Event, Tendermint34Client } from "@cosmjs/tendermint-rpc"
import { StargateClient } from "@cosmjs/stargate"
import { Attribute, StringEvent } from "cosmjs-types/cosmos/base/abci/v1beta1/abci"

export class MyStargateClient extends StargateClient {
    private readonly myTmClient: Tendermint34Client

    public static async connect(endpoint: string): Promise<MyStargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint)
        return new MyStargateClient(tmClient)
    }

    protected constructor(tmClient: Tendermint34Client) {
        super(tmClient)
        this.myTmClient = tmClient
    }

    protected convertTendermintEvents(events: readonly Event[]): StringEvent[] {
        return events.map(
            (event: Event): StringEvent => ({
                type: event.type,
                attributes: event.attributes.map((attribute: TendermintAttribute): Attribute => ({
                        key: fromUtf8(attribute.key),
                        value: fromUtf8(attribute.value),
                    })
                ),
            })
        )
    }

    public async getEndBlockEvents(height: number): Promise<StringEvent[]> {
        const results: BlockResultsResponse = await this.myTmClient.blockResults(height)
        return this.convertTendermintEvents(results.endBlockEvents)
    }
}
```

And swap out `StargateClient` with `MyStargateClient`:

```typescript
import { MyStargateClient } from "./mystargateclient"

export const createIndexer = async () => {
    ...
    let client: MyStargateClient

    ...
    const init = async () => {
        client = await MyStargateClient.connect(rpcPoint)
        ...
    }
}
```

With this in place, you can go back to `handleBlock` and work on the TODO.

## Handle one block's `EndBlock`

Go to the function and update it:

```typescript
const handleBlock = async (block: Block) => {
    ...
    const events: StringEvent[] = await client.getEndBlockEvents(
        block.header.height
    )
    if (0 < events.length) console.log("")
    await handleEvents(events)
}
```

Quite conveniently, the events that you have converted are compatible with those emanating from transactions so you can just pass them on. Of course, you need to update `handleEvent` so that it acts on the new event type, as foreshadowed here:

```typescript
const handleEvent = async (event: StringEvent): Promise<void> => {
    ...
    if (isActionOf("GameForfeited")) {
        await handleEventForfeit(event)
    }
}
```

So, quite naturally, you add a new function:

```typescript
const handleEventForfeit = async (event: StringEvent): Promise<void> => {
    const forfeitedId: string | undefined = getAttributeValueByKey(event.attributes, "IdValue")
    if (!forfeitedId) throw `Forfeit event missing forfeitedId`
    const winner: string | undefined = getAttributeValueByKey(event.attributes, "Winner")
    const blackAddress: string | undefined = db.games[forfeitedId]?.blackAddress
    const redAddress: string | undefined = db.games[forfeitedId]?.redAddress
    const blackGames: string[] = db.players[blackAddress]?.gameIds ?? []
    const redGames: string[] = db.players[redAddress]?.gameIds ?? []
    console.log(`Forfeit game: ${forfeitedId}, black: ${blackAddress}, red: ${redAddress}, winner: ${winner}`)
    const indexInBlack: number = blackGames.indexOf(forfeitedId)
    if (0 <= indexInBlack) blackGames.splice(indexInBlack, 1)
    const indexInRed: number = redGames.indexOf(forfeitedId)
    if (0 <= indexInRed) redGames.splice(indexInRed, 1)
    if (winner == "NO_PLAYER") {
        delete db.games[forfeitedId]
    }
}
```

Notice how:

* Again there is a lot of error handling.
* It deletes the game only if there are no winners, which means that it was a deletion, not a forfeit.

## Test time

Run the tests again as described earlier. Create a game, wait and see how the deletion event is picked up.

For the avoidance of doubt, You can find the code [here](https://github.com/cosmos/b9-checkers-academy-draft/tree/server-indexing).
