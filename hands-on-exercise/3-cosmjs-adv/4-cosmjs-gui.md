---
title: "Integrate CosmJS and Keplr"
order: 5
description: Take a checkers GUI and use the elements
tags: 
  - guided-coding
  - cosmos-sdk
  - cosm-js
---

# Integrate CosmJS and Keplr

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [CosmJS](/tutorials/7-cosmjs/1-cosmjs-intro.md).
* You have the checkers blockchain codebase up to the external GUI. If not, follow the [previous steps](./3-external-gui.md) or you can go ahead and clone and checkout [this branch](https://github.com/cosmos/academy-checkers-ui/tree/unwired-gui) to get the version needed for this tutorial.

</HighlightBox>

In the previous sections:

1. You created the objects, messages, and clients that allow you to **interface** any GUI with your checkers blockchain.
2. You imported an external checkers **GUI** to use.

Now, you must **integrate the two** together:

* Adjust the React app to be able to package CosmJS.
* Work on the CosmJS integration.

For the CosmJS integration, you will:

* Work with the GUI's data structures.
* Fetch all games from the blockchain and display them (without pagination).
* Integrate with Keplr for browser-based players.
* Create a new game.
* Fetch a single game to be played.

Rejecting a game will be left to you as an exercise.

## Prepare the integration with the checkers blockchain

As always, when moving code to a browser, adjustments are needed.

### Prepare Webpack

Your GUI uses React v18, which uses Webpack v5. Therefore you need to [adjust Webpack's configuration](https://github.com/cosmos/cosmjs/blob/v0.28.11/README.md#webpack-configs) to handle some elements (see also the CosmJS documentation). To modify the Webpack configuration in a non-ejected React app, use [`react-app-rewired`](https://www.npmjs.com/package/react-app-rewired) as [explained here](https://stackoverflow.com/questions/63280109/how-to-update-webpack-config-for-a-react-project-created-using-create-react-app):

1. Install the new package:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ npm install react-app-rewired@2.2.1 --save-dev --save-exact
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker run --rm -it -v $(pwd):/client -w /client node:18.7 npm install react-app-rewired@2.2.1 --save-dev --save-exact
    ```

    </CodeGroupItem>

    </CodeGroup>

2. Add a new `config-overrides.js`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/config-overrides.js#L1-L20]
    require("dotenv").config()
    const webpack = require("webpack")

    module.exports = function override(config, env) {
        config.plugins.push(
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
            }),
            new webpack.EnvironmentPlugin(["RPC_URL"]),
        )
        config.resolve.fallback = {
            buffer: false,
            crypto: false,
            events: false,
            path: false,
            stream: false,
            string_decoder: false,
        }
        return config
    }
    ```

    <HighlightBox type="note">

    You can also pass along the `RPC_URL` as an environment variable.

    </HighlightBox>

3. Change the run targets to use `react-app-rewired` in `package.json`:

    ```json [https://github.com/cosmos/academy-checkers-ui/blob/gui/package.json#L8-L11]
    {
        ...
        "scripts": {
            ...
            "start": "react-app-rewired start",
            "build": "react-app-rewired build",
            "test-react": "react-app-rewired test",
            "eject": "react-scripts eject"
        },
        ...
    }
    ```

    Be careful to leave the `"eject"` unchanged.

See a [previous section](./1-cosmjs-objects.md) for how to set `RPC_URL` in `process.env.RPC_URL`. It also assumes that you have an RPC end point that runs the checkers blockchain, as explained in the previous section.

### GUI data structures

The checkers GUI uses different data structures, which you must understand to convert them correctly.

1. The `IPlayerInfo` has a [`name: string`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/sharedTypes.ts#L27) field which can be used as the player's address.
2. The `IGameInfo` has a [`board: number[][] | null`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/sharedTypes.ts#L11) field. You must do a conversion from `b*b*...` to this type. Ensure that the alignments are correct.
3. The `IGameInfo` has a [`turn: number`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/sharedTypes.ts#L17), which maps to `"b"` or `"r"`.
4. The `IGameInfo` lacks an `index` or `id` field. Instead the GUI developer identified games by their index in an array, which is not adequate for this case. You must add an `index` field to `IGameInfo`. This is saved as a `string` in the blockchain but in practice is a **number**, which the GUI code expects as game index. Add:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/sharedTypes.ts#L18]
    export interface IGameInfo {
        ...
        index: number
    }
    ```

    To avoid compilation errors on `index:` elsewhere, temporarily add `index?: number`. Remember to come back and remove the `?`.

### Board converter

In order to correctly convert a _blockchain_ board into a _GUI_ board, you want to see how a GUI board is coded. In `components/Game/Board/Board.tsx`, add a [`console.log(props.squares)`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/Board/Board.tsx#L18). Let React recompile, open the browser console, and create a game. You should see printed:

```json
[
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, ...          ],
    ...,
    [...          , 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0]
]
```

Where `1` represents player 1, i.e. black pieces. Compare that to how a game is saved in the blockchain:

```json
"*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*"
```

To convert the board, create a new file `src/types/checkers/board.ts` and code as follows:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/board.ts#L5-L18]
const rowSeparator = "|"
export const pieceTranslator = {
    "*": 0,
    b: 1,
    r: 2,
}
export const playerReverseTranslator: Player[] = ["b", "r"];
export const pieceReverseTranslator = ["*", ...playerReverseTranslator];

export function serializedToBoard(serialized: string): number[][] {
    return serialized
        .split(rowSeparator)
        .map((row: string) => row.split("").map((char: string) => (pieceTranslator as any)[char]))
}
```

### Game converter

Next you convert a `StoredGame` into the `IGameInfo` of the GUI:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/board.ts#L20-L43]
export function storedToGameInfo(game: StoredGame): IGameInfo {
    return {
        board: serializedToBoard(game.board),
        created: new Date(Date.now()),
        isNewGame: game.moveCount.equals(0),
        last: new Date(Date.parse(game.deadline) - 86400 * 1000),
        p1: {
            name: game.black, // Addresses are used instead of names.
            is_ai: false, // To make it simple.
            score: 0,
        },
        p2: {
            name: game.red,
            is_ai: false,
            score: 0,
        },
        turn: (pieceTranslator as any)[game.turn],
        index: parseInt(game.index),
    };
}

export function storedsToGameInfos(games: StoredGame[]): IGameInfo[] {
    return games.map(storedToGameInfo);
}
```

<HighlightBox type="note">

Here:

* You use Cosmos addresses instead of names.
* You put today in the creation date because it is not stored in `StoredGame`.
* You set the `last` played date to deadline minus expiry duration (an adequate solution).
* The possibility of "AI" is not important.

</HighlightBox>

<HighlightBox type="info">

Could an AI player and the blockchain mix together? If _the AI_ has access to a private key that lets it send transactions, it would be a bona fide player. This could be implemented with backend scripts running on a server. See [checkers backend scripts](./5-server-side.md) for an example of backend scripts for a different use-case.

</HighlightBox>

## Obtain a client

For your React components to communicate with the blockchain they need to have access to a `StargateClient`, and at some point to a `SigningStargateClient` too. Among the information they need is the RPC URL.

### Pass RPC parameters

The RPC URL is already saved into `process.env.RPC_URL` thanks to `react-app-rewired`. However, it is better to reduce your components' reliance on `process.env`. A simple way to give the RPC URL to the components is for them to:

* Receive an `rpcUrl: string` in the properties.
* Keep a `StargateClient` in the component's state that would be instantiated lazily.

With this setup, only `index.tsx` would use `process.env.RPC_URL`.

For instance, prepare access to `rpcUrl` for `MenuContainer.tsx` by adding it to the following:

1. The properties of `src/components/Menu/MenuContainer.tsx`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/MenuContainer.tsx#L14]
    export interface IMenuContainerProps {
        ...
        rpcUrl: string
    }
    ```

2. The properties of the component call stack, first in `src/components/App.tsx`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/App.tsx#L38-L50]
    export interface AppProps {
        rpcUrl: string;
    }

    const App = ({ rpcUrl }: AppProps) => {
        ...
        return (
            <Container style={styles}>
                ...
                <Route path="menu" element={<MenuContainer location={""} rpcUrl={rpcUrl} />} />
                ...
            </Container>
        )
    }
    ```

    <HighlightBox type="note">

    You have to create the _missing_ `AppProps` entirely.

    </HighlightBox>

3. Finally, to `src/index.tsx`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/index.tsx#L21]
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <App rpcUrl={process.env.RPC_URL!} />
            </BrowserRouter>
        </React.StrictMode>,
    )
    ```

    <HighlightBox type="note">

    The `!` forces the type of `.RPC_URL` from `string | undefined` to `string` to satisfy the compiler.

    </HighlightBox>

Whenever another component needs the `rpcUrl`, adapt and reproduce these steps as necessary.

### Create the `StargateClient`

Whenever you need a `StargateClient` in a component, you can repeat the following chain of actions for the component in question. For instance, to prepare the client in the state of `src/components/Menu/MenuContainer.tsx`:

1. Add the field in the state:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/MenuContainer.tsx#L21]
    interface IMenuContainerState {
        ...
        client: CheckersStargateClient | undefined
    }
    ```

2. Initialize it to `undefined` in the constructor:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/MenuContainer.tsx#L31]
    constructor(props: IMenuContainerProps) {
        ...
        this.state = {
            ...
            client: undefined,
        };
        ...
    }
    ```

3. Add a method that implements the conditional instantiation:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/MenuContainer.tsx#L47-L52]
    protected async getStargateClient(): Promise<CheckersStargateClient> {
       const client: CheckersStargateClient =
           this.state.client ?? (await CheckersStargateClient.connect(this.props.rpcUrl))
       if (!this.state.client) this.setState({ client: client })
       return client
   }
    ```

    <HighlightBox type="note">

    This creates it only once by saving the client in the state.

    </HighlightBox>

Instantiating a `CheckersSigningStargateClient` is more involved, as you will see later on.

First, make use of what you already prepared. Why choose to start with `MenuContainer`? Because that is where all the games are listed.

## Show all games

To show all games, you only need the read-only `StargateClient`. There is no need to worry about private keys for now. Where do you query for the games?

### All games container

Look into `src/components/Menu/MenuContainer.tsx` for the `componentDidMount` method, which accesses the browser storage for saved games. You can replace the storage logic with the following steps:

* Obtain a `StargateClient` with the `getStargateClient` method.
* Obtain the blockchain games (without pagination).
* Convert the blockchain games to the format the component expects.
* Save them in `saved: IGameInfo[]` of the component's state.

Before adding lines of code in the component, a good next step is to add a new function to `CheckersStargateClient` to handle the call and the conversion, or to add a helper function that takes a client as a parameter.

### A specific GUI method

In the future you may want to reuse the `CheckersStargateClient` code in another GUI or for backend scripts. To avoid polluting the code, and to avoid a less-elegant helper where you need to pass a Stargate client as a parameter, add [an extension method](https://www.c-sharpcorner.com/article/learn-about-extension-methods-in-typescript/#:~:text=Extension%2Dmethod%20gives%20you%20the,any%20data%2Dtype%20you%20want) to `CheckersStargateClient`.

In a new `src/types/checkers/extensions-gui.ts`:

1. Declare the new extension method that extends your `CheckersStargateClient` _module_:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L14-L16]
    declare module "../../checkers_stargateclient" {
        interface CheckersStargateClient {
            getGuiGames(): Promise<IGameInfo[]>
        }
    }
    ```

2. Add its implementation:

    ```typecript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L33-L42]
    CheckersStargateClient.prototype.getGuiGames = async function (): Promise<IGameInfo[]> {
        return (
            await this.checkersQueryClient!.checkers.getAllStoredGames(
                Uint8Array.from([]),
                Long.ZERO,
                Long.fromNumber(20),
                true,
            )
        ).storedGames.map(storedToGameInfo)
    }
    ```

    <HighlightBox type="note">

    Note this does not care about pagination or games beyond the first 20. This purely-GUI detail is left as an exercise.

    </HighlightBox>

### All games call

Next, in `MenuContainer.tsx`:

1. Add an empty `import` for the extension method file, otherwise the method is not compiled:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/MenuContainer.tsx#L4]
    import {} from "../../types/checkers/extensions-gui"
    ```

2. Change `componentDidMount` to `async` and replace the storage code with a call to the new method:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/MenuContainer.tsx#L38-L46]
    public async componentDidMount(): Promise<void> {
        const queries = QueryString.parse(this.props.location.search)
        if (queries.newGame) {
            this.setState({ showModal: true })
        }
        this.setState({
            saved: await (await this.getStargateClient()).getGuiGames(),
        })
    }
    ```

Restart `npm start` and you should see an empty games list (unless you have previously created any). If you have access to any way of creating a game, for instance with the `checkersd` command line, test this new functionality by creating one:

![List of one game](/hands-on-exercise/3-cosmjs-adv/images/list-games-1.png)

If you do not have a way to create a game, wait for the procedures about creating a game.

### Individual game menu container

Each game is now listed as a [`src/components/Menu/MenuItem.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/MenuItem.tsx). However, in `src/components/Menu/Menu.tsx` the `index` of the game is taken from its _index_ in the games array, which is not what you want here. The list needs to use the proper `index` of each game. In `Menu.tsx` make this change:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/Menu.tsx#L21-L23]
const Menu = (props: IMenuProps) => {
    const menuItems = props.games.map((game, index) => (
      <MenuItem ... index={game.index} key={"game" + game.index} />
    ))
    ...
}
```

Alternatively, temporarily add `!` (as in `game.index!`) if you previously added the `IGameInfo.index` as `index?: number`.

## Show one game

What happens when you click on a game's <kbd>Resume Game</kbd>? It opens a page of the form `http://localhost:3000/play/1`. The component is `src/components/Game/GameContainer.tsx`, from which you have to pick the game information from the blockchain. This process begins as with `MenuContainer`:

* Pass a [`rpcUrl`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L19) along the chain to [`GameContainerWrapper`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/App.tsx#L51) then the [`GameContainer`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/App.tsx#L21-L27).
* Add a [`client: CheckersStargateClient | undefined`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L39) state field, [initialize it](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L62), and add a [lazy instantiation method](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L116-L121).

Looking into `GameContainer`, you see that `componentDidMount` gets all the games from storage then sets the state with the information. Instead, as you did for all games, you have to take the game from the blockchain.

1. In `extensions-gui.tsx` declare another extension method to `CheckersStargateClient` dedicated to getting the game as expected by the GUI:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L17]
    declare module "../../checkers_stargateclient" {
        interface CheckersStargateClient {
            ...
            getGuiGame(index: string): Promise<IGameInfo | undefined>
        }
    }
    ```

    Now define `getGuiGame`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L44-L48]
    CheckersStargateClient.prototype.getGuiGame = async function (index: string): Promise<IGameInfo | undefined> {
        const storedGame: StoredGame | undefined = await this.checkersQueryClient!.checkers.getStoredGame(index)
        if (!storedGame) return undefined
        return storedToGameInfo(storedGame)
    }
    ```

2. In `GameContainer.tsx` add an empty import to the extension methods:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L9]
    import {} from "../../types/checkers/extensions-gui"
    ```

3. Make the `componentDidMount` method `async`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L73]
    public async componentDidMount(): Promise<void>
    ```

4. Split the `componentDidMount` method, and move the game loading lines to their own `loadGame` function:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L76-L79]
    public async componentDidMount(): Promise<void> {
        // Allow a player to make a move by double-clicking the screen.
        // This is mainly for touchscreen users.
        window.addEventListener("dblclick", this.makeMove)
        await this.loadGame()
    }
    public async loadGame(): Promise<void> {
        ...
    }
    ```

5. In `loadGame` replace the storage actions with a fetch from the blockchain:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L80-L86]
    public async loadGame(): Promise<void> {
        const game: IGameInfo | undefined = await (
            await this.getStargateClient()
        ).getGuiGame(this.props.index)
        if (!game) {
            alert("Game does not exist")
            return
        }
        this.setState({
            ...
        })
        ...
    }
    ```

6. Adjust the `setState` call so that `isSaved` is always `true`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L91]
    public async loadGame(): Promise<void> {
        ...
        this.setState({
            ...
            isSaved: true,
            ...
        });
        ...
    }
    ```

    <HighlightBox type="note">

    Here:

    * You force `isSaved` to `true` since it is always saved in the blockchain.
    * Saving `game.index` to state is unimportant because it is actually passed in `IGameContainerProps.index`.
    * By having a separate `loadGame`, you can call it again if you know the game has changed.

    </HighlightBox>

Restart `npm start` and you should now see your game. If you have access to `checkersd`, or any other way to send a transaction, you can make a move from the command line and refresh to confirm the change. If not, wait for the procedure about playing.

![Game with one move played](/hands-on-exercise/3-cosmjs-adv/images/show-game-1-move.png)

## Integrate with Keplr

So far you have _only_ made it possible to show the state of games and of the blockchain. This allows your users to poke around without unnecessarily asking them to connect. However, to create a game or play in one, you need to make transactions. This is where you need to make integration with Keplr possible.

Install the necessary packages:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm install @keplr-wallet/types@0.10.17 --save-exact --save-dev
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/client -w /client node:18.7 npm install @keplr-wallet/types@0.10.17 --save-exact --save-dev
```

</CodeGroupItem>

</CodeGroup>

### Identify the checkers blockchain

Keplr will need information to differentiate your checkers blockchain from the other chains. Prepare your checkers blockchain info in a new `src/types/checkers/chain.ts` file:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/chain.ts]
import { ChainInfo } from "@keplr-wallet/types"
import _ from "../../../environment"

export const checkersChainId = "checkers"

export const getCheckersChainInfo = (): ChainInfo => ({
    chainId: checkersChainId,
    chainName: checkersChainId,
    rpc: process.env.RPC_URL!,
    rest: "http://0.0.0.0:1317",
    bip44: {
        coinType: 118,
    },
    bech32Config: {
        bech32PrefixAccAddr: "cosmos",
        bech32PrefixAccPub: "cosmos" + "pub",
        bech32PrefixValAddr: "cosmos" + "valoper",
        bech32PrefixValPub: "cosmos" + "valoperpub",
        bech32PrefixConsAddr: "cosmos" + "valcons",
        bech32PrefixConsPub: "cosmos" + "valconspub",
    },
    currencies: [
        {
            coinDenom: "STAKE",
            coinMinimalDenom: "stake",
            coinDecimals: 0,
            coinGeckoId: "stake",
        },
        {
            coinDenom: "TOKEN",
            coinMinimalDenom: "token",
            coinDecimals: 0,
        },
    ],
    feeCurrencies: [
        {
            coinDenom: "STAKE",
            coinMinimalDenom: "stake",
            coinDecimals: 0,
            coinGeckoId: "stake",
        },
    ],
    stakeCurrency: {
        coinDenom: "STAKE",
        coinMinimalDenom: "stake",
        coinDecimals: 0,
        coinGeckoId: "stake",
    },
    coinType: 118,
    gasPriceStep: {
        low: 1,
        average: 1,
        high: 1,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
})
```

Note the use of `process.env.RPC_URL` again.

<HighlightBox type="note">

The `chainId` value has to **match exactly** that returned by `client.getChainId()`, or the transaction signer will balk. The `ChainInfo` object is copied from the one you used for Theta in the [first steps with Keplr](/tutorials/7-cosmjs/4-with-keplr.md) section.

</HighlightBox>

### Prepare a signing client

Just as components that need a `CheckersStargateClient` keep one in their state, components that need a `SigningCheckersStargateClient` keep one in their state too. Some components may have both. The steps to take are the same for each such component.

For instance, in `src/components/Menu/NewGameModal/NewGameModal.tsx`:

1. Add an [`rpcUrl: string`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L25) to the props, passed along [`Menu.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/Menu.tsx#L47) which also needs it [as a new prop](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/Menu.tsx#L17), in turn passed from [`MenuContainer.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/MenuContainer.tsx#L82).

2. Add a signing client to the component's state, as well as the potential address of the Keplr user:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L30-L31]
    interface INewGameModalState {
        ...
        creator: string;
        signingClient: CheckersSigningStargateClient | undefined;
    }
    ```

    Do not forget to initialize them to nothing in the constructor:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L50-L51]
    this.state = {
        ...
        creator: "",
        signingClient: undefined,
    };
    ```

    The address of Keplr is saved because it is accessible from the `OfflineSigner` but not from the `SigningStargateClient`.

3. Add a tuple type to return both of them:

    ```typecript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L17-L20]
    interface CreatorInfo {
        creator: string;
        signingClient: CheckersSigningStargateClient;
    }
    ```

    This is done because the `setState` function does not ensure the state is updated immediately after it has been called, so the lazy instantiation method has to return both.

4. Inform TypeScript of the _Keplr `window`_ object:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L3-L15]
    import { Window as KeplrWindow } from "@keplr-wallet/types"
    ...
    declare global {
        interface Window extends KeplrWindow {}
    }
    ```

5. Add a function that obtains the signing client and signer's address (a.k.a. future transaction `creator`) by setting up Keplr and connecting to it:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L61-L84]
    protected async getSigningStargateClient(): Promise<CreatorInfo> {
        if (this.state.creator && this.state.signingClient)
            return {
                creator: this.state.creator,
                signingClient: this.state.signingClient,
            }
        const { keplr } = window
        if (!keplr) {
            alert("You need to install Keplr")
            throw new Error("You need to install Keplr")
        }
        await keplr.experimentalSuggestChain(getCheckersChainInfo())
        const offlineSigner: OfflineSigner = keplr.getOfflineSigner!(checkersChainId)
        const creator = (await offlineSigner.getAccounts())[0].address
        const client: CheckersSigningStargateClient = await CheckersSigningStargateClient.connectWithSigner(
            this.props.rpcUrl,
            offlineSigner,
            {
                gasPrice: GasPrice.fromString("1stake"),
            },
        )
        this.setState({ creator: creator, signingClient: client })
        return { creator: creator, signingClient: client }
    }
    ```

    <HighlightBox type="note">

    Setting up Keplr is [idempotent](https://www.merriam-webster.com/dictionary/idempotent#:~:text=Definition%20of%20idempotent,plural%20idempotents), so repeating these operations more than once is harmless. You may want to separate these actions into more defined methods at a later optimization stage.
    <br/><br/>
    Note too that a default gas price is passed in, so that you can use `"auto"` when sending a transaction.

    </HighlightBox>

Your component is now ready to send transactions to the blockchain. Why choose `NewGameModal.tsx` as the example? Because this is where a new game is created.

## Create a new game

This modal window pops up when you click on <kbd>New Game</kbd>:

![Modal window to create game](/hands-on-exercise/3-cosmjs-adv/images/window-create-game.png)

The player names look ready-made to take the player's Cosmos addresses.

Examine the code, and focus on `src/components/Menu/NewGameModal/NewGameModal.tsx`. Thanks to the previous preparation with `CheckersSigningStargateClient` it is ready to send transactions:

1. In `extensions-gui.ts` declare an extension method to your `CheckersSigningStargateClient` that encapsulates knowledge about how to get the newly created game index out of the events:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L26-L28]
    declare module "../../checkers_signingstargateclient" {
        interface CheckersSigningStargateClient {
            createGuiGame(creator: string, black: string, red: string): Promise<string>
        }
    }
    ```

    Now define it:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L64-L72]
    CheckersSigningStargateClient.prototype.createGuiGame = async function (
        creator: string,
        black: string,
        red: string,
    ): Promise<string> {
        const result: DeliverTxResponse = await this.createGame(creator, black, red, "stake", Long.ZERO, "auto")
        const logs: Log[] = JSON.parse(result.rawLog!)
        return getCreatedGameId(getCreateGameEvent(logs[0])!)
    }
    ```

    <HighlightBox type="note">

    Keep in mind:

    * For the sake of simplicity, a possible wager is completely omitted.
    * The `getCreatedGameId` is defined in a [previous section](./2-cosmjs-messages.md).

    </HighlightBox>

2. In `NewGameModal.tsx` add an empty import of the extension method so that it is compiled in:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L8]
    import {} from "src/types/checkers/extensions-gui"
    ```

3. Since you are going to paste addresses into the name field, make sure that the GUI does not truncate them. In `src/components/Menu/NewGameModal/PlayerNameInput.tsx`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/PlayerNameInput.tsx#L36]
    ...
    maxLength={45}
    ```

