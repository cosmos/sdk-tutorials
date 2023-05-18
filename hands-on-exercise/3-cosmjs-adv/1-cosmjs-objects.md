---
title: "Create Custom Objects"
order: 2
description: Create the objects for your checkers blockchain GUI
tags: 
  - guided-coding
  - cosmos-sdk
  - cosm-js
---

# Create Custom Objects

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md).
* You have completed the introductory [CosmJS tutorial](/tutorials/7-cosmjs/1-cosmjs-intro.md).
* Go and npm are installed.
* You have finished the checkers Go blockchain exercise. If not, you can follow the tutorial [here](/hands-on-exercise/2-ignite-cli-adv/8-wager-denom.md), or just clone and checkout the [relevant branch](https://github.com/cosmos/b9-checkers-academy-draft/tree/wager-denomination) that contains the final version.

</HighlightBox>

With your checkers application ready for use, it is a good time to prepare client elements that eventually allow you to create a GUI and/or server-side scripts. Here, you will apply [what you have learned](/tutorials/7-cosmjs/5-create-custom.md) about creating your own custom CosmJS interfaces.

Before you can get into working on your application directly, you need to make sure CosmJS understands your checkers module and knows how to interact with it. This generally means you need to create the Protobuf objects and clients in TypeScript and create extensions that facilitate the use of them.

## Compile Protobuf

You will have to create a `client` folder that will contain all these new elements. If you want to keep the Go parts of your checkers project separate from the TypeScript parts, you can use another repository for the _client_. To keep a link between the two repositories, add the _client_ parts as a submodule to your Go parts:

```sh
$ git submodule add git@github.com:cosmos/academy-checkers-ui.git client
```

Replace the path with your own repository. In effect, this creates a new `client` folder. This `client` folder makes it possible for you to easily update another repository with content generated out of your Go code.

Create a folder named `scripts` in your project root. This is where you will launch the Protobuf compilation: 

```sh
$ mkdir -p scripts/protoc
```

In the `scripts` folder, or in your Docker image, install a compiler:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ cd scripts/protoc
$ curl -L https://github.com/protocolbuffers/protobuf/releases/download/v21.5/protoc-21.5-linux-x86_64.zip -o protoc.zip
$ unzip protoc.zip
$ rm protoc.zip
# If /usr/local/bin is in your $PATH
$ ln -s $(pwd)/bin/protoc /usr/local/bin/protoc
$ cd ../..
```

Make sure that:

* `/usr/local/bin` is the right folder to link to in the command above.
* You are downloading the right executable for your computer; see your options [here](https://github.com/protocolbuffers/protobuf/releases/tag/v21.5).

</CodeGroupItem>

<CodeGroupItem title="Docker">

```diff [https://github.com/cosmos/b9-checkers-academy-draft/blob/cosmjs-elements/Dockerfile-ubuntu#L1-L50]
-  FROM --platform=linux ubuntu:22.04
+  FROM --platform=linux ubuntu:22.04 as base
    ARG BUILDARCH
    ...
    ENV MOCKGEN_VERSION=1.6.0
+  ENV PROTOC_VERSION=21.7
+
+  FROM base AS platform-amd64
+  ENV PROTOC_PLATFORM=x86_64
+
+  FROM base AS platform-arm64
+  ENV PROTOC_PLATFORM=aarch_64
+
+  FROM platform-${BUILDARCH}

    ENV LOCAL=/usr/local
    ...
-  ENV PACKAGES curl gcc jq make
+  ENV PACKAGES curl gcc jq make unzip
    ...
    RUN go install github.com/golang/mock/mockgen@v${MOCKGEN_VERSION}

+  # Install ProtoC
+  RUN mkdir -p /usr/lib/protoc
+  WORKDIR /usr/lib/protoc
+  RUN curl -L https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-${PROTOC_PLATFORM}.zip -o protoc.zip
+  RUN unzip -o protoc.zip
+  RUN rm protoc.zip
+  RUN ln -s /usr/lib/protoc/bin/protoc ${LOCAL}/bin/protoc
    ...
```

Rebuild your Docker image.

</CodeGroupItem>

</CodeGroup>

---

Now install your additional modules:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ cd scripts
$ npm install ts-proto@1.121.6 --save-dev --save-exact
$ cd ..
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers/scripts \
    checkers_i \
    npm install ts-proto@1.121.6 --save-dev --save-exact
```

</CodeGroupItem>

</CodeGroup>

Create the folder structure to receive the compiled files:

```sh
$ mkdir -p client/src/types/generated
```

Check what Cosmos SDK version you are using:

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
$ ls ../proto/checkers | xargs -I {} protoc \
    --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_proto_out="../client/src/types/generated" \
    --proto_path="../proto" \
    --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
    checkers/{}
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ ls proto/checkers | xargs -I {} docker run --rm \
    -v $(pwd):/checkers \
    -w /checkers/scripts \
    checkers_i \
    protoc \
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

```lang-makefile [https://github.com/cosmos/b9-checkers-academy-draft/blob/cosmjs-elements/Makefile#L6-L31]
install-protoc-gen-ts:
    mkdir -p scripts/protoc
    cd scripts && npm install
    curl -L https://github.com/protocolbuffers/protobuf/releases/download/v21.5/protoc-21.5-linux-x86_64.zip -o scripts/protoc/protoc.zip
    cd scripts/protoc && unzip -o protoc.zip
    rm scripts/protoc/protoc.zip
    ln -s $(pwd)/scripts/protoc/bin/protoc /usr/local/bin/protoc

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
    ls proto/checkers | xargs -I {} protoc \
        --plugin="./scripts/node_modules/.bin/protoc-gen-ts_proto" \
        --ts_proto_out="./client/src/types/generated" \
        --proto_path="./proto" \
        --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
        checkers/{}
```

Whenever you want to re-compile them, run:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ make gen-protoc-ts
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    make gen-protoc-ts
```

</CodeGroupItem>

</CodeGroup>

You have created the [basic Protobuf objects](https://github.com/cosmos/academy-checkers-ui/tree/generated/src/types/generated/checkers) that will assist you with communicating with the blockchain.

## Prepare integration

At this point, you have the `generated` files in your `client` folder. If you have made this `client` folder as a Git submodule, then you can work directly in it and do not need to go back to the checkers Cosmos SDK:

```sh
$ cd client
```

Also, if you use Docker and did not go through the trouble of building the Docker image for the checkers Cosmos SDK, you can use the `node:18.7-slim` image.

Install the Protobuf.js package in your client project:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm install protobufjs@7.0.0 --save-exact
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm \
    -v $(pwd):/client \
    -w /client \
    node:18.7-slim \
    npm install protobufjs@7.0.0 --save-exact
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
$ docker run --rm \
    -v $(pwd):/client \
    -w /client \
    node:18.7-slim \
    npm install @cosmjs/stargate@0.28.11 --save-exact
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
$ npm install mocha@10.0.0 @types/mocha@9.1.1 \
    chai@4.3.6 @types/chai@4.3.3 \
    ts-node@10.9.1 @types/node@18.7.5 \
    dotenv@16.0.1 @types/dotenv@8.2.0 \
    --save-dev --save-exact
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm \
    -v $(pwd):/client \
    -w /client \
    node:18.7-slim \
    npm install mocha@10.0.0 @types/mocha@9.1.1 \
        chai@4.3.6 @types/chai@4.3.3 \
        ts-node@10.9.1 @types/node@18.7.5 \
        dotenv@16.0.1 @types/dotenv@8.2.0 \
        --save-dev --save-exact
```

</CodeGroupItem>

</CodeGroup>

Describe how to connect to the running blockchain in a `.env` file in your project root. This depends on where you will run the tests, not on where you run the blockchain:

<CodeGroup>

<CodeGroupItem title="Local">

```ini [https://github.com/cosmos/academy-checkers-ui/blob/stargate/.env#L1]
RPC_URL="http://localhost:26657"
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```ini [https://github.com/cosmos/academy-checkers-ui/blob/stargate/.env#L1]
RPC_URL="http://checkers:26657"
```

This will run the checkers chain in a container named `checkers`.

</CodeGroupItem>

</CodeGroup>

---

Alternatively, use whichever address connects to the RPC port of the checkers blockchain.

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

```diff-json [https://github.com/cosmos/academy-checkers-ui/blob/stargate/package.json#L7]
    {
        ...
        "scripts": {
-          "test": "echo \"Error: no test specified\" && exit 1"
+          "test": "env TS_NODE_COMPILER_OPTIONS='{\"module\": \"commonjs\" }' mocha --require ts-node/register 'test/**/*.ts'"
        },
        ...
    }
```

### First tests

Because the intention is to run these tests against a running chain, possibly a fresh one, they cannot expect too much, such as how many games have been created so far. Still, it is possible to at least test that the connection is made and queries pass through.

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

### Prepare your checkers chain

There is more than one way to run a checkers blockchain. For instance:

* If you came here after going through the rest of the hands-on exercise, you know how to launch a running chain with Ignite.
* If you arrived here and are only focused on learning CosmJS, it is possible to abstract away niceties of the running chain in a minimal package. For this, you need Docker and to create an image:

   1. Get the `Dockerfile`:

       ```sh
       $ curl -O https://raw.githubusercontent.com/cosmos/b9-checkers-academy-draft/main/Dockerfile-standalone
       ```

   2. Build the image:

       ```sh
       $ docker build . \
           -f Dockerfile-standalone \
           -t checkersd_i:standalone
       ```

If you have another preferred method, make sure to keep track of the required `RPC_URL` accordingly.

<HighlightBox type="tip">

If you are curious about how this `Dockerfile-standalone` was created, head to the [run in production](../4-run-in-prod/1-run-prod-docker.md) section.

</HighlightBox>

### Launch the tests

Launch your checkers chain. You can choose your preferred method, as long as it can be accessed at the `RPC_URL` you defined earlier. For the purposes of this exercise, you have the choice between three methods:

<CodeGroup>

<CodeGroupItem title="Docker standalone" active>

```sh
$ docker network create checkers-net
$ docker run --rm -it \
    -p 26657:26657 \
    --name checkers \
    --network checkers-net \
    checkersd_i:standalone start
```

If your `checkers-net` network already exists, the first command fails with:

```txt
Error response from daemon: network with name checkers-net already exists
```

But that is okay.

</CodeGroupItem>

<CodeGroupItem title="Local Ignite">

```sh
$ ignite chain serve
```

</CodeGroupItem>

<CodeGroupItem title="Docker Ignite">

```sh
$ docker network create checkers-net
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    -p 26657:26657 \
    --name checkers \
    --network checkers-net \
    checkers_i \
    ignite chain serve
```

If your `checkers-net` network already exists, the first command fails with:

```txt
Error response from daemon: network with name checkers-net already exists
```

But that is okay.

</CodeGroupItem>

</CodeGroup>

---

When using Docker, note:

* `--name checkers` either matches the name you wrote in `RPC_URL`, or can be passed as an environment variable to another container to override the value found in `.env`.
* `--network checkers-net`, which is reused shortly if you also run your `npm` tests in Docker. See the paragraph on Docker network, later in this section.

Now, if you run the tests in another shell:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm \
    -v $(pwd):/client -w /client \
    --network checkers-net \
    --env RPC_URL="http://checkers:26657" \
    node:18.7-slim \
    npm test
```

<HighlightBox type="note">

This starts the container on the same network as the blockchain container, where `checkers` resolves to the checkers container. And it also passes `RPC_URL` as an override of the value found in `.env`, typically `localhost`.

</HighlightBox>

</CodeGroupItem>

</CodeGroup>

---

This should return:

```txt
StoredGame
  ✔ can get game list (39ms)
  ✔ cannot get non-existent game

SystemInfo
  ✔ can get system info


3 passing (287ms)
```

The only combination of running chain / running tests that will not work is if you run Ignite on your local computer and the tests in a container. For this edge case, you should put your host IP address in `--env RPC_URL="http://YOUR-HOST-IP:26657"`.

## A note on Docker networks

You may not have used Docker up to this point. The following paragraphs acquaint you with a Docker _user-defined bridged network_.

If you plan on using Docker Compose at a later stage, having a first taste of such networks is beneficial. Docker Compose can be used to orchestrate and launch separate containers in order to mimic a production setup. In fact, in the [production section](../4-run-in-prod/1-run-prod-docker.md) of this hands-on exercise you do exactly that. If you think this could eventually be useful, you should go through this section. You may want to redo this section with [Docker](https://docs.docker.com/get-docker/).

Earlier you ran the commands:

```sh
$ docker network create checkers-net
$ docker run --rm -it \
    -p 26657:26657 \
    --name checkers \
    --network checkers-net \
    --detach \
    checkersd_i:standalone start
```

This produced the following results:

1. A Docker network was created with the name `checkers-net`. If containers are started in this network, all ports are mutually accessible.
2. Your container started in it with the resolvable name of `checkers`.
3. With `-p 26657:26657`, port 26657 was forwarded to your host computer, on top of being already shared on the `checkers-net` network.

Then, for tests:

1. When you ran:

    ```sh
    $ npm test
    ```

    Your tests, running on the **host** computer, accessed the checkers chain from the host computer via the forwarded port 26657. Hence `RPC_URL="http://localhost:26657"`.

2. When you ran:

    ```sh
    $ docker run --rm \
        -v $(pwd):/client -w /client \
        --network checkers-net \
        --env RPC_URL="http://checkers:26657" \
        node:18.7-slim \
        npm test
    ```

    Your tests, running in a different container, accessed the checkers chain within the `checkers-net` **Docker network** thanks to the `checkers` name resolution. Hence `RPC_URL="http://checkers:26657"`.
    
    <HighlightBox type="note">

    In particular, the `-p 26657:26657` port forwarding was not necessary. You can confirm that by stopping your chain and starting it again, this time without `-p`.

    </HighlightBox>

Docker networks are explored further in the next section.

When you are done, if you started the chain in Docker you can stop the containers with:

```sh
$ docker stop checkers
$ docker network rm checkers-net
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

* The need to prepare the elements that will eventually allow you to create a GUI and/or server-side scripts for your checkers application.
* How to create the necessary Protobuf objects and clients in TypeScript, the extensions that facilitate the use of these clients, so that CosmJS will understand and be able to interact with your checkers module.
* How to use Docker to define a network to launch separate containers that can communicate, for the purpose of integration testing.

</HighlightBox>

<!--## Next up

Now that your types have been generated, you can get to work on making sure CosmJS understands which messages it can use on your checkers blockchain in the [next tutorial](./2-cosmjs-messages.md).-->
