---
order: 1
---

# Polling app

![Application screenshot](./1.png)

In this tutorial you will learn how to create a simple blockchain poll application. A user can sign in, create polls, cast votes and see voting results. Creating a poll will cost 200 tokens, voting is free, both actions will be available only for signed in users.

## Requirements 

For this tutorial you will be using [Starport](https://github.com/tendermint/starport) v0.15.1, an easy to use tool for building blockchains. To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.15.1! | bash
```

You can also use Starport v0.15.1 on the web in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.15.1). Learn more about other ways to [install Starport](https://github.com/tendermint/starport/blob/develop/docs/1%20Introduction/2%20Install.md).

## Creating a blockchain

Run the following command to create a voter project:

```
starport app github.com/username/voter
```

Starport `app` command will scaffold a project structure for your application in a `voter` directory. Make sure to replace `username` with your GitHub username.

Inside the `voter` directory you can see several files and directories:

```bash
cd voter
```

- `app` contains files that connect all of the moving parts of your application.
- `cmd` is responsible for the `voterd` daemon, which respectively allow you to start your application and interact with it.
- `proto` contains the protobuffer types of the blockchain application
- `vue` contains a web user interface for your app, reponsible for everything you see on the screenshot above.
- `x` contains the main building blocks of you app: modules. Right now we have only one: `voter`.

The project's directory contains all the code required to build and launch a blockchain-based app. Try launching the app by running starport serve inside the project:

```
starport serve
```

You should be able to see the following output - *as well as any errors that might show up in your application.*

```
Cosmos SDK's version is: Stargate v0.40.0 (or above)

🛠️  Building proto...
📦 Installing dependencies...
🛠️  Building the app...
💿 Initializing the app...
🙂 Created account "alice" with address "cosmos1lx7vqts97yxcamu838g8h6qp5gz4ddu7dsgq4k" with mnemonic: "front gloom sell trouble butter oval gain renew slogan crouch manual sponsor skull round banana note banner glance card topple circle slogan moon model"
🙂 Created account "bob" with address "cosmos1alkea94k20qwd3vk67qkg2fn2a83zauzdkz7gj" with mnemonic: "alarm stereo cute purse crystal verify goddess crop tide soda trim butter unfold embody arrive venue purpose vapor velvet odor orbit expire disease chuckle"
🌍 Running a Cosmos 'voter' app with Tendermint at http://localhost:26657.
🌍 Running a server at http://localhost:1317 (LCD)
🌍 Running a faucet at http://:4500

🚀 Get started: http://localhost:12345
```

*Note: use* `starport serve --verbose` *to visualize detailed operations happening in the background*

Congratulations! You now have a blockchain application running on your machine in just two commands. It doesn't do anything yet, add some transaction types next.

The voting applications has two types of entities: polls and votes. A poll is a type that has a `title` and a list of `options`.

## Add a Poll Transaction

Open a new terminal in `voter` directory and run the following: 

```
starport type poll title options
```

```
🎉 Created a type `poll`
```

This command generated code that handles the creation of `poll` items. If you run `starport serve` and visit [http://localhost:8080](http://localhost:8080) you will see a form for creating polls. It may take a short while to rebuild the app, so give it a couple of seconds.

![Application screenshot](./2.png)

Sign in with one of the passphrases printed in the console and try creating a poll. Click on `Access Wallet` and then `Import existing wallet`. Enter one of the passphrases that is in your console. Now you can give your wallet a name and password. The wallet can handle multiple accounts, give it a name in order to easier recognise wallets in the future. For this example, naming this wallet `voter` would make sense. 
You can find your newly created transaction type in the `Custom Type` navigation point. Enter an example value for Title and Poll option to see the workflow.
You should see a new object created and displayed next to the form. You have successfully created an object and stored it on the blockchain!

This, however, does not look and work exactly like initially explained. You should be able to add more option fields (and store them as an array) and they should be displayed as interactive buttons.

Take a look at some of the files modified by the `starport type` command.

## Modify the Protobuffer Types

To have multiple options, you need to change the value `string options` in the Protobuffer definitions. Open the `proto/voter` directory and look into the `poll.proto` and `tx.proto` files.

Add the keyword `repeated` before the options to allow passing an array of strings.
In the `proto/voter/poll.proto` file, modify the Poll message options field as follows:

```proto
message Poll {
  string creator = 1;
  uint64 id = 2;
  string title = 3; 
  repeated string options = 4; 
}
```

In the `proto/voter/tx.proto` file you have the CRUD (Create, Read, Update and Delete) types for the poll transaction. Update the `options` field for the messages `MsgCreatePoll` and `MsgUpdatePoll`.

```proto
message MsgCreatePoll {
  string creator = 1;
  string title = 2;
  repeated string options = 3;
}
```

```proto
message MsgUpdatePoll {
  string creator = 1;
  uint64 id = 2;
  string title = 3;
  repeated string options = 4;
}
```

## Modify the Poll Transaction Message

Navigate to the file at `x/voter/types/message_poll.go`.

This file defines a message that creates a poll.

We need to make options to be stored as a list instead of a string. Replace `options string` with `options []string` in the `NewMsgCreatePoll` and `NewMsgUpdatePoll` functions.

```go
// x/voter/types/message_poll.go
func NewMsgCreatePoll(creator string, title string, options []string) *MsgCreatePoll {
	return &MsgCreatePoll{
		Creator: creator,
		Title:   title,
		Options: options,
	}
}
```


```go
// x/voter/types/message_poll.go
func NewMsgUpdatePoll(creator string, id uint64, title string, options []string) *MsgUpdatePoll {
	return &MsgUpdatePoll{
		Id:      id,
		Creator: creator,
		Title:   title,
		Options: options,
	}
}
```

To write anything to a blockchain or perform any other state transition a client (web app in our case) makes an HTTP POST request with a title and options to [http://localhost:1317/voter/poll](http://localhost:1317/voter/poll) endpoint handler for which is defined in `x/voter/client/rest/txPoll.go`. The handler creates an unsigned transaction which contains an array of messages. The client then signs the transaction and sends it to [http://localhost:1317/txs](http://localhost:1317/txs). The application processes the transaction by sending each message to a corresponding handler, in our case `x/voter/handler.go`. A handler then calls a `CreatePoll` function defined in `x/voter/keeper/poll.go` which writes the poll data into the store.

## Modify the Poll Keeper 

The keeper adds the polls to the blockchain database. 

Navigate to the file at `x/voter/keeper/poll.go` and change the `options` parameter from `string` to `[]string` in the `AppendPoll` function

```go
// x/voter/keeper/poll.go
func (k Keeper) AppendPoll(
	ctx sdk.Context,
	creator string,
	title string,
	options []string,
) uint64 {
	// Create the poll
	count := k.GetPollCount(ctx)
	var poll = types.Poll{
		Creator: creator,
		Id:      count,
		Title:   title,
		Options: options,
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PollKey))
	value := k.cdc.MustMarshalBinaryBare(&poll)
	store.Set(GetPollIDBytes(poll.Id), value)

	// Update poll count
	k.SetPollCount(ctx, count+1)

	return count
}
```

## Modify the REST Endpoint

The rest endpoint is defined in the file `x/voter/client/rest/txPoll.go`.

Replace `Options string` with `Options []string` in `createPollRequest` struct.

```go
type createPollRequest struct {
	BaseReq rest.BaseReq `json:"base_req"`
	Creator string       `json:"creator"`
	Title   string       `json:"title"`
	Options []string     `json:"options"`
}
```

Also further below in the `updatePollRequest` struct.

```go
type updatePollRequest struct {
	BaseReq rest.BaseReq `json:"base_req"`
	Creator string       `json:"creator"`
	Title   string       `json:"title"`
	Options []string     `json:"options"`
}
```

### Modify the CLI Transaction

A user will also be able to interact with our application through a command line interface.

The CLI definition is available at `x/voter/client/cli/txPoll.go`.

```
votercli tx voter create-poll "Text editors" "Emacs" "Vim" --from alice
```

This command will generate a transaction with "create poll" message, sign it using a private key of `alice` (one of two users created by default) and broadcast it to the blockchain.

The modification we need to make is to change a line that reads arguments from the console. 

In the function `CmdCreatePoll`

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
msg := types.NewMsgCreatePoll(clientCtx.GetFromAddress().String(), string(argsTitle), argsOptions)
```

