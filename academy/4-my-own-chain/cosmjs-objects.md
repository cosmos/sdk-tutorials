---
title: "Custom Objects for Your Checkers Blockchain"
order: 22
description: Create the objects for your GUI
tag: deep-dive
---

# Custom Objects for Your Checkers Blockchain

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [Protobuf](../2-main-concepts/protobuf.md).
* You have completed the introductory [CosmJS tutorial](../xl-cosmjs/intro.md).
* Go and npm are installed.
* You have finished the checkers blockchain exercise. If not, you can follow that tutorial [here](/academy/4-my-own-chain/cosmjs-objects.html), or just clone and checkout the [relevant branch](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-wager-denomination) that contains the final version.

</HighlightBox>

With your Checkers application ready for use, it is a good time to prepare client elements that eventually allow you to create a GUI and/or server-side scripts. Here, you will apply [what you have learned](../xl-cosmjs/create-custom.md) about creating your own custom CosmJS interfaces.

Before you can get into working on your application directly, you need to make sure CosmJS understands your checkers module and knows how to interact with it. This generally means you need create the Protobuf objects and clients in Typescript and create extensions that facilitate the use of them.

## Compile Protobuf

You'll have to create a `client` folder that will contain all these new elements. If you want to keep the Go parts of your Checkers project separate from the Typescript parts, you can use another repository for the _client_. To keep a link between the two repositories, add the _client_ parts as a submodule to your Go parts:

```sh
$ git submodule add git@github.com:cosmos/academy-checkers-ui.git client
```

Replace the path with your own repository. In effect, this creates a new `client` folder. This `client` folder makes it possible for you to easily update another repository with content generated out of your Go code.

Create a folder named `scripts` in your project root. This is where you will launch the Protobuf compilation. In the `scripts` folder install modules for the Protobuf-to-Typescript compiler:

```sh
$ mkdir scripts
$ cd scripts
$ npm install ts-proto@1.110.4 protoc@1.0.4 --save-dev --save-exact
```

Create the folder structure to receive the compiled files:

```sh
$ mkdir -p ../client/src/types/generated
```

Check what Cosmos version you are using:

```sh
$ grep cosmos-sdk ../go.mod
```

This may return:

```
github.com/cosmos/cosmos-sdk v0.42.6
```

Download the required files from your `.proto` files:

```sh
$ mkdir -p ../proto/cosmos/base/query/v1beta1
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/proto/cosmos/base/query/v1beta1/pagination.proto -o ../proto/cosmos/base/query/v1beta1/pagination.proto
$ mkdir -p ../proto/google/api
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/third_party/proto/google/api/annotations.proto -o ../proto/google/api/annotations.proto
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/third_party/proto/google/api/http.proto -o ../proto/google/api/http.proto
```

Now compile:

```sh
$ ls ../proto/checkers | xargs -I {} ./node_modules/protoc/protoc/bin/protoc \
    --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_proto_out="../client/src/types/generated" \
    --proto_path="../proto" \
    --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
    checkers/{}
```

You should now have your Typescript files. Save these scripts into a `proto-ts-gen.sh` [script file](https://github.com/cosmos/b9-checkers-academy-draft/blob/4cf13b5a/scripts/proto-ts-gen.sh), make it executable with `chmod a+x`, and add an `npm run` [target for it](https://github.com/cosmos/b9-checkers-academy-draft/blob/4cf13b5a/scripts/package.json#L7). Next time, to update your compiled Protobuf objects directly into your `client` repository, run the following within the `scripts` folder:

```sh
$ npm run proto-ts-gen
```

Do not forget to install the Protobuf.js package in your client project:

```sh
$ npm install protobufjs@6.10.2 --save-exact
```

## Prepare integration

At a later stage you will add Checkers as an extension to Stargate, but you can define your Checkers extension immediately. The `canPlay` query could make use of better types for player and position. Declare them in `client/src/checkers/player.ts`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/02b0e3b/src/types/checkers/player.ts#L1-L5]
export type Player = "b" | "r"
export interface Pos {
    x: number
    y: number
}
```

Your Checkers extension will need to use the CosmJS Stargate package. Install it:

```sh
$ npm install @cosmjs/stargate@0.28.2 --save-exact
```

Now you can declare the Checkers extension in `client/src/modules/checkers/queries.ts`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/02b0e3b/src/modules/checkers/queries.ts#L15-L37]
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

Do not forget a _setup_ function, as this is expected by Stargate:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/02b0e3b/src/modules/checkers/queries.ts#L39-L94]
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
                    fromX: Long.fromNumber(from.x),
                    fromY: Long.fromNumber(from.y),
                    toX: Long.fromNumber(to.x),
                    toY: Long.fromNumber(to.y),
                })
            },
        },
    }
}
```

Now create your `CheckersStargateClient` in `client/src/checkers_stargateclient.ts`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/02b0e3b/src/checkers_stargateclient.ts#L5-L22]
export class CheckersStargateClient extends StargateClient {
    public readonly checkersQueryClient: CheckersExtension | undefined

    public static async connect(
        endpoint: string,
        options?: StargateClientOptions,
    ): Promise<CheckersStargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint)
        return new CheckersStargateClient(tmClient, options)
    }

    protected constructor(tmClient: Tendermint34Client | undefined, options: StargateClientOptions = {}) {
        super(tmClient, options)
        if (tmClient) {
            this.checkersQueryClient = QueryClient.withExtensions(tmClient, setupCheckersExtension)
        }
    }
}
```

## Test your client

It should already be possible to see communication happen. You are about to create a file that runs from the command-line and tests some actions. Install some packages:

```sh
$ npm install @types/node@17.0.24 dotenv@16.0.0 ts-node@10.7.0 --save-dev --save-exact
```

Describe how to connect to the running blockchain in a `.env` file in your project root:

``` [https://github.com/cosmos/academy-checkers-ui/blob/02b0e3b/.env#L1]
RPC_URL="http://localhost:26657"
```

Alternatively, use whichever address connects to the RPC port of the Checkers blockchain.

Now let Typescript know about this in a `environment.d.ts` file:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/02b0e3b/environment.d.ts]
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            RPC_URL: string
        }
    }
}

export {}
```

In your `client` folder create a `test/live` folder. In `test/live`, create an `experiment.ts` file to be a living document of your progress:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/02b0e3b/test/live/experiment.ts#L1-L32]
import { config } from "dotenv"
import Long from "long"
import { CheckersStargateClient } from "../../src/checkers_stargateclient"

config()

async function runAll() {
    const client: CheckersStargateClient = await CheckersStargateClient.connect(process.env.RPC_URL)
    const checkers = client.checkersQueryClient!.checkers

    // Initial NextGame
    const nextGame0 = await checkers.getNextGame()
    console.log("NextGame:", nextGame0, ", idValue:", nextGame0.idValue.toString(10))

    // All Games
    const allGames0 = await checkers.getAllStoredGames(
        Uint8Array.of(),
        Long.fromInt(0),
        Long.fromInt(0),
        true,
    )
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

* If you have Ignite CLI:

    ```sh
    $ ignite chain serve --reset-once
    ```

* Otherwise look for instructions on how to run the chain.

Now run the script file:

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

This is as expected, as nothing more can be tested at this stage.

## Next up

Now that your types have been generated, you can get to work on making sure CosmJS understands which messages it can use on your checkers blockchain in the [next tutorial](./cosmjs-messages.md).