4. Back in `NewGameModal.tsx`, change the declaration of `handleSubmit` and make it `async`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L128]
    private async handleSubmit(event: any): Promise<void>
    ```

5. In `handleSubmit`, avert the need to save to local storage and call your create game extension method:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L156-L157]
    const { creator, signingClient } = await this.getSigningStargateClient()
    const index: string = await signingClient.createGuiGame(creator, p1Name, p2Name)
    ```

6. Next send the player directly to the newly created game:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L158-L159]
    this.props.close()
    window.location.replace(`/play/${index}`)
    ```

7. In `render()` change the React link around the `Button` to a regular `div` so that window redirection appears smooth:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Menu/NewGameModal/NewGameModal.tsx#L115-L119]
    public render() {
        return (
            ...
            <div style={this.linkStyles} onClick={this.handleSubmit}>
                <Button color="success" size="lg">
                    Play Game!
                </Button>
            </div>
            ...
        )
    }
    ```

You have now added game creation to your GUI.

If you do not yet know your Keplr address on the checkers network, you will have to test in two passes. To test properly, you need to:

1. Run the initialization code by pretending to create a game. This makes Keplr prompt you to accept adding the `checkers` network and accessing your account. Accept both, but optionally reject the prompt to accept a transaction if your balance is zero.

    ![Checkers prompting to add support for Checkers](/hands-on-exercise/3-cosmjs-adv/images/checkers-add-support.png)![Checkers prompting to access account](/hands-on-exercise/3-cosmjs-adv/images/checkers-access-address.png)    

