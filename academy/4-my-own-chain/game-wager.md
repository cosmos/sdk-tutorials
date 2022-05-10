---
title: Token - Let Players Set a Wager
order: 15
description: You let players set a wager
tag: deep-dive
---

# Token - Let Players Set a Wager

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [modules](../2-main-concepts/modules.md)), [keepers](../2-main-concepts/multistore-keepers.md), and [Protobuf](../2-main-concepts/protobuf.md).
* Have Go installed.
* The checkers blockchain codebase up to game expiry handling. You can get there by following the [previous steps](./game-forfeit.md) or checking out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/forfeit-game).

</HighlightBox>

With the introduction of a game expiry in the [previous section](./game-forfeit.md) and others you have now addressed the cases when two players start a game and finish it or let it expire.

In this section you will add an extra layer to a game with wagers or stakes. Your application already includes all the necessary modules. This section relies on the `bank` module in particular.

Players choose to wager _money_ or not, and the winner gets both wagers. The forfeiter loses their wager. To reduce complexity start by letting players wager in the staking token of your application.

## New information

Add this wager value to the `StoredGame`'s Protobuf definition:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/proto/checkers/stored_game.proto#L20]
message StoredGame {
    ...
    uint64 wager = 12;
}
```

You can let players choose the wager they want by adding a dedicated field in the message to create a game, in `proto/checkers/tx.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/proto/checkers/tx.proto#L45]
message MsgCreateGame {
    ...
    uint64 wager = 4;
}
```

To have Ignite CLI and Protobuf recompile these two files, you can use:

```sh
$ ignite generate proto-go
```

Now add a helper function to `StoredGame` using the Cosmos SDK `Coin` in `full_game.go`. It encapsulates information about the wager:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/full_game.go#L71-L73]
func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
    return sdk.NewCoin(sdk.DefaultBondDenom, sdk.NewInt(int64(storedGame.Wager)))
}
```

Where `sdk.DefaultBondDenom` is most likely `"stake"`.

## Saving the wager

Time to make sure that the new field is saved in the storage and it is part of the creation event.

1. First, define a new event key as a constant:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/keys.go#L49]
    const (
        StoredGameEventWager = "Wager"
    )
    ```

2. Next set the actual value in the new `StoredGame` as it is instantiated in the create game handler:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_create_game.go#L29]
    storedGame := types.StoredGame{
        ...
        Wager: msg.Wager,
    }
    ```

3. And in the event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_create_game.go#L50]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.StoredGameEventWager, strconv.FormatUint(msg.Wager, 10)),
        )
    )
    ```

4. Also modify the constructor among the interface definition of `MsgCreateGame` in `x/checkers/types/message_create_game.go` to avoid surprises:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/message_create_game.go#L15]
    func NewMsgCreateGame(creator string, red string, black string, wager uint64) *MsgCreateGame {
        return &MsgCreateGame{
            ...
            Wager: wager,
        }
    }
    ```

## Declaring expectations

On its own the `Wager` field does not make players pay the wager or receive rewards. You need to add the handling actions. These handling actions must ask the `bank` module to perform the required token transfers. For that your keeper needs to ask for a `bank` instance during setup.

<HighlightBox type="info">

Remember the only way to have access to a capability with the object-capability model of the Cosmos SDK, is to be given the reference to an instance which already has this capability.

</HighlightBox>

Implement payment handling by having your keeper hold wagers in escrow while the game is being played. The `bank` module has functions to transfer tokens from any account to your module and vice-versa.

<HighlightBox type="tip">

It is best practice to to declare an interface that narrowly declares the functions from other modules that you expect for your module. The conventional file for these declarations is `x/checkers/types/expected_keepers.go`.

</HighlightBox>

