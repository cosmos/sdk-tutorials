---
order: 10
---

# App

Our `scaffold` utility has already created a pretty complete `app.go` file for us inside of `./app/app.go`. This version of the `app.go` file is meant to be as simple of an app as possible. It contains only the necessary modules needed for using an app that knows about coins (`bank`), user accounts (`auth`) and securing the application with proof-of-stake (`staking`).

One module which is missing but is part of the Cosmos SDK core set of features is `gov`, which allows for a simple form of governance to take place. This process includes making text proposals which can be voted on with coins or with delegation via [liquid democracy](https://en.wikipedia.org/wiki/Liquid_democracy). This module can also be used to update the logic of the application itself, via parameter changes which can affect specific parts of different modules.

Mostly we can just follow the `TODO`s that are marked in the file and add the necessary information about our new module. Afterwards it should look like:

<<< @/scavenge/app/app.go

Something you might notice near the beginning of the file is that I have renamed the `DefaultCLIHome` and the `DefaultNodeHome`. These are the directories located on your machine where the history of your application and the configuration of your CLI are stored, as well as the encrypted information for the keys you generate on your machine. I renamed them to `scavengeCLI` and `scavengeD` to better reflect our application.

Since we don't want to use the generic commands for our CLI and our application given to us by the `scaffold` command, let's rename the files within `cmd` as well. We will rename `./cmd/acli/` to `./cmd/scavengeCLI` as well as `./cmd/aud` to `./cmd/scavengeD`. Inside our `./cmd/scavengeCLI/main.go` file we will also update to the following format:

<<< @/scavenge/cmd/scavengeCLI/main.go

And within our `./cmd/scavengeD/main.go` we will update to the following format:

<<< @/scavenge/cmd/scavengeD/main.go

Finally we need to update our new `cmd` names within our `Makefile`. It should be updated to look like:

<<< @/scavenge/Makefile

Now our app is configured and ready to go!

Let's fire it up 🔥