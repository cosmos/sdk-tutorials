---
order: 4
---

# Messages

Messages are a great place to start when building a module because they define the actions that your application can make. Think of all the scenarios where a user would be able to update the state of the application in any way. These should be boiled down into basic interactions, similar to **CRUD** (Create, Read, Update, Delete).

Let's start with **Create**

## MsgCreateScavenge
Messages are `types` which live inside the `./x/scavenge/internal/types/` directory. There is already a `msg.go` file but we will make a new file for each Message type. We can use `msg.go` as a starting point by renaming it to `MsgCreateScavenge.go` like: 
```bash
# Assuming your current working directory is the root of your application
mv ./x/scavenge/internal/types/msg.go  ./x/scavenge/internal/types/MsgCreateScavenge.go
```
Inside this new file we will uncomment and follow the instructions of renaming variables until it looks as follows:

<<< @/scavenge/x/scavenge/internal/types/MsgCreateScavenge.go

The Message `struct` contains all the necessary information when creating the commit to a solution: 
 * `Scavenger` - Who is commiting the solution.
 * `SolutionHash` - The scrambled solution.
 * `SolutionScavengerHash` - This is the scramble of the solution combined with the Scavenger.

Similar to `MsgCreateScavenge` this type must fulfil the `sdk.Msg` interface by containing methods to check who signed the msg and make sure the values included are all valid.

## MsgRevealSolution

This message type should live in `./x/scavenge/internal/types/MsgRevealSolution.go` and look like:

<<< @/scavenge/x/scavenge/internal/types/MsgRevealSolution.go

The Message `struct` contains all the necessary information when revealing a solution:
 * `Scavenger` - Who is revealing the solution.
 * `SolutionHash` - The scrambled solution.
 * `Solution` - This is the plain text version of the solution.


 This message also fulfils the `sdk.Msg` interface.

 ## Codec
 Once we have defined our messages, we need to describe to our encoder how they should be stored as bytes. To do this we edit the file located at `./x/scavenge/internal/types/codec.go`. By describing our types as follows they will work with our encoding library:

 <<< @/scavenge/x/scavenge/internal/types/codec.go

 It's great to have Messages, but we need somewhere to store the information they are sending. All persistent data related to this module should live in the module's `Keeper`.

 Let's make a `Keeper` for our Scavenge Module next.