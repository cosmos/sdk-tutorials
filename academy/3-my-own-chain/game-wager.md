---
title: "Token - Let Players Set a Wager"
order: 16
description: Players set a wager
tags: 
  - guided-coding
  - cosmos-sdk
---

# Token - Let Players Set a Wager

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [modules](../2-main-concepts/modules.md), [keepers](../2-main-concepts/multistore-keepers.md), and [Protobuf](../2-main-concepts/protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase up to game expiry handling. If not, follow the [previous steps](./game-forfeit.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-forfeit-game).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add wagers.
* Work with the Bank module.
* Handle money.
* Do integration tests.

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
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

## New information

Add this wager value to the `StoredGame`'s Protobuf definition:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/proto/checkers/stored_game.proto#L18]
message StoredGame {
    ...
    uint64 wager = 12;
}
```

You can let players choose the wager they want by adding a dedicated field in the message to create a game, in `proto/checkers/tx.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/proto/checkers/tx.proto#L45]
message MsgCreateGame {
    ...
    uint64 wager = 4;
}
```

Have Ignite CLI and Protobuf recompile these two files:

```sh
$ ignite generate proto-go
```

Now add a helper function to `StoredGame` using the Cosmos SDK `Coin` in `full_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/types/full_game.go#L74-L76]
func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
    return sdk.NewCoin(sdk.DefaultBondDenom, sdk.NewInt(int64(storedGame.Wager)))
}
```

This encapsulates information about the wager (where `sdk.DefaultBondDenom` is most likely `"stake"`).

## Saving the wager

Time to make sure that the new field is saved in the storage and it is part of the creation event.

1. Define a new event key as a constant:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/types/keys.go#L49]
    const (
        StoredGameEventWager = "Wager"
    )
    ```

2. Set the actual value in the new `StoredGame` as it is instantiated in the create game handler:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_create_game.go#L33]
    storedGame := types.StoredGame{
        ...
        Wager: msg.Wager,
    }
    ```

3. And in the event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_create_game.go#L54]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.StoredGameEventWager, strconv.FormatUint(msg.Wager, 10)),
        )
    )
    ```

