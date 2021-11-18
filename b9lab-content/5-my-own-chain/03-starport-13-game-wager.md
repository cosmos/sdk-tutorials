---
title: The Game Wager Elements
order: 15
description: You let players play with money.
---

# The Game Wager Elements

With game expiry, you have now covered the game theoretic risks that arise when 2 players are playing a game. This tutorial lets you add an extra layer with wagers or stakes. Players choose to wager _money_ and the winner gets both wagers. The forfeiter loses their wager.

Your application already includes all the necessary modules. This tutorial relies on the `bank` module.

Start by letting players wager in the staking token of your application. 

## New Information

First, add this wager value to the stored game in `proto/checkers/stored_game.proto`:

```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/proto/checkers/stored_game.proto#L20]
message StoredGame {
    ...
    uint64 wager = 12;
}
```
To let different player leagues emerge, you can let players choose the wager they want with these changes in `proto/checkers/tx.proto`:

```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/proto/checkers/tx.proto#L45]
message MsgCreateGame {
    ...
    uint64 wager = 4;
}
```
Remember that players can still reject games, so there is no risk that players can be coerced into expensive games. To have Starport and Protobuf recompile this file, you can use:

```sh
$ starport chain serve
```
While you are at it, how about adding a helper function to `StoredGame` using the Cosmos SDK `Coin` in `x/checkers/types/full_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/full_game.go#L71-L73]
func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
    return sdk.NewCoin(sdk.DefaultBondDenom, sdk.NewInt(int64(storedGame.Wager)))
}
```
Where `sdk.DefaultBondDenom` is most likely `"stake"`.

## Saving The Wager

Time to make sure that the new field is saved in storage and part of the creation event. First, define a new event key in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/keys.go#L49]
const (
    StoredGameEventWager = "Wager"
)
```
Then you need to add the field in the stored object in `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_create_game.go#L29]
storedGame := types.StoredGame{
    ...
    Wager: msg.Wager,
}
```
And in the event:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_create_game.go#L50]
ctx.EventManager().EmitEvent(
    sdk.NewEvent(sdk.EventTypeMessage,
        ...
        sdk.NewAttribute(types.StoredGameEventWager, strconv.FormatUint(msg.Wager, 10)),
    )
)
```
Less evidently, in order to avoid surprises down the road, you ought to also modify the creator function among the interface definition of `MsgCreateGame`, in `x/checkers/types/message_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/message_create_game.go#L15]
func NewMsgCreateGame(creator string, red string, black string, wager uint64) *MsgCreateGame {
    return &MsgCreateGame{
        ...
        Wager: wager,
    }
}
```

## Preparing Your Keeper

Saving a field named `Wager`, however well named, does not make players pay it or receive rewards. You need to add the handling actions. This handling has to ask the Bank to do the necessary. For this to be possible, your keeper needs to ask for a bank instance during setup. Remember that, because of the object-capability model throughout the Cosmos SDK, the only way to have access to a capability is to be given the reference to an instance that has this capability.

What does your keeper need to do? It needs to keep in escrow the wager when the game is being played, and to pay back when the game is resolved. Good thing, the bank happens to have functions to transfer tokens from any account to your module, and vice-versa.

