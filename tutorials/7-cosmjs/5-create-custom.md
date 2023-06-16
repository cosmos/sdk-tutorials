---
title: "Create Custom CosmJS Interfaces"
order: 6
description: Work with your blockchain
tags:
  - tutorial
  - cosm-js
  - dev-ops
---

# Create Custom CosmJS Interfaces

<HighlightBox type="learning">

In this section, you will:

* Create custom CosmJS interfaces to connect to custom Cosmos SDK modules.
* Define custom interfaces with Protobuf.
* Define custom types and messages.
* Integrate with Ignite - previously known as Starport.

</HighlightBox>

CosmJS comes out of the box with interfaces that connect with the standard Cosmos SDK modules such as `bank` and `gov` and understand the way their messages are serialized. Since your own blockchain's modules are unique, they need custom CosmJS interfaces. That process consists of several steps:

1. Creating the Protobuf objects and clients in TypeScript.
2. Creating extensions that facilitate the use of the above clients.
3. Any further level of abstraction that you deem useful for integration.

This section assumes that you have a working Cosmos blockchain with its own modules. It is based on CosmJS version [`v0.28.3`](https://github.com/cosmos/cosmjs/tree/v0.28.3).

## Compiling the Protobuf objects and clients

You can choose which library you use to compile your Protobuf objects into TypeScript or JavaScript. Reproducing [what Stargate](https://github.com/cosmos/cosmjs/blob/main/packages/stargate/CUSTOM_PROTOBUF_CODECS.md) or [`cosmjs-types`](https://github.com/confio/cosmjs-types/blob/main/scripts/codegen.js) do is a good choice.

### Preparation

This exercise assumes that:

1. Your Protobuf definition files are in `./proto/myChain`.
2. You want to compile them into TypeScript in `./client/src/types/generated`.

Install `protoc` on your computer and its Typescript plugin in your project, possibly with the help of a Dockerfile:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ mkdir -p /usr/lib/protoc
$ cd /usr/lib/protoc
$ curl -L https://github.com/protocolbuffers/protobuf/releases/download/v21.7/protoc-21.7-linux-x86_64.zip -o protoc.zip
$ unzip -o protoc.zip
$ rm protoc.zip
$ ln -s /usr/lib/protoc/bin/protoc /usr/local/bin/protoc
$ npm install ts-proto@1.121.6 --save-dev
```

Adjust to your preferred version, operating system, and CPU platform. For instance, on an Apple M1 you would use `protoc-21.7-osx-aarch_64.zip`.

</CodeGroupItem>

<CodeGroupItem title="Dockerfile">

```Dockerfile
FROM --platform=linux node:lts-slim as base
ARG BUILDARCH

ENV PROTOC_VERSION=21.7
ENV TS_PROTO_VERSION=1.121.6

FROM base AS platform-amd64
ENV PROTOC_PLATFORM=x86_64

FROM base AS platform-arm64
ENV PROTOC_PLATFORM=aarch_64

FROM platform-${BUILDARCH}

RUN apt-get update
RUN apt-get install curl unzip --yes

# Install ProtoC
RUN mkdir -p /usr/lib/protoc
WORKDIR /usr/lib/protoc
RUN curl -L https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-${PROTOC_PLATFORM}.zip -o protoc.zip
RUN unzip -o protoc.zip
RUN rm protoc.zip
RUN ln -s /usr/lib/protoc/bin/protoc /usr/local/bin/protoc

# Install ts-proto
RUN npm install --global ts-proto@${TS_PROTO_VERSION} --save-exact

WORKDIR /

ENTRYPOINT [ "protoc" ]
```

Then build the image:

```sh
$ docker build . -t ts-protoc
```

</CodeGroupItem>

</CodeGroup>

---

You can confirm the version you received. The executable is located in `./node_modules/protoc/protoc/bin/protoc`:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ protoc --version
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    ts-protoc --version
```

</CodeGroupItem>

</CodeGroup>

This returns something like:

```txt
libprotoc 3.21.7
```

The compiler tools are ready. Time to use them.

Create the target folder if it does not exist yet:

```sh
$ mkdir -p client/src/types/generated
```

### Getting third party files

You need to get the imports that appear in your `.proto` files. Usually you can find the following in [`query.proto`](https://github.com/cosmos/cosmos-sdk/blob/d98503b/proto/cosmos/bank/v1beta1/query.proto#L4-L6):

```proto
import "cosmos/base/query/v1beta1/pagination.proto";
import "gogoproto/gogo.proto";
import "google/api/annotations.proto";
```

You need local copies of the right file versions in the right locations. Pay particular attention to Cosmos SDK's version of your project. You can check by running:

```sh
$ grep cosmos-sdk go.mod
```

This returns something like:

```txt
github.com/cosmos/cosmos-sdk v0.45.4
```

Use this version as a tag on Github. One way to retrieve the [pagination file](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/proto/cosmos/base/query/v1beta1/pagination.proto) is:

```sh
$ mkdir -p ./proto/cosmos/base/query/v1beta1/
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.45.4/proto/cosmos/base/query/v1beta1/pagination.proto -o ./proto/cosmos/base/query/v1beta1/pagination.proto
```

You can do the same for the others, found in the [`third_party` folder](https://github.com/cosmos/cosmos-sdk/tree/v0.45.4/third_party/proto) under the same version:

```sh
$ mkdir -p ./proto/google/api
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.45.4/third_party/proto/google/api/annotations.proto -o ./proto/google/api/annotations.proto
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.45.4/third_party/proto/google/api/http.proto -o ./proto/google/api/http.proto
$ mkdir -p ./proto/gogoproto
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.45.4/third_party/proto/gogoproto/gogo.proto -o ./proto/gogoproto/gogo.proto
```

### Compilation

You can now compile the Protobuf files. To avoid adding all the `.proto` files manually to the command, use `xargs`:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ls ./proto/myChain | xargs -I {} protoc \
  --plugin="./node_modules/ts-proto/protoc-gen-ts_proto" \
  --ts_proto_out="./client/src/types/generated" \
  --proto_path="./proto" \
  --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
  myChain/{}
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ ls ./proto/myChain | xargs -I {} \
    docker run --rm -i \
    -v $(pwd):/project -w /project \
    ts-protoc \
    --plugin="/usr/local/lib/node_modules/ts-proto/protoc-gen-ts_proto" \
    --ts_proto_out="./client/src/types/generated" \
    --proto_path="./proto" \
    --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
    myChain/{}
```

Where `/usr/local/lib/node_modules` is the result of the query:

```sh
$ docker run --rm -it \
    --entrypoint npm \
    ts-protoc \
    root --global
```

This shows where `ts-proto` was installed globally.

</CodeGroupItem>

</CodeGroup>

---

`--proto_path` is only `./proto` so that your imports (such as `import "cosmos/base...`) can be found.

You should now see your files compiled into TypeScript. They have been correctly filed under their respective folders and contain both types and services definitions. It also created the compiled versions of your third party imports.

### A note about the result

Your `tx.proto` file may have contained the following:

```protobuf [https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/proto/cosmos/bank/v1beta1/tx.proto#L11-L17]
service Msg {
      rpc Send(MsgSend) returns (MsgSendResponse);
      //...
}
```

If so, you find its service declaration in the compiled `tx.ts` file:

```typescript [https://github.com/confio/cosmjs-types/blob/v0.4.1/src/cosmos/bank/v1beta1/tx.ts#L243-L248]
export interface Msg {
    Send(request: MsgSend): Promise<MsgSendResponse>;
    //...
}
```

It also appears in the default implementation:

```typescript [https://github.com/confio/cosmjs-types/blob/v0.4.1/src/cosmos/bank/v1beta1/tx.ts#L250-L268]
export class MsgClientImpl implements Msg {
    private readonly rpc: Rpc;
    constructor(rpc: Rpc) {
        this.rpc = rpc;
        this.Send = this.Send.bind(this);
        //...
    }
    Send(request: MsgSend): Promise<MsgSendResponse> {
        const data = MsgSend.encode(request).finish();
        const promise = this.rpc.request("cosmos.bank.v1beta1.Msg", "Send", data);
        return promise.then((data) => MsgSendResponse.decode(new _m0.Reader(data)));
    }
    //...
}
```

The important points to remember from this are:

1. `rpc: RPC` is an instance of a Protobuf RPC client that is given to you by CosmJS. Although the interface appears to be [declared locally](https://github.com/confio/cosmjs-types/blob/v0.4.1/src/cosmos/bank/v1beta1/tx.ts#L270-L272), this is the same interface found [throughout CosmJS](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/queryclient/utils.ts#L35-L37). It is given to you [on construction](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/queryclient/queryclient.ts). At this point you do not need an implementation for it.
2. You can see `encode` and `decode` in action. Notice the `.finish()` that flushes the Protobuf writer buffer.
3. The `rpc.request` makes calls that are correctly understood by the Protobuf compiled server on the other side.

You can find the same structure in [`query.ts`](https://github.com/confio/cosmjs-types/blob/v0.4.1/src/cosmos/bank/v1beta1/query.ts).

### Proper saving

Commit the extra `.proto` files as well as the compiled ones to your repository so you do not need to recreate them.

Take inspiration from `cosmjs-types` [`codegen.sh`](https://github.com/confio/cosmjs-types/tree/main/scripts):

1. Create a script file named `ts-proto.sh` with the previous command, or create a `Makefile` target.
2. Add an [npm run target](https://github.com/confio/cosmjs-types/blob/c64759a/package.json#L31) with it, to keep track of how this was done and easily reproduce it in the future when you update a Protobuf file.

## Add convenience with types

CosmJS provides an interface to which all the created types conform, [`TsProtoGeneratedType`](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/proto-signing/src/registry.ts#L12-L18), which is itself a sub-type of [`GeneratedType`](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/proto-signing/src/registry.ts#L32). In the same file, note the definition:

```typescript [https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/proto-signing/src/registry.ts#L54-L57]
export interface EncodeObject {
    readonly typeUrl: string;
    readonly value: any;
}
```

The `typeUrl` is the identifier by which Protobuf identifies the type of the data to serialize or deserialize. It is composed of the type's package and its name. For instance (and see also [here](https://github.com/cosmos/cosmos-sdk/blob/3a1027c/proto/cosmos/bank/v1beta1/tx.proto)):

```protobuf
package cosmos.bank.v1beta1;
//...
message MsgSend {
    //...
}
```

In this case, the `MsgSend`'s type URL is [`"/cosmos.bank.v1beta1.MsgSend"`](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/modules/bank/messages.ts#L6).

Each of your types is associated like this. You can declare each string as a constant value, such as:

```typescript
export const msgSendTypeUrl = "/cosmos.bank.v1beta1.MsgSend";
```

Save those along with `generated` in `./client/src/types/modules`.

### For messages

Messages, sub-types of `Msg`, are assembled into transactions that are then sent to CometBFT. CosmJS types already include types for [transactions](https://github.com/confio/cosmjs-types/blob/v0.4.1/src/cosmos/tx/v1beta1/tx.ts#L12-L26). These are assembled, signed, and sent by the [`SigningStargateClient`](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/signingstargateclient.ts#L280-L298) of CosmJS.

The `Msg` kind also needs to be added to a registry. To facilitate that, you should prepare them in a nested array:

```typescript [https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/modules/bank/messages.ts#L4-L7]
export const bankTypes: ReadonlyArray<[string, GeneratedType]> = [
    ["/cosmos.bank.v1beta1.MsgMultiSend", MsgMultiSend],
    ["/cosmos.bank.v1beta1.MsgSend", MsgSend],
];
```

Add child types to `EncodeObject` to direct Typescript:

```typescript [https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/modules/bank/messages.ts#L9-L12]
export interface MsgSendEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.bank.v1beta1.MsgSend";
    readonly value: Partial<MsgSend>;
}
```

In the previous code, you cannot reuse your `msgSendTypeUrl` because it is a value not a type. You can add a type helper, which is useful in an `if else` situation:

```typescript [https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/modules/bank/messages.ts#L14-L16]
export function isMsgSendEncodeObject(encodeObject: EncodeObject): encodeObject is MsgSendEncodeObject {
    return (encodeObject as MsgSendEncodeObject).typeUrl === "/cosmos.bank.v1beta1.MsgSend";
}
```

### For queries

Queries have very different types of calls. It makes sense to organize them in one place, called an extension. For example:

```typescript [https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/modules/bank/queries.ts#L9-L18]
export interface BankExtension {
    readonly bank: {
        readonly balance: (address: string, denom: string) => Promise<Coin>;
        readonly allBalances: (address: string) => Promise<Coin[]>;
        //...
    };
}
```

Note that there is a **key** `bank:` inside it. This becomes important later on when you _add_ it to Stargate.

1. Create an extension interface for your module using function names and parameters that satisfy your needs.
2. It is recommended to make sure that the key is unique and does not overlap with any other modules of your application.
3. Create a factory for its implementation copying the [model here](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/modules/bank/queries.ts#L20-L59). Remember that the [`QueryClientImpl`](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/modules/bank/queries.ts#L4) implementation must come from your own compiled Protobuf query service.

## Integration with Stargate

`StargateClient` and `SigningStargateClient` are typically the ultimate abstractions that facilitate the querying and sending of transactions. You are now ready to add your own elements to them. The easiest way is to inherit from them and expose the extra functions you require.

If your extra functions map one-for-one with those of your own extension, then you can publicly expose the extension itself to minimize duplication in [`StargateClient`](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/stargateclient.ts#L143) and [`SigningStargateClient`](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/signingstargateclient.ts#L109).

For example, if you have your `interface MyExtension` with a `myKey` key and you are creating `MyStargateClient`:

```typescript
export class MyStargateClient extends StargateClient {
    public readonly myQueryClient: MyExtension | undefined

    public static async connect(
      endpoint: string,
      options: StargateClientOptions = {},
  ): Promise<MyStargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint)
        return new MyStargateClient(tmClient, options)
    }

    protected constructor(tmClient: Tendermint34Client | undefined, options: StargateClientOptions) {
        super(tmClient, options)
        if (tmClient) {
            this.myQueryClient = QueryClient.withExtensions(tmClient, setupMyExtension)
        }
    }
}
```

You can extend [`StargateClientOptions`](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/stargateclient.ts#L139-L141) if your own client can receive further options.

You also need to inform `MySigningStargateClient` about the extra encodable types it should be able to handle. The list is defined in a registry that you can [pass as options](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/signingstargateclient.ts#L139).

Take inspiration from the [`SigningStargateClient` source code](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/signingstargateclient.ts#L76-L80) itself. Collect your new types into an array:

```typescript
import { defaultRegistryTypes } from "@cosmjs/stargate"

export const myDefaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
    ...defaultRegistryTypes,
    ...myTypes, // As you defined bankTypes earlier
]
```

Taking inspiration from [the same place](https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/signingstargateclient.ts#L118-L120), add the registry creator:

```typescript
function createDefaultRegistry(): Registry {
    return new Registry(myDefaultRegistryTypes)
}
```

Now you are ready to combine this into your own `MySigningStargateClient`. It still takes an optional registry, but if that is missing it adds your newly defined default one:

```typescript
export class MySigningStargateClient extends SigningStargateClient {
    public readonly myQueryClient: MyExtension | undefined

    public static async connectWithSigner(
        endpoint: string,
        signer: OfflineSigner,
        options: SigningStargateClientOptions = {}
    ): Promise<MySigningStargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint)
        return new MySigningStargateClient(tmClient, signer, {
            registry: createDefaultRegistry(),
            ...options,
        })
    }

    protected constructor(tmClient: Tendermint34Client | undefined, signer: OfflineSigner, options: SigningStargateClientOptions) {
        super(tmClient, signer, options)
        if (tmClient) {
            this.myQueryClient = QueryClient.withExtensions(tmClient, setupMyExtension)
        }
    }
}
```

You can optionally add dedicated functions that use your own types, modeled on:

```typescript [https://github.com/cosmos/cosmjs/blob/v0.28.3/packages/stargate/src/signingstargateclient.ts#L180-L196]
public async sendTokens(
    senderAddress: string,
    recipientAddress: string,
    amount: readonly Coin[],
    fee: StdFee | "auto" | number,
    memo = "",
): Promise<DeliverTxResponse> {
    const sendMsg: MsgSendEncodeObject = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
            fromAddress: senderAddress,
            toAddress: recipientAddress,
            amount: [...amount],
        },
    };
    return this.signAndBroadcast(senderAddress, [sendMsg], fee, memo);
}
```

Think of your functions as examples of proper use, that other developers can reuse when assembling more complex transactions.

You are ready to import and use this in a server script or a GUI.

<HighlightBox type="tip">

If you would like to get started on building your own CosmJS elements on your own checkers game, you can go straight to the exercise in [CosmJS for Your Chain](/hands-on-exercise/3-cosmjs-adv/index.md) to start from scratch.

More specifically, you can jump to:

* [Create Custom Objects](/hands-on-exercise/3-cosmjs-adv/1-cosmjs-objects.md), to see how to compile the Protobuf objects.
* [Create Custom Messages](/hands-on-exercise/3-cosmjs-adv/2-cosmjs-messages.md), to see how to create messages relevant for checkers.
* [Backend Script for Game Indexing](/hands-on-exercise/3-cosmjs-adv/5-server-side.md), to see how this can be used also to listen to events coming from the blockchain.
* [Integrate CosmJS and Keplr](/hands-on-exercise/3-cosmjs-adv/4-cosmjs-gui.md), to see how to use and integrate what you prepared into a preexisting Checkers GUI.

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How CosmJS's out-of-the-box interfaces understand how messages of standard Cosmos SDK modules are serialized, meaning that your unique modules will require custom CosmJS interfaces of their own.
* How to create the necessary Protobuf objects and clients in Typescript, the extensions that facilitate the use of these clients, and any further level of abstraction that you deem useful for integration.
* How to integrate CosmJS with Ignite's client and signing client, which are typically the ultimate abstractions that facilitate the querying and sending of transactions.

</HighlightBox>

<!-- ## What next?

The Interchain is vast, with lots of projects, people and concepts to discover:

* Reach out to the community.
* Contribute to the Cosmos SDK, IBC, and CometBFT development.
* Get support for enterprise solutions which you are developing.

Head to the [What's Next](/academy/whats-next/index.md) section to find useful information to launch your journey into the Interchain universe. -->

<!-- INCLUDE AFTER NEW STRUCTURE IS IMPLEMENTED: Head right into the [next section](/hands-on-exercise/3-cosmjs-adv/1-cosmjs-objects.md) to begin creating custom objects for your checkers blockchain.
So what's next?  -->