2. Select _Checkers_ in Keplr. Make a note of your address, for instance `cosmos17excjd99u45c4fkzljwlx8eqyn5dplcujkwag8`.

    ![Checkers network in beta support list](/hands-on-exercise/3-cosmjs-adv/images/list-keplr-beta-support.png)

3. Put enough tokens in your Keplr _Checkers_ account. `"1000000stake"` will satisfy by a 10x margin.

    * If you have access to `checkersd` built by Ignite CLI, use this command:

        ```sh
        $ export alice=$(checkersd keys show alice -a)
        $ checkersd tx bank send $alice "cosmos17excjd99u45c4fkzljwlx8eqyn5dplcujkwag8" 1000000stake -y
        ```

    * If you have access to the Ignite-built faucet of checkers at port 4500, either go to the GUI at `localhost:4500` or whatever address at which it is running, or use this command:

        ```sh
        $ curl --request POST \
            --header "Content-Type: application/json" \
            --data '{"address":"cosmos17excjd99u45c4fkzljwlx8eqyn5dplcujkwag8","coins": ["1000000stake"]}' \
            localhost:4500
        ```

    * If you do not have access to `checkersd` or its faucet, look for instructions on how to start your locally-running checkers or tap the faucet of a public checkers test net.

4. Now start again to actually create a game. Accept the transaction, and you are redirected to the game page. This time the content of the game is from the blockchain.