We end up with the following function

```go
func CmdCreatePoll() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create-poll [title] [options]",
		Short: "Creates a new poll",
		Args:  cobra.MinimumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			argsTitle := string(args[0])
			argsOptions := args[1:len(args)]

			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			msg := types.NewMsgCreatePoll(clientCtx.GetFromAddress().String(), string(argsTitle), argsOptions)
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

	return cmd
}
```

Similar changes will need to be done for the function `CmdUpdatePoll`

And in the `CmdUpdatePoll` we set
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
msg := types.NewMsgUpdatePoll(clientCtx.GetFromAddress().String(), id, string(argsTitle), argsOptions)
```

This will assume that all arguments after the first one represent a list of options.

You end up with the following function

```go
func CmdUpdatePoll() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "update-poll [id] [title] [options]",
		Short: "Update a poll",
		Args:  cobra.MinimumNArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			id, err := strconv.ParseUint(args[0], 10, 64)
			if err != nil {
				return err
			}

			argsTitle := string(args[1])
			argsOptions := args[2:len(args)]

			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			msg := types.NewMsgUpdatePoll(clientCtx.GetFromAddress().String(), id, string(argsTitle), argsOptions)
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

	return cmd
}
```

In order for the app to recognize the changes that you have made, reset the application first before running it the next time 

```
starport serve --reset-once
```

## Add the Votes

Up to now you have created a blockchain where users can create polls. Users will need to vote on the options of the poll.
Create the code to cast votes on an existing poll.

A vote type transaction has the poll ID and an option - the string representation of the selected answer.

```bash
starport type vote pollID option
```

Now restart the application with

```bash
starport serve --reset-once
```

Remember, every time you reset the application state, you will have new passphrases. The reset restores all the data from your previously created state and you will receive new passphrases with new tokens. Mind to update your wallet accounts in the frontend once you reset the state of the blockchain.
{synopsis}

Now that you have made all the necessary changes to the app, take a look at the client-side application.

### Front-end application

Starport has generated a basic front-end for the app. For convenience [Vue.js](https://vuejs.org) framework is used with [Vuex](https://vuex.vuejs.org/) for state management, but since all features of the app are exposed through an HTTP API, clients can be built using any language or framework.

You will be mostly interested in `vue/src/views` directory and the `vue/src/components` directory. These directories contain the code for the page templates of our app. `vue/src/store/` handles sending transactions and receiving data from our blockchain and [`@tendermint/vue`](https://github.com/tendermint/vue/) directory, which contains components, like buttons and forms. It contains the generated protobuffer file definitions that were defined in the `vue/src/store/generated/username/voter/username.voter.voter` directory.

Inside `vue/src/store/generated/username/voter/username.voter.voter/index.js` you can see the generated transactions `MsgCreatePoll`, `MsgUpdatePoll`, `MsgDeletePoll` which use [CosmJS](https://github.com/cosmwasm/cosmjs), a library for handling wallets, creating, signing and broadcasting transactions and define a Vuex store.

## Add your Module Component to the Frontend

Navigate to the views directory in `vue/src/views`

Since we don't need the default form component replace inside of `vue/src/views/Types.vue`

```js
<SpType modulePath="username.voter.voter" moduleType="Vote"  />
<SpType modulePath="username.voter.voter" moduleType="Poll"  />
```

with two new components and a title
 
 ```js
			<SpH3>
				Polls
			</SpH3>
			<poll-form />
			<poll-list />
 ```

In the `<script></script>` tags below, import the component like this

```js
import PollForm from "../components/PollForm";
import PollList from "../components/PollList";

