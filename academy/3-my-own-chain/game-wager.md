---
title: "Token - Let Players Set a Wager"
order: 16
description: Players set a wager
tag: deep-dive
---

# Token - Let Players Set a Wager

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [modules](../2-main-concepts/modules.md), [keepers](../2-main-concepts/multistore-keepers.md), and [Protobuf](../2-main-concepts/protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase up to game expiry handling. If not, follow the [previous steps](./game-forfeit.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/forfeit-game).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add wagers.
* Work with the Bank module.
* Handle money.
* Use mocks.
* Add integration tests.

</HighlightBox>

With the introduction of game expiry in the [previous section](./game-forfeit.md) and other features, you have now addressed the cases when two players start a game and finish it, or let it expire.

In this section, you will add an extra layer to a game, with wagers or stakes. Your application already includes all the necessary modules. This section relies on the `bank` module in particular.

Players choose to wager _money_ or not, and the winner gets both wagers. The forfeiter loses their wager. To reduce complexity, start by letting players wager in the staking token of your application.

Now that no games can be left stranded, it is possible for players to safely wager on their games. How could this be implemented?

## Some initial thoughts

When thinking about implementing a wager on games, ask:

* What form will a wager take?
* Who decides on the amount of wagers?
* Where is a wager recorded?
* Is there any desirable atomicity of actions?
* At what junctures do you need to handle payments, refunds, and wins?
* Are there errors to report back?
* What event should you emit?

## Code needs

When it comes to your code:

* What Ignite CLI commands, if any, will assist you?
* How do you adjust what Ignite CLI created for you?
* Where do you make your changes?
* How would you unit-test these new elements?
* Are unit tests sufficient here?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

## New information

Add this wager value to the `StoredGame`'s Protobuf definition:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/proto/checkers/stored_game.proto#L17]
message StoredGame {
    ...
    uint64 wager = 11;
}
```

You can let players choose the wager they want by adding a dedicated field in the message to create a game, in `proto/checkers/tx.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/proto/checkers/tx.proto#L20]
message MsgCreateGame {
    ...
    uint64 wager = 4;
}
```

Have Ignite CLI and Protobuf recompile these two files:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite generate proto-go
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite generate proto-go
```

</CodeGroupItem>

</CodeGroup>

Now add a helper function to `StoredGame` using the Cosmos SDK `Coin` in `full_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/types/full_game.go#L68-L70]
func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
    return sdk.NewCoin(sdk.DefaultBondDenom, sdk.NewInt(int64(storedGame.Wager)))
}
```

This encapsulates information about the wager (where `sdk.DefaultBondDenom` is most likely `"stake"`).

## Saving the wager

Time to ensure that the new field is saved in the storage and it is part of the creation event.

1. Define a new event key as a constant:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/types/keys.go#L36]
    const (
        GameCreatedEventWager = "wager"
    )
    ```

2. Set the actual value in the new `StoredGame` as it is instantiated in the create game handler:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/keeper/msg_server_create_game.go#L33]
    storedGame := types.StoredGame{
        ...
        Wager: msg.Wager,
    }
    ```

3. And in the event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/keeper/msg_server_create_game.go#L52]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.GameCreatedEventWager, strconv.FormatUint(msg.Wager, 10)),
        )
    )
    ```

4. Modify the constructor among the interface definition of `MsgCreateGame` in `x/checkers/types/message_create_game.go` to avoid surprises:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/types/message_create_game.go#L12-L19]
    func NewMsgCreateGame(creator string, red string, black string, wager uint64) *MsgCreateGame {
        return &MsgCreateGame{
            ...
            Wager: wager,
        }
    }
    ```

5. Adjust the CLI client accordingly:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/client/cli/tx_create_game.go#L17-L38]
    func CmdCreateGame() *cobra.Command {
        cmd := &cobra.Command{
            Use:   "create-game [black] [red] [wager]",
            Short: "Broadcast message createGame",
            Args:  cobra.ExactArgs(3),
            RunE: func(cmd *cobra.Command, args []string) (err error) {
                argBlack := args[0]
                argRed := args[1]
                argWager, err := strconv.ParseUint(args[2], 10, 64)
                if err != nil {
                    return err
                }

                clientCtx, err := client.GetClientTxContext(cmd)
                if err != nil {
                    return err
                }

                msg := types.NewMsgCreateGame(
                    clientCtx.GetFromAddress().String(),
                    argBlack,
                    argRed,
                    argWager,
                )
                if err := msg.ValidateBasic(); err != nil {
                    return err
                }
                return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
            },
        }

        flags.AddTxFlagsToCmd(cmd)

        return cmd
    }
    ```

## Declaring expectations

On its own the `Wager` field does not make players pay the wager or receive rewards. You need to add handling actions which ask the `bank` module to perform the required token transfers. For that, your keeper needs to ask for a `bank` instance during setup.

<HighlightBox type="info">

The only way to have access to a capability with the object-capability model of the Cosmos SDK is to be given the reference to an instance which already has this capability.

</HighlightBox>

Payment handling is implemented by having your keeper hold wagers **in escrow** while the game is being played. The `bank` module has functions to transfer tokens from any account to your module and vice-versa.

Alternatively, your keeper could burn tokens when playing and mint them again when paying out. However, this makes your blockchain's total supply _falsely_ fluctuate. Additionally, this burning and minting may prove questionable when you later introduce IBC tokens.

<HighlightBox type="best-practice">

Declare an interface that narrowly declares the functions from other modules that you expect for your module. The conventional file for these declarations is `x/checkers/types/expected_keepers.go`.

</HighlightBox>

The `bank` module has many capabilities, but all you need here are two functions. Your module already expects one function of the bank keeper: [`SpendableCoins`](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/types/expected_keepers.go#L15-L18). Instead of expanding this interface, you add a new one and _redeclare_ the extra functions you need like so:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/types/expected_keepers.go#L20-L23]
type BankEscrowKeeper interface {
    SendCoinsFromModuleToAccount(ctx sdk.Context, senderModule string, recipientAddr sdk.AccAddress, amt sdk.Coins) error
    SendCoinsFromAccountToModule(ctx sdk.Context, senderAddr sdk.AccAddress, recipientModule string, amt sdk.Coins) error
}
```

