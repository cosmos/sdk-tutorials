---
title: CosmJs - Plug in your GUI
order: 25
description: Take a Checkers GUI and use your elements
tag: deep-dive
---

# CosmJs - Plug in your GUI

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [CosmJs](TODO).
* The checkers blockchain codebase up to the external GUI. You can get there by following the [previous steps](./external-gui.md) or checking out the [relevant version](https://github.com/cosmos/academy-checkers-ui/tree/unwired-gui).

</HighlightBox>

In the previous sections:

1. You created the objects, messages and clients that **allow** you to **interface** any GUI with your Checkers blockchain.
2. You imported an external Checkers **GUI** to use.

Now, you **integrate the two** together. The actions that you need to take:

* Adjust the React app to be able to package CosmJs.
* Work on the CosmJs integration.

For the CosmJs integration, you will:

* Work with the GUI's data structures.
* Fetch all games from the blockchain and display them, without pagination to keep it simple.
* Integrate with Keplr for browser-based players.
* Create a new game.
* Fetch a single game to be played.

Rejecting a game will be left to you as an exercise.

## Prepare the integration with the Checkers blockchain

### Prepare Webpack

Your GUI uses React v18, which uses Weback v5. Therefore, as the CosmJs documentation explains, you need to [adjust Webpack's configuration](https://github.com/cosmos/cosmjs/blob/5fc0960/README.md#webpack-configs) to handle some elements. To modify the Webpack configuration in a non-ejected React app, you can use [`react-app-rewired`](https://www.npmjs.com/package/react-app-rewired) as [explained here](https://stackoverflow.com/questions/63280109/how-to-update-webpack-config-for-a-react-project-created-using-create-react-app):

1. Install the new package:

    ```sh
    $ npm install react-app-rewired@2.2.1 --save-dev --save-exact
    ```

2. Add a new `config-overrides.js` with:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/config-overrides.js#L1-L20]
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

    Note how you can take this opportunity to also pass along the `RPC_URL` as an environment variable.

3. Change the run targets to use `react-app-rewired` in `package.json`:

    ```json [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/package.json#L8-L11]
    {
        ...
        "scripts": {
            "start": "react-app-rewired start",
            "build": "react-app-rewired build",
            "test": "react-app-rewired test",
            "eject": "react-scripts eject"
        },
        ...
    }
    ```

    Be careful to leave the `"eject"` unchanged.

See a [previous section](./cosmjs-objects.md) for how set `RPC_URL` in `process.env.RPC_URL`. It also assumes that, at this point, you have an RPC end point that runs the Checkers blockchain, as explained in the previous section.

### GUI data structures

The Checkers GUI uses different data structures, you need to understand them so as to convert them correctly.

1. The `IPlayerInfo` has a [`name: string`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/sharedTypes.ts#L27) field. At first glance, it appears you can readily use it as the player's address.
2. The `IGameInfo` has a [`board: number[][] | null`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/sharedTypes.ts#L11) field. So you have to do a conversion from `b*b*...` into this type. The catch is to make sure that the alignments are correct.
3. The `IGameInfo` has a [`turn: number`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/sharedTypes.ts#L17), which will readily map to `"b"` or `"r"`.
4. The `IGameInfo` lacks an `index` or `id` field. Instead the GUI developer identified games by their index in an array. This is not good enough for your case. You need to add an `index` field to `IGameInfo`. The field is saved as a `string` in the blockchain, but you know that it is a number anyway, and the GUI code happens to expect a number as game index. So add:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/sharedTypes.ts#L18]
    export interface IGameInfo {
        ...
        index: number
    }
    ```

    If you do not want to get compilation errors on `index:` elsewhere, just add `index?: number` for now, but remember to come back to it and remove the `?`.

### Board converter

In order to correctly convert a _blockchain_ board into a _GUI_ board, you want to see how a GUI board is coded. In `components/Game/Board/Board.tsx`, add a [`console.log(props.squares)`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/Board/Board.tsx#L18). Let React recompile, open the browser console, and create a game. You should see printed:

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

The conversion looks straightforward. Create a new file `src/types/checkers/board.ts`, and in it you can code:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/board.ts#L5-L18]
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

Then you can convert a `StoredGame` into the `IGameInfo` of the GUI:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/board.ts#L20-L43]
export function storedToGameInfo(game: StoredGame): IGameInfo {
    return {
        board: serializedToBoard(game.game),
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

Note in the above:

* You use Cosmos addresses instead of names.
* You put today in the creation date because it is not stored in `StoredGame`.
* You set the `last` played date to deadline minus expiry duration. Not ideal but it does the job.
* You do not care about the possibility of "AI".

<HighlightBox type="info">

Could an AI player and the blockchain mix together? As long as _the AI_ has access to a private key that lets it send transactions, it would be a bona fide player. The way this could be implemented is with backend scripts running on a server. See [Checkers backend scripts](./server-side.md) for an example of backend scripts with a different purpose.

</HighlightBox>

## Obtain a client

For your React components to communicate with the blockchain they need to have access to a `StargateClient`, and at some point to a `SigningStargateClient` too. Among the information they need is the RPC URL.

### Pass RPC parameters

The RPC URL is already saved into `process.env.RPC_URL` thanks to `react-app-rewired`. However, as a general design consideration, it is better to reduce your components' reliance on `process.env`. The next simplest way to give the RPC URL to the components is for them to:

* Receive an `rpcUrl: string` in the properties.
* Keep a `StargateClient` in the component's state that would be instantiated lazily.

With this setup, only `index.tsx` would use `process.env.RPC_URL`.

For instance, prepare access to `rpcUrl` for `MenuContainer.tsx` by:

1. Adding `rpcUrl` to the properties of `src/components/Menu/MenuContainer.tsx`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/MenuContainer.tsx#L14]
    export interface IMenuContainerProps {
        ...
        rpcUrl: string
    }
    ```

2. Adding it to the properties of the component call stack, first in `src/components/App.tsx`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/App.tsx#L38-L49]
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

    Note how you have to create the _missing_ `AppProps` entirely.

3. Finally in `src/index.tsx`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/index.tsx#L21]
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <App rpcUrl={process.env.RPC_URL!} />
            </BrowserRouter>
        </React.StrictMode>,
    )
    ```

    Note the `!` so as to force the type of `.RPC_URL` from `string | undefined` to `string`.

Whenever another component needs the `rpcUrl`, you can adapt and reproduce these steps as necessary.

### Create the `StargateClient`

Whenever you need a `StargateClient` in a component, you can repeat the following chain of actions for the component in question. For instance, prepare the client in the state of `src/components/Menu/MenuContainer.tsx` by:

1. Adding the field in the state:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/MenuContainer.tsx#L20]
    interface IMenuContainerState {
        ...
        client: CheckersStargateClient | undefined
    }
    ```

2. Initializing it to `undefined` in the constructor:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/MenuContainer.tsx#L30]
constructor(props: IMenuContainerProps) {
    ...
    this.state = {
        ...
        client: undefined,
    };
    ...
}
```

3. Adding a method that implements the conditional instantiation:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/MenuContainer.tsx#L46-L51]
    protected async getStargateClient(): Promise<CheckersStargateClient> {
       const client: CheckersStargateClient =
           this.state.client ?? (await CheckersStargateClient.connect(this.props.rpcUrl))
       if (!this.state.client) this.setState({ client: client })
       return client
   }
    ```

    Note that it creates it only once by saving the client in the state.

Instantiating a `CheckersSigningStargateClient` is a bit more involved as you will see later on.

First, make use of what you already prepared. Why choose to start with `MenuContainer`? Because that is where all the games are listed.

## Show all games

To show all games, you only need the read-only `StargateClient`. That is convenient as there is no need to worry about private keys, for now. Where do you query for the games?

### All games container

Look into `src/components/Menu/MenuContainer.tsx`'s `componentDidMount` method. It is accessing the browser storage for saved games. You can replace the storage logic with:

* Obtain a `StargateClient` with the `getStargateClient` method.
* Obtain the blockchain games. Without pagination to keep it simple.
* Convert the blockchain games to the format the component expects.
* Save them in `saved: IGameInfo[]` of the component's state.

Your first thought may be to add a new function to `CheckersStargateClient` to handle the call and the conversion, or to add a helper function that takes a client as a parameter.

### A specific GUI method

However, in the future you may want to reuse the `CheckersStargateClient` code in another GUI or for backend scripts. So, to avoid polluting the code, and to avoid a helper where you need to pass a Stargate client as parameter, you can add [an extension method](https://www.c-sharpcorner.com/article/learn-about-extension-methods-in-typescript/#:~:text=Extension%2Dmethod%20gives%20you%20the,any%20data%2Dtype%20you%20want) to `CheckersStargateClient`.

In a new `src/types/checkers/extensions-gui.ts`:

1. You declare the new extension method to your `CheckersStargateClient` _module_:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/extensions-gui.ts#L10-L12]
    declare module "../../checkers_stargateclient" {
        interface CheckersStargateClient {
            getGuiGames(): Promise<IGameInfo[]>
        }
    }
    ```

2. You add its implementation:

    ```typecript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/extensions-gui.ts#L29-L38]
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

    Note how it does not care about pagination or games beyond the first 20 ones. This purely-GUI detail is left as an exercise.

### All games call

Now, back in `MenuContainer.tsx`, you:

1. Add an empty `import` for the extension method file, otherwise the method is not compiled in:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/MenuContainer.tsx#L4]
    import {} from "../../types/checkers/gui-extensions"
    ```

2. Change `componentDidMount` to `async` and replace the storage code with a call to the new method:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/MenuContainer.tsx#L37-L45]
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

Restart `npm start` and you should see... an empty list of games, unless you have previously created any. To test this new functionality, and if you have access to any way of creating a game, for instance with the `checkersd` command line, go ahead and create one:

![List of one game](/list-games-1.png)

If you do not have a way to create a game, wait for the paragraphs about creating a game.

### Individual game menu container

Each game is now listed as a [`src/components/Menu/MenuItem.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/MenuItem.tsx). However, notice how, in `src/components/Menu/Menu.tsx`, the `index` of the game is taken from its _index_ in the games array. This is not what you want here. It needs to use the proper `index` of the game. In `Menu.tsx` make the change:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/Menu.tsx#L21-L23]
const Menu = (props: IMenuProps) => {
    const menuItems = props.games.map((game, index) => (
      <MenuItem ... index={game.index} key={"game" + game.index} />
    ))
    ...
}
```

Or temporarily add `!`, as in `game.index!`, if you previously added the `IGameInfo.index` as `index?: number`.

## Show one game

What happens when you click on a game's <kbd>Resume Game</kbd>? It opens a page of the form `http://localhost:3000/play/1`. The component is `src/components/Game/GameContainer.tsx`. It is in this component that you have to pick the game information from the blockchain. To get started with it, as with the `MenuContainer`:

* You pass a [`rpcUrl`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L24) along the chain to [`GameContainerWrapper`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/App.tsx#L50) then the [`GameContainer`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/App.tsx#L21-L27).
* You add a [`client: CheckersStargateClient | undefined`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L38) state field, [initialize it](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L61), and add a [lazy instantiation method](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L115-L120).

Looking into `GameContainer`, you see that `componentDidMount` gets all the games from storage then sets the state with the information. Instead, as you did for all games, you have to take the game from the blockchain.

1. In `extensions-gui.tsx`, declare another extension method to `CheckersStargateClient` dedicated to getting the game as expected by the GUI:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/extensions-gui.ts#L13]
    declare module "../../checkers_stargateclient" {
        interface CheckersStargateClient {
            ...
            getGuiGame(index: string): Promise<IGameInfo | undefined>
        }
    }
    ```

    And define it:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/extensions-gui.ts#L40-L44]
    CheckersStargateClient.prototype.getGuiGame = async function (index: string): Promise<IGameInfo | undefined> {
        const storedGame: StoredGame | undefined = await this.checkersQueryClient!.checkers.getStoredGame(index)
        if (!storedGame) return undefined
        return storedToGameInfo(storedGame)
    }
    ```

2. Back in `GameContainer.tsx`, add an empty import to the extension methods:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L6]
    import {} from "../../types/checkers/extensions-gui"
    ```

3. Make the `componentDidMount` method `async`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L72]
    public async componentDidMount(): Promise<void>
    ```

4. Split the `componentDidMount` method and take the game loading lines out into its own `loadGame` function:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L76-L79]
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

5. In `loadGame`, replace the storage actions with a fetch from the blockchain:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L80-L86]
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

4. Adjust the `setState` call so that `isSaved` is always `true`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L90]
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

    Note how:

    * You force `isSaved` to `true` since it is indeed always saved in the blockchain.
    * You do not care about saving `game.index` to state because it is actually passed in `IGameContainerProps.index`.
    * By having a separate `loadGame`, you can call it again if you know the game has changed.

Restart `npm start` and you should now see your game. If you have access to `checkersd`, or any other way to send a transaction, you can make a move from the command line and refresh to confirm the change. If not, wait for the part about playing.

![Game with one move played](/show-game-1-move.png)

## Integrate with Keplr

So you have _only_ made it possible to show the state of games and of the blockchain. That is good. You should let your users poke around without unnecessarily asking them to connect. However, to create a game, or play in one, you need to make transactions. This is where you need first to make the integration with Keplr possible.

Install the necessary packages:

```sh
$ npm install @keplr-wallet/types@0.10.2 --save-exact --save-dev
```

### Identify the Checkers blockchain

Keplr will need information to identify your Checkers blockchain from the other chains. Prepare your Checkers blockchain info. In a new `src/types/checkers/chain.ts` file, you add:

```typescript [TODO]
import { ChainInfo } from "@keplr-wallet/types"

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

Take note that the `chainId` value has to **match exactly** that returned by `client.getChainId()`, or the transaction signer will balk. If you wonder where such a strange `ChainInfo` object comes from, it is copied from the one you used for Theta in the [first steps with Keplr](./with-keplr.md) section.

### Prepare a signing client

In the same way that your components that need a `CheckersStargateClient` keep one in their state, your components that need a `SigningCheckersStargateClient` will keep one in their state. Some components may have both, it does not matter. The steps to take are the same in each such component.

For instance in `src/components/Menu/NewGameModal/NewGameModal.tsx`:

1. Add an [`rpcUrl: string`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L25) to the props, passed along [`Menu.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/Menu.tsx#L47), which also needs it [as a new prop](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/Menu.tsx#L17), in turn passed from [`MenuContainer.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/MenuContainer.tsx#L81).

2. Add a signing client to the component's state, as well as the potential address of the Keplr user:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L29-L30]
    interface INewGameModalState {
        ...
        creator: string;
        signingClient: CheckersSigningStargateClient | undefined;
    }
    ```

    Do not forget to initialize them to nothing in the constructor:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L49-L50]
    this.state = {
        ...
        creator: "",
        signingClient: undefined,
    };
    ```

    The reason why you also save the address of Keplr is because it is accessible from the `OfflineSigner` but not from the `SigningStargateClient`.

3. Add a tuple type to return both of them:

    ```typecript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L17-L20]
    interface CreatorInfo {
        creator: string;
        signingClient: CheckersSigningStargateClient;
    }
    ```

    The reason you do this is that the `setState` function does not ensure the state is updated right after it has been called, so the lazy instantiation method has to return both.

4. Inform Typescript of the _Keplr `window`_ object:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L5-L15]
    import { Window as KeplrWindow } from "@keplr-wallet/types"

    declare global {
        interface Window extends KeplrWindow {}
    }
    ```

5. Add a function that obtains the signing client and signer's address, a.k.a. future transaction `creator`, by setting up Keplr and connecting to it:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L60-L83]
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

    Remember that setting up Keplr is idempotent so doing all these operations more than once is harmless. You may want to separate these actions into more chiseled methods at a later optimization stage.

    Note too how a default gas price is passed in, so that you can use `"auto"` when sending a transaction.

With all these steps, your component is ready to send transactions to the blockchain. Why choose `NewGameModal.tsx` as the example? Because this is where a new game is created.

## Create a new game

This modal window pops up when you click on <kbd>New Game</kbd>:

![Modal window to create game](/window-create-game.png)

The player names look ready-made to take the player's Cosmos addresses.

Look around the code and you see that the action takes place in `src/components/Menu/NewGameModal/NewGameModal.tsx`. So it is here that you are going to work. Thanks to the previous preparation with `CheckersSigningStargateClient`, it is ready to send transactions.

1. In `extensions-gui.ts`, declare an extension method to your `CheckersSigningStargateClient` that encapsulates knowledge about how to get the newly created game index out of the events:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/extensions-gui.ts#L22-L24]
    declare module "../../checkers_signingstargateclient" {
        interface CheckersSigningStargateClient {
            createGuiGame(creator: string, black: string, red: string): Promise<string>
        }
    }
    ```

    And define it:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/extensions-gui.ts#L60-L66]
    CheckersSigningStargateClient.prototype.createGuiGame = async function (
        creator: string,
        black: string,
        red: string,
    ): Promise<string> {
        return getCreatedGameId(await this.createGame(creator, black, red, "stake", Long.ZERO, "auto"), 0)
    }
    ```

    Note how:

    * For the sake of simplicity, a possible wager is completely omitted.
    * The `getCreatedGameId` is defined in a [previous section](./cosmjs-messages.md).

2. In `NewGameModal.tsx`, add an empty import of the extension method so that it is compiled in:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L6]
    import {} from "../../../types/checkers/extensions-gui"
    ```

