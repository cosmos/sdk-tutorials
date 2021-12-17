---
title: IBC Foreign Token Wager
order: 18
description: Let players wager any fungible token
tag: deep-dive
---

# IBC Foreign Token Wager

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [messages](../2-main-concepts/messages.md), [Protobuf](../2-main-concepts/protobuf.md), and [IBC](../2-main-concepts/ibc.md).
* Have Go installed.
* The checkers blockchain codebase up to the _can play_ query. You can get there by following the [previous steps](./can-play.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/can-play-move-handler).

</HighlightBox>

When you [introduced a wager](./game-wager.md) you made it possible for players to play a game and wager the base staking token of your blockchain application. What if your players want to play with other _currencies_? Your blockchain can represent a token from any other blockchain connected to your chain by using the Inter-Blockchain Communication Protocol (IBC).

You will be agnostic about the tokens that are represented and about who is taking care of the relayers. Your only concern is to enable the use of _foreign_ tokens.

## New information

Instead of defaulting to `"stake"`, let players decide what string represents their token. So you update:

1. The stored game:
    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/proto/checkers/stored_game.proto#L21]
    message StoredGame {
        ...
        string token = 13; // Denomination of the wager.
    }
    ```

2. The message to create a game:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/proto/checkers/tx.proto#L46]
    message MsgCreateGame {
        ...
        string token = 5; // Denomination of the wager.
    }
    ```

To have Starport and Protobuf recompile both files, you can use:

```sh
$ starport generate proto-go
```

To avoid surprises down the road, also update the `MsgCreateGame` constructor:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/message_create_game.go#L16]
func NewMsgCreateGame(creator string, red string, black string, wager uint64, token string) *MsgCreateGame {
    return &MsgCreateGame{
        ...
        Token: token,
    }
}
```

You already know that you are going to emit this new information during the game creation. So add a new event key as a constant:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/keys.go#L56]
const (
    StoredGameEventToken = "Token"
)
```

## Additional handling

You have prepared the ground by placing this token denomination into the relevant data structures. Now the proper values need to be inserted in the relevant locations:

1. In the helper function to create the `Coin` in `full_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/full_game.go#L71-L73]
    func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
        return sdk.NewCoin(storedGame.Token, sdk.NewInt(int64(storedGame.Wager)))
    }
    ```

2. In the handler that instantiates a game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/keeper/msg_server_create_game.go#L30]
    storedGame := types.StoredGame{
        ...
        Token:     msg.Token,
    }
    ```

    Not to forget where it emits an event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/keeper/msg_server_create_game.go#L54]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.StoredGameEventToken, msg.Token),
        )
    )
    ```

## Live testing with a relayer

With the checkers application ready to accommodate IBC-foreign tokens, you want to run some tests locally with another blockchain's tokens, without running a large scale operation. Luckily, Starport has built in the [Typescript relayer](https://docs.starport.com/kb/relayer.html). If you look at the GUI Starport created in your checkers blockchain, you will see a _Relayers_ section on the left.

As you recall, a relayer is a process that transfers IBC packets between two blockchains. It just so happens that here this process is **running in your browser**, using the account you configured in your browser. This account in the browser is the same one you would use to play a game of checkers. Let's dub it `alice123@checkers`.

1. On the checkers end, the relayer is already configured to connect to your running checkers blockchain, and to use the tokens of whichever account you have configured in your browser, here `alice123@checkers`. In this sense, it gets the same privileges to access your tokens that you have granted to the checkers browser application.
2. You now need to configure it to connect to the other blockchain, the one that hosts the foreign tokens you want to transfer. It can be the Cosmos Hub, or a [testnet](https://tutorials.cosmos.network/connecting-to-testnet/testnet-tutorial.html) that you or someone else runs.
3. You also need to fund the relayer's account on the remote chain so that it can operate at all. This account is generated from the same private key as `alice123@checkers`, so let's call it `alice465@remote`. The relayer shows you in the browser which account this is.

Your test comes in a few steps:

1. Configure the relayer. This is a matter of entering the necessary parameters, clicking a button and waiting for the setup to be done. In effect, the relayer opened a transfer channel, likely numbered `0`, on the checkers chain, and opened another transfer channel on the remote chain, and linked the two.
2. Send the desired foreign tokens to your `alice465@remote`, using any regular method of sending tokens, be it from a faucet or from another account of yours.
3. Use the relayer to send these foreign tokens to `alice123@checkers`.
4. When this is done, check `alice123@checkers` balance in the checkers blockchain. You should see a new entry whose `denom` field looks like a long hex value `ibc/1873CA...`. Save this string so as to use with your test.
5. Repeat the transfer process through the relayer, this time for the benefit of another player, say `bob224@checkers`. In fact, for your test, Alice can send some tokens to Bob so they can start a game.
6. Have Alice and Bob start a game with `token: ibc/1873CA...`.
7. Later, the players can retransfer these foreign tokens via the same relayer to the remote chain.

And this is how the Typescript relayer built in by Starport lets you experiment with foreign tokens.

Note that as soon as you close the browser window, the channels on both ends are no longer monitored and therefore no token transfers will take place. Also, depending on the state of development of Starport, after you close it, this relayer may not be able to reuse a channel it created earlier. So do not use this for production.

## Next up

In the [next section](./migration.md) you will learn how to conduct chain upgrades through migrations.