These two functions must exactly match the functions declared in the [`bank`'s keeper.go file](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/bank/keeper/keeper.go#L35-L37). Copy the declarations directly from the `bank`'s file. In Go, any object with these two functions is a `BankEscrowKeeper`.

## Obtaining the capability

With your requirements declared, it is time to make sure your keeper receives a reference to a bank keeper. First add a `BankEscrowKeeper` to your keeper in `x/checkers/keeper/keeper.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper.go#L16]
type (
    Keeper struct {
        bank types.BankEscrowKeeper
        ...
    }
)
```

This `BankEscrowKeeper` is your newly declared narrow interface. Do not forget to adjust the constructor accordingly:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper.go#L25-L38]
func NewKeeper(
    bank types.BankEscrowKeeper,
    ...
) *Keeper {
    return &Keeper{
        bank: bank,
        ...
    }
}
```

Next, update where the constructor is called and pass a proper instance of `BankKeeper`. This happens in `app/app.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/app/app.go#L418-L419]
app.CheckersKeeper = *checkersmodulekeeper.NewKeeper(
    app.BankKeeper,
    ...
)
```

This `app.BankKeeper` is a full `bank` keeper that also conforms to your `BankEscrowKeeper` interface.

Finally, inform the app that your checkers module is going to hold balances in escrow by adding it to the **whitelist** of permitted modules:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/app/app.go#L173]
maccPerms = map[string][]string{
    ...
    checkersmoduletypes.ModuleName: nil,
}
```

If you compare it to the other `maccperms` lines, the new line does not mention any `authtypes.Minter` or `authtypes.Burner`. Indeed `nil` is what you need to keep in escrow. For your information, the bank creates an _address_ for your module's escrow account. When you have the full `app`, you can access it with:

```go
import(
    "github.com/alice/checkers/x/checkers/types"
)
checkersModuleAddress := app.AccountKeeper.GetModuleAddress(types.ModuleName)
```

## Preparing expected errors

There are several new error situations that you can enumerate with new variables:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/types/errors.go#L23-L28]
ErrBlackCannotPay    = sdkerrors.Register(ModuleName, 1112, "black cannot pay the wager")
ErrRedCannotPay      = sdkerrors.Register(ModuleName, 1113, "red cannot pay the wager")
ErrNothingToPay      = sdkerrors.Register(ModuleName, 1114, "there is nothing to pay, should not have been called")
ErrCannotRefundWager = sdkerrors.Register(ModuleName, 1115, "cannot refund wager to: %s")
ErrCannotPayWinnings = sdkerrors.Register(ModuleName, 1116, "cannot pay winnings to winner: %s")
ErrNotInRefundState  = sdkerrors.Register(ModuleName, 1117, "game is not in a state to refund, move count: %d")
```

## Money handling steps

With the `bank` now in your keeper, it is time to have your keeper handle the money. Keep this concern in its own file, as the functions are reused on play, reject, and forfeit.

Create the new file `x/checkers/keeper/wager_handler.go` and add three functions to collect a wager, refund a wager, and pay winnings:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go]
func (k *Keeper) CollectWager(ctx sdk.Context, storedGame *types.StoredGame) error
func (k *Keeper) MustPayWinnings(ctx sdk.Context, storedGame *types.StoredGame)
func (k *Keeper) MustRefundWager(ctx sdk.Context, storedGame *types.StoredGame)
```

The `Must` prefix in the function means that the transaction either takes place or a `panic` is issued. If a player cannot pay the wager, it is a user-side error and the user must be informed of a failed transaction. If the module cannot pay, it means the escrow account has failed. This latter error is much more serious: an invariant may have been violated and the whole application must be terminated.

Now set up collecting a wager, paying winnings, and refunding a wager:

1. **Collecting wagers** happens on a player's first move. Therefore, differentiate between players:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go#L12-L33]
    if storedGame.MoveCount == 0 {
        // Black plays first
    } else if storedGame.MoveCount == 1 {
        // Red plays second
    }
    return nil
    ```

    When there are no moves, get the address for the black player:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go#L14-L17]
    black, err := storedGame.GetBlackAddress()
    if err != nil {
        panic(err.Error())
    }
    ```

    Try to transfer into the escrow:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go#L18-L21]
    err = k.bank.SendCoinsFromAccountToModule(ctx, black, types.ModuleName, sdk.NewCoins(storedGame.GetWagerCoin()))
    if err != nil {
        return sdkerrors.Wrapf(err, types.ErrBlackCannotPay.Error())
    }
    ```

    Then do the same for the [red player](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go#L24-L31) when there is a single move.

2. **Paying winnings** takes place when the game has a declared winner. First get the winner. "No winner" is **not** an acceptable situation in this `MustPayWinnings`. The caller of the function must ensure there is a winner:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go#L37-L43]
    winnerAddress, found, err := storedGame.GetWinnerAddress()
    if err != nil {
        panic(err.Error())
    }
    if !found {
        panic(fmt.Sprintf(types.ErrCannotFindWinnerByColor.Error(), storedGame.Winner))
    }
    ```

    Then calculate the winnings to pay:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go#L44-L49]
    winnings := storedGame.GetWagerCoin()
    if storedGame.MoveCount == 0 {
        panic(types.ErrNothingToPay.Error())
    } else if 1 < storedGame.MoveCount {
        winnings = winnings.Add(winnings)
    }
    ```

    You double the wager only if the red player has also played and therefore both players have paid their wagers. Then pay the winner:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go#L50-L53]
    err = k.bank.SendCoinsFromModuleToAccount(ctx, types.ModuleName, winnerAddress, sdk.NewCoins(winnings))
    if err != nil {
        panic(fmt.Sprintf(types.ErrCannotPayWinnings.Error(), err.Error()))
    }
    ```

3. Finally, **refunding wagers** takes place when the game has partially started, i.e. only one party has paid, or when the game ends in a draw. In this narrow case of `MustRefundWager`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go#L57-L72]
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

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler.go#L59-L66]
    black, err := storedGame.GetBlackAddress()
    if err != nil {
        panic(err.Error())
    }
    err = k.bank.SendCoinsFromModuleToAccount(ctx, types.ModuleName, black, sdk.NewCoins(storedGame.GetWagerCoin()))
    if err != nil {
        panic(fmt.Sprintf(types.ErrCannotRefundWager.Error(), err.Error()))
    }
    ```

    If the module cannot pay, then there is a panic as the escrow has failed.

You will notice that no special case is made when the wager is zero. This is a design choice here, and which way you choose to go is up to you. Not contacting the bank unnecessarily is cheaper in gas. On the other hand, why not outsource the zero check to the bank?

## Insert wager handling

With the desired steps defined in the wager handling functions, it is time to invoke them at the right places in the message handlers.

1. When a player plays for the first time:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move.go#L47-L50]
    err = k.Keeper.CollectWager(ctx, &storedGame)
    if err != nil {
        return nil, err
    }
    ```

2. When a player wins as a result of a move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move.go#L79]
    if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
        ...
    } else {
        ...
        k.Keeper.MustPayWinnings(ctx, &storedGame)
    }
    ```

3. When a player rejects a game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_reject_game.go#L36]
    k.Keeper.MustRefundWager(ctx, &storedGame)
    ```