Additionally, it is good practice to declare an interface that narrowly defines the functions you need for your purpose. The bank is capable of a lot but really, all you need here are 2 functions of bank. You _redeclare_ them in the file made for this purpose, `x/checkers/types/expected_keepers.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/expected_keepers.go#L7-L10]
type BankKeeper interface {
    SendCoinsFromModuleToAccount(ctx sdk.Context, senderModule string, recipientAddr sdk.AccAddress, amt sdk.Coins) error
    SendCoinsFromAccountToModule(ctx sdk.Context, senderAddr sdk.AccAddress, recipientModule string, amt sdk.Coins) error
}
```
These 2 functions need to exactly match those declared [here](https://github.com/cosmos/cosmos-sdk/blob/8b78406/x/bank/keeper/keeper.go#L37-L39), copy / paste to the rescue. The magic of Go is that any object that has your 2 functions above will be a `BankKeeper`. Because the bank's keeper has these 2 functions, it will be one.

Now with the requirements declared, it is time to make sure your keeper receives a reference. First, add a `BankKeeper` to your keeper in `x/checkers/keeper/keeper.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/keeper.go#L16]
type (
    Keeper struct {
        bank types.BankKeeper
        ...
    }
)
```
At the risk of repeating, this `BankKeeper` is your newly declared narrow interface. Don't forget the constructor:

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
That's not all, you need to update where the constructor is called, namely in `app/app.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/app/app.go#L341-L342]
app.CheckersKeeper = *checkersmodulekeeper.NewKeeper(
    app.BankKeeper,
    ...
)
```
This `app.BankKeeper` is a full bank keeper, which also conforms to your `BankKeeper` interface.

## Preparing Expected Errors

There is bunch of new error situations, that you can enumerate in `x/checkers/types/errors.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/types/errors.go#L23-L29]
ErrRedCannotPay            = sdkerrors.Register(ModuleName, 1112, "red cannot pay the wager")
ErrBlackCannotPay          = sdkerrors.Register(ModuleName, 1113, "black cannot pay the wager")
ErrNothingToPay            = sdkerrors.Register(ModuleName, 1115, "there is nothing to pay, should not have been called")
ErrCannotRefundWager       = sdkerrors.Register(ModuleName, 1116, "cannot refund wager to: %s")
ErrCannotPayWinnings       = sdkerrors.Register(ModuleName, 1117, "cannot pay winnings to winner")
ErrNotInRefundState        = sdkerrors.Register(ModuleName, 1118, "game is not in a state to refund, move count: %d")
```

## Money Handling Steps

With the bank now in your keeper, it is time to have your keeper handle the money. Better keep this concern into its own file as it will be reused on play, reject and forfeit. Create the new file `x/checkers/keeper/wager_handler.go` and add 3 functions, to collect a wager, refund it and pay winnings:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go]
func (k *Keeper) CollectWager(ctx sdk.Context, storedGame *types.StoredGame) error
func (k *Keeper) MustPayWinnings(ctx sdk.Context, storedGame *types.StoredGame)
func (k *Keeper) MustRefundWager(ctx sdk.Context, storedGame *types.StoredGame)
```
In the above, the `Must` prefix means that it either takes place or a panic is issued. After all, if a player cannot pay the wager, it is a user-side error, and the user should be informed with a failed transaction. On the other hand, if the module cannot pay, it means the escrow account has failed. This is much more serious, an invariant has been violated and the whole application should be terminated.

1. **Collecting wagers** happens on a player's first move. This makes sense. Don't forget to differentiate between players:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L15-L36]
    if storedGame.MoveCount == 0 {
        // Black plays first
    } else if storedGame.MoveCount == 1 {
        // Red plays second
    }
    return nil
    ```
    So for the black player, get its address:
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
    Then the same for the red player.
2. **Paying winnings** takes place when the game has a declared winner. So first, get the winner. In this `MustPayWinnings`, no winner is not an acceptable situation, the caller of the function should be aware:
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
    Of course, you double the wager only if the red player has played, i.e. both players paid. Then pay the winner:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/wager_handler.go#L55-L58]
    err = k.bank.SendCoinsFromModuleToAccount(ctx, types.ModuleName, winnerAddress, sdk.NewCoins(winnings))
    if err != nil {
        panic(types.ErrCannotPayWinnings.Error())
    }
    ```
3. Finally, **refunding wagers** happens when the game was partially started i.e. partially paid, or when the game ends in a draw. A draw is still a TODO in this application because a draw is not deterministic, but instead needs the agreement of both players that a draw has in fact taken place. So in this narrow case of `MustRefundWager`:
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
    And when there has been a single move, refund the black player:
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
    Once again, if the module cannot pay, then it is a panic as the escrow has failed.

## Insert Wager Handling

With the desired steps defined into their own functions, it is time to insert them at the right places in the message handlers.

1. When a player plays for the first time, in `x/checkers/keeper/msg_server_play_move.go`:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_play_move.go#L47-L50]
    err = k.Keeper.CollectWager(ctx, &storedGame)
    if err != nil {
        return nil, err
    }
    ```
2. When a player wins as a result of a move, in `x/checkers/keeper/msg_server_play_move.go`:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_play_move.go#L75-L82]
    if storedGame.Winner == rules.NO_PLAYER.Color {
        ...
    } else {
        ...
        k.Keeper.MustPayWinnings(ctx, &storedGame)
    }
    ```
3. When a player rejects a game, in `x/checkers/keeper/msg_server_reject_game.go`:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a8e8cdfe3f02697495f15d2348ed960635f32dc3/x/checkers/keeper/msg_server_reject_game.go#L39]
    k.Keeper.MustRefundWager(ctx, &storedGame)
    ```
4. When a game expires and there is a forfeit, in `x/checkers/keeper/end_block_server_game.go`. Make sure to only refund or pay full winnings or not when relevant, so the logic needs to be adjusted:
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

And with that, you have handled wagers. Players can start getting serious if they want.
