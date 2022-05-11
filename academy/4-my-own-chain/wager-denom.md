---
title: IBC Token - Play With Cross-Chain Tokens
order: 18
description: Let players wager any fungible token
tag: deep-dive
---

# IBC Token - Play With Cross-Chain Tokens

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [messages](../2-main-concepts/messages.md), [Protobuf](../2-main-concepts/protobuf.md), and [IBC](../2-main-concepts/ibc.md).
* Go is installed.
* You have the checkers blockchain codebase up to the _can play_ query. If not, follow the [previous steps](./can-play.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/can-play-move-handler).

</HighlightBox>

When you [introduced a wager](./game-wager.md) you enabled players to play a game and bet on the outcome using the base staking token of your blockchain. What if your players want to play with _other_ currencies? Your blockchain can represent a token from any other blockchain connected to your chain by using the Inter-Blockchain Communication Protocol (IBC).

<HighlightBox type="info">

Your checkers application will be agnostic to tokens and relayers. Your only task is to enable the use of _foreign_ tokens.

</HighlightBox>

## New information

Instead of defaulting to `"stake"`, let players decide what string represents their token. So update:

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

For Ignite CLI and Protobuf to recompile both files you can use:

```sh
$ ignite generate proto-go
```

To avoid surprises later, also update the `MsgCreateGame` constructor:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/message_create_game.go#L16]
func NewMsgCreateGame(creator string, red string, black string, wager uint64, token string) *MsgCreateGame {
    return &MsgCreateGame{
        ...
        Token: token,
    }
}
```

This data will be emitted during game creation, so add a new event key as a constant:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/keys.go#L56]
const (
    StoredGameEventToken = "Token"
)
```

## Additional handling

The token denomination has been integrated into the relevant data structures. Now the proper values need to be inserted in the right locations:

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

    Also insert it where it emits an event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/keeper/msg_server_create_game.go#L54]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.StoredGameEventToken, msg.Token),
        )
    )
    ```

## Live testing with a relayer

With the checkers application ready to accommodate IBC-foreign tokens, you should run some tests locally with another blockchain's tokens without running a large-scale operation. Conveniently, Ignite CLI has the [Typescript relayer](https://docs.ignite.com/kb/relayer.html) built in. If you look at the GUI Ignite CLI created in your checkers blockchain, you will see a _Relayers_ section on the left.

A relayer is a process that transfers IBC packets between two blockchains. Here this process is **running in your browser** using the account you configured in your browser. The account is the same one you would use to play a game of checkers. Dub it `alice123@checkers`.

1. On the checkers end, the relayer is already configured to connect to your running checkers blockchain and to use the tokens of whichever account you have configured in your browser (here `alice123@checkers`). Therefore, it gets the same privileges to access your tokens that you have granted to the checkers' browser application.
2. You need to configure it to connect to the other blockchain which hosts the foreign tokens you want to transfer. This can be the Cosmos Hub, or a [testnet](https://github.com/cosmos/testnets) that you or someone else runs.
3. You also need to fund the relayer's account on the remote chain so that it can operate. The account is generated from the same private key as `alice123@checkers`, so call it `alice465@remote`. The relayer shows you in the browser which account this is.

Your test follows a few steps:

1. Configure the relayer. This is a matter of entering the necessary parameters, clicking a button, and waiting for the setup to be done. In effect, the relayer opens a transfer channel (likely numbered `0`) on the checkers chain, opens another transfer channel on the remote chain, and links the two.
2. Send the desired foreign tokens to `alice465@remote` using any regular method of sending tokens, independent of whether the tokens come from a faucet or another account.
3. Use the relayer to send these foreign tokens to `alice123@checkers`.
4. Check the balance of `alice123@checkers` in the checkers blockchain when it is done. You should see a new entry whose `denom` field looks like a long hex value (`ibc/1873CA...`). Save this string to use with your test.
5. Repeat the transfer process through the relayer, this time for the benefit of another player (for example `bob224@checkers`). For your test, Alice can send some tokens to Bob so they can start a game.
6. Have Alice and Bob start a game with `token: ibc/1873CA...`.
7. After the outcome of a game, the players can retransfer these foreign tokens via the same relayer to the remote chain.

This is how the Typescript relayer built in by Ignite CLI lets you experiment with foreign tokens.

<HighlightBox type="tip">

As soon as you close the browser window the channels on both ends are no longer monitored, and therefore no token transfers will take place. Also depending on the development state of Ignite CLI, after you close it the relayer may not be able to reuse a channel it created earlier. **Do not use this for production**.

</HighlightBox>

## Next up

In the [next section](./migration.md) you will learn how to conduct chain upgrades through migrations.