4. When a game expires and there is a forfeit, make sure to only refund or pay full winnings when applicable. The logic needs to be adjusted:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/end_block_server_game.go#L45-L56]
    if deadline.Before(ctx.BlockTime()) {
        ...
        if storedGame.MoveCount <= 1 {
            ...
            if storedGame.MoveCount == 1 {
                k.MustRefundWager(ctx, &storedGame)
            }
        } else {
            ...
            k.MustPayWinnings(ctx, &storedGame)
            ...
        }
    }
    ```

## Unit tests

If you try running your existing tests you get a compilation error on the [test keeper builder](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/testutil/keeper/checkers.go#L39-L44). Passing `nil` will not get you far and creating a full-fledged bank keeper would be a lot of work.

### Prepare mocks

It is better to create some [mocks](https://en.wikipedia.org/wiki/Mock_object). The Cosmos SDK does not offer mocks of its objects so you have to create your own. For that, the [`gomock`](https://github.com/golang/mock) library is a good resource. Install it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go install github.com/golang/mock/mockgen@v1.6.0
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/Dockerfile-ubuntu#L8-L33]
ENV MOCKGEN_VERSION=1.6.0
...
RUN go install github.com/golang/mock/mockgen@v${MOCKGEN_VERSION}
```

Rebuild your Docker image.

</CodeGroupItem>

</CodeGroup>

