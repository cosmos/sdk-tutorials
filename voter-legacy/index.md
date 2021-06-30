---
order: 1
---

# Polling app

![Application screenshot](./1.png)

Create a simple poll application so a user can sign in, create polls, cast votes, and see voting results. Creating a poll costs 200 tokens, voting is free, and actions are restricted to signed-in users.

## Requirements 

This tutorial uses [Starport](https://github.com/tendermint/starport) v0.14.0, a developer-friendly interface for building blockchains with the Cosmos SDK. To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.14.0! | bash
```

You can also use Starport v0.14.0 on the web in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.14.0). Learn more about other ways to [install Starport](https://github.com/tendermint/starport/blob/develop/docs/1%20Introduction/2%20Install.md).

## Creating a blockchain

Run the following command to create a voter project:

```
starport scaffold chain github.com/alice/voter --sdk-version launchpad
```

The Starport `app` command scaffolds a project structure for your application in a `voter` directory. Make sure to replace `alice` with your GitHub username.

Several files and directories are generated in the `voter` directory:

```bash
cd voter
```

- `app` contains files that connect all of the moving parts of your application.
- `cmd` is responsible for `voterd` and `votercli` programs that allow you to start and interact with your application.
- `vue` contains a web user interface for your app, responsible for everything you see on the user interface.
- `x` contains the main building blocks of your app: modules. Right now there is only one module: `voter`.

Your project directory contains all of the code that is required to build and launch a blockchain-based app. Now, you can try to launch your app by running starport chain serve inside your project:

```
starport chain serve
```

You should be able to see the following output - *as well as any errors that might show up in your application.*

```
📦 Installing dependencies...
🚧 Building the application...
💫 Initializing the chain...
🙂 Created an account. Password (mnemonic): truth tooth front fabric sing divert zone milk fatigue urban hundred certain sorry merge milk treat foam coral absent run stand invest monkey aspect
🙂 Created an account. Password (mnemonic): famous faculty genre finger build fantasy squirrel icon carbon absent sleep weather fold piece thank earth pioneer excite trim cupboard grow pumpkin bundle auction
🌍 Running a Cosmos 'voter' app with Tendermint.

🚀 Get started: http://localhost:12345/
```

*Note: use* `starport chain serve --verbose` *to visualize detailed operations happening in the background*

Congratulations! You now have a blockchain application running on your machine in just two commands. It doesn't do anything yet, so let's work on that.

Our voting applications has two types of entities: polls and votes. A poll is a type that has a `title` and a list of `options`.

## Adding polls

Open a new terminal in `voter` directory and run the following: 

```
starport type poll title options
```

```
🎉 Created a type `poll`
```

This command generated code that handles the creation of `poll` items. 

 Now you can run the `starport chain serve` command and visit [http://localhost:8080](http://localhost:8080) to see a form for creating polls. It may take a short while to rebuild the app, so give it a couple of seconds.

![Application screenshot](./2.png)

Sign in with one of the passwords printed in the console and try creating a poll. You should see a new object created and displayed above the form. You have successfully created an object and stored it on the blockchain!

This, however, does not look and work exactly like you might need. You can add option fields and store them as an array. You can make the option fields display as interactive buttons in your app.

Take a look at some of the files that were modified by the `starport type` command.

### `x/voter/types/TypePoll.go`

This file contains the definition of the `Poll` type. A poll has two fields (creator and ID) that are created automatically and two fields (title and options) that you define.

To define `Options` as a list of strings, **replace `string` with `[]string`**

```go
package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Poll struct {
	Creator sdk.AccAddress `json:"creator" yaml:"creator"`
	ID      string         `json:"id" yaml:"id"`
	Title   string         `json:"title" yaml:"title"`
	Options []string       `json:"options" yaml:"options"`
}

```


### `x/voter/types/MsgCreatePoll.go`


This file defines a message that creates a poll.

To make options store as a list instead of a string, replace `Options string` with `Options []string` in `MsgCreatePoll` struct and `options string` with `options []string` in the arguments of `NewMsgCreatePoll` function.

```go
package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgCreatePoll{}

type MsgCreatePoll struct {
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
  Title string `json:"title" yaml:"title"`
  Options []string `json:"options" yaml:"options"`
}

func NewMsgCreatePoll(creator sdk.AccAddress, title string, options []string) MsgCreatePoll {
  return MsgCreatePoll{
		Creator: creator,
    Title: title,
    Options: options,
	}
}

...
```

To write anything to a blockchain or perform any other state transition a client (web app in our case) makes an HTTP POST request with a title and options to [http://localhost:1317/voter/poll](http://localhost:1317/voter/poll) endpoint handler for which is defined in `x/voter/client/rest/txPoll.go`. The handler creates an unsigned transaction which contains an array of messages. The client then signs the transaction and sends it to [http://localhost:1317/txs](http://localhost:1317/txs). The application then processes the transaction by sending each message to a corresponding handler, in our case `x/voter/handlerMessageCreatePoll.go`. A handler then calls a `CreatePoll` function defined in `x/voter/keeper/poll.go` which writes the poll data into the store.

### `x/voter/types/MsgSetPoll.go`

In the `MsgSetPoll` file, modify the `Options string` to `[]string`

```go
package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgSetPoll{}

type MsgSetPoll struct {
	ID      string         `json:"id" yaml:"id"`
	Creator sdk.AccAddress `json:"creator" yaml:"creator"`
	Title   string         `json:"title" yaml:"title"`
	Options []string       `json:"options" yaml:"options"`
}

func NewMsgSetPoll(creator sdk.AccAddress, id string, title string, options []string) MsgSetPoll {
	return MsgSetPoll{
		ID:      id,
		Creator: creator,
		Title:   title,
		Options: options,
	}
}

...
```

### `x/voter/client/rest/txPoll.go`

Replace `Options string` with `Options []string` in `createPollRequest` struct.

```go
type createPollRequest struct {
	BaseReq rest.BaseReq `json:"base_req"`
	Creator string `json:"creator"`
	Title string `json:"title"`
	Options []string `json:"options"`
}
```

Also in the `setPollRequest` struct.

```go
type setPollRequest struct {
	BaseReq rest.BaseReq `json:"base_req"`
	ID      string       `json:"id"`
	Creator string       `json:"creator"`
	Title   string       `json:"title"`
	Options []string     `json:"options"`
}
```

### `x/voter/client/cli/txPoll.go`

To enable users to interact with your application through a command-line interface:

```
votercli tx voter create-poll "Text editors" "Emacs" "Vim" --from user1
```

This command generates a transaction with the "create poll" message. Sign the transaction using a private key of `user1` (one of two users created by default) and broadcast it to the blockchain.

Now make a modification to change the line that reads arguments from the console. 

In the function `GetCmdCreatePoll`

replace
```go
Args:  cobra.ExactArgs(2),
```
with

```go
Args:  cobra.MinimumNArgs(2),
```

```go
argsOptions := args[1:len(args)]
```

The variable `msg` is defined to read a string of argOptions, delete the stringification

```go
msg := types.NewMsgCreatePoll(cliCtx.GetFromAddress(), string(argsTitle), argsOptions)
```

You end up with the following function

```go
func GetCmdCreatePoll(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "create-poll [title] [options]",
		Short: "Creates a new poll",
		Args:  cobra.MinimumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			argsTitle := string(args[0])
			argsOptions := args[1:len(args)]

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			inBuf := bufio.NewReader(cmd.InOrStdin())
			txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))
			msg := types.NewMsgCreatePoll(cliCtx.GetFromAddress(), string(argsTitle), argsOptions)
			err := msg.ValidateBasic()
			if err != nil {
				return err
			}
			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}