export default {
	name: 'Types',
	components: { PollForm, PollList },
}
```

Start creating the components.

## Create the PollForm Component

For the PollForm, create a new file `PollForm.vue` in the `vue/src/components` directory. 

The component has a title and two buttons.

```vue
<template>
  <div>
    <input class="sp-input" placeholder="Title" v-model="title" />
    <div v-for="(option, index) in options" v-bind:key="'option' + index">
      <input class="sp-input" placeholder="Option" v-model="option.title" />
    </div>
    <sp-button @click="add">+ Add option</sp-button>
    <sp-button @click="submit">Create poll</sp-button>
  </div>
</template>
```

In between `<script></script>` tags below the javacsript code.
The Form manages the input of the user and broadcasts the transaction to the blockchain if the form gets submitted.

```js
export default {
  name: "PollForm",
  data() {
    return {
      title: "",
      options: [{
        title: "",
      }],
    };
  },
  computed: {

		currentAccount() {
			if (this._depsLoaded) {
				if (this.loggedIn) {
					return this.$store.getters['common/wallet/address']
				} else {
					return null
				}
			} else {
				return null
			}
		},
		loggedIn() {
			if (this._depsLoaded) {
				return this.$store.getters['common/wallet/loggedIn']
			} else {
				return false
			}
		}
  },
  methods: {
    add() {
      this.options = [...this.options, { title: "" }];
    },
    async submit() {
      const value = {
        creator: this.currentAccount,
        title: this.title,
        options: this.options.map((o) => o.title),
      };
      await this.$store.dispatch("username.voter.voter/sendMsgCreatePoll", {
        value,
        fee: [],
      });
    },
  },
};
```


Refresh the page, sign in with a password and create a new poll. It takes a couple of seconds to process a transaction. Now, if you visit [http://localhost:1317/voter/poll](http://localhost:1317/voter/poll) you should see a list of polls (this endpoint is defined in `x/voter/client/rest/queryPoll.go`):

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

### Create the Poll List Component

Create a new component `PollList.vue` in `vue/src/components/PollList.vue`.

```js
<template>
  <div>
    <div v-for="poll in polls" v-bind:key="'poll' + poll.id">
      <SpH3> Poll {{ poll.title }} </SpH3>
      <app-radio-item
        @click="submit(poll.id, option)"
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
import AppRadioItem from "./AppRadioItem";
import AppText from "./AppText";
import { countBy } from "lodash";

