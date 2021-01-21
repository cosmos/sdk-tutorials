---
order: 5
---


# Scaffolding types

In this section, we'll be explaining how to quickly scaffold types for your application using the `starport type` command.

## `starport type`

Open a new terminal under project's folder and run the following `starport type` command to generate our `scavenge` type: 

```
starport type scavenge description solutionHash reward solution scavenger
```

From this command, we've made changes to the following files:
- `scavenge/vue/src/views/Index.vue` - The `scavenge` type in our front-end application
- `scavenge/x/scavenge/client/cli/query.go` - adding the `GetCmdListScavenge` query function to the CLI commands
- `scavenge/x/scavenge/client/cli/queryScavenge.go` - defining the `GetCmdListScavenge` and `GetCmdGetScavenge` function
- `scavenge/x/scavenge/client/cli/tx.go` - adding `GetCmdCreateScavenge`, `GetCmdSetScavenge` and `GetCmdDeleteScavenge` transaction function to the CLI commands
- `scavenge/x/scavenge/client/cli/txScavenge.go` - defining the `GetCmdCreateScavenge`, `GetCmdSetScavenge` and `GetCmdDeleteScavenge` function
- `scavenge/x/scavenge/client/rest/queryScavenge.go` - defining the `listScavengeHandler` and `getScavengeHandler` query function
- `scavenge/x/scavenge/client/rest/txScavenge.go` - defining the `createScavengeRequest` type and `createScavengeHandler` function, the `setScavengeRequest` type and `setScavengeHandler` function, the `deleteScavengeRequest` type and `deleteScavengeHandler` function
- `scavenge/x/scavenge/client/rest/rest.go` - adding the `createScavengeHandler`, `listScavengeHandler`, `getScavengeHandler`, `setScavengeHandler` and deleteScavengeHandler functions to the REST API
- `scavenge/x/scavenge/handler.go` - handle the case where `MsgCreateScavenge`, `MsgSetScavenge` and `MsgDeleteScavenge` is passed, and handle it
- `scavenge/x/scavenge/handlerMsgCreateScavenge.go` - define `handleMsgCreateScavenge`, which creates the scavenge
- `scavenge/x/scavenge/handlerMsgSetScavenge.go` - define `handleMsgSetScavenge`, which updates the scavenge
- `scavenge/x/scavenge/handlerMsgDeleteScavenge.go` - define `handleMsgDeleteScavenge`, which deletes the scavenge
- `scavenge/x/scavenge/keeper/querier.go` - Handle the `QueryListScavenge` case to use the `listScavenge` function and the `QueryGetScavenge` case to use the `getScavenge` function
- `scavenge/x/scavenge/keeper/scavenge.go` - Define the `GetScavengeCount`, `SetScavengeCount`, `CreateScavenge`, `GetScavenge`, `SetScavenge`, `DeleteScavenge`, `listScavenge`, `getScavenge`, `GetScavengeOwner` and `ScavengeExists` functions
- `scavenge/x/scavenge/types/MsgCreateScavenge.go` - define the  `MsgCreateScavenge` function
- `scavenge/x/scavenge/types/MsgDeleteScavenge.go` - define the  `MsgDeleteScavenge` function
- `scavenge/x/scavenge/types/MsgSetScavenge.go` - define the  `MsgSetScavenge` function
- `scavenge/x/scavenge/types/TypeScavenge.go` - define the `Scavenge` type
- `scavenge/x/scavenge/types/key.go` - Adding the `ScavengePrefix` and `ScavengeCountPrefix` constant
- `scavenge/x/scavenge/types/querier.go` - Adding the `QueryListScavenge` and `QueryGetScavenge` constant

We also want to create a second type, `Commit`, in order to prevent frontrunning of our submitted solutions as mentioned earlier.

```
starport type commit solutionHash solutionScavengerHash
```

Here, `starport` has already done the majority of the work by helping us scaffold the necessary files and functions.

In the next sections, we'll be modifying these to give our appliation the functionality we want, according to the game.