```

Now make the same changes for the function `GetCmdSetPoll`

In the `GetCmdSetPoll`, set
```go
Args:  cobra.ExactArgs(3),
```
to
```go
Args:  cobra.MinimumNArgs(3),
```

```go
argsOptions := args[2:len(args)]
```

```go
msg := types.NewMsgSetPoll(cliCtx.GetFromAddress(), id, string(argsTitle), argsOptions)
```

This change assumes that all arguments after the first one represent a list of options.

You end up with the following function

```go
func GetCmdSetPoll(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "set-poll [id]  [title] [options]",
		Short: "Set a new poll",
		Args:  cobra.MinimumNArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			id := args[0]
			argsTitle := string(args[1])
			argsOptions := args[2:len(args)]

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			inBuf := bufio.NewReader(cmd.InOrStdin())
			txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))
			msg := types.NewMsgSetPoll(cliCtx.GetFromAddress(), id, string(argsTitle), argsOptions)
			err := msg.ValidateBasic()
			if err != nil {
				return err
			}
			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}
```

Now that we have made all the necessary changes to our app, let's take a look at the client-side application.

```
starport chain serve
```

### Front-end application

Starport has generated a basic front-end for our application. For convenience [Vue.js](https://vuejs.org) framework is used with [Vuex](https://vuex.vuejs.org/) for state management, but since all features of our application are exposed through an HTTP API, clients can be built using any language or framework.

We'll be mostly interested in `vue/src/views` directory, which contains page templates of our app, `vue/src/store/index.js` handles sending transactions and receiving data from our blockchain and [`@tendermint/vue`](https://github.com/tendermint/vue/) directory, which contains components, like buttons and forms.

Inside `vue/src/store/index.js` we import [@tendermint/vue/src/store/cosmos](https://github.com/tendermint/vue/blob/develop/src/store/cosmos.js) which uses [CosmJS](https://github.com/cosmwasm/cosmjs), a library for handling wallets, creating, signing and broadcasting transactions and define a Vuex store. We'll use `entitySubmit` function for sending data to our blockchain (like a JSON representing a newly created poll), `entityFetch` for requesting a list of polls and `accountUpdate` to fetch information about our token balance.

### `vue/src/views/Index.vue`

Since we don't need the default form component replace 
```js
<sp-type-form type="poll" :fields="['title', 'options', ]" module="voter" />
```

inside of `vue/src/views/Index.vue` with a new component and a Title
 
 ```js
