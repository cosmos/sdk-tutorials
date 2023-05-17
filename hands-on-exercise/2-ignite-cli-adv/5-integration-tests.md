---
title: "Add Integration Tests"
order: 8
description: Add Integration Tests to Wager Payments
tags:
  - guided-coding
  - cosmos-sdk
---

# Integration Tests

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [modules](/academy/2-cosmos-concepts/5-modules.md), [keepers](/academy/2-cosmos-concepts/7-multistore-keepers.md), and [testing](/academy/2-cosmos-concepts/12-testing.md).
* Go is installed.
* You have the checkers blockchain codebase up to the wager payments. If not, follow the [previous steps](./5-payment-winning.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/payment-winning).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add integration tests.

</HighlightBox>

In the [previous section](./5-payment-winning.md), you handled wager payments and added unit tests that pass. You added mocks of the bank keeper. Mocks are useful to embody your expectations of the bank keeper's behavior and then quickly confirm that your code does what you expect. By interacting via the CLI, you also confirmed that the bank keeper behaved as you expected.

Now, it would be better to automatically check that your expectations of the bank keeper's behavior are correct. This is done with integration tests, and is the focus of this section.

## What is to be done

In order, you will:

* Prepare your code to accept integration tests.
* Create helper functions that will make your integration tests more succinct.
* Add integration tests that create a full app and test proper token bank balances.

<HighlightBox type="remember">

As a reminder:

* At version 0.45.4 of the Cosmos SDK, an integration test creates a full app.
* At version 0.47 of the SDK, an integration test creates a minimal app, and a test that creates a full app is called an end-to-end test (E2E).

</HighlightBox>