## Play a move

In the `GameContainer.tsx` there are `makeMove` and `saveGame` functions. In a blockchain context, `saveGame` is irrelevant, as on each move done with a transaction the game will be automatically _saved_ in the blockchain. So add `index: -1` in the game to be saved to get past the compilation error.

Add a `console.log` to  `makeMove` to demonstrate the format it uses:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L211]
const positions: Position[] = keys.map((k: string): Position => k.split(",").map(Number) as Position)
console.log(positions)
```

Now play a move with the current interface. Move your first black piece:

![Black moves first piece](/hands-on-exercise/3-cosmjs-adv/images/black-moves-first-piece.png)

In the blockchain code, this is `fromX: 1, fromY: 2, toX: 2, toY: 3`. However, the GUI prints:

```json
[ [ 2, 1 ], [ 3, 2 ] ]
```

Evidently for each position X and Y are flipped. You can encapsulate this knowledge in a helper function:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/board.ts#L45-L47]
export function guiPositionToPos(position: number[]): Pos {
    return { x: position[1], y: position[0] }
}
```

This is likely a familiar situation. Go back to the board and do as if your piece was moving twice. This time, the GUI prints an array with three positions:

```json
[ [ 2, 1 ], [ 3, 2 ], [ 4, 3 ] ]
```