4. Modify the constructor among the interface definition of `MsgCreateGame` in `x/checkers/types/message_create_game.go` to avoid surprises:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/types/message_create_game.go#L15]
    func NewMsgCreateGame(creator string, red string, black string, wager uint64) *MsgCreateGame {
        return &MsgCreateGame{
            ...
            Wager: wager,
        }
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

The `bank` module has many capabilities, but all you need here are two functions. Therefore, you _redeclare_ the functions like so:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/types/expected_keepers.go#L7-L10]
type BankKeeper interface {
    SendCoinsFromModuleToAccount(ctx sdk.Context, senderModule string, recipientAddr sdk.AccAddress, amt sdk.Coins) error
    SendCoinsFromAccountToModule(ctx sdk.Context, senderAddr sdk.AccAddress, recipientModule string, amt sdk.Coins) error
}
```

These two functions must exactly match the functions declared in the [`bank`'s keeper.go file](https://github.com/cosmos/cosmos-sdk/blob/8b78406/x/bank/keeper/keeper.go#L37-L39). Copy the declarations directly from the `bank`'s file. In Go, any object with these two functions is a `BankKeeper`.

## Obtaining the capability

With your requirements declared, it is time to make sure your keeper receives a reference to a bank keeper. First add a `BankKeeper` to your keeper in `x/checkers/keeper/keeper.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper.go#L16]
type (
    Keeper struct {
        bank types.BankKeeper
        ...
    }
)
```

This `BankKeeper` is your newly declared narrow interface. Do not forget to adjust the constructor accordingly:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper.go#L25-L41]
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

Next, update where the constructor is called and pass a proper instance of `BankKeeper`. This happens in `app/app.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/app/app.go#L368-L369]
app.CheckersKeeper = *checkersmodulekeeper.NewKeeper(
    app.BankKeeper,
    ...
)
```

This `app.BankKeeper` is a full `bank` keeper that also conforms to your `BankKeeper` interface.

Finally, inform the app that your checkers module is going to hold balances in escrow by adding it to the list of permitted modules:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/6213d10/app/app.go#L153]
maccPerms = map[string][]string{
    ...
    checkersmoduletypes.ModuleName: nil,
}
```

It is only keeping funds in escrow and not minting or burning, hence the `nil`.

One last step. Before your module can keep money in escrow, it needs to be **whitelisted** by the bank module. You do this in the `maccperms`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/app/app.go#L154]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/types/errors.go#L23-L29]
ErrRedCannotPay      = sdkerrors.Register(ModuleName, 1112, "red cannot pay the wager")
ErrBlackCannotPay    = sdkerrors.Register(ModuleName, 1113, "black cannot pay the wager")
ErrNothingToPay      = sdkerrors.Register(ModuleName, 1115, "there is nothing to pay, should not have been called")
ErrCannotRefundWager = sdkerrors.Register(ModuleName, 1116, "cannot refund wager to: %s")
ErrCannotPayWinnings = sdkerrors.Register(ModuleName, 1117, "cannot pay winnings to winner")
ErrNotInRefundState  = sdkerrors.Register(ModuleName, 1118, "game is not in a state to refund, move count: %d")
```

## Money handling steps

With the `bank` now in your keeper, it is time to have your keeper handle the money. Keep this concern in its file, as the functions are reused on a play, reject, and forfeit.

Create the new file `x/checkers/keeper/wager_handler.go` and add three functions to collect a wager, refund a wager, and pay winnings:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/wager_handler.go]
func (k *Keeper) CollectWager(ctx sdk.Context, storedGame *types.StoredGame) error
func (k *Keeper) MustPayWinnings(ctx sdk.Context, storedGame *types.StoredGame)
func (k *Keeper) MustRefundWager(ctx sdk.Context, storedGame *types.StoredGame)
```

The `Must` prefix in the function means that the transaction either takes place or a panic is issued. If a player cannot pay the wager, it is a user-side error and the user must be informed of a failed transaction. If the module cannot pay, it means the escrow account has failed. This error is much more serious: an invariant has been violated and the whole application must be terminated.

Now set up collecting a wager, paying winnings, and refunding a wager:

1. **Collecting wagers** happens on a player's first move. Therefore, differentiate between players:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/wager_handler.go#L15-L36]
    if storedGame.MoveCount == 0 {
        // Black plays first
    } else if storedGame.MoveCount == 1 {
        // Red plays second
    }
    return nil
    ```

    Get the address for the black player:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/wager_handler.go#L17-L20]
    black, err := storedGame.GetBlackAddress()
    if err != nil {
        panic(err.Error())
    }
    ```

    Try to transfer into the escrow:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/wager_handler.go#L21-L24]
    err = k.bank.SendCoinsFromAccountToModule(ctx, black, types.ModuleName, sdk.NewCoins(storedGame.GetWagerCoin()))
    if err != nil {
        return sdkerrors.Wrapf(err, types.ErrBlackCannotPay.Error())
    }
    ```

    Then do the same for the red player.

2. **Paying winnings** takes place when the game has a declared winner. First get the winner. "No winner" is **not** an acceptable situation in this `MustPayWinnings`. The caller of the function must ensure there is a winner:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/wager_handler.go#L42-L48]
    winnerAddress, found, err := storedGame.GetWinnerAddress()
    if err != nil {
        panic(err.Error())
    }
    if !found {
        panic(fmt.Sprintf(types.ErrCannotFindWinnerByColor.Error(), storedGame.Winner))
    }
    ```

    Then get the winnings to pay:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/wager_handler.go#L49-L54]
    winnings := storedGame.GetWagerCoin()
    if storedGame.MoveCount == 0 {
        panic(types.ErrNothingToPay.Error())
    } else if 1 < storedGame.MoveCount {
        winnings = winnings.Add(winnings)
    }
    ```

    You double the wager only if the red player has also played and therefore both players have paid their wagers. Then pay the winner:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/wager_handler.go#L55-L58]
    err = k.bank.SendCoinsFromModuleToAccount(ctx, types.ModuleName, winnerAddress, sdk.NewCoins(winnings))
    if err != nil {
        panic(types.ErrCannotPayWinnings.Error())
    }
    ```

3. Finally, **refunding wagers** takes place when the game has partially started, i.e. only one party has paid, or when the game ends in a draw. In this narrow case of `MustRefundWager`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/wager_handler.go#L64-L78]
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

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/wager_handler.go#L65-L72]
    black, err := storedGame.GetBlackAddress()
    if err != nil {
        panic(err.Error())
    }
    err = k.bank.SendCoinsFromModuleToAccount(ctx, types.ModuleName, black, sdk.NewCoins(storedGame.GetWagerCoin()))
    if err != nil {
        panic(fmt.Sprintf(types.ErrCannotRefundWager.Error(), rules.BLACK_PLAYER.Color))
    }
    ```

    If the module cannot pay, then there is a panic as the escrow has failed.

You will notice that no special case is made when the wager is zero. This is a design choice here, and which way you choose to go is up to you. Not contacting the bank unnecessarily is cheaper in gas. On the other hand, why not outsource the zero check to the bank?

## Insert wager handling

With the desired steps defined in the wager handling functions, it is time to invoke them at the right places in the message handlers.

1. When a player plays for the first time:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_play_move.go#L51-L54]
    err = k.Keeper.CollectWager(ctx, &storedGame)
    if err != nil {
        return nil, err
    }
    ```

2. When a player wins as a result of a move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_play_move.go#L79-L86]
    if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
        ...
    } else {
        ...
        k.Keeper.MustPayWinnings(ctx, &storedGame)
    }
    ```

3. When a player rejects a game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_reject_game.go#L39]
    k.Keeper.MustRefundWager(ctx, &storedGame)
    ```

