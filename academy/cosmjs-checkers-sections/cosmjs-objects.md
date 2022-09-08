---
title: "Custom Objects for Your Checkers Blockchain"
order: 2
description: Create the objects for your GUI
tag: deep-dive
---

# Custom Objects for Your Checkers Blockchain

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [Protobuf](../2-main-concepts/protobuf.md).
* You have completed the introductory [CosmJS tutorial](../xl-cosmjs/intro.md).
* Go and npm are installed.
* You have finished the checkers blockchain exercise. If not, you can follow that tutorial [here](/academy/4-my-own-chain/cosmjs-objects.html), or just clone and checkout the [relevant branch](https://github.com/cosmos/b9-checkers-academy-draft/tree/wager-denomination) that contains the final version.

</HighlightBox>

With your Checkers application ready for use, it is a good time to prepare client elements that eventually allow you to create a GUI and/or server-side scripts. Here, you will apply [what you have learned](../xl-cosmjs/create-custom.md) about creating your own custom CosmJS interfaces.

Before you can get into working on your application directly, you need to make sure CosmJS understands your checkers module and knows how to interact with it. This generally means you need create the Protobuf objects and clients in TypeScript and create extensions that facilitate the use of them.

## Compile Protobuf

You'll have to create a `client` folder that will contain all these new elements. If you want to keep the Go parts of your Checkers project separate from the TypeScript parts, you can use another repository for the _client_. To keep a link between the two repositories, add the _client_ parts as a submodule to your Go parts:

```sh
$ git submodule add git@github.com:cosmos/academy-checkers-ui.git client
```

Replace the path with your own repository. In effect, this creates a new `client` folder. This `client` folder makes it possible for you to easily update another repository with content generated out of your Go code.

Create a folder named `scripts` in your project root. This is where you will launch the Protobuf compilation. In the `scripts` folder install modules for the Protobuf-to-TypeScript compiler:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ mkdir -p scripts/protoc
$ cd scripts
$ npm install ts-proto@1.121.6 --save-dev --save-exact
$ cd protoc
$ curl -L https://github.com/protocolbuffers/protobuf/releases/download/v21.5/protoc-21.5-linux-x86_64.zip -o protoc.zip
$ unzip protoc.zip
$ rm protoc.zip
$ cd ../..
```

Make sure [here](https://github.com/protocolbuffers/protobuf/releases/tag/v21.5) that you are downloading the right executable for your computer.

</CodeGroupItem>

<CodeGroupItem title="Docker">

```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/cosmjs-elements/Dockerfile-ubuntu#L18]
...
ENV PACKAGES curl gcc jq make unzip
...
```

Rebuild your Docker image and then:

```sh
$ mkdir -p scripts/protoc
$ docker run --rm -it -v $(pwd):/checkers -w /checkers/scripts checkers_i npm install ts-proto@1.121.6 --save-dev --save-exact
$ docker run --rm -it -v $(pwd):/checkers -w /checkers/scripts/protoc checkers_i bash -c "curl -L https://github.com/protocolbuffers/protobuf/releases/download/v21.5/protoc-21.5-linux-x86_64.zip -o /root/protoc.zip && unzip /root/protoc.zip"
```

</CodeGroupItem>

</CodeGroup>

Create the folder structure to receive the compiled files:

```sh
$ mkdir -p client/src/types/generated
```

Check what Cosmos version you are using:

```sh
$ grep cosmos-sdk go.mod
```

This may return:

```txt
github.com/cosmos/cosmos-sdk v0.45.4
```

Download the required files from your `.proto` files:

```sh
$ mkdir -p proto/cosmos/base/query/v1beta1
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.45.4/proto/cosmos/base/query/v1beta1/pagination.proto -o proto/cosmos/base/query/v1beta1/pagination.proto
$ mkdir -p proto/google/api
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.45.4/third_party/proto/google/api/annotations.proto -o proto/google/api/annotations.proto
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.45.4/third_party/proto/google/api/http.proto -o proto/google/api/http.proto
$ mkdir -p proto/gogoproto
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.45.4/third_party/proto/gogoproto/gogo.proto -o proto/gogoproto/gogo.proto
```

Now compile:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ cd scripts
$ ls ../proto/checkers | xargs -I {} ./protoc/bin/protoc \
    --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_proto_out="../client/src/types/generated" \
    --proto_path="../proto" \
    --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
    checkers/{}
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ ls proto/checkers | xargs -I {} docker run --rm -v $(pwd):/checkers -w /checkers/scripts checkers_i ./protoc/bin/protoc \
    --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_proto_out="../client/src/types/generated" \
    --proto_path="../proto" \
    --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
    checkers/{}
```

</CodeGroupItem>

</CodeGroup>

You should now have your TypeScript files.

In order to easily repeat these steps in the future, you can add them to your existing `Makefile` with slight modifications:

```lang-makefile [https://github.com/cosmos/b9-checkers-academy-draft/blob/cosmjs-elements/Makefile#L4-L31]
install-protoc-gen-ts:
    cd scripts && npm install
    mkdir -p scripts/protoc
    curl -L https://github.com/protocolbuffers/protobuf/releases/download/v21.5/protoc-21.5-linux-x86_64.zip -o scripts/protoc/protoc.zip
    cd scripts/protoc && unzip -o protoc.zip
    rm scripts/protoc/protoc.zip

cosmos-version = v0.45.4

download-cosmos-proto:
    mkdir -p proto/cosmos/base/query/v1beta1
    curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/${cosmos-version}/proto/cosmos/base/query/v1beta1/pagination.proto -o proto/cosmos/base/query/v1beta1/pagination.proto
    mkdir -p proto/google/api
    curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/${cosmos-version}/third_party/proto/google/api/annotations.proto -o proto/google/api/annotations.proto
    curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/${cosmos-version}/third_party/proto/google/api/http.proto -o proto/google/api/http.proto
    mkdir -p proto/gogoproto
    curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/${cosmos-version}/third_party/proto/gogoproto/gogo.proto -o proto/gogoproto/gogo.proto

gen-protoc-ts: download-cosmos-proto install-protoc-gen-ts
    mkdir -p ./client/src/types/generated/
    ls proto/checkers | xargs -I {} ./scripts/protoc/bin/protoc \
        --plugin="./scripts/node_modules/.bin/protoc-gen-ts_proto" \
        --ts_proto_out="./client/src/types/generated" \
        --proto_path="./proto" \
        --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
        checkers/{}
```

Then whenever you want to re-run them:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ make gen-protoc-ts
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -v $(pwd):/checkers -w /checkers checkers_i make gen-protoc-ts
```

</CodeGroupItem>

</CodeGroup>

You have created the [basic Protobuf objects](https://github.com/cosmos/academy-checkers-ui/tree/stargate/src/types/generated/checkers) that will assist you with communicating with the blockchain.

## Prepare integration

At this point, you have the `generated` files in your `client` folder. If you have made this `client` folder as a Git submodule, then you can work directly in it and do not need to go back to the checkers Cosmos SDK:

```sh
$ cd client
```

Also, if you use Docker and did not go through the trouble of building the Docker image for the checkers Cosmos SDK, you can use the `node:18.7` image.

Install the Protobuf.js package in your client project:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm install protobufjs@7.0.0 --save-exact
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -v $(pwd):/client -w /client node:18.7 npm install protobufjs@7.0.0 --save-exact
```

</CodeGroupItem>

</CodeGroup>

At a later stage, you will add checkers as an extension to Stargate, but you can define your checkers extension immediately. The `canPlay` query could make use of better types for player and position. Start by declaring them in `client/src/checkers/player.ts`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/stargate/src/types/checkers/player.ts#L1-L6]
export type Player = "b" | "r"
export type GamePiece = Player | "*"
export interface Pos {
    x: number
    y: number
}
```

Your checkers extension will need to use the CosmJS Stargate package. Install it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm install @cosmjs/stargate@0.28.11 --save-exact
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -v $(pwd):/client -w /client node:18.7 npm install @cosmjs/stargate@0.28.11 --save-exact
```

</CodeGroupItem>

</CodeGroup>

Now you can declare the checkers extension in `src/modules/checkers/queries.ts`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/stargate/src/modules/checkers/queries.ts#L15-L37]
export interface AllStoredGameResponse {
    storedGames: StoredGame[]
    pagination?: PageResponse
}

export interface CheckersExtension {
    readonly checkers: {
        readonly getSystemInfo: () => Promise<SystemInfo>
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

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/stargate/src/modules/checkers/queries.ts#L39-L95]
export function setupCheckersExtension(base: QueryClient): CheckersExtension {
    const rpc = createProtobufRpcClient(base)
    // Use this service to get easy typed access to query methods
    // This cannot be used for proof verification
    const queryService = new QueryClientImpl(rpc)

    return {
        checkers: {
            getSystemInfo: async (): Promise<SystemInfo> => {
                const { SystemInfo } = await queryService.SystemInfo({})
                assert(SystemInfo)
                return SystemInfo
            },
            getStoredGame: async (index: string): Promise<StoredGame | undefined> => {
                const response: QueryGetStoredGameResponse = await queryService.StoredGame({
                    index: index,
                })
                return response.storedGame
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
                        reverse: false,
                    },
                })
                return {
                    storedGames: response.storedGame,
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
                    gameIndex: index,
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

You may have to add these imports by hand:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/stargate/src/modules/checkers/queries.ts#L2-L3]
import { assert } from "@cosmjs/utils"
import Long from "long"
```

Now create your `CheckersStargateClient` in `src/checkers_stargateclient.ts`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/stargate/src/checkers_stargateclient.ts#L5-L22]
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

## Integration tests

It is possible to already run some integration tests against a running checkers blockchain.

### Preparation

Install packages to run tests.

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm install mocha@10.0.0 @types/mocha@9.1.1 chai@4.3.6 @types/chai@4.3.3 ts-node@10.9.1 @types/node@18.7.5 dotenv@16.0.1 @types/dotenv@8.2.0 --save-dev --save-exact
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -v $(pwd):/client -w /client node:18.7 npm install mocha@10.0.0 @types/mocha@9.1.1 chai@4.3.6 @types/chai@4.3.3 ts-node@10.9.1 @types/node@18.7.5 dotenv@16.0.1 @types/dotenv@8.2.0 --save-dev --save-exact
```

</CodeGroupItem>

</CodeGroup>

Describe how to connect to the running blockchain in a `.env` file in your project root:

``` [https://github.com/cosmos/academy-checkers-ui/blob/stargate/.env#L1]
RPC_URL="http://localhost:26657"
```

Alternatively, use whichever address connects to the RPC port of the checkers blockchain. If your chain runs in a Docker container, you may need to pass your actual IP address.

This information will be picked up by the `dotenv` package. Now let TypeScript know about this in an `environment.d.ts` file:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/stargate/environment.d.ts]
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            RPC_URL: string
        }
    }
}

export {}
```

Also add your `tconfig.json` as you see fit:

```json [https://github.com/cosmos/academy-checkers-ui/blob/stargate/tsconfig.json]
{
    "exclude": ["./tests/", "./node_modules/", "./dist/"],
    "compilerOptions": {
        "esModuleInterop": true,
        "module": "ES2015",
        "moduleResolution": "node",
        "target": "ES6"
    }
}
```

Add the line that describes how the tests are run:

```json [https://github.com/cosmos/academy-checkers-ui/blob/stargate/package.json#L7]
{
    ...
    "scripts": {
        "test": "env TS_NODE_COMPILER_OPTIONS='{\"module\": \"commonjs\" }' mocha --require ts-node/register 'test/**/*.ts'"
    },
    ...
}
```

### First tests

Because the intention is to run these tests against a running chain they cannot expect too much, such as how many games have been created so far. Still, it is possible to at least test that the connection is made and queries pass through.

Create `test/integration/system-info.ts`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/stargate/test/integration/system-info.ts]
import { expect } from "chai"
import { config } from "dotenv"
import _ from "../../environment"
import { CheckersStargateClient } from "../../src/checkers_stargateclient"
import { CheckersExtension } from "../../src/modules/checkers/queries"

config()

describe("SystemInfo", function () {
    let client: CheckersStargateClient, checkers: CheckersExtension["checkers"]

    before("create client", async function () {
        client = await CheckersStargateClient.connect(process.env.RPC_URL)
        checkers = client.checkersQueryClient!.checkers
    })

    it("can get system info", async function () {
        const systemInfo = await checkers.getSystemInfo()
        expect(systemInfo.nextId.toNumber()).to.be.greaterThanOrEqual(1)
        expect(parseInt(systemInfo.fifoHeadIndex, 10)).to.be.greaterThanOrEqual(-1)
        expect(parseInt(systemInfo.fifoTailIndex, 10)).to.be.greaterThanOrEqual(-1)
    })
})
```

And create one for stored games:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/stargate/test/integration/stored-game.ts]
import { expect } from "chai"
import { config } from "dotenv"
import Long from "long"
import _ from "../../environment"
import { CheckersStargateClient } from "../../src/checkers_stargateclient"
import { CheckersExtension } from "../../src/modules/checkers/queries"

config()

describe("StoredGame", function () {
    let client: CheckersStargateClient, checkers: CheckersExtension["checkers"]

    before("create client", async function () {
        client = await CheckersStargateClient.connect(process.env.RPC_URL)
        checkers = client.checkersQueryClient!.checkers
    })

    it("can get game list", async function () {
        const allGames = await checkers.getAllStoredGames(
            Uint8Array.of(),
            Long.fromInt(0),
            Long.fromInt(0),
            true,
        )
        expect(allGames.storedGames).to.be.length.greaterThanOrEqual(0)
    })

    it("cannot get non-existent game", async function () {
        try {
            await checkers.getStoredGame("no-id")
            expect.fail("It should have failed")
        } catch (error) {
            expect(error.toString()).to.equal(
                "Error: Query failed with (22): rpc error: code = NotFound desc = not found: key not found",
            )
        }
    })
})
```

<HighlightBox type="note">

Note the forced import of `import _ from "../../environment"`, to actively inform on the `string` type (as opposed to `string | undefined`) and avoid any compilation error.

</HighlightBox>

Launch your checkers chain, for instance from the checkers folder with:

<!-- TODO create a Docker container that contains everything for a pure CosmJS dev to follow along -->

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain serve
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers -p 1317:1317 -p 4500:4500 -p 5000:5000 -p 26657:26657 checkers_i ignite chain serve
```

</CodeGroupItem>

</CodeGroup>

Now if you run the tests:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -v $(pwd):/client -w /client node:18.7 npm test
```

Make sure your Node container can access the chain, especially if you set the `RPC_URL` at `localhost`.

</CodeGroupItem>

</CodeGroup>

This should return:

```txt
StoredGame
  ✔ can get game list (39ms)
  ✔ cannot get non-existent game

SystemInfo
  ✔ can get system info


3 passing (287ms)
```

## Next up

Now that your types have been generated and you have created your read-only Stargate client, you can get to work on making sure CosmJS understands which messages it can use on your checkers blockchain in the [next tutorial](./cosmjs-messages.md).