3. Since you are going to paste addresses into the name field, make sure that the GUI does not truncate them. In `src/components/Menu/NewGameModal/PlayerNameInput.tsx`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/PlayerNameInput.tsx#L34]
    ...
    maxLength={45}
    ```

4. Back in `NewGameModal.tsx`, change the declaration of `handleSubmit`, and make it `async`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L127]
    private async handleSubmit(event: any): Promise<void>
    ```

5. In `handleSubmit`, do the necessary instead of saving to local storage:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L155-L156]
    const { creator, signingClient } = await this.getSigningStargateClient()
    const index: string = await signingClient.createGuiGame(creator, p1Name, p2Name)
    ```

6. And finish off by sending the player directly to the newly created game:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L157-L158]
    this.props.close()
    window.location.replace(`/play/${index}`)
    ```

7. In `render()`, don't forget to change the React link around the `Button` into a regular `div` so that your window redirection appears smooth:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Menu/NewGameModal/NewGameModal.tsx#L114-L118]
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

And there you have it. You just added game creation to your GUI.

If you do not yet know your Keplr address on the Checkers network, you will have to test in two passes. To test properly, you need to:

1. Run the initialization code by pretending to create a game. This makes Keplr prompt you to accept adding the `checkers` network and accessing your account. Accept both but reject, or not, the prompt to accept a transaction if your balance is zero.

    ![Checkers prompting to add support for Checkers](/checkers-add-support.png)![Checkers prompting to access account](/checkers-access-address.png)    