4. When a game expires and there is a forfeit, make sure to only refund or pay full winnings when applicable. The logic needs to be adjusted:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/end_block_server_game.go#L45-L56]
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

## Integration tests

If you try running your existing tests you will see a lot of **null pointer exceptions**. That's because currently the tests set up your checkers keeper [without a bank keeper](https://github.com/cosmos/b9-checkers-academy-draft/blob/ba95217/x/checkers/keeper/keeper_test.go#L30-L34). Cosmos SDK does not have [mocks](https://en.wikipedia.org/wiki/Mock_object), so instead of passing a mocked bank when setting up your test keeper you need to build a proper bank keeper too. Fortunately, you do not have to do this from scratch: taking inspiration from [tests on the bank module](https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b/x/bank/keeper/keeper_test.go#L66-L110), prepare your code and tests in order to accommodate and create a full app which will contain a bank keeper.

<HighlightBox type="note">

Your existing tests, although never pure **unit** tests, will become true **integration** tests.

</HighlightBox>

Previously, each test function took a [`t *testing.T`](https://github.com/cosmos/b9-checkers-academy-draft/blob/ba95217/x/checkers/keeper/end_block_server_game_test.go#L12) object. Now, each test function will be a method on a test suite that inherits from [testify's suite](https://pkg.go.dev/github.com/stretchr/testify/suite). This has the advantage that your test suite can have as many fields as is necessary or useful. The objects that you have used and would welcome in the suite are:

```go
keeper    keeper.Keeper
msgServer types.MsgServer
ctx       sdk.Context
```

You can spread the suite's methods to different files, so as to keep consistent naming for your test files.

When testing, `go test` will find the suite because you add a [_regular_ test](https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b/x/bank/keeper/keeper_test.go#L1241-L1243) that initializes the suite and runs it. The test suite is then automatically initialized with its [`SetupTest`](https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b/x/bank/keeper/keeper_test.go#L96) function via its parent `suite` class. After that, all the methods of the test suite are run.

### Accommodate your code

1. To get the compilation error out of the way, for basic tests that do not require integration you can add an empty bank keeper on `func setupKeeper(t testing.TB)`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_test.go#L35]
    keeper := keeper.NewKeeper(
        *new(bankkeeper.Keeper),
        ...
    }
    ```

    Keep this `setupKeeper` function because tests created by Ignite CLI expect it.

2. Ignite CLI created a default constructor for your App with a [`cosmoscmd.App`](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/app/app.go#L219-L230) return type, but this is not convenient as you need access to the `app.App` type for initialization in the upcoming tests. Instead of risking breaking other dependencies, add a new constructor with [your `App`](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/app/app.go#L231-L255) as the return type.
3. Add other elements taken from Cosmos SDK tests, like [`encoding.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/app/encoding.go), [`proto.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/app/params/proto.go), and [`test_helpers.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/app/test_helpers.go), in which you must also initialize your checkers genesis:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/app/test_helpers.go#L127-L128]
    checkersGenesis := types.DefaultGenesis()
    genesisState[types.ModuleName] = app.AppCodec().MustMarshalJSON(checkersGenesis)
    ```

4. Define your test suite in a new `keeper_integration_test.go` file:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L38-L45]
    type IntegrationTestSuite struct {
        suite.Suite

        app         *checkersapp.App
        msgServer   types.MsgServer
        ctx         sdk.Context
        queryClient types.QueryClient
    }
    ```

5. Direct `go test` to it:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L47-L49]
    func TestCheckersKeeperTestSuite(t *testing.T) {
        suite.Run(t, new(IntegrationTestSuite))
    }
    ```

6. Create the `suite.SetupTest` function, taking inspiration from the [bank tests](https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b/x/bank/keeper/keeper_test.go#L96-L110):

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L51-L67]
    func (suite *IntegrationTestSuite) SetupTest() {
        app := checkersapp.Setup(false)
        ctx := app.BaseApp.NewContext(false, tmproto.Header{})

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

    This [`SetupTest` function](https://github.com/stretchr/testify/blob/v1.7.0/suite/interfaces.go#L18-L22) is like a `beforeEach` as it is named in other test libraries. With it, you always get a new `app` with each test, without interference between them. Do not [omit it](https://github.com/stretchr/testify/blob/v1.7.0/suite/suite.go#L147) unless you have specific reasons to do so.

    Also note that it collects your `checkersModuleAddress` for later use in tests that check events and balances:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L34-L36]
    var (
        checkersModuleAddress string
    )
    ```

