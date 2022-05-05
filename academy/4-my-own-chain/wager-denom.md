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

When you [introduced a wager](./game-wager.md) you enabled players to play a game and bet on the outcome using the base staking token of your blockchain. What if your players want to play with _other_ currencies? Your blockchain can represent a token from any other connected blockchain by using the Inter-Blockchain Communication Protocol (IBC).

Your checkers application will be agnostic regarding tokens and relayers. Your only task is to enable the use of _foreign_ tokens.

## New information

Instead of defaulting to `"stake"`, let players decide what string represents their token:

1. Update the stored game:
    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/proto/checkers/stored_game.proto#L21]
    message StoredGame {
        ...
        string token = 13; // Denomination of the wager.
    }
    ```

2. Update the message to create a game:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/proto/checkers/tx.proto#L46]
    message MsgCreateGame {
        ...
        string token = 5; // Denomination of the wager.
    }
    ```

Instruct Ignite CLI and Protobuf to recompile both files:

```sh
$ ignite generate proto-go
```

Also update the `MsgCreateGame` constructor:

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

    Also where it emits an event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/keeper/msg_server_create_game.go#L54]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.StoredGameEventToken, msg.Token),
        )
    )
    ```


## Next up

In the [next section](./migration.md) you will learn how to conduct chain upgrades through migrations.

Alternatively, you can learn how to create the [Typescript client elements](./cosmjs-objects.md) for your blockchain.