2. Select _Checkers_ in Keplr. Make a note of your address, for instance `cosmos17excjd99u45c4fkzljwlx8eqyn5dplcujkwag8`.

    ![Checkers network in beta support list](/list-keplr-beta-support.png)

3. Put enough tokens in your Keplr _Checkers_ account. `"1000000stake"` will do the trick by a 10x margin.

    * If you have access to `checkersd` built by Ignite CLI, you can do that with this command:

        ```sh
        $ export alice=$(checkersd keys show alice -a)
        $ checkersd tx bank send $alice "cosmos17excjd99u45c4fkzljwlx8eqyn5dplcujkwag8" 1000000stake -y
        ```

    * If you do not have access to `checkersd`, look for instructions on how to start your locally-running Checkers or tap the faucet of a public Checkers test net.

4. Start again to create a game, for real this time. Accept the transaction, and a few seconds later, you are redirected to the game page. This time the content of the game was indeed from the blockchain.

Time to play this game.

## Play a game

Back to the `GameContainer.tsx`, you see that there are a `makeMove` and a `saveGame` functions. In a blockchain context, the `saveGame` does not make much sense. Indeed, on each move done with a transaction, the game will be automatically _saved_ in the blockchain.

Observing `makeMove`, add a `console.log` to see in what format it deals:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L210]
const move: Position[] = keys.map((k: string): Position => k.split(",").map(Number) as Position)
console.log(move)
```

Then play a move with the current interface. Say you move your first black piece like so:

![Black moves first piece](/black-moves-first-piece.png)

In the blockchain code, this is a `fromX: 1, fromY: 2, toX: 2, toY: 3`. However, the GUI prints:

```
[ [ 2, 1 ], [ 3, 2 ] ]
```

It is safe to assume that, for each position, X and Y are flipped. No problem, you can encapsulate this knowledge in a helper function:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/board.ts#L45-L47]
export function guiMoveToPos(move: number[]): Pos {
    return { x: move[1], y: move[0] };
}
```