export default {
  components: { AppText, AppRadioItem },
  data() {
    return {
      selected: "",
    };
  },
  computed: {

		currentAccount() {
			if (this._depsLoaded) {
				if (this.loggedIn) {
					return this.$store.getters['common/wallet/address']
				} else {
					return null
				}
			} else {
				return null
			}
		},
		loggedIn() {
			if (this._depsLoaded) {
				return this.$store.getters['common/wallet/loggedIn']
			} else {
				return false
			}
		},
    polls() {
      return (
        this.$store.getters["username.voter.voter/getPollAll"]({
          params: {}
        })?.Poll ?? []
      );
    },
    votes() {
      return (
        this.$store.getters["username.voter.voter/getVoteAll"]({
          params: {}
        })?.Vote ?? []
      );
    },
  },
  methods: {
    results(id) {
      const results = this.votes.filter((v) => v.pollID === id);
      return countBy(results, "option");
    },
    async submit(pollID, option) {
      
      const value = { creator: this.currentAccount, pollID, option };
      await this.$store.dispatch("username.voter.voter/sendMsgCreateVote", {
        value,
        fee: [],
      });
      await this.$store.dispatch("username.voter.voter/QueryPollAll", {
        options: { subscribe: true, all: true },
        params: {},
      });
    },
  },
};
```

The `PollList` component lists every poll, including the options for that poll as buttons. Selecting an option triggers a `submit` method that broadcasts a transaction with a "create vote" message and fetches data back from our application.

Two components are still missing from our App, to make it a bit better looking. Let's add `AppRadioItem.vue` and `AppText.vue`.

### Add the Options Component

`vue/src/components/AppRadioItem.vue`

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


### Add the Poll List Text Component

`vue/src/components/AppText.vue`

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

Now in the `App.vue` you need to update the JavaScript to fetch the votes.

### Update the Frontend App

The App file handles the transactions of the components. Modify the script in `vue/src/App.vue` to look the following 

```js
import './scss/app.scss'
import '@starport/vue/lib/starport-vue.css'
import Sidebar from './components/Sidebar'