With the library installed, you still need to do a one time creation of the mocks. Run:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ mockgen -source=x/checkers/types/expected_keepers.go -destination=testutil/mock_types/expected_keepers.go 
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i mockgen -source=x/checkers/types/expected_keepers.go -destination=testutil/mock_types/expected_keepers.go
```

</CodeGroupItem>

</CodeGroup>

If your expected keepers change, you will have to run this command again. It can be a good idea to save the command for future reference. You may use a `Makefile` for that. Ensure you install the `make` tool for your computer. If you use Docker, add it to the packages and rebuild the image:

```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/Dockerfile-ubuntu#L18]
ENV PACKAGES curl gcc jq make
```

Create the `Makefile`:

```lang-makefile [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/Makefile#L1-L2]
mock-expected-keepers:
	mockgen -source=x/checkers/types/expected_keepers.go -destination=testutil/mock_types/expected_keepers.go 
```

At any time, you can rebuild the mocks with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ make mock-expected-keepers
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i make mock-expected-keepers
```

</CodeGroupItem>

</CodeGroup>

You are going to set the expectations on this `BankEscrowKeeper` mock many times, including when you do not care about the result. So it is in your interest to create helper functions that will make setting up the expectations more efficient. Create a new `bank_escrow_helpers.go` file with:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/testutil/mock_types/bank_escrow_helpers.go#L11-L39]
func (escrow *MockBankEscrowKeeper) ExpectAny(context context.Context) {
    escrow.EXPECT().SendCoinsFromAccountToModule(sdk.UnwrapSDKContext(context), gomock.Any(), gomock.Any(), gomock.Any()).AnyTimes()
    escrow.EXPECT().SendCoinsFromModuleToAccount(sdk.UnwrapSDKContext(context), gomock.Any(), gomock.Any(), gomock.Any()).AnyTimes()
}

func coinsOf(amount uint64) sdk.Coins {
    return sdk.Coins{
        sdk.Coin{
            Denom:  sdk.DefaultBondDenom,
            Amount: sdk.NewInt(int64(amount)),
        },
    }
}

func (escrow *MockBankEscrowKeeper) ExpectPay(context context.Context, who string, amount uint64) *gomock.Call {
    whoAddr, err := sdk.AccAddressFromBech32(who)
    if err != nil {
        panic(err)
    }
    return escrow.EXPECT().SendCoinsFromAccountToModule(sdk.UnwrapSDKContext(context), whoAddr, types.ModuleName, coinsOf(amount))
}

func (escrow *MockBankEscrowKeeper) ExpectRefund(context context.Context, who string, amount uint64) *gomock.Call {
    whoAddr, err := sdk.AccAddressFromBech32(who)
    if err != nil {
        panic(err)
    }
    return escrow.EXPECT().SendCoinsFromModuleToAccount(sdk.UnwrapSDKContext(context), types.ModuleName, whoAddr, coinsOf(amount))
}
```

### Make use of mocks

With the helpers in place, you can add a new function similar to `CheckersKeeper(t testing.TB)` but which uses mocks. Keep the original function, which passes a `nil` for bank.

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/testutil/keeper/checkers.go#L21-L58]
func CheckersKeeper(t testing.TB) (*keeper.Keeper, sdk.Context) {
    return CheckersKeeperWithMocks(t, nil)
}

func CheckersKeeperWithMocks(t testing.TB, bank *mock_types.MockBankEscrowKeeper) (*keeper.Keeper, sdk.Context) {
    storeKey := sdk.NewKVStoreKey(types.StoreKey)
    memStoreKey := storetypes.NewMemoryStoreKey(types.MemStoreKey)

    db := tmdb.NewMemDB()
    stateStore := store.NewCommitMultiStore(db)
    stateStore.MountStoreWithDB(storeKey, sdk.StoreTypeIAVL, db)
    stateStore.MountStoreWithDB(memStoreKey, sdk.StoreTypeMemory, nil)
    require.NoError(t, stateStore.LoadLatestVersion())

    registry := codectypes.NewInterfaceRegistry()
    cdc := codec.NewProtoCodec(registry)

    paramsSubspace := typesparams.NewSubspace(cdc,
        types.Amino,
        storeKey,
        memStoreKey,
        "CheckersParams",
    )
    k := keeper.NewKeeper(
        bank,
        cdc,
        storeKey,
        memStoreKey,
        paramsSubspace,
    )

    ctx := sdk.NewContext(stateStore, tmproto.Header{}, false, log.NewNopLogger())

    // Initialize params
    k.SetParams(ctx, types.DefaultParams())

    return k, ctx
}
```

The `CheckersKeeperWithMocks` function takes the mock in its arguments for more versatility.

Now adjust the small functions that set up the keeper before each test. You do not need to change them for the _create_ tests because they never call the bank. You have to do it for _play_, _reject_, and _forfeit_.

For _play_:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_test.go#L17-L32]
func setupMsgServerWithOneGameForPlayMove(t testing.TB) (types.MsgServer, keeper.Keeper, context.Context,
    *gomock.Controller, *mock_types.MockBankEscrowKeeper) {
    ctrl := gomock.NewController(t)
    bankMock := mock_types.NewMockBankEscrowKeeper(ctrl)
    k, ctx := keepertest.CheckersKeeperWithMocks(t, bankMock)
    checkers.InitGenesis(ctx, *k, *types.DefaultGenesis())
    server := keeper.NewMsgServerImpl(*k)
    context := sdk.WrapSDKContext(ctx)
    server.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Black:   bob,
        Red:     carol,
        Wager:   45,
    })
    return server, *k, context, ctrl, bankMock
}
```

This function creates the mock and returns two new objects:

* The mock controller, so that the `.Finish()` method can be called within the test itself. This is the function that will verify the call expectations placed on the mocks.
* The mocked bank escrow. This is the instance on which you place the call expectations.

Both objects will be used from the tests proper.

Do the same for [_reject_](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_reject_game_test.go#L17-L32).

### Adjust the unit tests

With these changes, you need to adjust many unit tests for _play_, _reject_, and _forfeit_. For many, you may only want to make the tests pass again without checking any meaningful bank call expectations. There are different situations:

1. The mocked bank is not called. So you do not add any expectation, and still call the controller:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_reject_game_test.go#L35-L36]
    msgServer, _, context, ctrl, _ := setupMsgServerWithOneGameForRejectGame(t)
    defer ctrl.Finish()
    ```

2. The mocked bank is called, but you do not care about how it was called:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_reject_game_test.go#L148-L150]
    msgServer, _, context, ctrl, escrow := setupMsgServerWithOneGameForRejectGame(t)
    defer ctrl.Finish()
    escrow.ExpectAny(context)
    ```

3. The mocked bank is called, and you want to add call expectations:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/end_block_server_game_test.go#L139-L143]
    msgServer, keeper, context, ctrl, escrow := setupMsgServerWithOneGameForPlayMove(t)
    defer ctrl.Finish()
    pay := escrow.ExpectPay(context, bob, 45).Times(1)
    escrow.ExpectRefund(context, bob, 45).Times(1).After(pay)
    ```

Go ahead and make the many necessary changes as you see fit.

### Wager handler unit tests

After these adjustments, it is a good idea to add unit tests directly on the wager handling functions of the keeper. Create a new `wager_handler_test.go` file. In it:

1. Add a setup helper function that does not create any message server:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler_test.go#L18-L26]
    func setupKeeperForWagerHandler(t testing.TB) (keeper.Keeper, context.Context,
        *gomock.Controller, *mock_types.MockBankEscrowKeeper) {
        ctrl := gomock.NewController(t)
        bankMock := mock_types.NewMockBankEscrowKeeper(ctrl)
        k, ctx := keepertest.CheckersKeeperWithMocks(t, bankMock)
        checkers.InitGenesis(ctx, *k, *types.DefaultGenesis())
        context := sdk.WrapSDKContext(ctx)
        return *k, context, ctrl, bankMock
    }
    ```

2. Add tests on the `CollectWager` function. For instance, when the game is malformed:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler_test.go#L28-L40]
    func TestWagerHandlerCollectWrongNoBlack(t *testing.T) {
        keeper, context, ctrl, _ := setupKeeperForWagerHandler(t)
        ctx := sdk.UnwrapSDKContext(context)
        defer ctrl.Finish()
        defer func() {
            r := recover()
            require.NotNil(t, r, "The code did not panic")
            require.Equal(t, "black address is invalid: : empty address string is not allowed", r)
        }()
        keeper.CollectWager(ctx, &types.StoredGame{
            MoveCount: 0,
        })
    }
    ```

    Or when the black player failed to escrow the wager:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler_test.go#L42-L57]
    func TestWagerHandlerCollectFailedNoMove(t *testing.T) {
        keeper, context, ctrl, escrow := setupKeeperForWagerHandler(t)
        ctx := sdk.UnwrapSDKContext(context)
        defer ctrl.Finish()
        black, _ := sdk.AccAddressFromBech32(alice)
        escrow.EXPECT().
            SendCoinsFromAccountToModule(ctx, black, types.ModuleName, gomock.Any()).
            Return(errors.New("Oops"))
        err := keeper.CollectWager(ctx, &types.StoredGame{
            Black:     alice,
            MoveCount: 0,
            Wager:     45,
        })
        require.NotNil(t, err)
        require.EqualError(t, err, "black cannot pay the wager: Oops")
    }
    ```

    Or when the collection of a wager works:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler_test.go#L90-L101]
    func TestWagerHandlerCollectNoMove(t *testing.T) {
        keeper, context, ctrl, escrow := setupKeeperForWagerHandler(t)
        ctx := sdk.UnwrapSDKContext(context)
        defer ctrl.Finish()
        escrow.ExpectPay(context, alice, 45)
        err := keeper.CollectWager(ctx, &types.StoredGame{
            Black:     alice,
            MoveCount: 0,
            Wager:     45,
        })
        require.Nil(t, err)
    }
    ```

3. Add similar tests to the payment of winnings from the escrow. When it fails:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler_test.go#L163-L184]
    func TestWagerHandlerPayWrongEscrowFailed(t *testing.T) {
        keeper, context, ctrl, escrow := setupKeeperForWagerHandler(t)
        ctx := sdk.UnwrapSDKContext(context)
        defer ctrl.Finish()
        black, _ := sdk.AccAddressFromBech32(alice)
        escrow.EXPECT().
            SendCoinsFromModuleToAccount(ctx, types.ModuleName, black, gomock.Any()).
            Times(1).
            Return(errors.New("Oops"))
        defer func() {
            r := recover()
            require.NotNil(t, r, "The code did not panic")
            require.Equal(t, r, "cannot pay winnings to winner: Oops")
        }()
        keeper.MustPayWinnings(ctx, &types.StoredGame{
            Black:     alice,
            Red:       bob,
            Winner:    "b",
            MoveCount: 1,
            Wager:     45,
        })
    }
    ```

    Or when it works:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler_test.go#L200-L212]
    func TestWagerHandlerPayEscrowCalledTwoMoves(t *testing.T) {
        keeper, context, ctrl, escrow := setupKeeperForWagerHandler(t)
        ctx := sdk.UnwrapSDKContext(context)
        defer ctrl.Finish()
        escrow.ExpectRefund(context, alice, 90)
        keeper.MustPayWinnings(ctx, &types.StoredGame{
            Black:     alice,
            Red:       bob,
            Winner:    "b",
            MoveCount: 2,
            Wager:     45,
        })
    }
    ```

4. You will also need a test for [refund](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/wager_handler_test.go#L251-L270) situations.

### Add bank escrow unit tests

Now that the wager handling has been convincingly tested, you want to confirm that its functions are called at the right junctures. Add dedicated tests with message servers that confirm how the bank is called. Add them in existing files, for instance:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_winner_test.go#L132-L140]
func TestPlayMoveUpToWinnerCalledBank(t *testing.T) {
    msgServer, _, context, ctrl, escrow := setupMsgServerWithOneGameForPlayMove(t)
    defer ctrl.Finish()
    payBob := escrow.ExpectPay(context, bob, 45).Times(1)
    payCarol := escrow.ExpectPay(context, carol, 45).Times(1).After(payBob)
    escrow.ExpectRefund(context, bob, 90).Times(1).After(payCarol)

    playAllMoves(t, msgServer, context, "1", game1Moves)
}
```

After doing all that, confirm that your tests run.

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

</CodeGroup>

## Integration tests

Your unit tests pass, and they confirm that the bank is called as per your expectations. It would be nice to add further tests that use a _real_ bank. This is possible with the help of integration tests.

Fortunately, you do not have to do this from scratch: taking inspiration from [tests on the bank module](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/bank/keeper/keeper_test.go#L66-L110), prepare your code so as to accommodate and create a full app that will contain a bank keeper, and add new tests.

For unit tests, each function takes a [`t *testing.T`](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/end_block_server_game_test.go#L12) object. For integration tests, each function will be a method on a test suite that inherits from [testify's suite](https://pkg.go.dev/github.com/stretchr/testify/suite). This has the advantage that your test suite can have as many fields as is necessary or useful. The objects that you have used and would welcome in the suite are:

```go
keeper    keeper.Keeper
msgServer types.MsgServer
ctx       sdk.Context
```

You can spread the suite's methods to different files, so as to keep consistent naming for your test files.

When testing, `go test` will find the suite because you add a [_regular_ test](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/bank/keeper/keeper_test.go#L1233-L1235) that initializes the suite and runs it. The test suite is then automatically initialized with its [`SetupTest`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/bank/keeper/keeper_test.go#L96) function via its parent `suite` class. After that, all the methods of the test suite are run.

### Accommodate your code

Copy and adjust from the Cosmos SDK.

<PanelList>

<PanelListItem number="1">

Ignite CLI created a default constructor for your App with a [`cosmoscmd.App`](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/app/app.go#L245-L256) return type, but this is not convenient. Instead of risking breaking other dependencies, add a new constructor with [your `App`](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/app/app.go#L257-L270) as the return type.

</PanelListItem>

<PanelListItem number="2">

Use [`encoding.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/app/encoding.go) taken from [here](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/encoding.go), where you:

* Import `"github.com/ignite-hq/cli/ignite/pkg/cosmoscmd"`.
* Replace `simappparams.EncodingConfig` with `cosmoscmd.EncodingConfig`.
* Replace `simappparams.MakeTestEncodingConfig` with `appparams.MakeTestEncodingConfig`.

</PanelListItem>

<PanelListItem number="3">

Use [`proto.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/app/params/proto.go) taken from [here](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/params/proto.go), where you:

* Import `"github.com/ignite-hq/cli/ignite/pkg/cosmoscmd"`.
* Replace `EncodingConfig` with `cosmoscmd.EncodingConfig`.

</PanelListItem>

<PanelListItem number="4">

Use [`test_helpers.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/app/test_helpers.go) taken from [here](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/test_helpers.go), in which you:

* Adjust from `SimApp` to `App`
* Adjust from `New()` to `NewApp()`
* Initialize your checkers genesis:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/app/test_helpers.go#L146-L147]
    checkersGenesis := types.DefaultGenesis()
    genesisState[types.ModuleName] = app.AppCodec().MustMarshalJSON(checkersGenesis)
    ```

</PanelListItem>

<PanelListItem number="5">

Define your test suite in a new `keeper_integration_test_suite.go` file:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper_integration_suite_test.go#L24-L31]
type IntegrationTestSuite struct {
    suite.Suite

    app         *checkersapp.App
    msgServer   types.MsgServer
    ctx         sdk.Context
    queryClient types.QueryClient
}
```

</PanelListItem>

<PanelListItem number="6">

Direct `go test` to it:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper_integration_suite_test.go#L37-L39]
func TestCheckersKeeperTestSuite(t *testing.T) {
    suite.Run(t, new(IntegrationTestSuite))
}
```

</PanelListItem>

<PanelListItem number="7" :last="true">

Create the `suite.SetupTest` function, taking inspiration from the [bank tests](https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b/x/bank/keeper/keeper_test.go#L96-L110):

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper_integration_suite_test.go#L41-L57]
func (suite *IntegrationTestSuite) SetupTest() {
    app := checkersapp.Setup(false)
    ctx := app.BaseApp.NewContext(false, tmproto.Header{Time: time.Now()})

    app.AccountKeeper.SetParams(ctx, authtypes.DefaultParams())
    app.BankKeeper.SetParams(ctx, banktypes.DefaultParams())
    checkersModuleAddress = app.AccountKeeper.GetModuleAddress(types.ModuleName).String()

    queryHelper := baseapp.NewQueryServerTestHelper(ctx, app.InterfaceRegistry())
    types.RegisterQueryServer(queryHelper, app.CheckersKeeper)
    queryClient := types.NewQueryClient(queryHelper)

    suite.app = app
    suite.msgServer = keeper.NewMsgServerImpl(app.CheckersKeeper)
    suite.ctx = ctx
    suite.queryClient = queryClient
}
```