You should start to know the drill. Do some more preparation:

1. In `extensions-gui.ts`, declare an extension method to `CheckersStargateClient` to check whether the move is valid with parameters as they are given in the GUI components:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/board.ts#L45-L47]
    declare module "../../checkers_stargateclient" {
        interface CheckersStargateClient {
            ...
            canPlayGuiMove(
                gameIndex: string,
                playerId: number,
                move: number[][],
            ): Promise<QueryCanPlayMoveResponse>
        }
    }
    ```

    And define it:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/extensions-gui.ts#L46-L58]
    CheckersStargateClient.prototype.canPlayGuiMove = async function (
        gameIndex: string,
        playerId: number,
        move: number[][],
    ): Promise<QueryCanPlayMoveResponse> {
        if (playerId < 1 || 2 < playerId) throw new Error(`Wrong playerId: ${playerId}`)
        return await this.checkersQueryClient!.checkers.canPlayMove(
            gameIndex,
            playerId === 1 ? "b" : "r",
            guiMoveToPos(move[0]),
            guiMoveToPos(move[1]),
        )
    }
    ```

2. Declare another extension method, this time for `CheckersSigningStargateClient` to actually make the move with parameters as they are given in the GUI components:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/extensions-gui.ts#L25]
    declare module "../../checkers_signingstargateclient" {
        interface CheckersSigningStargateClient {
            ...
            playGuiMove(creator: string, gameIndex: string, move: number[][]): Promise<void>
        }
    }
    ```

    And define it:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/types/checkers/extensions-gui.ts#L68-L74]
    CheckersSigningStargateClient.prototype.playGuiMove = async function (
        creator: string,
        gameIndex: string,
        move: number[][],
    ): Promise<void> {
        await this.playMove(creator, gameIndex, guiMoveToPos(move[0]), guiMoveToPos(move[1]), "auto")
    }
    ```

