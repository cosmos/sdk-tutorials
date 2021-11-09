# CosmJS

[CosmJS](https://github.com/cosmos/cosmjs) is a TypeScript library for the Cosmos SDK. It is a [powerful tool](https://github.com/cosmos/cosmjs/wiki/What-can-CosmJS-do-for-me%3F), which can be used to create wallets, explorers, IBC relayers, and other dApps. It is written in TypeScript and therefore, it can be used on the client or server side.

In this section, you will observe the generated code by Starport to understand the basics of the CosmJS library.

## Chain

In the previous section on Starport, you created a chain with Starport. Starport generated several components, including a UI. The UI uses Vue and CosmJS to interact with the chain.

Remember that Starport creates the definitions for `MsgCreatePost` after running:

```bash
$ starport scaffold message createPost title body
```

In `starport/chain/vue/src/store/generated/alice/chain/alice.chain.chain/module/index.js`, you will find:

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

It starts by importing `@cosmjs/stargate`, which is the client library for Cosmos SDK 0.40, 0.41, and 0.42 (Stargate). In addition, `@cosmjs/proto-signing` is used to add the type `MsgCreatePost` to the registry. The message type `MsgCreatePost` is defined in `starport/chain/vue/src/store/generated/alice/chain/alice.chain.chain/module/types/chain/tx.js` using [protobuf.js](https://protobufjs.github.io/protobuf.js/).

`http://localhost:26657` is the Tendermint RPC node address, and it is used to send the transactions.
`http://localhost:1317` is the high-level blockchain API. In the above code, it is used for queries.

Above, you can see that `@cosmjs/stargate` is used for signing and broadcasting:

```javascript
    const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
    const { address } = (await wallet.getAccounts())[0];
    return {
        signAndBroadcast: (msgs, { fee, memo } = { fee: defaultFee, memo: "" }) => client.signAndBroadcast(address, msgs, fee, memo),
        msgCreatePost: (data) => ({ typeUrl: "/alice.chain.chain.MsgCreatePost", value: data }),
```

Notice that `@cosmjs/proto-signing` provides `DirectSecp256k1HdWallet` as a wallet. You cannot see it in the code above because it is wrapped through [Starport and Vue](https://github.com/tendermint/vue/blob/develop/packages/vuex/src/modules/common/wallet/wallet.js). If you want to use a specific mnemonic instead of importing a wallet via the UI, you can do so with:

```javascript
const mnemonic =
  "ivory uniform actual spot floor vessel monster rose yellow noise smile odor veteran human reason miss stadium phrase assault puzzle sentence approve coral apology";
const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
```

You can also find other useful methods like `assertIsBroadcastTxSuccess` in the [sample snippet](https://gist.github.com/webmaster128/8444d42a7eceeda2544c8a59fbd7e1d9), which will notice if the transaction was successful or not.

At the end, `txClient` and `queryClient` are exported so they can be used in `starport/chain/vue/src/store/generated/alice/chain/alice.chain.chain/index.js`, as you could see in the previous Starport section.
