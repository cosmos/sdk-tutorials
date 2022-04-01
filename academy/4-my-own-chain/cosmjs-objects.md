---
title: CosmJs - Create the objects for your GUI
order: 19
description: Create the objects that your GUI will use
tag: deep-dive
---

# CosmJs - Create the objects for your GUI

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [Protobuf](../2-main-concepts/protobuf.md), and [CosmJs](TODO).
* Have Go installed.
* The checkers blockchain codebase up to the wager denomination. You can get there by following the [previous steps](./wager-denom.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/wager-denomination).

</HighlightBox>

With your Checkers application ready for use, it is a good time to prepare its client elements that will eventually allow you to create a GUI and/or server-side scripts. Here, you are going to apply [what you learned](TODO) about creating your own custom CosmJs interfaces.

## Compile Protobuf

Create a `client` folder that will contain all these new elements. As you start with Protobuf, in `client`, install modules for the Protobuf-to-Typescript compiler:

```sh
$ cd client
$ npm install ts-proto protoc --save-dev
```

And create the folder structure to receive the compiled files:

```sh
$ mkdir -p src/types/generated
```

What Cosmos version are you using?

```sh
$ grep cosmos-sdk ../go.mod
```

May return:

```
github.com/cosmos/cosmos-sdk v0.42.6
```

So look into your `.proto` files and download the required files:

```sh
$ mkdir -p ../proto/cosmos/base/query/v1beta1
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/proto/cosmos/base/query/v1beta1/pagination.proto -o ../proto/cosmos/base/query/v1beta1/pagination.proto
$ mkdir -p ../proto/google/api
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/third_party/proto/google/api/annotations.proto -o ../proto/google/api/annotations.proto
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/third_party/proto/google/api/http.proto -o ../proto/google/api/http.proto
```

And compile:

```sh
$ ls ../proto/checkers | xargs -I {} ./node_modules/protoc/protoc/bin/protoc \
    --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_proto_out="./src/types/generated" \
    --proto_path="../proto" \
    --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
    checkers/{}
```

You should now have your Typescript files. Save these scripts into a `proto-ts-gen.sh` [script file](https://github.com/cosmos/b9-checkers-academy-draft/blob/2f2c3f3/scripts/proto-ts-gen.sh), make it executable with `chmod a+x`, and add an `npm run` [target for it](https://github.com/cosmos/b9-checkers-academy-draft/blob/2f2c3f3/client/package.json#L8). Next time, you can simply run within the `client` folder:

```sh
$ npm run proto-ts-gen
```

## Prepare integration

At a later stage, you will add Checkers as an extension to Stargate. You can start now and define your Checkers extension right away.

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/2f2c3f3/client/src/modules/checkers/queries.ts#L15-L37]
export interface AllStoredGameResponse {
    storedGames: StoredGame[]
    pagination?: PageResponse
}

export interface CheckersExtension {
    readonly checkers: {
        readonly getNextGame: () => Promise<NextGame>
        readonly getStoredGame: (index: string) => Promise<StoredGame | undefined>
        readonly getAllStoredGames: (
            key: Uint8Array,
            offset: Long,
            limit: Long,
            countTotal: boolean,
        ) => Promise<AllStoredGameResponse>
        readonly canPlayMove: (
            index: string,
            player: Player,
            from: Pos,
            to: Pos,
        ) => Promise<QueryCanPlayMoveResponse>
    }
}
```

Don't forget a _setup_ function as it is expected by Stargate:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/2f2c3f3/client/src/modules/checkers/queries.ts#L39-L94]
export function setupCheckersExtension(base: QueryClient): CheckersExtension {
    const rpc = createProtobufRpcClient(base)
    // Use this service to get easy typed access to query methods
    // This cannot be used for proof verification
    const queryService = new QueryClientImpl(rpc)

    return {
        checkers: {
            getNextGame: async (): Promise<NextGame> => {
                const { NextGame } = await queryService.NextGame({})
                assert(NextGame)
                return NextGame
            },
            getStoredGame: async (index: string): Promise<StoredGame | undefined> => {
                const response: QueryGetStoredGameResponse = await queryService.StoredGame({
                    index: index,
                })
                return response.StoredGame
            },
            getAllStoredGames: async (
                key: Uint8Array,
                offset: Long,
                limit: Long,
                countTotal: boolean,
            ): Promise<AllStoredGameResponse> => {
                const response: QueryAllStoredGameResponse = await queryService.StoredGameAll({
                    pagination: {
                        key: key,
                        offset: offset,
                        limit: limit,
                        countTotal: countTotal,
                    },
                })
                return {
                    storedGames: response.StoredGame,
                    pagination: response.pagination,
                }
            },
            canPlayMove: async (
                index: string,
                player: Player,
                from: Pos,
                to: Pos,
            ): Promise<QueryCanPlayMoveResponse> => {
                return queryService.CanPlayMove({
                    idValue: index,
                    player: player,
                    fromX: Long.fromInt(from.x),
                    fromY: Long.fromInt(from.y),
                    toX: Long.fromInt(to.x),
                    toY: Long.fromInt(to.y),
                })
            },
        },
    }
}
```

Then create your `CheckersStargateClient`:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/2f2c3f3/client/src/checkers_stargateclient.ts#L5-L19]
export class CheckersStargateClient extends StargateClient {
    public readonly checkersQueryClient: CheckersExtension | undefined

    public static async connect(endpoint: string): Promise<CheckersStargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint)
        return new CheckersStargateClient(tmClient)
    }

    protected constructor(tmClient: Tendermint34Client | undefined) {
        super(tmClient)
        if (tmClient) {
            this.checkersQueryClient = QueryClient.withExtensions(tmClient, setupCheckersExtension)
        }
    }
}
```

## Test your client

It is already possible to see if communication happens. In your `client` folder, create a `test/live` folder and, in it, an `experiment.ts` file that will be a living document as your progress:

```typescript [https://github.com/cosmos/b9-checkers-academy-draft/blob/2f2c3f3/client/test/live/experiment.ts#L4-L26]
const starportEndpoint = "http://localhost:26657"

async function runAll() {
    const client: CheckersStargateClient = await CheckersStargateClient.connect(starportEndpoint)
    const checkers = client.checkersQueryClient!.checkers

    // Initial NextGame
    const nextGame0 = await checkers.getNextGame()
    console.log("NextGame:", nextGame0, ", idValue:", nextGame0.idValue.toString(10))

    // All Games
    const allGames0 = await checkers.getAllStoredGames(Uint8Array.of(), Long.fromInt(0), Long.fromInt(0), true)
    console.log("All games", allGames0, ", total: ", allGames0.pagination!.total.toString(10))

    // Non-existent game
    try {
        await checkers.getStoredGame("1024")
    } catch (error1024) {
        console.log(error1024)
    }
}

runAll()
```

Start your chain:

```sh
$ starport chain serve --reset-once
```

Then run it:

```sh
$ npx ts-node ./test/live/experiment.ts
```

Because your chain is empty, you should see:

```
NextGame: {
  creator: '',
  idValue: Long { low: 1, high: 0, unsigned: true },
  fifoHead: '-1',
  fifoTail: '-1'
} , idValue: 1
All games {
  storedGames: [],
  pagination: {
    nextKey: Uint8Array(0) [],
    total: Long { low: 0, high: 0, unsigned: true }
  }
} , total:  0
Error: Query failed with (18): rpc error: code = InvalidArgument desc = not found: invalid request
...
```

That's all you can test at this stage.
