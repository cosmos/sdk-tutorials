# CosmJS

[CosmJS](https://github.com/cosmos/cosmjs) is a TypeScript library for the Cosmos SDK. It is a [powerful tool](https://github.com/cosmos/cosmjs/wiki/What-can-CosmJS-do-for-me%3F), which can be used to create wallets, explorers, IBC relayers, and other dApps. It is written in TypeScript and therefore, can be used on the client or server side.

In this section, you will have a look at the generated code by Starport to understand the basics of the CosmJS library.

## Your Chain

In the previous section, about Starport, you created a chain with it. Starport generated several components, including a UI. The UI uses Vue and CosmJS to interact with the chain.

Recall how you used Starport to create the definitions for `MsgCreatePost` by running the command:

```sh
$ starport scaffold message createPost title body
```

## Your Module in UI

With that, Starport also created UI-side elements to facilitate integration. To have a look at one, open `./vue/src/store/generated/alice/chain/alice.chain.chain/module/index.js`, where you find:

```javascript
// THIS FILE IS GENERATED AUTOMATICALLY. DO NOT MODIFY.
import { SigningStargateClient } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
import { Api } from "./rest";
import { MsgCreatePost } from "./types/chain/tx";
const types = [
    ["/alice.chain.chain.MsgCreatePost", MsgCreatePost],
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
        msgCreatePost: (data) => ({ typeUrl: "/alice.chain.chain.MsgCreatePost", value: data }),
    };
};
const queryClient = async ({ addr: addr } = { addr: "http://localhost:1317" }) => {
    return new Api({ baseUrl: addr });
};
export { txClient, queryClient, };
```
This file is where your module's client-side services are defined. Let's review the actions that are taking place here.

1. It starts by importing `@cosmjs/stargate`, which is the client library for Cosmos SDK 0.40 and the following versions (named Stargate).
2. Next, it imports `@cosmjs/proto-signing`, which encapsulates knowledge about how to sign `Msg` objects created with Protobuf. In this case, it added your `MsgCreatePost` type to the registry.
3. Further, in a mirror of your Go code, your message type `MsgCreatePost` is defined in `./vue/src/store/generated/alice/chain/alice.chain.chain/module/types/chain/tx.js` using [protobuf.js](https://protobufjs.github.io/protobuf.js/). This is the Typescript / Javascript counterpart of Protobuf in Go that you saw earlier. With this, both ends _speak the same serialization language_.
4. `http://localhost:26657` is the default Tendermint RPC node end point used to send transactions.
5. `http://localhost:1317` is the default high-level blockchain API end point. In the above code, it is used for queries.
6. These created elements, `txClient` and `queryClient`, are then returned to be part of a bigger whole, namely to be used in `./vue/src/store/generated/alice/chain/alice.chain.chain/index.js`, as you could see in the previous Starport section.

## Detail About The Client

Above, in the nested function, you can see that `@cosmjs/stargate` is used for signing and broadcasting. Have a closer look at its inner part:

```javascript
const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
const { address } = (await wallet.getAccounts())[0];
return {
    signAndBroadcast: (msgs, { fee, memo } = { fee: defaultFee, memo: "" }) => client.signAndBroadcast(address, msgs, fee, memo),
    msgCreatePost: (data) => ({ typeUrl: "/alice.chain.chain.MsgCreatePost", value: data }),
    ...
}
```
What is going on:

1. `SigningStargateClient.connectWithSigner`, as its name suggests, is a way to connect with a wallet and obtain a signing client. The `addr` is passed so that it can be used as part of the information prompted to the user, when confirming  if using an external wallet.
2. What is returned is an object with 2 functions: `msgCreatePost` and `signAndBroadcast`.
3. As expected, `signAndBroadcast` is called when the UI has finished creating the message and is about to sign and broadcast the message. If using an external wallet, it is at this point that the wallet prompts the user to confirm the signing.

Of note is that `@cosmjs/proto-signing` provides `DirectSecp256k1HdWallet` as a wallet. You cannot see it in the code above because it is wrapped through [Starport and Vue](https://github.com/tendermint/vue/blob/develop/packages/vuex/src/modules/common/wallet/wallet.js). If you want to use a specific mnemonic instead of importing an external wallet via the UI, you can do so with:

```javascript
const mnemonic =
  "ivory uniform actual spot floor vessel monster rose yellow noise smile odor veteran human reason miss stadium phrase assault puzzle sentence approve coral apology";
const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
```
You can also find other useful methods like `assertIsBroadcastTxSuccess` as used in [this sample snippet](https://gist.github.com/webmaster128/8444d42a7eceeda2544c8a59fbd7e1d9), which verifies whether the transaction was successful or not.