This may not be a legal move but it proves that the GUI lets you make more than one move per turn. You can use this feature to send a transaction with more than one move.

Do some more preparation:

1. In `extensions-gui.ts` declare an extension method to `CheckersStargateClient` to check whether the move is valid, with parameters as they are given in the GUI components:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L18-L22]
    declare module "../../checkers_stargateclient" {
        interface CheckersStargateClient {
            ...
            canPlayGuiMove(
                gameIndex: string,
                playerId: number,
                positions: number[][],
            ): Promise<QueryCanPlayMoveResponse>
        }
    }
    ```

    Now define it:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L50-L62]
    CheckersStargateClient.prototype.canPlayGuiMove = async function (
        gameIndex: string,
        playerId: number,
        positions: number[][],
    ): Promise<QueryCanPlayMoveResponse> {
        if (playerId < 1 || 2 < playerId) throw new Error(`Wrong playerId: ${playerId}`)
        return await this.checkersQueryClient!.checkers.canPlayMove(
            gameIndex,
            playerId === 1 ? "b" : "r",
            guiPositionToPos(positions[0]),
            guiPositionToPos(positions[1]),
        )
    }
    ```

    Note that due to the limits of the `canPlayGuiMove` function, you can only test the first move of a multi-move turn. That is, it uses only `positions[0]` and `positions[1]` of a potentially longer move. You cannot just test the next moves anyway because it will be rejected for sure. For it to be passed, the board would have to be updated first in the blockchain state.

