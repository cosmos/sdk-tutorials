---
title: "CosmJS"
order: 20
description: Understanding the TypeScript library for the Cosmos SDK
tag: deep-dive
---

# CosmJS

<HighlightBox type="synopsis">

CosmJS provides a TypeScript library for the Cosmos SDK. Reading the following sections as a preparation is recommended:

* [Messages](../2-main-concepts/messages.md)
* [Modules](../2-main-concepts/modules.md)
* [Queries](../2-main-concepts/queries.md)
* [Protobuf](../2-main-concepts/protobuf.md)
* [Ignite CLI](./ignitecli.md)

</HighlightBox>

[CosmJS](https://github.com/cosmos/cosmjs) is a library created to talk to the Cosmos SDK. It is a [powerful tool](https://github.com/cosmos/cosmjs/wiki/What-can-CosmJS-do-for-me%3F), which can be used to create wallets, explorers, IBC relayers, and other decentralized applications (dApps). It is written in TypeScript and can therefore be client or server side.

## Your chain

In the [checkers blockchain exercise](./ignitecli.md) you created a chain using Ignite CLI. Ignite CLI generated several components including a UI. Under the hood, this UI uses Vue.js and CosmJS to interact with the services exposed by the chain.

You used Ignite CLI to create the definitions for `MsgCreatePost` by running the command:

```sh
$ ignite scaffold message createPost title body
```

## Your module in the UI

Ignite CLI also created UI-side elements to facilitate integration, for example:

<CodeGroup>

<CodeGroupItem title="vue/src/store/generated/alice/checkers/alice.checkers.checkers/module/index.ts" active>

```typescript
import { StdFee } from "@cosmjs/launchpad";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Registry, OfflineSigner, EncodeObject, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { Api } from "./rest";
import { MsgCreatePost } from "./types/checkers/tx";


const types = [
  ["/alice.checkers.checkers.MsgCreatePost", MsgCreatePost],

];
export const MissingWalletError = new Error("wallet is required");

const registry = new Registry(<any>types);

const defaultFee = {
  amount: [],
  gas: "200000",
};

interface TxClientOptions {
  addr: string
}

interface SignAndBroadcastOptions {
  fee: StdFee,
  memo?: string
}

const txClient = async (wallet: OfflineSigner, { addr: addr }: TxClientOptions = { addr: "http://localhost:26657" }) => {
  if (!wallet) throw MissingWalletError;

  const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
  const { address } = (await wallet.getAccounts())[0];

  return {
    signAndBroadcast: (msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions = {fee: defaultFee, memo: ""}) => client.signAndBroadcast(address, msgs, fee,memo),
    msgCreatePost: (data: MsgCreatePost): EncodeObject => ({ typeUrl: "/alice.checkers.checkers.MsgCreatePost", value: data }),

  };
};

interface QueryClientOptions {
  addr: string
}

const queryClient = async ({ addr: addr }: QueryClientOptions = { addr: "http://localhost:1317" }) => {
  return new Api({ baseUrl: addr });
};

export {
  txClient,
  queryClient,
};
```

</CodeGroupItem>

<CodeGroupItem title="index.js">

```javascript
import { SigningStargateClient } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
import { Api } from "./rest";
import { MsgCreatePost } from "./types/checkers/tx";
const types = [
    ["/alice.checkers.checkers.MsgCreatePost", MsgCreatePost],
];
export const MissingWalletError = new Error("wallet is required");
const registry = new Registry(types);
const defaultFee = {
    amount: [],
    gas: "200000",
};
const txClient = async (wallet, { addr: addr } = { addr: "http://localhost:26657" }) => {
    if (!wallet)
        throw MissingWalletError;
    const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
    const { address } = (await wallet.getAccounts())[0];
    return {
        signAndBroadcast: (msgs, { fee, memo } = { fee: defaultFee, memo: "" }) => client.signAndBroadcast(address, msgs, fee, memo),
        msgCreatePost: (data) => ({ typeUrl: "/alice.checkers.checkers.MsgCreatePost", value: data }),
    };
};
const queryClient = async ({ addr: addr } = { addr: "http://localhost:1317" }) => {
    return new Api({ baseUrl: addr });
};
export { txClient, queryClient, };
```

</CodeGroupItem>

</CodeGroup>

In this file your module's client-side services are defined.

What does that code do?

1. It starts by importing `@cosmjs/stargate`, which is the client library for Cosmos SDK 0.40, and the following versions named Stargate.
2. Then it imports `@cosmjs/proto-signing` which encapsulates knowledge on how to sign `Msg` objects created with Protobuf. Lower down, it adds your `MsgCreatePost` type to the registry in this case.
3. Mirroring your Go code, your message type `MsgCreatePost` is defined in `[...]]alice.checkers.checkers/module/types/checkers/tx.js` using [Protobuf.js](https://protobufjs.github.io/protobuf.js/). This is the TypeScript/&ZeroWidthSpace;JavaScript counterpart of Protobuf in Go - that you saw earlier. With this both ends _speak the same serialization language_.
4. `http://localhost:26657` is the default Tendermint RPC node endpoint used to send transactions. And is indeed passed here only as a default value if it is missing.
5. `http://localhost:1317` is the default high-level blockchain API endpoint. In the above code it is used for queries.
6. The created elements `txClient` and `queryClient` are returned to be used in `./vue/src/store/generated/alice/checkers/alice.checkers.checkers/index.js` as you can see in the [previous Ignite CLI section](./ignitecli.md).

## Details on the client

In the nested function above you can see that `@cosmjs/stargate` is used for signing and broadcasting:

<CodeGroup>

<CodeGroupItem title="index.ts" active>

```javascript
const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
const { address } = (await wallet.getAccounts())[0];
return {
  signAndBroadcast: (msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions = {fee: defaultFee, memo: ""}) => client.signAndBroadcast(address, msgs, fee,memo),
  msgCreatePost: (data: MsgCreatePost): EncodeObject => ({ typeUrl: "/alice.checkers.checkers.MsgCreatePost", value: data }),
};
```

</CodeGroupItem>

<CodeGroupItem title="index.js" active>

```javascript
const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
const { address } = (await wallet.getAccounts())[0];
return {
    signAndBroadcast: (msgs, { fee, memo } = { fee: defaultFee, memo: "" }) => client.signAndBroadcast(address, msgs, fee, memo),
    msgCreatePost: (data) => ({ typeUrl: "/alice.checkers.checkers.MsgCreatePost", value: data }),
};
```

</CodeGroupItem>

</CodeGroup>

The following is taking place:

1. `SigningStargateClient.connectWithSigner` is a way to connect with a wallet and obtain a signing client. The `addr` is passed so that it can be used as part of the information prompted to the user when confirming if an external wallet is used.
2. An object with two functions is returned: `msgCreatePost` and `signAndBroadcast`.
3. `signAndBroadcast` is called when the UI finishes creating the message and is about to sign and broadcast the message. If using an external wallet, the wallet prompts the user to confirm the signing.

`@cosmjs/proto-signing` provides `DirectSecp256k1HdWallet` as a wallet. You cannot see it in the code above because it is wrapped through [Ignite CLI and Vue](https://github.com/tendermint/vue/blob/develop/packages/vuex/src/modules/common/wallet/wallet.js).

If you want to use a specific mnemonic, for instance on a server, instead of importing an external wallet via the UI, you can do so with:

```javascript
const mnemonic =
  "ivory uniform actual spot floor vessel monster rose yellow noise smile odor veteran human reason miss stadium phrase assault puzzle sentence approve coral apology";
const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
```

There are many other useful methods like `assertIsBroadcastTxSuccess` that verifies whether the transaction was successful or not, as used in [this sample snippet](https://gist.github.com/webmaster128/8444d42a7eceeda2544c8a59fbd7e1d9).


## Next up

Ready for the [final section](./cosmwasm.md) of this course? Discover CosmWasm and multi-chain smart contracting.