With this done:

1. Repeat in `GameContainer` what you did in `NewGameModal` by keeping a [signing client and `creator`](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L39-L40) in the component's state, [initializing](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L62-L63) it in the constructor, adding [a tuple](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L16-L19), and adding a method to [lazily instantiate it](https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L121-L144):

2. Change the declaration of `makeMove` to make it `async`:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L201]
    public async makeMove(): Promise<void>
    ```

3. Then  in `makeMove`, make sure that the move is likely to be accepted, right after the existing code that extracts the move. It uses the read-only `StargateClient`, which is good, because like this players can look around as long as they can without being asked to disclose their address:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L210-L222]
    const move: Position[] = keys.map((k: string): Position => k.split(",").map(Number) as Position)

    const client = await this.getStargateClient()
    const canPlayOrNot = await client.canPlayGuiMove(
        this.props.index,
        this.state.board.current_player,
        move,
    )
    if (!canPlayOrNot.possible) {
        const error = `Cannot make this move ${canPlayOrNot.reason}`
        alert(error)
        throw new Error(error)
    }
    ```

4. With this partial assurance, you can make the move for real:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L224-L230]
    const { creator, signingClient } = await this.getSigningStargateClient()
    try {
        await signingClient.playGuiMove(creator, this.props.index, move)
    } catch (e) {
        console.error(e)
        alert("Failed to play: " + e)
    }
    ```

    The assurance is **partial** because what was tested with `canPlayGuiMove` is whether a player of a certain color can make a move or not. Then at the time of making the move, it takes the Keplr address, without cross-checking whether this is indeed the address of the colored player that tested a move. This **could be improved** either at the cost of another call to get the game, or better, by adding the black and red addresses in the component's status.

    You can delete the remaining code of the `makeMove` method.

5. And finish with a reload of the game, in order to show its new state:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/f6a96b7/src/components/Game/GameContainer.tsx#L231-L233]
    const selected = Object.create(null)
    this.setState({ selected })
    return this.loadGame();
    ```

    <HighlightBox type="tip">

    There is a potentially hard-to-reproduce-in-production **race condition** bug here. The `loadGame` is done right after the transaction has completed. However, depending on the implementation of the RPC end point, your `playGuiMove` and your `loadGame` calls may be hitting two different servers on the backend. In some instances, the server that answers your `loadGame` may not have fully updated its store and may in fact serve you the **old** version of your game.

    So, as your GUI matures, you may want to show the _expected_ state of the game, before you eventually show its _finalized_ state. Sometimes you may want to show the expected state of the game even before the transaction has completed, and add visual cues hinting at the fact it is a **provisional** state.

    The same can happen when creating the game, where the second server may return `null` if it has not been updated yet.

    </HighlightBox>

Now you can try yourself in the GUI. Of course, make sure you put your Keplr address as the black player, so that you start with this one. Then either you have a second account on Keplr with which to play red, or you play red from the command line.

Either way, you have now made it possible to play the game from the GUI. Congratulations.

## Further exercise ideas

* You can use the <kbd>Quit Game</kbd> button to handle a reject for instance.
* Add pagination to the game list.
* All the usual GUI bells and whistles where, for instance, buttons are disabled when you ought not to be able to do the action, or a countdown to the forfeit deadline.
* Implement a Web socket to listen to changes. That would be useful, instead of polling, when there are two players who cannot communicate otherwise.
* You will notice that, when a double (or more) capture is possible, the GUI allows you to make the multiple move in one fell swoop, i.e. with `move.length >= 2`. However as it is coded, the code handles only a single hop, i.e. `move[0]` and `move[1]`. It is however technically possible to pack more than one `PlayMove` message in a single transaction, thereby saving the player the hassle of sending multiple transactions.
