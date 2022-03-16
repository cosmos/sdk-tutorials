---
title: Create custom CosmJs interfaces
order: 4
description: To work with your blockchain
tag: deep-dive
---

# Create custom CosmJs interfaces

CosmJs comes out of the box with interfaces that connect with the standard Cosmos modules such as `bank` and `gov`. But because your blockchain's own modules are specific, they need to have their own CosmJs interfaces. The process consists of several steps:

1. Creating the Protobuf objects and clients in Typescript.
2. Creating extensions that facilitate the use of the above clients.
3. Any further level of abstraction that you deem useful for integration.

## Compiling the Protobuf objects and clients

You can choose which library you use to compile your Protobuf objects into Typescript or Javascript. Reproducing [what Starport](https://github.com/cosmos/cosmjs/blob/main/packages/stargate/CUSTOM_PROTOBUF_CODECS.md) or [`cosmjs-types`](https://github.com/confio/cosmjs-types/blob/main/scripts/codegen.sh) do is a good choice.

### Preparation

Let's assume that:

1. Your Protobuf definition files are in `./proto/checkers`.
2. And that you want to compile them into Typescript in `./client/src/types/generated`.

You need to install `protoc` and its Typescript plugin:

```sh
$ npm install ts-proto protoc --save-dev
```

You can confirm the version you get. The executable is actually a bit hidden in `./node_modules/protoc/protoc/bin/protoc`:

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

Unfortunately, you need these files locally. How you get them does not matter as long as you get the right versions in the right locations. Pay particular attention to Cosmos SDK's version. You can obtain it with:

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
$ ls ./proto/checkers | xargs -I {} ./node_modules/protoc/protoc/bin/protoc \
  --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
  --ts_proto_out="./client/src/types/generated" \
  --proto_path="./proto" \
  --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=messages" \
  checkers/{}
```

Notice how `--proto_path` is only `./proto` so that your imports like `import "cosmos/base...` can be found.

When it's done, you should see your files compiled into Typescript. They have been correctly filed under their respective folders and contain both types and services definitions. It also created the compiled versions of your third party imports.

### Proper saving

You ought to commit the extra `.proto` files as well as the compiled ones to your repository so you don't need to redo it.

In fact, take inspiration from `cosmjs-types` [`codegen.sh`](https://github.com/confio/cosmjs-types/tree/main/scripts):

1. Create a script file named `ts-proto.sh` with the command above.
2. Add an [npm run target](https://github.com/confio/cosmjs-types/blob/c64759a/package.json#L31) with it to keep a trace of how this was done and easily reproduce in the future when you update a Protobuf file.