<SpH3>
  Polls
</SpH3>
<poll-form />
 ```

In the `<script></script>` tags below, import the component like this

```js
import * as sp from "@tendermint/vue";
import PollForm from "../components/PollForm";

export default {
  components: { PollForm, ...sp },
};
```

For our PollForm, you need to create a new directory `components` in your `vue/src/` path. In this directory, create a new file `PollForm.vue` and fill your first component with life.

### `vue/src/components/PollForm.vue`

Create the PollForm component to have a title and two buttons.

```js
<template>
  <div>
    <sp-input placeholder="Title" v-model="title" />
    <div v-for="option in options">
      <sp-input placeholder="Option" v-model="option.title" />
    </div>
    <sp-button @click.native="add">+ Add option</sp-button>
    <sp-button @click.native="submit">Create poll</sp-button>
  </div>
</template>
```

in between `<script></script>` tags below this:

```js
import * as sp from "@tendermint/vue";
export default {
  components: { ...sp },
  data() {
    return {
      title: "",
      options: []
    };
  },
  methods: {
    add() {
      this.options = [...this.options, { title: "" }];
    },
    async submit() {
      const payload = {
        type: "poll",
        module: "voter",
        body: {
          title: this.title,
          options: this.options.map(o => o.title)
        }
      };
      await this.$store.dispatch("cosmos/entitySubmit", payload);
        await this.$store.dispatch("cosmos/entityFetch", payload);
    }
  }
};
```

Now set up your Vue store.

### `vue/src/store/index.js`

```js
import Vue from "vue";
import Vuex from "vuex";
import cosmos from "@tendermint/vue/src/store/cosmos.js";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { cosmos },
});