export default {
	components: {
		Sidebar
	},
	data() {
		return {
			initialized: false
		}
	},
	computed: {
		hasWallet() {
			return this.$store.hasModule([ 'common', 'wallet'])
		}
	},
	async created() {
		await this.$store.dispatch('common/env/init')
		this.initialized = true
		await this.$store.dispatch("username.voter.voter/QueryPollAll",{options:{subscribe:true, all:true},params:{}})
		await this.$store.dispatch("username.voter.voter/QueryVoteAll",{options:{subscribe:true, all:true},params:{}})
	},
	errorCaptured(err) {
		console.log(err)
		return false
	}
}
```

By now should be able to see the same UI as in the first screenshot. Try creating polls and casting votes.
You may notice that it's possible to cast multiple votes for one poll. This is not what we want, so let's fix this behaviour.

## Access the API

To fix this issue you first have to understand how data is stored in our application.

Think of the data storage as a lexicographically ordered key value store. 
You can loop through the entries, filter by key prefix, add, update and delete entries. 
It is easier to visualize the store as JSON.

When you create a poll and cast on vote, this is the resulting JSON.

See the API and JSON output of your created Poll endpoint at http://localhost:1317/username/voter/voter/poll 
```json
{
  "Poll": [
    {
      "creator": "cosmos1vedd97ku2n8qtsccrfna5gg0repdnk0a9cl7ze",
      "id": "0",
      "title": "Soft drinks",
      "options": ["Coca-Cola", "Pepsi"]
    }
  ],
  "pagination": {
    "next_key": null,
    "total": "1"
  }
}
```

For the votes you can go to the page on http://localhost:1317/username/voter/voter/vote 

```json

{
  "Vote": [
    {
      "creator": "cosmos1vedd97ku2n8qtsccrfna5gg0repdnk0a9cl7ze",
      "id": "0",
      "pollID": "0",
      "option": "Pepsi"
    }
  ],
  "pagination": {
    "next_key": null,
    "total": "2"
  }
}
```

The endpoint paths are defined by the username you use when bootstrapping the application with Starport, together with your module name.

Looking into this data, you can see the combination of `creator` and `pollID` is what we are looking for. Each account should only be allowed to have 1 vote per pollID.

## Limit to One Vote per User

The logic for access to a certain transaction should be in the `keeper` directory. For the votes transaction logic, open the `msg_server_vote.go` file at `x/voter/keeper/msg_server_vote.go` and modify the `CreateVote` function.

```go
func (k msgServer) CreateVote(goCtx context.Context, msg *types.MsgCreateVote) (*types.MsgCreateVoteResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

  // Get all existing votes
	voteList := k.GetAllVote(ctx)
	for _, existingVote := range voteList {
    // Check if the account has already voted on this PollID
		if existingVote.Creator == msg.Creator && existingVote.PollID == msg.PollID {
      // Return an error when a vote has been casted by this account on this PollID
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Vote already casted.")
		}
	}

	id := k.AppendVote(
		ctx,
		msg.Creator,
		msg.PollID,
		msg.Option,
	)

	return &types.MsgCreateVoteResponse{
		Id: id,
	}, nil
}
```

Now when you restart the app, in the frontend you should be able to only cast 1 vote per poll.

## Introducing a fee for creating polls

Add the logic for the transaction, that creating a poll costs 200 tokens.

We already require users to have accounts registered, and each user has tokens on balance. The only thing you need to do is to send coins from user's account to a module account before we create a poll.

## Add the Bank Keeper to the Module

First, load the `expected_keepers` in the `x/voter/types/expected_keepers.go` file.
This will define all the bank functions available in your module.

```go
package types

