---
order: 6
---

# Messages

Messages are a great place to start when building a module because they define the actions that your application can make. Think of all the scenarios where a user would be able to update the state of the application in any way. These should be boiled down into basic interactions, similar to **CRUD** (Create, Read, Update, Delete).

Let's start with **Create**.

## MsgCreateScavenge

Messages are `types` which live inside the `./x/scavenge/types/` directory. You can see the `type` command has already scaffolded a `MsgCreateScavenge.go` file.

Inside this new file we will be removing some of the fields that won't be used when creating the scavenge, until it looks like this:

<<< @/scavenge/scavenge/x/scavenge/types/MsgCreateScavenge.go

Notice that all Messages in the app need to follow the `sdk.Msg` interface. The Message `struct` contains all the necessary information when creating a new scavenge:

- `Creator` - Who created it. This uses the `sdk.AccAddress` type which represents an account in the app controlled by public key cryptograhy.
- `Description` - The question to be solved or description of the challenge.
- `SolutionHash` - The scrambled solution.
- `Reward` - This is the bounty that is awarded to whoever submits the answer first.

The `Msg` interface requires some other methods be set, like validating the content of the `struct`, and confirming the msg was signed and submitted by the Creator.

Now that one can create a scavenge the only other essential action is to be able to solve it. This should be broken into two separate actions as described before: `MsgCommitSolution` and `MsgRevealSolution`.

## MsgCommitSolution

Rename our `./x/scavenge/types/MsgCreateCommit.go` to `./x/scavenge/types/MsgCommitSolution.go`.

Replace functions parameters to reflect `MsgCommitSolution` instead of previous `MsgCreateCommit`.

The message type that describes how to commit a solution should live in `./x/scavenge/types/MsgCommitSolution.go` and look like:

<<< @/scavenge/scavenge/x/scavenge/types/MsgCommitSolution.go

The Message `struct` contains all the necessary information when revealing a solution:

- `Scavenger` - Who is revealing the solution.
- `SolutionHash` - The scrambled solution (hash).
- `SolutionScavengerHash` - That is the hashed combination of the solution and the person who solved it.

This message also fulfils the `sdk.Msg` interface.

## MsgRevealSolution

This message type should live in `./x/scavenge/types/MsgRevealSolution.go` and look like:

<<< @/scavenge/scavenge/x/scavenge/types/MsgRevealSolution.go

The Message `struct` contains all the necessary information when revealing a solution:

- `Scavenger` - Who is revealing the solution.
- `SolutionHash` - The scrambled solution.
- `Solution` - The plain text version of the solution.

This message also fulfils the `sdk.Msg` interface.

Especially look into the `ValidateBasic` function. It validates if all the necessary inputs are made to reveal a solution and creates the sha256 hash out of the submitted solution.

## MsgSetScavenge

<<< @/scavenge/scavenge/x/scavenge/types/MsgSetScavenge.go

## MsgDeleteScavenge

<<< @/scavenge/scavenge/x/scavenge/types/MsgDeleteScavenge.go

## MsgSetCommit

<<< @/scavenge/scavenge/x/scavenge/types/MsgSetCommit.go

## MsgDeleteCommit

<<< @/scavenge/scavenge/x/scavenge/types/MsgDeleteCommit.go

## Codec

Once we have defined our messages, we need to describe to our encoder how they should be stored as bytes. To do this we edit the file located at `./x/scavenge/types/codec.go`. By describing our types as follows they will work with our encoding library:

<<< @/scavenge/scavenge/x/scavenge/types/codec.go

**Note:** in case you have restarted the app using `starport chain serve` some errors might appear due to changes on our **type** files. Don't panic! All these changes will be covered during the next session.

Awesome, It's great to have Messages, but we need somewhere to store the information they are sending. All persistent data related to this module should live in the module's `Keeper`.

Let's update the `Keeper` for our Scavenge module next.