Fortunately, you do not have to do this from scratch: taking inspiration from [tests on the bank module](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/bank/keeper/keeper_test.go#L66-L110), prepare your code so as to accommodate and create a full app that will contain a bank keeper, and add new tests.

For unit tests, each function takes a [`t *testing.T`](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/x/checkers/keeper/end_block_server_game_test.go#L12) object. For integration tests, each function will be a method on a test suite that inherits from [testify's suite](https://pkg.go.dev/github.com/stretchr/testify/suite). This has the advantage that your test suite can have as many fields as is necessary or useful. The objects that you have used and would welcome in the suite are:

```go
keeper    keeper.Keeper
msgServer types.MsgServer
ctx       sdk.Context
```

You can spread the suite's methods to different files, so as to keep consistent naming for your test files.

When testing, `go test` will find the suite because you add a [_regular_ test](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/bank/keeper/keeper_test.go#L1233-L1235) that initializes the suite and runs it. The test suite is then automatically initialized with its [`SetupTest`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/bank/keeper/keeper_test.go#L96) function via its parent `suite` class. After that, all the methods of the test suite are run.

## Accommodate your code

Copy and adjust from the Cosmos SDK.

<PanelList>

<PanelListItem number="1">

Ignite CLI created a default constructor for your App with a [`cosmoscmd.App`](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/app/app.go#L245-L256) return type, but this is not convenient. Instead of risking breaking other dependencies, add a new constructor with [your `App`](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/app/app.go#L257-L281) as the return type.

</PanelListItem>

<PanelListItem number="2">

Use [`encoding.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/app/encoding.go) taken from [here](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/encoding.go), where you:

* Import `"github.com/ignite-hq/cli/ignite/pkg/cosmoscmd"`.
* Replace `simappparams.EncodingConfig` with `cosmoscmd.EncodingConfig`.
* Replace `simappparams.MakeTestEncodingConfig` with `appparams.MakeTestEncodingConfig`.

</PanelListItem>

<PanelListItem number="3">

Use [`proto.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/app/params/proto.go) taken from [here](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/params/proto.go), where you:

* Import `"github.com/ignite-hq/cli/ignite/pkg/cosmoscmd"`.
* Replace `EncodingConfig` with `cosmoscmd.EncodingConfig`.

</PanelListItem>

<PanelListItem number="4">

Use [`test_helpers.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/app/test_helpers.go) taken from [here](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/test_helpers.go), in which you:

* Adjust from `SimApp` to `App`
* Adjust from `New()` to `NewApp()`
* Initialize your checkers genesis:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/app/test_helpers.go#L146-L147]
    checkersGenesis := types.DefaultGenesis()
    genesisState[types.ModuleName] = app.AppCodec().MustMarshalJSON(checkersGenesis)
    ```

</PanelListItem>

<PanelListItem number="5">

Define your test suite in a new `keeper_integration_suite_test.go` file in a dedicated folder `tests/integration/checkers/keeper`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L30-L37]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L43-L45]
func TestCheckersKeeperTestSuite(t *testing.T) {
    suite.Run(t, new(IntegrationTestSuite))
}
```

</PanelListItem>

<PanelListItem number="7" :last="true">

Create the `suite.SetupTest` function, taking inspiration from the [bank tests](https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b/x/bank/keeper/keeper_test.go#L96-L110):

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L47-L63]
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

<HighlightBox type="note">

It collects your `checkersModuleAddress` for later use in tests that check events and balances:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L39-L41]
var (
    checkersModuleAddress string
)
```

</HighlightBox>

</PanelListItem>

</PanelList>

## Test the test suite

You can now confirm you did all this correctly by running these new keeper integration tests, although the suite has no tests. Note how the path to call has changed:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go test github.com/alice/checkers/tests/integration/checkers/keeper
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    go test github.com/alice/checkers/tests/integration/checkers/keeper
```

</CodeGroupItem>

</CodeGroup>

## Helpers for money checking

Your upcoming integration tests will include checks on wagers being paid, lost, and won, so your tests need to initialize some bank balances for your players. This is made easier with a few helpers, including a helper to confirm a bank balance.

1. Make a bank genesis [`Balance`](https://github.com/cosmos/cosmos-sdk/blob/9e1ec7b6/x/bank/types/genesis.pb.go#L105-L110) type from primitives:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L65-L75]
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

2. Declare default accounts and balances that will be useful for you:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L19-L28]
    import (
        "github.com/alice/checkers/x/checkers/testutil"
    ) 

    const (
        alice = testutil.Alice
        bob   = testutil.Bob
        carol = testutil.Carol
    )
    const (
        balAlice = 50000000
        balBob   = 20000000
        balCarol = 10000000
    )
    ```

3. Make your preferred bank genesis state:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L77-L94]
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

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L96-L98]
    func (suite *IntegrationTestSuite) setupSuiteWithBalances() {
        suite.app.BankKeeper.InitGenesis(suite.ctx, getBankGenesis())
    }
    ```

5. Add a function to check balances from primitives:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L100-L106]
    func (suite *IntegrationTestSuite) RequireBankBalance(expected int, atAddress string) {
        sdkAdd, err := sdk.AccAddressFromBech32(atAddress)
        suite.Require().Nil(err, "Failed to parse address: %s", atAddress)
        suite.Require().Equal(
            int64(expected),
            suite.app.BankKeeper.GetBalance(suite.ctx, sdkAdd, sdk.DefaultBondDenom).Amount.Int64())
    }
    ```

With the preparation done, what does an integration test method look like?

## Anatomy of an integration suite test

Now you must add integration tests for your keeper in new files. What does an integration test look like? Take the example of a [simple unit test](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/x/checkers/keeper/msg_server_create_game_test.go#L35-L66) ported to the integration test suite:

1. The method has a declaration:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_create_game_test.go#L8]
    func (suite *IntegrationTestSuite) TestCreate1GameHasSaved()
    ```

    It is declared as a member of your test suite, and is prefixed with [`Test`](https://github.com/stretchr/testify/blob/v1.7.0/suite/suite.go#L181-L182).

2. The **setup** can be done as you prefer, but just like for unit tests you ought to create a helper and use it. Here one exists already:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_create_game_test.go#L9-L10]
    suite.setupSuiteWithBalances()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    ```

3. The **action** is no different from a unit test's action, other than that you get the `keeper` or `msgServer` from the suite's fields:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_create_game_test.go#L11-L17]
    suite.msgServer.CreateGame(goCtx, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
        Wager:   45,
    })
    keeper := suite.app.CheckersKeeper
    ```

4. The **verification** is done with `suite.Require().X`, but otherwise looks similar to the shorter `require.X` of unit tests:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_create_game_test.go#L18-L24]
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

## Extra tests

It is time to add extra tests that check money handling by the bank. Before jumping in, as you did in _play_ unit tests you can add a method that prepares your suite's keeper with a game ready to be played on:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_play_move_test.go#L9-L18]
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

You will call this function from the relevant tests.

For the tests proper, before an action that you expect to transfer money (or not), you can verify the initial position:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_play_move_test.go#L59-L62]
suite.RequireBankBalance(balAlice, alice)
suite.RequireBankBalance(balBob, bob)
suite.RequireBankBalance(balCarol, carol)
suite.RequireBankBalance(0, checkersModuleAddress)
```

After the action you can test the new balances, for instance:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_play_move_test.go#L71-L74]
suite.RequireBankBalance(balAlice, alice)
suite.RequireBankBalance(balBob-45, bob)
suite.RequireBankBalance(balCarol, carol)
suite.RequireBankBalance(45, checkersModuleAddress)
```

How you subdivide your tests and where you insert these balance checks is up to you. You can find examples here for:

* [Creating a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_create_game_test.go#L42-L59).
* [Playing the first move](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_play_move_test.go#L56-L75) and [the second move](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_play_move_test.go#L209-L236), including [up to a resolution](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_play_move_test.go#L308-L315). You can also [check the events](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_play_move_test.go#L129-L164).
* Failing to play a game because of a failure to pay the wager on the [first move](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_play_move_test.go#L104-L127) and the [second move](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/msg_server_play_move_test.go#L238-L269).
* [Forfeiting a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/end_block_server_game_test.go#L10-L30), including when [there has been one move played](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/end_block_server_game_test.go#L32-L60) or [two](https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/end_block_server_game_test.go#L185-L222).

## What happened to the events?

With the new tests, you may think that the events are compromised. For instance, the event type `"transfer"` normally comes with three attributes, but when the bank has made two transfers the `"transfer"` event ends up with 6 attributes. This is just the way events are organized: per type, with the attributes piled in.

When checking emitted events, you need to skip over the attributes you are not checking. You can easily achieve that with [Go slices](/tutorials/4-golang-intro/5-arrays.md).

For instance, here `transferEvent.Attributes[6:]` discards the first six attributes:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/integration-tests/tests/integration/checkers/keeper/end_block_server_game_test.go#L264-L270]
transferEvent := events[6]
suite.Require().Equal(transferEvent.Type, "transfer")
suite.Require().EqualValues([]sdk.Attribute{
    {Key: "recipient", Value: carol},
    {Key: "sender", Value: checkersModuleAddress},
    {Key: "amount", Value: "90stake"},
}, transferEvent.Attributes[6:])
```

## Debug your suite

You learned in a [previous section](/hands-on-exercise/1-ignite-cli/3-stored-game.md) how to launch a test in debug mode. It is still possible to do so when using a suite. Depending on the versions of your Go installation and your Visual Studio Code, you can launch it in two ways:

1. Right-click on the arrow to the left of the suite's runner `func TestCheckersKeeperTestSuite`:

    ![Suite runner with green button](/hands-on-exercise/2-ignite-cli-adv/images/go_test_debug_suite.png)

    <HighlightBox type="note">

    In this case, you can only launch debug for **all** of the suite's test methods and not just a single one (as is possible with a simple test).

    </HighlightBox>

2. Right-click on the arrow to the left of the separate test of the suite:

    ![Suite test with green button](/hands-on-exercise/2-ignite-cli-adv/images/go_test_debug_suite_test.png)

    <HighlightBox type="note">

    This option may not be available. If being able to debug only a few tests at a time is important to you, a solution is to create more granular suites, for example using one or more test suites per file and falling back on the first option.

    </HighlightBox>

With this you have tested your wager payments in a way more realistic that unit tests and mocks.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to prepare your code so as to accommodate integration tests.
* How an integration test is built, and what is a test suite.
* How to add simple integration tests and helpers.
* How to add meaningful integration tests and account for how the events are emitted.
* How to debug your integration tests.

</HighlightBox>

<!--## Next up

You can skip ahead and see how to integrate [foreign tokens](/hands-on-exercise/2-ignite-cli-adv/8-wager-denom.md) via the use of IBC, or take a look at the [next section](./6-gas-meter.md) to prevent spam and reward validators proportional to their effort in your checkers blockchain.-->
