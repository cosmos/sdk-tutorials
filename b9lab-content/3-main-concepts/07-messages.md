---
title: "Messages"
order: 5
description: Introduction to MsgService and the flow of messages
tag: deep-dive
---

# Messages

<HighlightBox type="prereq">

In this section, you will take a closer look at messages, `Msg`. It is recommended to take a look at the following previous sections to better understand messages:

* [A Blockchain App Architecture](./02-architecture.md)
* [Accounts](./04-accounts.md)
* [Transactions](./05-transactions.md)

At the end of the section you can find a code example illustrating message creation and the inclusion of messages in transactions for our checkers blockchain.

Understanding `Msg` will help you prepare for the [next section on modules in the Cosmos SDK](./08-modules.md) as messages are a primary object handled by modules.

</HighlightBox>

Messages are one of two primary objects handled by a module in the Cosmos SDK. The other primary object handled by modules is queries. While messages inform the state and have the potential to alter it, queries inspect the module state and are always read-only.

In the Cosmos SDK, a **transaction** contains **one or more messages**. After the transaction is included in a block by the consensus layer, the module processes the messages.

<ExpansionPanel title="Signing a message">

Remember from the [last section on transactions](./05-transactions.md) that transactions must be signed before a validator includes them in a block. Every message in a transaction must be signed by the addresses as specified by `GetSigners`.

The Cosmos SDK currently allows signing transactions with either `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON`.

When an account signs a message it signs an array of bytes. This array of bytes is the outcome of serializing the message. For the signature to be verifiable at a later date, this conversion needs to be deterministic. For this reason, you define a canonical bytes representation of the message, typically with the parameters ordered alphabetically.

</ExpansionPanel>

## Messages and the transaction lifecycle

Transactions containing one or more valid messages are serialized and confirmed by the Tendermint consensus engine. As you might recall, Tendermint is agnostic to the transaction interpretation, and has absolute finality. So, when a transaction is included in a block, it is confirmed and finalized with no possibility of chain re-organization or cancellation.

The confirmed transaction is relayed to the Cosmos SDK application for interpretation. Each message is routed to the appropriate module via `BaseApp`’s `MsgServiceRouter`. `BaseApp` decodes each message contained in the transaction. Each module has its own `MsgService` that processes each received message.

## `MsgService`

Although it is technically feasible to create a novel `MsgService`, the recommended approach is to define a Protobuf `Msg` service. Each module will have exactly one Protobuf `Msg` service defined in `tx.proto` and there is an RPC service method for each message type in the module. The Protobuf message service implicitly defines the interface layer of the state mutating processes contained within the module.

How does all of this translate into code? Here's an example `MsgService` from the [bank module](https://docs.cosmos.network/master/modules/bank/):

```protobuf
// Msg defines the bank Msg service.
service Msg {
  // Send defines a method for sending coins from one account to another account.
  rpc Send(MsgSend) returns (MsgSendResponse);

  // MultiSend defines a method for sending coins from some accounts to other accounts.
  rpc MultiSend(MsgMultiSend) returns (MsgMultiSendResponse);
}
```

In the above example, we can see that:

* Each `Msg` service method has exactly **one argument**, such as `MsgSend`, which must implement the `sdk.Msg` interface and a Protobuf response.
* The **standard naming convention** is to call the RPC argument `Msg<service-rpc-name>` and the RPC response `Msg<service-rpc-name>Response`.

## Client and server code generation

The Cosmos SDK uses Protobuf definitions to generate client and server code:

* The `MsgServer` interface defines the server API for the `Msg` service. Its implementation is described in the [`Msg` services documentation](https://docs.cosmos.network/master/building-modules/msg-services.html).
* Structures are generated for all RPC requests and response types.

<HighlightBox type="tip">

If you want to dive deeper when it comes to messages, the `Msg` service and modules take a look at:

* The Cosmos SDK documentation on [`Msg` service](https://docs.cosmos.network/master/building-modules/msg-services.html)
* The Cosmos SDK documentation on messages and queries addressing how to define messages using `Msg` services - [Amino `LegacyMsg`](https://docs.cosmos.network/master/building-modules/messages-and-queries.html#legacy-amino-legacymsgs)

</HighlightBox>

## Next up

Have a look at the code example below to get a better sense of how the above translates in development. If you feel ready to dive into the next main concept of the Cosmos SDK, you can head straight to the [next section](./08-modules.md) to learn more about modules.


<ExpansionPanel title="Show me some code for my checkers blockchain - Including messages">

In our [previous](../3-main-concepts/02-architecture.md) code examples, the ABCI application was aware of a single transaction type: that of a checkers move with four `int` values. With multiple games, this is no longer sufficient. Additionally, you will need to conform to the SDK's way of handling `Tx`, which means **creating messages that are then included in a transaction**.

## What you need

Let's begin by describing the messages you need for your checkers application to have a solid starting point before diving into the code:

1. In the former _Play_ transaction, your four integers need to move from the transaction to an `sdk.Msg`, wrapped in said transaction. Four flat `int` values are no longer sufficient as you need to follow the `sdk.Msg` interface, identify the game for which a move is meant, and distinguish a move message from other message types.
2. You will need to add a message type for creating a new game. When this is done, a player can create a new game and this new game will mention the other players. A generated ID identifies this newly created game and is returned to the message creator.
3. You will also have to allow the other player to reject the new game, which helps to clear the state of stale, un-started games.

## How to proceed

Now, let's have a closer look at the messages around the **game creation**.

1. The message itself is structured like this:

    ```go
    type MsgCreateGame struct {
        Creator string
        Red     string
        Black   string
    }
    ```

Where `Creator` contains the address of the message signer.

2. The corresponding response message would then be:

    ```go
    type MsgCreateGameResponse struct {
        IdValue string
    }
    ```

With the messages defined, you will need to declare how the message should be handled. This involves:

1. Describing how the messages are serialized.
2. Writing the code that handles the message and places the new game in the storage.
3. Putting hooks and callbacks at the right places in the general message handling.

Fortunately **Starport** can assist you by creating a boilerplate for message serialization and correct hook and callback implementation (points 1 and 3).

<HighlightBox type="tip">

If you want to go beyond these out-of-context code samples and understand in more detail how all this should be defined, head to the chapter [My Own Chain](../5-my-own-chain/01-index.md).


</HighlightBox>

Starport can also help you create the `MsgCreateGame` and `MsgCreateGameResponse` objects with the following command:

```sh
$ starport scaffold message createGame red black --module checkers --response idValue
```

<HighlightBox type="info">

Starport creates several other files. For details and to guide you on how to make additions to existing files see the [My Own Chain chapter](../5-my-own-chain/01-index.md).

</HighlightBox>

### A sample of things Starport took care of

Starport significantly reduces the amount of work a developer has to do to build an application with the Cosmos SDK. Among others, it assists with:

1. Getting the signer, the `Creator`, of your message:

    ```go
    func (msg *MsgCreateGame) GetSigners() []sdk.AccAddress {
        creator, err := sdk.AccAddressFromBech32(msg.Creator)
        if err != nil {
           panic(err)
       }
       return []sdk.AccAddress{creator}
    }
    ```

Where `GetSigners` is a requirement of [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/1dba673/types/tx_msg.go#L21).

2. Making sure the message's bytes to sign are deterministic:

    ```go
    func (msg *MsgCreateGame) GetSignBytes() []byte {
        bz := ModuleCdc.MustMarshalJSON(msg)
        return sdk.MustSortJSON(bz)
    }
    ```

3. Adding a callback for your new message type in your module's message handler `x/checkers/handler.go`:

    ```go
    ...
    switch msg := msg.(type) {
        ...
        case *types.MsgCreateGame:
            res, err := msgServer.CreateGame(sdk.WrapSDKContext(ctx), msg)
            return sdk.WrapServiceResult(ctx, res, err)
        ...
    }
    ```

4. Creating an empty shell of a file (`x/checkers/keeper/msg_server_create_game.go`) for you to include your code, and the response message:

    ```go
    func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgCreateGameResponse{}, nil
    }
    ```

## What is left to do?

Your work is mostly done. Still, you will want to create the specific game creation code to replace `// TODO: Handling the message`. For this, you will need to:

1. Decide on how to create a new and unique game ID: `newIndex`. 

<HighlightBox type="tip">

For more details and to avoid diving too deep in this section, see [My Own Chain](../5-my-own-chain/01-index.md).

</HighlightBox>

2. Extract and verify addresses, such as:

    ```go
    red, err := sdk.AccAddressFromBech32(msg.Red)
    if err != nil {
        return nil, errors.New("invalid address for red")
    }
    ```

3. Create a game object with all required parameters - see the [modules section](./08-modules) for the declaration of this object:

    ```go
    storedGame := {
        Creator:   creator,
        Index:     newIndex,
        Game:      rules.New().String(),
        Red:       red,
        Black:     black,
    }
    ```

4. Send it to storage - see the [modules section](../3-main-concepts/08-modules.md) for the declaration of this function:

    ```go
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

5. And finally, return the expected message:

    ```go
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

Keep in mind:

* If you encounter an internal error, you should `panic("This situation should not happen")`.
* If you encounter a user or _regular_ error (like not having enough funds), you should return a regular `error`.

## Other messages

You can also implement other messages. Without repeating all of the above, you can include:

1. The **play message** to implicitly accept the challenge when playing for the first time. If you create it with Starport, use:

    ```sh
    $ starport scaffold message playMove idValue fromX:uint fromY:uint toX:uint toY:uint --module checkers --response idValue
    ```

    Which generates (among others) the object files, callbacks, and a new file for you to include your code in:

    ```go
    func (k msgServer) PlayMove(goCtx context.Context, msg *types.MsgPlayMove) (*types.MsgPlayMoveResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgPlayMoveResponse{}, nil
    }
    ```

2. The **reject message**, which is only valid if the player never played any moves in this game. Again, if you create it with Starport:

    ```sh
    $ starport scaffold message rejectGame idValue --module checkers
    ```

    It generates, among others:

    ```go
    func (k msgServer) RejectGame(goCtx context.Context, msg *types.MsgRejectGame) (*types.MsgRejectGameResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgRejectGameResponse{}, nil
    }
    ```

## Other considerations

You can already begin contemplating game-theoretical situations for your checkers application. After all, a game involves two parties/players and they may not always play nice.

What would happen if one of the two players has accepted the game by playing, but the other player has neither accepted nor rejected the game? You can address this scenario by:

* Having a timeout after which the game is canceled. This cancelation could be handled automatically in ABCI's `EndBlock`, without any of the players having to trigger the cancelation.
* Keeping an index as a First-In-First-Out (FIFO) list or a list of un-started games ordered by their cancelation time so the automatic trigger does not consume too many resources.

What would happen if the player never shows up or never sends a valid transaction? To ensure functionality for your checkers application consider:

* Having a timeout after which the game is forfeited. You could also automatically charge the forgetful player, if and when you implement a wager system.
* Keeping an index of games that could be forfeited. If both timeouts are the same, you can keep a single FIFO list of games, so you can clear them from the top of the list as necessary.

In general terms, you could add `timeout: Timestamp` to your `StoredGame` and update it every time something changes in the game. You can decide on a maximum delay: what about one day?

If you'd like to get started on building your own checkers game, you can head straight to the main excercise in [My Own Chain](../5-my-own-chain/01-index.md).

</ExpansionPanel>