```

In the main `App.vue` file, initialize the Cosmos Wallet functions that you created:

### `vue/src/App.vue`

In the `<script></script>` tag at the end of the file, dispatch to initialize your own app and the cosmos Vue framework

```js
export default {
  created() {
    this.$store.dispatch("cosmos/init");
    this.$store.dispatch("cosmos/entityFetch", {type: "poll", module: "voter"});
  },
};
```

Refresh the page, sign in with a password and create a new poll. It takes a couple of seconds to process a transaction. Now, if you visit [http://localhost:1317/voter/poll](http://localhost:1317/voter/poll) you should see a list of polls (this endpoint is defined in `x/voter/rest/queryPoll.go`):

```json
{
  "height": "0",
  "result": [
    {
      "creator": "cosmos19qqa7j73735w4pcx9mkkaxr00af7p432n62tv6",
      "id": "826477ab-0005-4e68-8031-19758d331681",
      "title": "A poll title",
      "options": ["First option", "The second option"]
    }
  ]
}
```

## Adding votes

A vote type contains poll ID and a value (string representation of the selected option).

```json
starport type vote pollID value
```

### `vue/src/views/Index.vue`

Delete the just bootstrapped for you `<sp-type-form type="vote" :fields="['pollID', 'value', ]" module="voter" />`.
Add `<poll-list />` into the `vue/src/view/Index.vue` file after the poll form component we just created. 

Update the imports below in the `<script></script>` tags as follows:

```js
import * as sp from "@tendermint/vue";
import PollForm from "../components/PollForm";
import PollList from "../components/PollList";

export default {
  components: { PollForm, PollList, ...sp },
};
```


Then make a new component at `vue/src/components/PollList.vue` and add the following:

### `vue/src/components/PollList.vue`

```js
<template>
  <div>
    
    <div v-for="poll in polls" v-bind:key="poll.id">
      <SpH3>
        Poll {{ poll.title }}
      </SpH3>
      <app-radio-item
        @click.native="submit(poll.id, option)"
        v-for="option in poll.options"
        v-bind:key="option"
        :value="option"
      />
      <app-text type="subtitle">Results: {{ results(poll.id) }}</app-text>
    </div>
  </div>
</template>
```
in between `<script></script>` tags below this:

```js
import * as sp from "@tendermint/vue";
import AppRadioItem from "./AppRadioItem";
import AppText from "./AppText";
import {countBy } from "lodash"
export default {
  components: { AppText, AppRadioItem, ...sp },
  data() {
    return {
      selected: ""
    };
  },
  computed: {
    polls() {
      return this.$store.state.cosmos.data["voter/poll"] || [];
    },
    votes() {
      return this.$store.state.cosmos.data["voter/vote"] || [];
    }
  },
  methods: {
    results(id) {
      const results = this.votes.filter(v => v.pollID === id);
      return countBy(results, "value");
    },
    async submit(pollID, value) {
      const type = { type: "vote" };
      const body = { pollID, value };
      await this.$store.dispatch("cosmos/entitySubmit", { ...type, module:"voter", body });
      await this.$store.dispatch("cosmos/entityFetch", {...type, module: "voter"});
    }
  }
};
```

The `PollList` component lists for every poll, all the options for that poll, as buttons. Selecting an option triggers a `submit` method that broadcasts a transaction with a "create vote" message and fetches data back from our application.

Two components are still missing from our app to make it a bit better looking. Add  the `AppRadioItem.vue` and `AppText.vue` components.

### `vue/src/components/AppRadioItem.vue`

```js
<template>
  <div>
    <button class="button">{{ value }}</button>
  </div>
</template>