2. Declare another extension method, this time for `CheckersSigningStargateClient`, to actually make the move with parameters as they are given in the GUI components:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L29]
    declare module "../../checkers_signingstargateclient" {
        interface CheckersSigningStargateClient {
            ...
            playGuiMoves(creator: string, gameIndex: string, positions: number[][]): Promise<(Pos | undefined)[]>
        }
    }
    ```

    It returns the captured pieces. Now define it:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/types/checkers/extensions-gui.ts#L74-L99]
    CheckersSigningStargateClient.prototype.playGuiMoves = async function (
        creator: string,
        gameIndex: string,
        positions: number[][],
    ): Promise<(Pos | undefined)[]> {
        const playMoveMsgList: MsgPlayMoveEncodeObject[] = positions
            .slice(0, positions.length - 1)
            .map((position: number[], index: number) => {
                const from: Pos = guiPositionToPos(position)
                const to: Pos = guiPositionToPos(positions[index + 1])
                return {
                    typeUrl: typeUrlMsgPlayMove,
                    value: {
                        creator: creator,
                        gameIndex: gameIndex,
                        fromX: Long.fromNumber(from.x),
                        fromY: Long.fromNumber(from.y),
                        toX: Long.fromNumber(to.x),
                        toY: Long.fromNumber(to.y),
                    },
                }
            })
        const result: DeliverTxResponse = await this.signAndBroadcast(creator, playMoveMsgList, "auto")
        const logs: Log[] = JSON.parse(result.rawLog!)
        return logs.map((log: Log) => getCapturedPos(getMovePlayedEvent(log)!))
    }
    ```

    <HighlightBox type="note">

    Note how it maps from the positions array except for the last position. This is to take the _moves_ out of the _positions_.

    </HighlightBox>