The `bank` module is capable of a lot but all you need here are two of the `bank`'s functions. So you _redeclare_ the functions like so:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/expected_keepers.go#L7-L10]
type BankKeeper interface {
    SendCoinsFromModuleToAccount(ctx sdk.Context, senderModule string, recipientAddr sdk.AccAddress, amt sdk.Coins) error
    SendCoinsFromAccountToModule(ctx sdk.Context, senderAddr sdk.AccAddress, recipientModule string, amt sdk.Coins) error
}
```

These two functions must exactly match the functions declared in the [`bank`'s keeper.go file](https://github.com/cosmos/cosmos-sdk/blob/8b78406/x/bank/keeper/keeper.go#L37-L39). Copy the file. Any object with these two functions is a `BankKeeper`.

## Obtaining the capability

With your requirements declared it is time to make sure your keeper receives a reference to a bank keeper. First add a `BankKeeper` to your keeper in `x/checkers/keeper/keeper.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/keeper.go#L16]
type (
    Keeper struct {
        bank types.BankKeeper
        ...
    }
)
```

This `BankKeeper` is your newly declared narrow interface. Do not forget to adjust the constructor accordingly:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/keeper.go#L25-L41]
func NewKeeper(
    bank types.BankKeeper,
    ...
) *Keeper {
    return &Keeper{
        bank: bank,
        ...
    }
}
```

Finally you need to update where the constructor is called and pass a proper instance of bank keeper. This happens in `app/app.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/app/app.go#L341-L342]
app.CheckersKeeper = *checkersmodulekeeper.NewKeeper(
    app.BankKeeper,
    ...
)
```

This `app.BankKeeper` is a full `bank` keeper that also conforms to your `BankKeeper` interface because you mastered that copy and paste move.

## Preparing expected errors

There are several new error situations which you can enumerate with new variables:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/errors.go#L23-L29]
ErrRedCannotPay      = sdkerrors.Register(ModuleName, 1112, "red cannot pay the wager")
ErrBlackCannotPay    = sdkerrors.Register(ModuleName, 1113, "black cannot pay the wager")
ErrNothingToPay      = sdkerrors.Register(ModuleName, 1115, "there is nothing to pay, should not have been called")
ErrCannotRefundWager = sdkerrors.Register(ModuleName, 1116, "cannot refund wager to: %s")
ErrCannotPayWinnings = sdkerrors.Register(ModuleName, 1117, "cannot pay winnings to winner")
ErrNotInRefundState  = sdkerrors.Register(ModuleName, 1118, "game is not in a state to refund, move count: %d")
```

## Money handling steps

With the `bank` now in your keeper it is time to have your keeper handle the money. Keep this concern in its own file as the keeper is reused on a play, reject, and forfeit.

Create the new file `x/checkers/keeper/wager_handler.go` and add three functions to collect a wager, refund a wager, and pay winnings:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go]
func (k *Keeper) CollectWager(ctx sdk.Context, storedGame *types.StoredGame) error
func (k *Keeper) MustPayWinnings(ctx sdk.Context, storedGame *types.StoredGame)
func (k *Keeper) MustRefundWager(ctx sdk.Context, storedGame *types.StoredGame)
```

The `Must` prefix in the function means that the transaction either takes place or a panic is issued. If a player cannot pay the wager, it is a user-side error and the user must be informed of a failed transaction. If the module cannot pay, it means the escrow account has failed. This error is much more serious. An invariant has been violated and the whole application must be terminated.

Now it is time to set up collecting a wager, paying winnings, and refunding a wager:

1. **Collecting wagers** happens on a player's first move. Therefore, differentiate between players:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L15-L36]
    if storedGame.MoveCount == 0 {
        // Black plays first
    } else if storedGame.MoveCount == 1 {
        // Red plays second
    }
    return nil
    ```

    Get the address for the black player:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L17-L20]
    black, err := storedGame.GetBlackAddress()
    if err != nil {
        panic(err.Error())
    }
    ```

    Try to transfer into the escrow:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L21-L24]
    err = k.bank.SendCoinsFromAccountToModule(ctx, black, types.ModuleName, sdk.NewCoins(storedGame.GetWagerCoin()))
    if err != nil {
        return sdkerrors.Wrapf(err, types.ErrBlackCannotPay.Error())
    }
    ```

    Then do the same for the red player.

2. **Paying winnings** takes place when the game has a declared winner. So first get the winner. "No winner" is not an acceptable situation in this `MustPayWinnings`. The caller of the function must know:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L42-L48]
    winnerAddress, found, err := storedGame.GetWinnerAddress()
    if err != nil {
        panic(err.Error())
    }
    if !found {
        panic(fmt.Sprintf(types.ErrCannotFindWinnerByColor.Error(), storedGame.Winner))
    }
    ```

    Then get the winnings to pay:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L49-L54]
    winnings := storedGame.GetWagerCoin()
    if storedGame.MoveCount == 0 {
        panic(types.ErrNothingToPay.Error())
    } else if 1 < storedGame.MoveCount {
        winnings = winnings.Add(winnings)
    }
    ```

    You double the wager only if the red player has also played and therefore both players have paid their wagers. Then pay the winner:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L55-L58]
    err = k.bank.SendCoinsFromModuleToAccount(ctx, types.ModuleName, winnerAddress, sdk.NewCoins(winnings))
    if err != nil {
        panic(types.ErrCannotPayWinnings.Error())
    }
    ```

3. Finally, **refunding wagers** takes place when the game has partially started, i.e. only one party has paid, or when the game ends in a draw. In this narrow case of `MustRefundWager`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L64-L78]
    if storedGame.MoveCount == 1 {
        // Refund
    } else if storedGame.MoveCount == 0 {
        // Do nothing
    } else {
        // TODO Implement a draw mechanism.
        panic(fmt.Sprintf(types.ErrNotInRefundState.Error(), storedGame.MoveCount))
    }
    ```

    Refund the black player when there has been a single move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L65-L72]
    black, err := storedGame.GetBlackAddress()
    if err != nil {
        panic(err.Error())
    }
    err = k.bank.SendCoinsFromModuleToAccount(ctx, types.ModuleName, black, sdk.NewCoins(storedGame.GetWagerCoin()))
    if err != nil {
        panic(fmt.Sprintf(types.ErrCannotRefundWager.Error(), rules.BLACK_PLAYER.Color))
    }
    ```

    If the module cannot pay, then it is a panic as the escrow has failed.

## Insert wager handling

With the desired steps defined in the wager handling functions, it is time to invoke them at the right places in the message handlers.

1. When a player plays for the first time:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_play_move.go#L47-L50]
    err = k.Keeper.CollectWager(ctx, &storedGame)
    if err != nil {
        return nil, err
    }
    ```

2. When a player wins as a result of a move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_play_move.go#L75-L82]
    if storedGame.Winner == rules.NO_PLAYER.Color {
        ...
    } else {
        ...
        k.Keeper.MustPayWinnings(ctx, &storedGame)
    }
    ```

3. When a player rejects a game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_reject_game.go#L39]
    k.Keeper.MustRefundWager(ctx, &storedGame)
    ```

4. When a game expires and there is a forfeit. Make sure to only refund or pay full winnings when applicable. The logic needs to be adjusted:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/end_block_server_game.go#L54-L58]
    if deadline.Before(ctx.BlockTime()) {
        if storedGame.MoveCount == 0 {
            ...
        } else {
            ...
            if storedGame.MoveCount <= 1 {
                k.MustRefundWager(ctx, &storedGame)
            } else {
                k.MustPayWinnings(ctx, &storedGame)
            }
            ...
        }
    }
    ```

## Next up

You can skip ahead and see how you can integrate [foreign tokens](./wager-denom.md) via the use of IBC. Or take a look at the [next section](./gas-meter.md) to prevent spam and reward validators proportional to their effort in your checkers blockchain.