This [`SetupTest` function](https://github.com/stretchr/testify/blob/v1.7.0/suite/interfaces.go#L18-L22) is like a `beforeEach` as found in other test libraries. With it, you always get a new `app` in each test, without interference between them. Do not [omit it](https://github.com/stretchr/testify/blob/v1.7.0/suite/suite.go#L147) unless you have specific reasons to do so.

Also note that it collects your `checkersModuleAddress` for later use in tests that check events and balances:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper_integration_suite_test.go#L33-L35]
var (
    checkersModuleAddress string
)
```

</PanelListItem>

</PanelList>

You can confirm you did all this correctly by running keeper tests now, although the suite has no tests.

### Helpers for money checking

Your upcoming integration tests will include checks on wagers being paid, lost, and won, so your tests need to initialize some bank balances for your players. This is made easier with a few helpers, including a helper to confirm a bank balance.

1. Make a bank genesis [`Balance`](https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b6/x/bank/types/genesis.pb.go#L105-L110) type from primitives:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper_integration_suite_test.go#L59-L69]
    func makeBalance(address string, balance int64) banktypes.Balance {
        return banktypes.Balance{
            Address: address,
            Coins: sdk.Coins{
                sdk.Coin{
                    Denom:  sdk.DefaultBondDenom,
                    Amount: sdk.NewInt(balance),
                },
            },
        }
    }
    ```

2. Declare default balances that will be useful for you:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper_integration_suite_test.go#L18-L22]
    const (
        balAlice = 50000000
        balBob   = 20000000
        balCarol = 10000000
    )
    ```

3. Make your preferred bank genesis state:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper_integration_suite_test.go#L71-L88]
    func getBankGenesis() *banktypes.GenesisState {
        coins := []banktypes.Balance{
            makeBalance(alice, balAlice),
            makeBalance(bob, balBob),
            makeBalance(carol, balCarol),
        }
        supply := banktypes.Supply{
            Total: coins[0].Coins.Add(coins[1].Coins...).Add(coins[2].Coins...)
        }

        state := banktypes.NewGenesisState(
            banktypes.DefaultParams(),
            coins,
            supply.GetTotal(),
            []banktypes.Metadata{})

        return state
    }
    ```

4. Add a simple function to prepare your suite with your desired balances:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper_integration_suite_test.go#L90-L92]
    func (suite *IntegrationTestSuite) setupSuiteWithBalances() {
        suite.app.BankKeeper.InitGenesis(suite.ctx, getBankGenesis())
    }
    ```

5. Add a function to check balances from primitives:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/keeper_integration_suite_test.go#L94-L100]
    func (suite *IntegrationTestSuite) RequireBankBalance(expected int, atAddress string) {
        sdkAdd, err := sdk.AccAddressFromBech32(atAddress)
        suite.Require().Nil(err, "Failed to parse address: %s", atAddress)
        suite.Require().Equal(
            int64(expected),
            suite.app.BankKeeper.GetBalance(suite.ctx, sdkAdd, sdk.DefaultBondDenom).Amount.Int64())
    }
    ```

With the preparation done, what does an integration test method look like?

### Anatomy of an integration suite test

Now you must add integration tests for your keeper in new files. What does an integration test look like? Take the example of a [simple unit test](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_create_game_test.go#L41-L72) ported to the integration test suite:

1. The method has a declaration:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_create_game_integration_test.go#L8]
    func (suite *IntegrationTestSuite) TestCreate1GameHasSaved()
    ```

    It is declared as a member of your test suite, and is prefixed with [`Test`](https://github.com/stretchr/testify/blob/v1.7.0/suite/suite.go#L181-L182).

2. The **setup** can be done as you like, but just like for unit tests you ought to create a helper and use it. Here one exists already:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_create_game_integration_test.go#L9-L10]
    suite.setupSuiteWithBalances()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    ```

3. The **action** is no different from a unit test's action, other than that you get the `keeper` or `msgServer` from the suite's fields:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_create_game_integration_test.go#L11-L17]
    suite.msgServer.CreateGame(goCtx, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
        Wager:   45,
    })
	keeper := suite.app.CheckersKeeper
    ```

4. The **verification** is done with `suite.Require().X`, but otherwise looks similar to the shorter `require.X` of unit tests:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_create_game_integration_test.go#L18-L24]
    systemInfo, found := keeper.GetSystemInfo(suite.ctx)
    suite.Require().True(found)
    suite.Require().EqualValues(types.SystemInfo{
        NextId:        2,
        FifoHeadIndex: "1",
        FifoTailIndex: "1",
    }, systemInfo)
    ```

    In fact, it is exactly the [same `require`](https://github.com/stretchr/testify/blob/v1.7.0/suite/suite.go#L24) object.

You have added an integration test that copies an existing unit test. It demonstrates the concept but is of limited additional utility.

### Extra tests

It is time to add extra tests that check money handling by the bank. Before jumping in, as you did in _play_ unit tests you can add a method that prepares your suite's keeper with a game ready to be played on:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_integration_test.go#L8-L17]
func (suite *IntegrationTestSuite) setupSuiteWithOneGameForPlayMove() {
    suite.setupSuiteWithBalances()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    suite.msgServer.CreateGame(goCtx, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
        Wager:   45,
    })
}
```

You will call this game from the relevant tests. You can do the [same for _reject_](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_reject_game_integration_test.go#L8-L17).

For the tests proper, before an action that you expect to transfer money (or not) you can verify the initial position:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_integration_test.go#L58-L61]
suite.RequireBankBalance(balAlice, alice)
suite.RequireBankBalance(balBob, bob)
suite.RequireBankBalance(balCarol, carol)
suite.RequireBankBalance(0, checkersModuleAddress)
```

After the action you can test the new balances, for instance:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_integration_test.go#L70-L73]
suite.RequireBankBalance(balAlice, alice)
suite.RequireBankBalance(balBob-45, bob)
suite.RequireBankBalance(balCarol, carol)
suite.RequireBankBalance(45, checkersModuleAddress)
```

How you subdivide your tests and where you insert these balance checks is up to you. You can find examples here for:

* [Creating a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_create_game_integration_test.go#L42-L59).
* [Playing the first move](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_integration_test.go#L55-L74), [the second move](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_integration_test.go#L208-L235), including [up to a resolution](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_integration_test.go#L307-L314). You can also [check the events](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_integration_test.go#L128-L163).
* Failing to play a game because of a failure to pay the wager on the [first move](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_integration_test.go#L103-L126) and the [second move](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_play_move_integration_test.go#L237-L268).
* [Rejecting a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_reject_game_integration_test.go#L30-L41), including when [there have been moves played](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/msg_server_reject_game_integration_test.go#L56-L79).
* [Forfeiting a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/end_block_server_game_integration_test.go#L10-L30), including when [there has been one move played](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/end_block_server_game_integration_test.go#L32-L60) or [two](https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/end_block_server_game_integration_test.go#L185-L222).

### What happened to the events?

With the new tests, you may think that the events are compromised. For instance, the event type `"transfer"` normally comes with three attributes, but when the bank has made two transfers the `"transfer"` event ends up with 6 attributes. This is just the way events are organized: per type, with the attributes piled in.

When checking emitted events, you need to skip over the attributes you are not checking. You can easily achieve that with [Go slices](https://go.dev/tour/moretypes/7).

For instance, here `transferEvent.Attributes[6:]` discards the first 6 attributes:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/payment-winning/x/checkers/keeper/end_block_server_game_integration_test.go#L264-L270]
transferEvent := events[6]
suite.Require().Equal(transferEvent.Type, "transfer")
suite.Require().EqualValues([]sdk.Attribute{
    {Key: "recipient", Value: carol},
    {Key: "sender", Value: checkersModuleAddress},
    {Key: "amount", Value: "90stake"},
}, transferEvent.Attributes[6:])
```

### Debug your suite

You learned in a [previous section](./stored-game.md) how to launch a test in debug mode. It is still possible to do so when using a suite. Depending on the versions of your Go installation and your Visual Studio Code, you can launch it in two ways:

1. Right-click on the arrow to the left of the suite's runner `func TestCheckersKeeperTestSuite`:

    ![Suite runner with green button](/academy/4-my-own-chain/images/go_test_debug_suite.png)

    Note that in this case you can only launch debug for **all** of the suite's test methods and not just a single one (as is possible with a simple test). 

2. Right-click on the arrow to the left of the separate test of the suite:

    ![Suite test with green button](/academy/4-my-own-chain/images/go_test_debug_suite_test.png)

    Note that this option may not be available. If being able to debug only a few tests at a time is important to you, a solution is to create more granular suites, for example using one or more test suites per file and falling back on option 1.

## Interact via the CLI

With the tests done, see what happens at the command-line.

Keep the game expiry at 5 minutes to be able to test a forfeit, as done in the [previous section](./game-forfeit.md). Now, you need to check balances after relevant steps to test that wagers are being withheld and paid.

How much do Alice and Bob have to start with?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query bank balances $alice
$ checkersd query bank balances $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query bank balances $alice
$ docker exec -it checkers checkersd query bank balances $bob
```

</CodeGroupItem>

</CodeGroup>

This prints:

```txt
balances:
- amount: "100000000"
  denom: stake
- amount: "20000"
  denom: token
  pagination:
  next_key: null
  total: "0"
balances:
- amount: "100000000"
  denom: stake
- amount: "10000"
  denom: token
  pagination:
  next_key: null
  total: "0"
```

Create a game on which the wager will be refunded because the player playing `red` did not join:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob 1000000 --from $alice
```

</CodeGroupItem>

</CodeGroup>

Which mentions the wager:

```txt
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"create_game"}]},{"type":"new-game-created","attributes":[{"key":"creator","value":"cosmos1yysy889jzf4kgd84mf6649gt6024x6upzs6pde"},{"key":"game-index","value":"1"},{"key":"black","value":"cosmos1yysy889jzf4kgd84mf6649gt6024x6upzs6pde"},{"key":"red","value":"cosmos1ktgz57udyk4sprkpm5m6znuhsm904l0een8k6y"},{"key":"wager","value":"1000000"}]}]}]'
```

Confirm that the balances of both Alice and Bob are unchanged - as they have not played yet.

<HighlightBox type="info">

**Note:** In this example Alice paid no gas fees, other than the transaction costs, to create a game. The gas price is likely `0` here anyway. This is fixed in the [next section](./gas-meter.md).

</HighlightBox>

Have Alice play:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 1 1 2 2 3 --from $alice
```

</CodeGroupItem>

</CodeGroup>

Confirm that Alice has paid her wager:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query bank balances $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query bank balances $alice
```

</CodeGroupItem>

</CodeGroup>

This prints:

```txt
balances:
- amount: "99000000" # <- 1,000,000 fewer
  denom: stake
- amount: "20000"
  denom: token
pagination:
  next_key: null
  total: "0"
```

Wait 5 minutes for the game to expire and check again:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query bank balances $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query bank balances $alice
```

</CodeGroupItem>

</CodeGroup>

This prints:

```txt
balances:
- amount: "100000000" # <- 1,000,000 are back
  denom: stake
- amount: "20000"
  denom: token
pagination:
  next_key: null
  total: "0"
```

Now create a game in which both players only play once each, i.e. where the player playing `black` forfeits:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice
$ checkersd tx checkers play-move 2 1 2 2 3 --from $alice
$ checkersd tx checkers play-move 2 0 5 1 4 --from $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob 1000000 --from $alice
$ docker exec -it checkers checkersd tx checkers play-move 2 1 2 2 3 --from $alice
$ docker exec -it checkers checkersd tx checkers play-move 2 0 5 1 4 --from $bob
```

</CodeGroupItem>

</CodeGroup>


Confirm that both Alice and Bob paid their wagers. Wait 5 minutes for the game to expire and check again:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query bank balances $alice
$ checkersd query bank balances $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query bank balances $alice
$ docker exec -it checkers checkersd query bank balances $bob
```

</CodeGroupItem>

</CodeGroup>

This shows:

```txt
balances:
- amount: "99000000" # <- her 1,000,000 are gone for good
  denom: stake
...
balances:
- amount: "101000000" # <- 1,000,000 more than at the beginning
  denom: stake
...
```

This is correct: Bob was the winner by forfeit.

Similarly, you can test that Alice gets her wager back when Alice creates a game, Alice plays, and then Bob rejects it.

It would be difficult to test by CLI when there is a winner after a full game. That would be better tested with a GUI, or by using integration tests as you did above.

## Next up

You can skip ahead and see how to integrate [foreign tokens](./wager-denom.md) via the use of IBC, or take a look at the [next section](./gas-meter.md) to prevent spam and reward validators proportional to their effort in your checkers blockchain.