### Helpers for money checking

Your new tests will include checks on wagers being paid, lost, and won, so your tests need to initialize some bank balances for your players. This is made easier with a few helpers, including a helper to confirm a bank balance.

1. Make a bank genesis [`Balance`](https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b6/x/bank/types/genesis.pb.go#L105-L110) type from primitives:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L69-L79]
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

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L26-L31]
    const (
        alice    = "cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d3"
        bob      = "cosmos1xyxs3skf3f4jfqeuv89yyaqvjc6lffavxqhc8g"
        carol    = "cosmos1e0w5t53nrq7p66fye6c8p0ynyhf6y24l4yuxd7"
        balAlice = 50000000
        balBob   = 20000000
        balCarol = 10000000
    )
    ```

3. Make your preferred bank genesis state:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L81-L96]
    func getBankGenesis() *banktypes.GenesisState {
        coins := []banktypes.Balance{
            makeBalance(alice, balAlice),
            makeBalance(bob, balBob),
            makeBalance(carol, balCarol),
        }
        supply := banktypes.NewSupply(coins[0].Coins.Add(coins[1].Coins...).Add(coins[2].Coins...))

        state := banktypes.NewGenesisState(
            banktypes.DefaultParams(),
            coins,
            supply.GetTotal(),
            []banktypes.Metadata{})

        return state
    }
    ```

