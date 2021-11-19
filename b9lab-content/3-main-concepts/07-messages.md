# Messages

Messages are one of two primary objects handled by a module in the Cosmos SDK. The other is queries. As you might expect, queries inspect the module state and are always read-only, and messages inform the state and have the potential to alter the state, also known as state mutating.

In Cosmos, a transaction contains one or more messages for the module to process after the transaction is included in a block by the consensus layer.

<HighlightBox type=”info”>

When an account signs a message, it in effect signs an array of bytes. This array of bytes is the result of a serialization from the message itself, therefore, this conversion needs to be deterministic for the signature to be verifiable at a later date. This is why you define a canonical bytes representation of the message, typically with the parameters ordered alphabetically.

</HighlightBox>

## Flow

Transactions containing one or more valid messages are serialized and confirmed by the Tendermint consensus. Recall that Tendermint is agnostic about interpretation of the transactions. When a transaction is included in a block, it is confirmed and finalized with no possibility of chain reorganization or cancellation.

The confirmed transaction is passed to the Cosmos SDK for interpretation. The `BaseApp` you use to begin module development of your custom modules attends to the first stages of interpretation. It decodes each message contained in the transaction.

Each message is routed to the appropriate module via `BaseApp`’s `MsgServiceRouter`. Each module has its own `MsgService` that processes each received message.

## MsgService

Although it is technically feasible to proceed to create a novel `MsgService`, the recommended approach is to define a Protobuf `Msg` service. Each module will have exactly one Protobuf `Msg` service defined in `tx.proto` and there will be a RPC service method for each message type in the module. Implicitly, the ProtoBuf message service defines the interface layer of the state mutating processes contained within the module.

Example MsgService:

```protobuf
// Msg defines the bank Msg service.
service Msg {
  // Send defines a method for sending coins from one account to another account.
  rpc Send(MsgSend) returns (MsgSendResponse);

  // MultiSend defines a method for sending coins from some accounts to other accounts.
  rpc MultiSend(MsgMultiSend) returns (MsgMultiSendResponse);
}
```

In the example above we can see that:

* Each `Msg` service method has exactly one argument, such as `MsgSend`, which must implement the `sdk.Msg` interface and a Protobuf response.
* The standard naming convention is to call the RPC argument `Msg<service-rpc-name>` and the RPC response `Msg<service-rpc-name>Response`.

## Code Generation with Cosmos SDK

Cosmos SDK uses Protobuf definitions to generate client and server code:

* The `MsgServer` interface defines the server API for the `Msg` service and its implementation is described as part of the [Msg services](https://docs.cosmos.network/master/building-modules/msg-services.html) documentation.
* Structures are generated for all RPC request and response types.
* Implementation of a module [`Msg` service](https://docs.cosmos.network/master/building-modules/msg-services.html).
* Method to define messages using Msg services - [Amino `LegacyMsg`](https://docs.cosmos.network/master/building-modules/messages-and-queries.html#legacy-amino-legacymsgs).

## Next up

Have a look at the code example below or head straight to the [next section](./08-modules) to learn more about modules.

<ExpansionPanel title="Show me code for my checkers' blockchain">

Previously, the ABCI application knew of a single transaction type: that of a checkers move with four `int` values. With multiple games, this is no longer sufficient, nor viable. Additionally, because you are now on your way to using the Cosmos SDK, you need to conform to its `Tx` ways, which means that you have to create messages that are then placed into a transaction.

## What you need

Let's describe the messages you need:

1. First, in the former _Play_ transaction, your four `int`s need to move from the transaction to an `sdk.Msg` wrapped in said transaction. Just four flat `int`s is no longer good enough as you need to follow the `sdk.Msg` interface, identify for which game a move is meant, and distinguish a move message from other message types.
2. Second, you need to add a message type to create a new game. When this is done, someone will create a new game, and this new game will mention someone else (the other player or, say, the two players). This newly created game would be identified by a generated ID, which needs to be returned to the message creator as a courtesy.
3. Third, it would be a welcomed idea for the other person to be able to reject the challenge. That would have the added benefit of clearing the state of stale un-started games.

## How to proceed

Let's have a closer look at the messages around the **creation of a game**.

1. The message itself:

    ```go
    type MsgCreateGame struct {
        Creator string
        Red     string
        Black   string
    }
    ```

Where `Creator` contains the address of the message signer.

2. The response message:
    ```go
    type MsgCreateGameResponse struct {
        IdValue string
    }
    ```

With the messages defined, you need to declare how the message should be handled. This involves:

1. Describing how the messages are serialized.
2. Writing the code that handles the message and creates the new game in the storage.
3. Putting hooks and callbacks at the right places in the general message handling.

Fortunately, **Starport** can assist you with creating what is, in essence, boilerplate (points 1 and 3 above).

<HighlightBox type="tip">

For more details about Starport, if you want to go beyond these out-of-context code samples and instead see more in detail how to define all this, head to the section on [how to build your own chain](../5-my-own-chain/01-index).

</HighlightBox>

In fact, Starport can help you create all that plus the `MsgCreateGame` and `MsgCreateGameResponse` objects with this command:

```sh
$ starport scaffold message createGame red black --module checkers --response idValue
```

Starport would create a whole lot of other files, see [My Own Chain](../5-my-own-chain/01-index) for details and make additions to existing files.

### A sample of things Starport did for you

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

Where `GetSigners` is [a requirement of `sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/1dba673/types/tx_msg.go#L21).

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

4. Creating an empty shell of a file for you to write your code and the response message in, `x/checkers/keeper/msg_server_create_game.go`:

    ```go
    func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgCreateGameResponse{}, nil
    }
    ```

## What is left to do?

The meat of the subject, that is. To create the game in place of `// TODO: Handling the message`:

1. Decide on how to create a new and unique game ID: `newIndex`. 

<HighlightBox type="tip">

For more details and to avoid diving too deep in this section, see [My Own Chain](../5-my-own-chain/01-index).

</HighlightBox>

2. Extract and verify addresses, such as:

    ```go
    red, err := sdk.AccAddressFromBech32(msg.Red)
    if err != nil {
        return nil, errors.New("invalid address for red")
    }
    ```

3. Create a game object with all required parameters - see the [modules](./08-modules) section for the declaration of this object:

    ```go
    storedGame := {
        Creator:   creator,
        Index:     newIndex,
        Game:      rules.New().String(),
        Red:       red,
        Black:     black,
    }
    ```

4. Send it to storage - see the [modules](./08-modules) section for the declaration of this function:

    ```go
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

5. Return the expected message:

    ```go
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

Not to forget, and it is worth mentioning here:

* If you encounter an internal error, you should `panic("This situation should not happen")`.
* If you encounter a user or _regular_ error, like not enough funds, you should return a regular `error`.

## The other messages

Without repeating all of the above, you can decide on:

1. The **play message**, which means implicitly accepting the challenge when playing for the first time. If you create it with Starport:

    ```sh
    $ starport scaffold message playMove idValue fromX:uint fromY:uint toX:uint toY:uint --module checkers --response idValue
    ```

    Which yields, among others, the object files, callbacks, and a new file for you to write your code:

    ```go
    func (k msgServer) PlayMove(goCtx context.Context, msg *types.MsgPlayMove) (*types.MsgPlayMoveResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgPlayMoveResponse{}, nil
    }
    ```

2. The **reject message**, which should be valid only if the player never played any moves in this game. Again, if you create it with Starport:

    ```sh
    $ starport scaffold message rejectGame idValue --module checkers
    ```

    Which yields, among others:

    ```go
    func (k msgServer) RejectGame(goCtx context.Context, msg *types.MsgRejectGame) (*types.MsgRejectGameResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgRejectGameResponse{}, nil
    }
    ```

## Other considerations

You can already think about some game-theoretical situations. After all, a game involves two parties, and they may not always play nice.

What would happen if one of the two players has accepted the game by playing, but the other player has neither accepted nor rejected the game? What you could do is:

* Have a timeout after which the game is canceled. And this cancelation would be handled automatically in ABCI's `EndBlock`, or rather its equivalent in the Cosmos SDK, without any of the players having to trigger the cancelation.
* Keep an index, a FIFO, or a list of un-started games ordered by cancelation time, so that this automatic trigger does not consume too many resources.

What would happen if the player, whose turn it is, never shows up or never sends a valid transaction? What you could do is:

* Have a timeout after which the game is forfeited. You could also automatically charge the forgetful player, if and when you implement a wager system.
* Keep an index of games that could be forfeited. If both timeouts are the same, you can keep a single FIFO of games so that you clear from the head as necessary.

So, in pseudo-code, you add `timeout: Timestamp` to your `StoredGame` and update it every time something changes in the game. You can decide on a maximum delay: what about one day?

Of note is that there are no _open_ challenges, meaning a player creates a game where the second player is unknown until someone steps in. So player matching is left outside of the blockchain. It is left to the enterprising student to incorporate it inside the blockchain by changing all models.

</ExpansionPanel>