With this done:

1. Repeat in `GameContainer` what you did in `NewGameModal`:
    1.  Keep a [signing client and `creator`](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L40-L41) in the component's state.
    2.  [Initialize](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L63-L64) it in the constructor.
    3.  Add [a tuple](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L22-L25).
    4.  Add a method to [lazily instantiate it](https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L122-L145).

2. Change the declaration of `makeMove` to make it `async`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L202]
    public async makeMove(): Promise<void>
    ```

3. In `makeMove` make sure that the move is likely to be accepted immediately after the existing code that extracts the move. It uses the read-only `StargateClient`, which allows players to look around without being asked to disclose their address:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L211-L223]
    const positions: Position[] = keys.map((k: string): Position => k.split(",").map(Number) as Position)

    const client = await this.getStargateClient()
    const canPlayOrNot = await client.canPlayGuiMove(
        this.props.index,
        this.state.board.current_player,
        positions,
    )
    if (!canPlayOrNot.possible) {
        const error = `Cannot make this move ${canPlayOrNot.reason}`
        alert(error)
        throw new Error(error)
    }
    ```

4. With this partial assurance, you can make an actual move:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L225-L231]
    const { creator, signingClient } = await this.getSigningStargateClient()
    try {
        await signingClient.playGuiMoves(creator, this.props.index, positions)
    } catch (e) {
        console.error(e)
        alert("Failed to play: " + e)
    }
    ```

    <HighlightBox type="note">

    The assurance is **partial** because what was tested with `canPlayGuiMove` is whether a player of a certain color can make a move or not. When making the move, it takes the Keplr address without cross-checking whether this is indeed the address of the colored player that tested a move. This **could be improved** either at the cost of another call to get the game, or better by adding the black and red addresses in the component's status.

    </HighlightBox>

    The remaining code of the `makeMove` method can be deleted.

5. Finish with a reload of the game to show its new state:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/gui/src/components/Game/GameContainer.tsx#L233-L235]
    const selected = Object.create(null)
    this.setState({ selected })
    return this.loadGame();
    ```

    <HighlightBox type="tip">

    There is a potentially hard-to-reproduce-in-production **race condition** bug here. The `loadGame` is done immediately after the transaction has completed. However, depending on the implementation of the RPC end point, the `playGuiMoves` and `loadGame` calls may hit two different servers on the backend. In some instances, the server that answers your `loadGame` may not have fully updated its store and may in fact serve you the **old** version of your game.
    <br/><br/>
    As your GUI matures, you may want to show the _expected_ state of the game before you eventually show its _finalized_ state. Sometimes you may want to show the expected state of the game even before the transaction has completed, and add visual cues hinting at the fact that it is a **provisional** state.
    <br/><br/>
    The same can happen when creating a game, where the second server may return `null` if it has not been updated yet.

    </HighlightBox>

Now you can play test in the GUI. Make sure to put your Keplr address as the black player, so that you start with this one. You will need a second account on Keplr with which to play red, otherwise you must play red from the command line. Alternatively, put the same Keplr address for both black and red.

Either way, it is now possible to play the game from the GUI. Congratulations!

## Further exercise ideas

* Use the <kbd>Quit Game</kbd> button to handle a reject.
* Add pagination to the game list.
* Implement typical GUI features, like disabling buttons when their action should be unavailable, or adding a countdown to the forfeit deadline.
* Implement a Web socket to listen to changes. That would be useful when there are two players who cannot communicate otherwise (instead of polling).

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to prepare for and then integrate CosmJS and Keplr into the GUI of your checkers blockchain, including how to adjust the React app to be able to package CosmJS.
* How to integrate CosmJS, including working with the GUI's data structures, fetching games from the blockchain and displaying them, integrating with Keplr for browser-based players, creating a new game, and fetching a single game to be played.

</HighlightBox>

<!--## Next up

In the [next section](./5-server-side.md), explore how server-side scripts can help you improve the user experience of your application.-->
