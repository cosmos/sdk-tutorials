---
order: 5
---

# Keeper

After using the `scaffold` command you should have a boilerplate `Keeper` at `./x/scavenge/internal/keeper/keeper.go`. It contains a basic keeper with references to basic functions like `Set`, `Get` and `Delete`.

Our keeper stores all our data for our module. Sometimes a module will import the keeper of another module. This will allow state to be shared and modified across modules. Since we are dealing with coins in our module as bounty rewards, we will need to access the `bank` module's keeper (which we call `CoinKeeper`). Look at our completed `Keeper` and you can see where the `bank` keeper is referenced and how `Set`, `Get` and `Delete` are expanded:

<<< @/scavenge/x/scavenge/internal/keeper/keeper.go

## Commits and Scavenges
You may notice reference to `types.Commit` and `types.Scavenge` throughout the `Keeper`. These are new structs defined in `./x/scavenge/internal/types/types.go` that contin all necessary information about different scavenge challenges, and different commited solutions to those challenges. They appear similar to the `Msg` types we saw earlier because they contain similar information. You can create this file now and add the following:

<<< @/scavenge/x/scavenge/internal/types/types.go

You can imagine that an unsolved `Scavenge` would contain a `nil` value for the fields `Solution` and `Scavenger` before they are solved. You might also notice that each type has the `String` method. This allows us to render the struct as a string for rendering.

## Prefixes

You may notice the use of `types.ScavengePrefix` and `types.CommitPrefix`. These are defined in a file called `./x/scavenge/internal/types/key.go` and help us keep our `Keeper` organized. The `Keeper` is really just a key value store. That means that, similar to an `Object` in javascript, all values are referenced under a key. To access a value, you need to know the key under which it is stored. This is a bit like a unique identifier (UID).

When storing a `Scavenge` we use the key of the `SolutionHash` as a unique ID, for a `Commit` we use the key of the `SolutionScavengeHash`. However since we are storing these two data types in the same location, we may want to distinguish between the types of hashes we use as keys. We can do this by adding prefixes to the hashes that allow us to recognize which is which. For `Scavenge` we add the prefix `sk-` and for `Commit` we add the prefix `ck-`. You should add these to your `key.go` file so it looks as follows:

<<< @/scavenge/x/scavenge/internal/types/key.go

## Iterators

Sometimes you will want to access a `Commit` or a `Scavenge` directly by their key. That's why we have the methods `GetCommit` and `GetScavenge`. However, sometimes you will want to get every `Scavenge` at once or every `Commit` at once. To do this we use an **Iterator** called `KVStorePrefixIterator`. This utility comes from the `sdk` and iterates over a key store. If you provide a prefix, it will only iterate over the keys that contain that prefix. Since we have prefixes defined for our `Scavenge` and our `Commit` we can use them here to only return our desired data types.

---

Now that you've seen the `Keeper` where every `Commit` and `Scavenge` are stored, we need to connect the messages to the this storage. This process is called _handling_ the messages and is done inside the `Handler`.