---
title: IBC Foreign Token Wager
order: 18
description: Let players wager any fungible token
---

# IBC Foreign Token Wager

<HighlightBox type="info">

Make sure you have all you need before proceeding:

* You understand the concepts of [messages](../3-main-concepts/07-messages.md), [Protobuf](../3-main-concepts/09-protobuf.md), and [IBC](../3-main-concepts/16-ibc.md).
* Have Go installed.
* The checkers blockchain up to the _can play_ query. Either because you followed the [previous steps](./03-starport-15-can-play.md) or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/can-play-move-handler).

</HighlightBox>

When you [introduced a wager](./03-starport-13-game-wager.md), you made it possible for players to play a game and wager the base staking token of your blockchain application. What if your players want to play with other _currencies_? Fortunately, your blockchain can represent a token from any other blockchain connected to your chain by using the Inter-Blockchain Communication Protocol (IBC).

In effect, you will be agnostic about the tokens that are represented and about who is taking care of the relayers. Your only concern is to enable the use of _foreign_ tokens.

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

As you can see, the code updates to introduce these changes into your chain are not complex. The complexity is hidden in the IBC Protocol itself and the relayers.

Congratulations! Your checkers blockchain is complete with the required features. Now, players can play checkers comfortably. All you have left to do is implement a draw mechanism, which requires both players to reach consensus that a draw has happened. This is left as an exercise.

## Next up

With such a well-rounded checkers blockchain, you deploy and launch into production.

What if, later, you want to introduce a leaderboard, i.e. a brand new feature, after the blockchain has been running successfully?

Take a look at the [next section](./03-starport-17-migration.md) to discover how to conduct chain upgrades, a.k.a. migrations.