4. Add a simple function to prepare your suite with your desired balances:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L98-L100]
    func (suite *IntegrationTestSuite) setupSuiteWithBalances() {
        suite.app.BankKeeper.InitGenesis(suite.ctx, getBankGenesis())
    }
    ```

5. Add a function to check balances from primitives:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L102-L108]
    func (suite *IntegrationTestSuite) RequireBankBalance(expected int, atAddress string) {
        sdkAdd, err := sdk.AccAddressFromBech32(atAddress)
        suite.Require().Nil(err, "Address %s failed to parse")
        suite.Require().Equal(
            int64(expected),
            suite.app.BankKeeper.GetBalance(suite.ctx, sdkAdd, sdk.DefaultBondDenom).Amount.Int64())
    }
    ```

6. Update any functions you used to set up your keeper with one game, for instance:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_play_move_test.go#L8-L17]
    func (suite *IntegrationTestSuite) setupSuiteWithOneGameForPlayMove() {
        suite.setupSuiteWithBalances()
        goCtx := sdk.WrapSDKContext(suite.ctx)
        suite.msgServer.CreateGame(goCtx, &types.MsgCreateGame{
            Creator: alice,
            Red:     bob,
            Black:   carol,
            Wager:   11,
        })
    }
    ```

With the preparation done, what does a test method look like?

### Anatomy of an integration suite test

Now you must refactor the existing tests that test your keeper. What does a refactored test look like?

1. The method declaration:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_create_game_test.go#L8]
    func (suite *IntegrationTestSuite) TestCreateGame()
    ```

    It is declared as a member of your test suite, and is prefixed with [`Test`](https://github.com/stretchr/testify/blob/v1.7.0/suite/suite.go#L181-L182).

2. The **setup** can be done as you like, but since you created a helper you can use it:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_create_game_test.go#L9-L10]
    suite.setupSuiteWithBalances()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    ```

3. The **action** does not change from before, other than that you get the `keeper` or `msgServer` from the suite's fields:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_create_game_test.go#L11-L16]
    createResponse, err := suite.msgServer.CreateGame(goCtx, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
        Wager:   12,
    })
    ```

4. The **verification** is done with `suite.Require().X`, but otherwise looks similar to the shorter `require.X`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_create_game_test.go#L17-L20]
    suite.Require().Nil(err)
    suite.Require().EqualValues(types.MsgCreateGameResponse{
        IdValue: "1",
    }, *createResponse)
    ```

    In fact, it is exactly the [same `require`](https://github.com/stretchr/testify/blob/v1.7.0/suite/suite.go#L24) object. A basic search and replace should work.

5. If you need access to the checkers keeper, it can also be found in the suite:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_create_game_test.go#L51-L52]
    keeper := suite.app.CheckersKeeper
    nextGame, found := keeper.GetNextGame(suite.ctx)
    ```

### What happened to the events?

As you refactor your existing tests, you may notice that the events become messed up. That is because the bank emits events too, and in particular it emits:

1. An event with the `message` type, like yours, with only the sender:

    ```go [https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b6/x/bank/keeper/send.go#L166-L169]
    sdk.NewEvent(
        sdk.EventTypeMessage,
        sdk.NewAttribute(types.AttributeKeySender, fromAddr.String()),
    ),
    ```

2. An event with the `transfer` type:

    ```go [https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b6/x/bank/keeper/send.go#L160-L165]
    sdk.NewEvent(
        types.EventTypeTransfer,
        sdk.NewAttribute(types.AttributeKeyRecipient, toAddr.String()),
        sdk.NewAttribute(types.AttributeKeySender, fromAddr.String()),
        sdk.NewAttribute(sdk.AttributeKeyAmount, amt.String()),
    )
    ```

This means that in your `suite.ctx.EventManager().ABCIEvents()` there are [extra events](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_play_move_test.go#L242) to account for, and in each case there are extra attributes to discard. Recommended steps:

1. Make explicit the count of expected attributes for each event type:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/keeper_integration_test.go#L18-L25]
    const (
        transferEventCount            = 3 // As emitted by the bank
        createEventCount              = 7
        playEventCountFirst           = 8 // Extra "sender" attribute emitted by the bank
        playEventCountNext            = 7
        rejectEventCount              = 4
        rejectEventCountWithTransfer  = 5  // Extra "sender" attribute emitted by the bank
        forfeitEventCount             = 4
        forfeitEventCountWithTransfer = 5  // Extra "sender" attribute emitted by the bank
    )
    ```

2. Make calculations on the expected count of attributes to discard, depending on the actions previously taken:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_reject_game_test.go#L248-L255]
    rejectAttributesDiscardCount := createEventCount + playEventCountFirst
    suite.Require().EqualValues([]sdk.Attribute{
        ...
        {Key: "IdValue", Value: "1"},
    }, rejectEvent.Attributes[rejectAttributesDiscardCount:])
    ```

You can now refactor your tests, which is a substantial task.

### Extra tests

After refactoring, and finding no failing tests, it is time to add extra checks of money handling. For instance, before an action that you expect to transfer money (or not), you can verify the initial position:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_play_move_test.go#L68-L71]
suite.RequireBankBalance(balAlice, alice)
suite.RequireBankBalance(balBob, bob)
suite.RequireBankBalance(balCarol, carol)
suite.RequireBankBalance(0, checkersModuleAddress)
```

After the action you can test the new balances, for instance:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_play_move_test.go#L80-L83]
suite.RequireBankBalance(balAlice, alice)
suite.RequireBankBalance(balBob, bob)
suite.RequireBankBalance(balCarol-11, carol)
suite.RequireBankBalance(11, checkersModuleAddress)
```

How you subdivide your tests and where you insert these balance checks is up to you. You can find examples here for:

* [Creating a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_create_game_test.go#L23-L40).
* [Playing a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_play_move_test.go#L65-L84), including [up to a resolution](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_play_move_winner_test.go#L142-L145).
* Failing to play a game because of a [failure to pay the wager](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_play_move_test.go#L323-L354).
* [Rejecting a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_reject_game_test.go#L41-L52), including when [there have been moves played](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/msg_server_reject_game_test.go#L175-L198).
* [Forfeiting a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/end_block_server_game_test.go#L44-L47), including when [there have been moves played](https://github.com/cosmos/b9-checkers-academy-draft/blob/872366cd/x/checkers/keeper/end_block_server_game_test.go#L776-L779).

### Debug your suite

You learned in a [previous section](./stored-game.md) how to launch your test in debug mode. It is still possible to do so when using a suite. The difference is that you launch it by right-clicking on the arrow left of the suite's runner `func TestCheckersKeeperTestSuite`:

![Suite runner with green button](/academy/3-my-own-chain/images/go_test_debug_suite.png)

Note that you can only launch debug for all of the suite's test methods and not just a single one (as is possible with a simple test). A solution to this is to create more granular suites, for example using one or more test suites per file.

## Interact via the CLI

Keep the game expiry at 5 minutes to be able to test a forfeit, as done in the [previous section](./game-forfeit.md). Now, you need to check balances after relevant steps to test that wagers are being withheld and paid.

How much do Alice and Bob have to start with?

<CodeGroup>
<CodeGroupItem title="Alice" active>

```sh
$ checkersd query bank balances $alice
```

This prints:

```
balances:
- amount: "100000000"
  denom: stake
- amount: "20000"
  denom: token
  pagination:
  next_key: null
  total: "0"
```

</CodeGroupItem>
<CodeGroupItem title="Bob">

```sh
$ checkersd query bank balances $bob
```

This prints:

```
balances:
- amount: "100000000"
  denom: stake
- amount: "10000"
  denom: token
  pagination:
  next_key: null
  total: "0"
```

</CodeGroupItem>
</CodeGroup>

---

Create a game on which the wager will be refunded because the player playing `red` did not join:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice
```

Which mentions the wager:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"CreateGame"},{"key":"module","value":"checkers"},{"key":"action","value":"NewGameCreated"},{"key":"Creator","value":"cosmos1z63q2mn2f6ljm8vfxjzpuz0xthmyx9qd0yy5xr"},{"key":"Index","value":"1"},{"key":"Red","value":"cosmos1z63q2mn2f6ljm8vfxjzpuz0xthmyx9qd0yy5xr"},{"key":"Black","value":"cosmos195e0h5qw44sazd450yt5qvllukcfp7lyc3f9kr"},{"key":"Wager","value":"1000000"}]}]}]'
```

Confirm that the balances of both Alice and Bob are unchanged - as they have not played yet.

<HighlightBox type="info">

**Note:** In this example Alice paid no gas fees, other than the transaction costs, to create a game. This is fixed in the [next section](./gas-meter.md).

</HighlightBox>

Have Bob play:

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $bob
```

Confirm that Bob has paid his wager:

```sh
$ checkersd query bank balances $bob
```

This prints:

```
balances:
- amount: "99000000" # <- 1,000,000 fewer
  denom: stake
- amount: "10000"
  denom: token
pagination:
  next_key: null
  total: "0"
```

Wait 5 minutes for the game to expire and check again:

```sh
$ checkersd query bank balances $bob
```

This prints:

```
balances:
- amount: "100000000" # <- 1,000,000 are back
  denom: stake
- amount: "10000"
  denom: token
pagination:
  next_key: null
  total: "0"
```

Now create a game in which both players only play once each, i.e. where the player playing `black` forfeits:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice
$ checkersd tx checkers play-move 2 1 2 2 3 --from $bob
$ checkersd tx checkers play-move 2 0 5 1 4 --from $alice
```

Confirm that both Alice and Bob paid their wagers. Wait 5 minutes for the game to expire and check again:

<CodeGroup>
<CodeGroupItem title="Alice" active>

```sh
$ checkersd query bank balances $alice
```

This shows:

```
balances:
- amount: "101000000" # <- 1,000,000 more than at the beginning
  denom: stake
...
```

</CodeGroupItem>
<CodeGroupItem title="Bob">

```sh
$ checkersd query bank balances $bob
```

This shows:

```
balances:
- amount: "99000000" # <- his 1,000,000 are gone for good
  denom: stake
...
```

</CodeGroupItem>
</CodeGroup>

---

This is correct: Alice was the winner by forfeit.

Similarly, you can test that Bob gets his wager back when Alice creates a game, Bob plays, and then Alice rejects it.

It would be difficult to test by CLI when there is a winner after a full game. That would be better tested with a GUI.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to work with the Bank module and handle players making wagers on games, now that the application supports live games playing to completion (with the winner claiming both wagers) or expiring through inactivity (with the inactive player forfeiting their wager as if losing), and no possibility of staked value being stranded in inactive games.
* How to add the new "wager" value, modify the "create a game" message, and add a helper function to allow players to choose the wager they want to make.
* How to save the wager by defining a new event key, modifying the create game handler and the event to set the wager value, and modifying the constructor in the `MsgCreateGame` interface definition.
* How to add handling actions which ask the `bank` module to perform the token transfers required by the wager, and where to invoke them in the message handlers.
* How to create a new wager-handling file with functions to collect a wager, refund a wager, and pay winnings, in which `must` prefixes indicate either a user-side error (leading to a failed transaction) or a failure of the application's escrow account (requiring the whole application be terminated).
* How to run integration tests, which requires you to first build a proper bank keeper, create new helpers, refactor your existing keeper tests, account for the new events being emitted from the bank, and add extra checks of money handling.
* How to interact with the CLI to check account balances to test that wagers are being withheld and paid.

</HighlightBox>

<!--## Next up

You can skip ahead and see how to integrate [foreign tokens](./wager-denom.md) via the use of IBC, or take a look at the [next section](./gas-meter.md) to prevent spam and reward validators proportional to their effort in your checkers blockchain.-->
