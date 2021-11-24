# IBC

## Long-running exercise

Now we want to let players choose to play with foreign tokens. So:

* The `CreateGameTx` transaction needs to be able to specify the token to use, on top of the amount.
* The _billing_ needs to be updated.
* The leaderboard does not need to be adjusted because it is already per token type. We don't want to do another migration example, that's why we had to be clever about the leaderboard structure.

TODO decide how it looks like.
