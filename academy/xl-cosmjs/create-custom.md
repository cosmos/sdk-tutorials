---
title: Create custom CosmJs interfaces
order: 4
description: To work with your blockchain
tag: deep-dive
---

# Create custom CosmJs interfaces

CosmJs comes out of the box with interfaces that connect with the standard Cosmos modules such as `bank` and `gov`. Your own blockchain's modules are unique, so they need their own CosmJs interfaces. The process consists of several steps:

1. Creating the Protobuf objects and clients in Typescript.
2. Creating extensions that facilitate the use of the above clients.
3. Any further level of abstraction that you deem useful for integration.

The below assumes that you have a working Cosmos blockchain with its own module(s).

## Compiling the Protobuf objects and clients

You can choose which library you use to compile your Protobuf objects into Typescript or Javascript. Reproducing [what Starport](https://github.com/cosmos/cosmjs/blob/main/packages/stargate/CUSTOM_PROTOBUF_CODECS.md) or [`cosmjs-types`](https://github.com/confio/cosmjs-types/blob/main/scripts/codegen.sh) do is a good choice.

### Preparation

Let's assume that:

1. Your Protobuf definition files are in `./proto/myChain`.
2. And that you want to compile them into Typescript in `./client/src/types/generated`.

You need to install `protoc` and its Typescript plugin:

```sh
$ npm install ts-proto protoc --save-dev
```

You can confirm the version you received. The executable is actually slightly hidden in `./node_modules/protoc/protoc/bin/protoc`:

```sh
$ ./node_modules/protoc/protoc/bin/protoc --version
```

Which, at the time of writing returned:

```
libprotoc 3.11.2
```

Also create the target folder if it does not exist yet:

```sh
$ mkdir -p client/src/types/generated
```

### Getting third party files

With this done, you need to also get the imports that appear in your `.proto` files. For instance, typically in [`query.proto`](https://github.com/cosmos/cosmos-sdk/blob/d98503b/proto/cosmos/bank/v1beta1/query.proto#L4-L6) you can find:

```proto
import "cosmos/base/query/v1beta1/pagination.proto";
import "gogoproto/gogo.proto";
import "google/api/annotations.proto";
```

You need these files locally. How you get them does not matter as long as you get the right versions in the right locations. Pay particular attention to the Cosmos SDK's version of your project. You can obtain it with:

```sh
$ grep cosmos-sdk go.mod
```

Which can for instance return:

```
github.com/cosmos/cosmos-sdk v0.42.6
```

Use this version as a tag on Github. So one way to retrieve the [pagination file](https://github.com/cosmos/cosmos-sdk/blob/v0.42.6/proto/cosmos/base/query/v1beta1/pagination.proto) is with:

```sh
$ mkdir -p ./proto/cosmos/base/query/v1beta1/
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/proto/cosmos/base/query/v1beta1/pagination.proto -o ./proto/cosmos/base/query/v1beta1/pagination.proto
```

You can do the same for the others, found in the [`third_party` folder](https://github.com/cosmos/cosmos-sdk/tree/v0.42.6/third_party/proto) under the same version:

```sh
$ mkdir -p ./proto/google/api
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/third_party/proto/google/api/annotations.proto -o ./proto/google/api/annotations.proto
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/third_party/proto/google/api/http.proto -o ./proto/google/api/http.proto
$ mkdir -p ./proto/gogoproto
$ curl https://raw.githubusercontent.com/cosmos/cosmos-sdk/v0.42.6/third_party/proto/gogoproto/gogo.proto -o ./proto/gogoproto/gogo.proto
```

### Compilation

With that, you can now compile the Protobuf files. If you want to avoid adding all the `.proto` files manually to the command, you can use `xargs`, although this is a bit less CPU efficient:

```sh
$ ls ./proto/myChain | xargs -I {} ./node_modules/protoc/protoc/bin/protoc \
  --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
  --ts_proto_out="./client/src/types/generated" \
  --proto_path="./proto" \
  --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
  myChain/{}
```

Notice how `--proto_path` is only `./proto` so that your imports, such as `import "cosmos/base...` can be found.

When it finishes, you should see your files compiled into Typescript. They have been correctly filed under their respective folders and contain both types and services definitions. It also created the compiled versions of your third party imports.

### A note about the result

If your `tx.proto` file contained:

```protobuf [https://github.com/cosmos/cosmos-sdk/blob/v0.42.6/proto/cosmos/bank/v1beta1/tx.proto#L11-L17]
service Msg {
      rpc Send(MsgSend) returns (MsgSendResponse);
      //...
}
```

Then, in the compiled `tx.ts` file, you will find its service declaration:

```typescript [https://github.com/confio/cosmjs-types/blob/a14662d/src/cosmos/bank/v1beta1/tx.ts#L243-L248]
export interface Msg {
    Send(request: MsgSend): Promise<MsgSendResponse>;
    //...
}
```

And default implementation:

```typescript [https://github.com/confio/cosmjs-types/blob/a14662d/src/cosmos/bank/v1beta1/tx.ts#L250-L268]
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

1. `rpc: RPC` is an instance of a Protobuf RPC client that will be given to you by CosmJs. Although the interface appears to be [declared locally](https://github.com/confio/cosmjs-types/blob/a14662d/src/cosmos/bank/v1beta1/tx.ts#L270-L272), this is the same interface found [throughout CosmJs](https://github.com/cosmos/cosmjs/blob/bb92692/packages/stargate/src/queryclient/utils.ts#L35-L37). It will be given to you [on construction](https://github.com/cosmos/cosmjs/blob/bb92692/packages/stargate/src/queryclient/queryclient.ts). So, you need not worry about creating an implementation for it.
2. You can see `encode` and `decode` in action. Notice the `.finish()` that flushes the Protobuf writer buffer.
3. The `rpc.request` makes the calls that will be correctly understood by Protobuf compiled server on the other side.

You can find the same structure in [`query.ts`](https://github.com/confio/cosmjs-types/blob/a14662d/src/cosmos/bank/v1beta1/query.ts).

### Proper saving

You ought to commit the extra `.proto` files as well as the compiled ones to your repository so you don't need to recreate them.

In fact, take inspiration from `cosmjs-types` [`codegen.sh`](https://github.com/confio/cosmjs-types/tree/main/scripts):

1. Create a script file named `ts-proto.sh` with the command above.
2. Add an [npm run target](https://github.com/confio/cosmjs-types/blob/c64759a/package.json#L31) with it to keep a trace of how this was done and easily reproduce in the future when you update a Protobuf file.

## Add convenience with types

For convenience, ComsJs has created an interface to which all the created types happen to conform, [`TsProtoGeneratedType`](https://github.com/cosmos/cosmjs/blob/cda0819/packages/proto-signing/src/registry.ts#L12-L18), itself a sub-type of [`GeneratedType`](https://github.com/cosmos/cosmjs/blob/cda0819/packages/proto-signing/src/registry.ts#L32). In the same file, notice the definition:

```typescript [https://github.com/cosmos/cosmjs/blob/cda0819/packages/proto-signing/src/registry.ts#L54-L57]
export interface EncodeObject {
    readonly typeUrl: string;
    readonly value: any;
}
```

The `typeUrl` is the identifier by which Protobuf identifies the type of the data to serialize or deserialize. It is composed of the type's package and its name. For instance, if you have like [here](https://github.com/cosmos/cosmos-sdk/blob/3a1027c/proto/cosmos/bank/v1beta1/tx.proto):

```protobuf
package cosmos.bank.v1beta1;
//...
message MsgSend {
    //...
}
```

The `MsgSend`'s type URL is [`"/cosmos.bank.v1beta1.MsgSend"`](https://github.com/cosmos/cosmjs/blob/bb926925e1ad2e03414449ff31d0c914f91b8ac2/packages/stargate/src/modules/bank/messages.ts#L6).

Each of your types will be associated like this. If you prefer, you can declare each string as a constant value such as:

```typescript
export const msgSendTypeUrl = "/cosmos.bank.v1beta1.MsgSend";
```

A good path to add those would be side by side with `generated`, in `./client/src/types/modules`.

### For messages

Messages, sub-types of `Msg`, will be assembled into transactions that are then sent to Tendermint. CosmJs types already include types for [transactions](https://github.com/confio/cosmjs-types/blob/a14662d/src/cosmos/tx/v1beta1/tx.ts#L12-L26). These are assembled, signed and sent by CosmJs' [`SigningStargateClient`](https://github.com/cosmos/cosmjs/blob/fe34588/packages/stargate/src/signingstargateclient.ts#L276-L294). Thanks to this, there is minimal work left to do.

The `Msg` kind will also need to be added to a registry. To facilitate that, you should prepare them in a nested array like so:

```typescript [https://github.com/cosmos/cosmjs/blob/bb926925e1ad2e03414449ff31d0c914f91b8ac2/packages/stargate/src/modules/bank/messages.ts#L4-L7]
export const bankTypes: ReadonlyArray<[string, GeneratedType]> = [
    ["/cosmos.bank.v1beta1.MsgMultiSend", MsgMultiSend],
    ["/cosmos.bank.v1beta1.MsgSend", MsgSend],
];
```

While you are adding convenience to your types, add child types to `EncodeObject` like so:

```typescript [https://github.com/cosmos/cosmjs/blob/bb926925e1ad2e03414449ff31d0c914f91b8ac2/packages/stargate/src/modules/bank/messages.ts#L9-L12]
export interface MsgSendEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.bank.v1beta1.MsgSend";
    readonly value: Partial<MsgSend>;
}
```

Unfortunately, in the code above, you cannot reuse your `msgSendTypeUrl` because it is a value, not a type. You can add a type helper, which can come in handy in an `if else` situation:

```typescript [https://github.com/cosmos/cosmjs/blob/bb926925e1ad2e03414449ff31d0c914f91b8ac2/packages/stargate/src/modules/bank/messages.ts#L14-L16]
export function isMsgSendEncodeObject(encodeObject: EncodeObject): encodeObject is MsgSendEncodeObject {
    return (encodeObject as MsgSendEncodeObject).typeUrl === "/cosmos.bank.v1beta1.MsgSend";
}
```

### For queries

Unlike transactions which are sent to Tendermint, queries are sent to the application. For queries, there are altogether different types of calls. So, it makes sense to organize them in one place, called an extension. For example:

```typescript [https://github.com/cosmos/cosmjs/blob/902f21b/packages/stargate/src/modules/bank/queries.ts#L9-L18]
export interface BankExtension {
    readonly bank: {
        readonly balance: (address: string, denom: string) => Promise<Coin>;
        readonly allBalances: (address: string) => Promise<Coin[]>;
        //...
    };
}
```

Notice how there is a **key** `bank:` inside it. This will become important later on when you _add_ it to Stargate.

1. Create an extension interface for your module using function names and parameters that make sense in your case.
2. Make sure that the key is unique and does not overlap with any other modules of your application, unless you are certain that you really know what you are doing.
3. Then, create a factory for its implementation copying the [model here](https://github.com/cosmos/cosmjs/blob/902f21b/packages/stargate/src/modules/bank/queries.ts#L20-L59). For the implementation, of course, the [`QueryClientImpl`](https://github.com/cosmos/cosmjs/blob/902f21b/packages/stargate/src/modules/bank/queries.ts#L4) implementation has to come from your own compiled Protobuf query service.

## Integration with Stargate

`StargateClient` and `SigningStargateClient` are typically the ultimate abstractions that facilitate the querying and sending of transactions. You are now ready to add your own elements to them. The easiest way is for you to inherit from them and expose the extra functions you require.

If your extra functions map one for one with those of your own extension, then you might as well publicly expose the extension itself to minimize duplication in `StargateClient` and `SigningStargateClient`.

For example, if you have your `interface MyExtension` with a `myKey` key and you are creating `MyStargateClient`, it is as succinct as this:

```typescript
export class MyStargateClient extends StargateClient {
    public readonly myQueryClient: MyExtension | undefined

    public static async connect(endpoint: string): Promise<MyStargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint)
        return new MyStargateClient(tmClient)
    }

    protected constructor(tmClient: Tendermint34Client | undefined) {
        super(tmClient)
        if (tmClient) {
            this.myQueryClient = QueryClient.withExtensions(tmClient, setupMyExtension)
        }
    }
}
```

Then, for `MySigningStargateClient`:

```typescript
export class MySigningStargateClient extends SigningStargateClient {
    public readonly myQueryClient: MyExtension | undefined

    public static async connectWithSigner(
        endpoint: string,
        signer: OfflineSigner,
        options: SigningStargateClientOptions = {}
    ): Promise<MySigningStargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint)
        return new MySigningStargateClient(tmClient, signer, options)
    }

    protected constructor(tmClient: Tendermint34Client | undefined, signer: OfflineSigner, options: SigningStargateClientOptions) {
        super(tmClient, signer, options)
        if (tmClient) {
            this.myQueryClient = QueryClient.withExtensions(tmClient, setupMyExtension)
        }
    }
}
```

To which you _can_ add dedicated functions modeled on:

```typescript [https://github.com/cosmos/cosmjs/blob/fe34588/packages/stargate/src/signingstargateclient.ts#L176-L192]
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

## Conclusion

With this, you are ready to import and use the lot in a server script or a GUI.