<style scoped>
.button {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  user-select: none;
  cursor: pointer;
  transition: all 0.1s;
  font-weight: 500;
  outline: none;
  border: none;
  background: rgba(0, 0, 0, 0.01);
  width: 100%;
  font-family: inherit;
  text-align: left;
  font-size: 1rem;
  font-weight: inherit;
}
.button:hover {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1),
    0 1px 5px -1px rgba(0, 0, 0, 0.1);
}
.button:focus {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2),
    0 1px 5px -1px rgba(0, 0, 0, 0.1);
}
.button:active {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.07);
  color: rgba(0, 0, 0, 0.7);
  transform: scale(0.998);
}
</style>
```

In the `<script></script>` tag below this:

```js
export default {
  props: {
    value: "",
  },
};
```


### `vue/src/components/AppText.vue`

```js
<template>
  <div>
    <div :class="[`${type}`]">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.h1 {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  margin-bottom: 2rem;
}
.h2 {
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  margin-top: 2rem;
}
.subtitle {
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.85rem;
}
</style>
```

In between `<script></script>` tags below this

```js
export default {
  props: {
    type: {
      default: "p1",
    },
  },
};
```

In `App.vue` you need to update to fetch votes. In the `<script></script>` tag is the resulting code:

### `vue/src/App.vue`

```js
export default {
  created() {
    this.$store.dispatch("cosmos/init");
    this.$store.dispatch("cosmos/entityFetch", {type: "poll", module: "voter"});
    this.$store.dispatch("cosmos/entityFetch", {type: "vote", module: "voter"});
  },
};
```

By now, you should see the same UI as shown in the first screenshot. Try creating polls and casting votes. You may notice that it's possible to cast multiple votes for one poll. This behavior is not what we want, so let's fix the app.

## Casting votes only once

To fix this issue, you must understand how data is stored in your application.

You can think of our data storage as a lexicographically ordered key-value store. You can loop through the entries, filter by key prefix, add, update and delete entries. It is easier to visualize the store as JSON:

```json
{
  "poll-1a266241-c58d-4cbc-bacf-aaf939c95de1": {
    "creator": "cosmos15c6g4v5yvq0hy3kjllyr9ytlx45r936y0m6dm6",
    "id": "1a266241-c58d-4cbc-bacf-aaf939c95de1",
    "title": "Soft drinks",
    "options": ["Coca-Cola", "Pepsi"]
  },
  "vote-cd63b110-2959-45b0-8ce3-afa2fb7a5652": {
    "creator": "cosmos15c6g4v5yvq0hy3kjllyr9ytlx45r936y0m6dm6",
    "id": "cd63b110-2959-45b0-8ce3-afa2fb7a5652",
    "pollID": "1a266241-c58d-4cbc-bacf-aaf939c95de1",
    "value": "Pepsi"
  }
}
```

Both `poll-` and `vote-` are prefixes. They are added to keys for ease of filtering. By convention, prefixes are defined in `x/voter/types/key.go`.

### `x/voter/keeper/vote.go`

Whenever a user casts a vote, a new "create vote" message is handled by a handler and is passed to a keeper. Keeper takes a `vote-` prefix, adds a UUID (unique to every message) and uses this string as a key. `x/voter/keeper/vote.go`:

```go
key := []byte(types.VotePrefix + vote.ID)
```

These strings are unique but it is possible to get duplicate votes. To fix that scenario, make sure a keeper records every vote only once by choosing the right key. In this case, you can use poll ID and creator address to make sure that one user can cast only one vote per poll.

```go
key := []byte(types.VotePrefix + vote.PollID + "-" + string(vote.Creator))
```

Restart the application and try voting multiple times on a single poll, you'll see you can vote as many times as you want but only your most recent vote is counted.

## Introducing a fee for creating polls

Now make it so that creating a poll costs 200 tokens.

This feature is very easy to add. You already require users to have accounts registered and each user has tokens on balance. The only thing you need to do is to send coins from the user's account to a module account before we create a poll.

## `x/voter/handlerMsgCreatePoll.go`:


```go
package voter

import (
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/alice/voter/x/voter/keeper"
	"github.com/alice/voter/x/voter/types"
	"github.com/tendermint/tendermint/crypto"
)

func handleMsgCreatePoll(ctx sdk.Context, k keeper.Keeper, msg types.MsgCreatePoll) (*sdk.Result, error) {
	var poll = types.Poll{
		Creator: msg.Creator,
		Title:   msg.Title,
		Options: msg.Options,
	}
	moduleAcct := sdk.AccAddress(crypto.AddressHash([]byte(types.ModuleName)))
	payment, _ := sdk.ParseCoins("200token")
	if err := k.CoinKeeper.SendCoins(ctx, poll.Creator, moduleAcct, payment); err != nil {
		return nil, err
	}
	k.CreatePoll(ctx, msg)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
```

The fee payment happens before `k.CreatePoll(ctx, poll)`. This way, if a user does not have enough tokens, the application raises an error and does not proceed to creating a poll. Make sure to have `"github.com/tendermint/tendermint/crypto"` added to the import statement (if your text editor didn't do that for you).

Now, restart the app and try creating several polls to see how this affects your token balance.

Congratulations! You successfully built a blockchain voting application.
