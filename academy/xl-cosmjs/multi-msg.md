---
title: "Send Multiple Messages"
order: 3
description: Send multiple tokens and messages through CosmJs
tag: deep-dive
---

# Send Multiple Messages

## Send multiple tokens using `sendTokens`

In the [previous exercise](./first-steps.md), you had Alice send tokens back to the faucet. To refresh your memory, here is the function's signature:

```typescript [https://github.com/cosmos/cosmjs/blob/7aad551/packages/stargate/src/signingstargateclient.ts#L217-L223]
public async sendTokens(
    senderAddress: string,
    recipientAddress: string,
    amount: readonly Coin[],
    fee: StdFee | "auto" | number,
    memo = "",
): Promise<DeliverTxResponse>;
```

`Coin[]` is convenient in that Alice can send to the faucet not just `stake`, but also any number of other coins as long as she owns them. So she can:

<CodeGroup>
<CodeGroupItem title="Send one token type" active>

```typescript
const result = await signingClient.sendTokens(
    alice,
    faucet,
    [
        {
            denom: "stake",
            amount: "10000000",
        },
    ],
    "auto",
)
```

</CodeGroupItem>
<CodeGroupItem title="Send two token types">

```typescript
const result = await signingClient.sendTokens(
    alice,
    faucet,
    [
        {
            denom: "stake",
            amount: "10000000",
        },
        {
            denom: "token",
            amount: "12",
        },
    ],
    "auto",
)
```

</CodeGroupItem>
</CodeGroup>

However, there is **one limitation** here. Alice can only target a single recipient per transaction. If she wants to send tokens to multiple recipients, then she needs to create as many transactions as there are recipients.

Doing so costs gas because each transaction costs a bit extra in overhead. The **second limitation** is that doing separate transfers is not atomic. I.e. it could be that Alice wants to send tokens to two recipients but they have to both receive them or none of them receive anything.

Fortunately, there is a way to atomically send tokens to multiple recipients.

## Introducing `signAndBroadcast`

`SigningStargateClient` has this `signAndBroadcast` function:

```typescript [https://github.com/cosmos/cosmjs/blob/7aad551/packages/stargate/src/signingstargateclient.ts#L317-L322]
public async signAndBroadcast(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee | "auto" | number,
    memo = "",
): Promise<DeliverTxResponse>;
```

[Cosmos transactions](../2-main-concepts/transactions.md) are indeed composed of multiple [messages](../2-main-concepts/messages.md). This function does not invent anything, it merely surfaces this detail.

## Token transfer messages

In order to use `signAndBroadcast` to send tokens, you need to figure out what messages go into `messages: readonly EncodeObject[]`. For that, refer to the `sendTokens` function body itself:

```typescript [https://github.com/cosmos/cosmjs/blob/7aad551/packages/stargate/src/signingstargateclient.ts#L224-L232]
const sendMsg: MsgSendEncodeObject = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: senderAddress,
      toAddress: recipientAddress,
      amount: [...amount],
    },
  };
return this.signAndBroadcast(senderAddress, [sendMsg], fee, memo);
```

So, when sending back to the faucet, Alice could have instead called:

```typescript
const result = await signingClient.signAndBroadcast(
    alice,
    [
        {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
                fromAddress: alice,
                toAddress: faucet,
                amount: [
                    {
                        denom: "stake",
                        amount: "10000000",
                    },
                ],
            },
          },
    ],
    "auto",
)
```

You can confirm this in your `experiment.ts` from the previous section.

From here, it is a simple step to add an extra message for a token transfer from Alice to Bob:

```typescript
const result = await signingClient.signAndBroadcast(
    alice,
    [
        {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
                fromAddress: alice,
                toAddress: faucet,
                amount: [
                    {
                        denom: "stake",
                        amount: "10000000",
                    },
                ],
            },
          },
        {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
                fromAddress: alice,
                toAddress: bob,
                amount: [
                    {
                        denom: "token",
                        amount: "10",
                    },
                ],
            },
          },
    ],
    "auto",
)
```

<HighlightBox type="tip">

Notice how the structure of the message hints at the fact that Alice can transfer other people's tokens, by putting `fromAddress: notAlice`. Of course, the transaction will be accepted if and only if this `notAlice` address has authorized Alice to spend its tokens. See the section on the Cosmos SDK `authz` module.

</HighlightBox>

## Mixing other message types

The above example shows you two token-transfer messages in a single transaction. Neither Cosmos nor CosmJs limit you to messages of the same type. You can decide to have other message types along a token transfer. For instance, Alice could in one transaction:

1. Send tokens to the faucet.
2. Delegate some of her tokens to Bob the validator.

How would Alice create the second message? Head to the types table, and find your message type:

```typescript [https://github.com/cosmos/cosmjs/blob/7aad551/packages/stargate/src/signingstargateclient.ts#L94]
    ["/cosmos.staking.v1beta1.MsgDelegate", MsgDelegate],
```

Clicking through to the type definition, you land at the `cosmjs-types` repository:

```typescript [https://github.com/confio/cosmjs-types/blob/a14662d/src/cosmos/staking/v1beta1/tx.ts#L46-L50]
export interface MsgDelegate {
    delegatorAddress: string;
    validatorAddress: string;
    amount?: Coin;
}
```

With this information, the transaction Alice sends is:

```typescript
const result = await signingClient.signAndBroadcast(
    alice,
    [
        {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
                fromAddress: alice,
                toAddress: faucet,
                amount: [
                    {
                        denom: "stake",
                        amount: "10000000",
                    },
                ],
            },
        },
        {
            typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
            value: {
                delegatorAddress: alice,
                validatorAddress: bob,
                amount: {
                    denom: "stake",
                    amount: "1000",
                },
            },
          },
    ],
    "auto",
)
```

For the avoidance of doubt, you can put more than two messages in a single transaction, as long as your raw transaction has fewer bytes than the limit.

When you create your own message types in CosmJs, they have to follow this format and be declared in the same fashion.

## What is this long string?

A note on the `"/cosmos.bank.v1beta1.MsgSend"` string. It comes from Protobuf. It is a concatenation of:

1. The `package` where `MsgSend` is initially declared:

    ```protobuf [https://github.com/cosmos/cosmos-sdk/blob/3a1027c/proto/cosmos/bank/v1beta1/tx.proto#L2]
    package cosmos.bank.v1beta1;
    ```
2. And the name of the message itself, `MsgSend`:

    ```protobuf [https://github.com/cosmos/cosmos-sdk/blob/3a1027c/proto/cosmos/bank/v1beta1/tx.proto#L22]
    message MsgSend {
        ...
    }
    ```

The same object has been named `MsgSend` in `cosmjs-types` too, but this is to make it easy for you, the developer, to understand what this represents. Under the hood, Protobuf knows how to serialize it only because this `"/cosmos.bank.v1beta1.MsgSend"` string is passed along.