import sdk "github.com/cosmos/cosmos-sdk/types"

// BankKeeper defines the expected bank keeper
type BankKeeper interface {
	SendCoins(ctx sdk.Context, fromAddr sdk.AccAddress, toAddr sdk.AccAddress, amt sdk.Coins) error
	MintCoins(ctx sdk.Context, moduleName string, amt sdk.Coins) error
	BurnCoins(ctx sdk.Context, moduleName string, amt sdk.Coins) error
	SendCoinsFromModuleToAccount(ctx sdk.Context, senderModule string, recipientAddr sdk.AccAddress, amt sdk.Coins) error
	SendCoinsFromAccountToModule(ctx sdk.Context, senderAddr sdk.AccAddress, recipientModule string, amt sdk.Coins) error
}
```

Second, add the keeper to the `x/voter/keeper/keeper.go` file.
Add it to the `type` as well as the `NewKeeper` function as follows:

```go
type (
	Keeper struct {
		cdc        codec.Marshaler
		storeKey   sdk.StoreKey
		memKey     sdk.StoreKey
		bankKeeper types.BankKeeper
	}
)

func NewKeeper(cdc codec.Marshaler, storeKey, memKey sdk.StoreKey, bankKeeper types.BankKeeper) *Keeper {
	return &Keeper{
		cdc:        cdc,
		storeKey:   storeKey,
		memKey:     memKey,
		bankKeeper: bankKeeper,
	}
}
```

Finally, add the bank module to the `app.go` file in `x/app/app.go`

```go
app.voterKeeper = *voterkeeper.NewKeeper(
  appCodec, keys[votertypes.StoreKey], keys[votertypes.MemStoreKey], app.BankKeeper,
)
```

Now you are ready to use all the bank functions that you added to the expected keepers file above.
Next you will define how the transaction will require the funds in order to exectue the transaction.

## Modify the Message with the price

Modify the msg at `x/voter/keeper/msg_server_poll.go`.

```go
package keeper

import (
	"context"
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/tendermint/tendermint/crypto"
	"github.com/username/voter/x/voter/types"
)

func (k msgServer) CreatePoll(goCtx context.Context, msg *types.MsgCreatePoll) (*types.MsgCreatePollResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	moduleAcct := sdk.AccAddress(crypto.AddressHash([]byte(types.ModuleName)))
	feeCoins, err := sdk.ParseCoinsNormalized("200token")
	if err != nil {
		return nil, err
	}
	creatorAddress, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return nil, err
	}
	if err := k.bankKeeper.SendCoins(ctx, creatorAddress, moduleAcct, feeCoins); err != nil {
		return nil, err
	}

	id := k.AppendPoll(
		ctx,
		msg.Creator,
		msg.Title,
		msg.Options,
	)

	return &types.MsgCreatePollResponse{
		Id: id,
	}, nil
}
```

The fee payment happens before `k.AppendPoll`. This way, if a user does not have enough tokens, the application will raise an error and will not proceed to creating a poll. Make sure to have `"github.com/tendermint/tendermint/crypto"` added to the import statement (if your text editor didn't do that for you).

Now, restart the app and try creating several polls to see how this affects your token balance.

Congratulations, you have built a blockchain voting application.
