---
title: CosmJs - Plug in your GUI
order: 25
description: Take a Checkers GUI and use your elements
tag: deep-dive
---

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [CosmJs](TODO).
* Have Go installed.
* The checkers blockchain codebase up to the CosmJs objects. You can get there by following the [previous steps](./cosmjs-objects.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/cosmjs-elements).

</HighlightBox>

In the previous sections, you created the objects, messages and clients that allow you to interface with your Checkers blockchain. Now, you use them in an existing Checkers GUI.

# CosmJs - Plug in your GUI

The point of this exercise is not to create a GUI for the game of checkers. Instead it is to show how to prepare a GUI for use with the checkers blockchain. So pick a checkers GUI you like. [This one](https://github.com/nablsi14/react-checkers) is a good choice. It has not been updated in quite some time, so to avoid any version incompatibilities, you are going to:

* Reuse its components instead.
* Reuse them in a brand new React app.

The actions that you need to take:

* Create a brand new React app.
* Take the existing GUI.
* Fix errors related to versions package.
* Adjust the React app to be able to package CosmJs.
* Work on the CosmJs integration.

For the CosmJs integration, you will:

* Fetch all games from the blockchain and display them., without pagination to keep it simple.
* Fetch a single game to be played.
* Integrate with Keplr for browser-based players.
* Create a new game and display it.

Rejecting a game will be left to you.

## Prepare the folders

### Get the external GUI files

Download it as a separate project in a folder:

```sh
$ curl -L https://github.com/nablsi14/react-checkers/archive/refs/heads/master.zip -o gui.zip
$ unzip gui.zip
$ rm gui.zip
```

It creates a subfolder named `react-checkers-master` with the GUI. It would be good to have a feel for this GUI before you use its parts. Install the GUI elements:

```sh
$ cd react-checkers-master
$ npm install
```

Make sure it works:

```sh
$ npm start
```

If it does not do it for you, open your browser at `http://localhost:3000`. The obvious first action to do is to list existing games in the place of "You have no saved games". Before that, take account of the data structure.

Because this GUI project was created separately, you will simply copy the necessary Cosmos files into it:

```sh
$ mkdir src/cosmos
$ cp -R ../client/src/* ./src/cosmos
```

And add the necessary modules:

```sh
$ npm install @cosmjs/stargate@0.28.0 @cosmjs/utils@0.28.0 --save
```

### Create a new React app

This is straightforward. Back in your root folder, run:

```sh
$ npx clear-npx-cache
$ npx create-react-app checkers-gui --template typescript
```

If it complains that some packages failed to install, add them with an `npm install` as suggested. If it complains about some incompatibilities with React 18, follow [this](https://stackoverflow.com/questions/71835697/create-react-app-dependency-version-issues-with-react-18). And [this](https://github.com/facebook/create-react-app/issues/8717).
Add an empty `tsconfig.json`.
`npm install --save-dev @testing-library/react@12.1.5`


Test this one too:

```sh
$ cd gui
$ npm start
$ npm install --save typescript @types/node @types/react @types/react-dom @types/jest
```

You should see a simple page.

### Your CosmJs elements

Install the necessary packages:

```sh
$ npm install @cosmjs/stargate@0.28.0 @cosmjs/utils@0.28.0 @cosmjs/crypto@0.28.0 @cosmjs/proto-signing@0.28.0 --save-exact
```

Copy and paste your existing CosmJs elements to the `src` folder. If it complains at compilation, in `tsconfig.json`:

* Add `"downlevelIteration": true` in `compilerOptions`.
* Remove `"dom.iterable"` from `compilerOptions.lib`.

### The GUI components

Add from `react-checkers/src`:

* `sharedTypes.ts`, `registerServiceWorker.ts`.
* The `util` and `images` folders.
* The `components` folder.
* The `images.d.ts` and `json.d.ts` files.
* Replace the `index.tsx`

To get through all the compilation errors:

```sh
$ npm install bootstrap@5.1.3 react-loadable@5.5.0 react-router-dom@4.2.2 reactstrap@8.10.1 lockr@0.8.5 react-icons@4.3.1 query-string@7.1.1 --save-exact
$ npm install @types/react-loadable@5.5.6 @types/react-router-dom@4.2.6 @types/reactstrap@8.7.2 @types/lockr@0.8.8 @types/react-icons@3.0.0 @types/query-string@6.3.0 --save-exact --save-dev
```

1. In `Menu.tsx`, `MenuItemButtons.tsx`, `HowToPlay.tsx`, `BoardMenu.tsx` update:

    ```typescript
    // From
    import * as FontAwesome from "react-icons/lib/fa";
    // To
    import * as FontAwesome from "react-icons/fa";
    ```

2. In `HowToPlay.tsx`, replace `FaLongArrowLeft` with `FaLongArrowAltLeft`.
3. In `BoardMenu.tsx`, replace `FaFloppyO` with `FaSave`.

Fix a Typescript compilation error in `Section.tsx`:

1. Replace:

    ```typescript
    const TitleTag = `h${
        props.level < 6 ? (props.level > 0 ? props.level : 1) : 6
    }`;
    ```

2. With:

    ```typescript
    const tags: ("h1" | "h2" | "h3" | "h4" | "h5" | "h6")[] = [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
    ];
    const level = props.level < 6 ? (props.level > 0 ? props.level : 1) : 6;
    const TitleTag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = tags[level];
    ```

Fix a compilation error in `GameContainer.tsx`:

1. Replace `match: match<{ index: number }>;` with `match: match<{ index: string }>;`.
2. Line 71, replace `let index: number = this.props.match.params.index;` with `let index: number = parseInt(this.props.match.params.index);`.

### Webpack

Following [this solution](https://stackoverflow.com/questions/63280109/how-to-update-webpack-config-for-a-react-project-created-using-create-react-app) applied with [this info](https://github.com/cosmos/cosmjs/blob/5fc096089a98af40dd8adca6d6ca8adbbae8933e/README.md#webpack-configs).

```sh
$ npm install react-app-rewired@2.2.1 --save-dev --save-exact
```

And in `config-overrides.js`:

```javascript
const webpack = require("webpack")

module.exports = function override(config, env) {
    config.plugins.push(new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
    }),)
    config.resolve.fallback = {
        buffer: false,
        crypto: false,
        events: false,
        path: false,
        stream: false,
        string_decoder: false,
    }
    // New config, e.g. config.plugins.push...
    return config
}
```

### Compilation error

If it complains on `BrowserRouter` about `No overload matches this call... Type '{ children: Element; }' has no properties in common`, then apply [this fix](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56210) by adding `children?: React.ReactNode` to `export interface BrowserRouterProps` deep inside `node_modules/@types/react-router-dom/index.d.ts`.

### Cleanup

The existing GUI code took some shortcuts. To facilitate writing further code, you close these shortcuts.

Make an explicit `IMenuContainerProps`:

```typescript
export interface IMenuContainerProps {
    location?: any;
}
export default class MenuContainer extends Component<
    IMenuContainerProps,
    IMenuContainerState
> {
    constructor(props: IMenuContainerProps)...
}
```

An explicit `INewGameModalState`:

```typescript
interface INewGameModalState {
    showAlert: boolean;
}

export default class NewGameModal extends Component<
    INewGameModalProps,
    INewGameModalState
> {}
```

## Data structures

The Checkers GUI uses different data structures, you need to understand them so as to do conversions.

1. The `IPlayerInfo` has a `name: string` field. You can readily use it as the player's address.
2. The `IGameInfo` has a ` board: number[][] | null` field. So you have to do a conversion from `b*b*...` into this type. The catch is to make sure that the alignments are correct.
3. The `IGameInfo` has a `turn: number`, which will readily map to `"b"` or `"r"`.
4. The `IGameInfo` lacks an `index` or `id` field. Instead the GUI developer relied on an index in an array. This is not good enough for this case. You need to add an `index` field. The field is saved as a `string` in the blockchain, but you know that it is a number anyway, and the GUI code happens to expect a number as game index. So add `index: number`.

### Board converter

You want to see how a board is coded. First, you need to allow `console.log`. In `tslint.json`, add:

```json
{
    ...,
    "rules": {
        "no-console": false
    }
}
```

Then, in `components/Games/Board/Board.tsx`, add a `console.log(props.squares)`. Let React recompile, open the browser console, and create a game. You should see printed:

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

It looks straightforward. Create a new file `boards.ts`, and in it you can code:

```typescript
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

Then you can convert a `StoredGame` into the `IGameInfo` of the GUI:

```typescript
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

If you get compilation errors on `index:` elsewhere, just add `index: 99999` for now.

## Obtain a client

For your component to get a `StargateClient`, it first needs to know about its RPC URL.

### Pass RPC parameters

Your individual components will need access to a `StargateClient`. The simplest way to achieve this is, for each component, to:

* Receive an `rpcUrl: string` in the properties.
* Keep a `StargateClient` in the component's state.

Prepare the `rpcUrl` property for `MenuContainer` by adding it to the properties of:

1. `src/components/Menu/MenuContainer.tsx`:

    ```typescript
    export interface IMenuContainerProps {
        ...
        rpcUrl: string;
    }
    ```

2. `src/components/Routes.tsx`:

    ```typescript
    export interface RoutesProps {
        rpcUrl: string;
    }
    const Routes = ({ rpcUrl }: RoutesProps) => (
        <Switch>
            <Route
                path="/menu"
                exact={true}
                render={(props: RouteProps) => (
                    <MenuContainer rpcUrl={rpcUrl} location={props.location} />
                )}
            />
            ...
        </Switch>
    );
    ```

    Where in fact you have to create this new `RoutesProps` entirely.

3. `src/components/App.tsx`:

    ```typescript
    export interface AppProps {
        rpcUrl: string;
    }

    const App: React.FunctionComponent<AppProps> = ({ rpcUrl }: AppProps) => (
        <BrowserRouter>
            <Container style={styles}>
                <div className="well">
                    <div style={titleStyles}>Checkers</div>
                    <Routes rpcUrl={rpcUrl} />
                </div>
                ...
            </Container>
        </BrowserRouter>
    );
    ```

    Here too you have to create this new `AppProps` entirely.

4. Put the RPC url in the `process.env` environment configuration with the help of `dotenv`:

    ```sh
    $ npm install dotenv@16.0.0 --save-exact
    ```

    Create a `.env` file in the project's root folder with:

    ```
    RPC_URL="http://localhost:26657"
    ```

    Or whichever address you have for your blockchain. Tell Webpack to load it in `config-overrides.js`:

    ```typescript

    config.plugins.push(
        ...,
        new webpack.EnvironmentPlugin(["RPC_URL"])
    )
    ```

5. Finally in `index.tsx`:

    ```typescript
    ReactDOM.render(
        <App rpcUrl={process.env.RPC_URL!} />,
        ...
    );
    ```

### Create the `StargateClient`

Whenever you want a `StargateClient` in a component, you can repeat this chain of actions for the component in question. For instance, prepare the client in the state of `MenuContainer` by:

1. Adding the field in the state:

    ```typescript
    interface IMenuContainerState {
        ...
        client: CheckersStargateClient | undefined;
    }
    ```

2. Initialize it to `undefined` in the constructor:

```typescript
constructor(props: IMenuContainerProps) {
    ...
    this.state = {
        ...
        client: undefined,
    };
    ...
}
```

3. Add a method that abstracts away the instantiation:

    ```typescript
    protected async getStargateClient(): Promise<CheckersStargateClient> {
        const client: CheckersStargateClient =
            this.state.client ??
            (await CheckersStargateClient.connect(this.props.rpcUrl));
        if (!this.state.client) this.setState({ client: client });
        return client;
    }
    ```

    Note that it creates it only once by saving the client in the state.

Why choose to start with `MenuContainer`? Because that is where you list all the games.

## Show all games

To show all games, you only need the read-only `StargateClient`. That's convenient as there is no need to worry about private keys, for now. Where do you query for the games?

### All games container

Look into `/components/Menu/MenuContainer.tsx`'s `componentDidMount` method. It is accessing the browser storage for saved games. You can replace the logic with:

* Obtain a `StargateClient` with the `getStargateClient` method.
* Obtain the games. Without pagination to keep it simple.
* Convert the games.
* Save them in `saved: IGameInfo[]` of the component's state.

It is reasonable to add a function for that in your `CheckersStargateClient`:

```typescript
public async getGuiGames(): Promise<IGameInfo[]> {
    return (
        await this.checkersQueryClient!.checkers.getAllStoredGames(
            Uint8Array.from([]),
            Long.ZERO,
            Long.fromNumber(20),
            true
        )
    ).storedGames.map(storedToGameInfo);
}
```

Now, back in `MenuContainer.tsx`, you:

1. Add a game-load function:

    ```typescript
    private async loadAllGames(): Promise<void> {
        this.setState({
            saved: await (await this.getStargateClient()).getGuiGames(),
        });
    }
    ```

2. Call it in an asynchronous way:

    ```typescript
    public componentDidMount(): void {
        this.loadAllGames().catch(console.error);
    }
    ```

Restart `npm start` and you should see... an empty list of games, unless you have created ones. To test this functionality, and if you have access to the `checkersd` command line, you can create a game for testing:

![List of one game](/list-games-1.png)

If not, wait for the paragraphs about creating a game.

### Individual game container

Each game is now listed as a `MenuItem`. However, notice how the `index` of the game is taken from its _index_ in the games array. This is not what you want here. It needs to use the proper `index` of the game. In `Menu.tsx`:

```javascript
const Menu = (props: IMenuProps) => {
    const menuItems = props.games.map((game, index) => (
      <MenuItem
        ...
        index={game.index}
        key={"game" + game.index}
      />
    ));
}
```

## Show one game

What happens when you click on <kbd>Resume Game</kbd>? It opens a page of the form `http://localhost:3000/play/1`. You have to take care of this. As with the `MenuContainer`, you have to pass a `rpcUrl` to `AsyncGameContainer`, which is in fact a `GameContainer`.

Looking into `GameContainer`, you see that `componentDidMount` gets all the games from storage then sets the state with the information. Instead, you have to take the game from the blockchain.

1. To make it easier for you, you can take the part that sets the state into a separate function:

    ```typescript
    private setGame(game: IGameInfo): void {
        this.setState({
            board: new MoveTree(game.board, game.turn, 5),
            created: game.created,
            isSaved: true,
            last: game.last,
            p1: {
                is_ai: game.p1.is_ai,
                name: game.p1.name,
                score: game.p1.score,
            },
            p2: {
                is_ai: game.p2.is_ai,
                name: game.p2.name,
                score: game.p2.score,
            },
        });
    }
    ```

    Note how you force `isSaved` to `true` since it is indeed always saved in the blockchain.

2. Add another dedicated method on `CheckersStargateClient` to get a single game:

    ```typescript
    public async getGuiGame(index: string): Promise<IGameInfo | undefined> {
        const storedGame: StoredGame | undefined =
            await this.checkersQueryClient!.checkers.getStoredGame(index);
        if (!storedGame) return undefined;
        return storedToGameInfo(storedGame);
    }
    ```

3. Then you take care of passing `rpcUrl`, in `Routes.tsx` with a bit of rework:

    ```typescript
    <Route
        path="/play/:index"
        render={(props: RouteComponentProps<{ index: string }>) => (
            <AsyncGameContainer
                rpcUrl={rpcUrl}
                location={props.location}
                match={props.match}
            />
        )}
    />
    ```

4. In `src/components/Game/GameContainer.tsx`, like for `MenuContainer`, you add `rpcUrl: string` to the props, `client: CheckersStargateClient | undefined` to the state, add the same `getStargateClient()` method. Then add a new method to fetch the game and set it into the state:

    ```typescript
    private async loadGame(): Promise<void> {
        const game: IGameInfo | undefined = await (
            await this.getStargateClient()
        ).getGuiGame(this.props.match.params.index);
        if (!game) {
            alert("Game does not exist");
            return;
        }
        this.setGame(game);
    }
    ```


4. Then, you can update `componentDidMount` to remove what you do not need and add:


    ```typescript
    this.loadGame().catch(console.error);
    ```

Restart `npm start` and you should now see your game. If you have access to `checkersd`, you can make a move from the command line and refresh to confirm the change. If not, wait for the part about playing.

![Game with one move played](/show-game-1-move.png)

## Integrate with Keplr

So you have only made it possible to show the state of games and of the blockchain. That is good. You should let your users poke around without asking them to connect unnecessarily. However, to create a game, or play in one, you need to make transactions. This is where you need first to make the integration with Keplr possible.

Install the necessary packages:

```sh
$ npm install @keplr-wallet/types@0.10.1 --save-exact --save-dev
```

Prepare your Checkers blockchain info for Keplr. In a new `src/types/checkers/info.ts` file, you add:

```typescript
export const chainId = "checkers";

export const getCheckersChainInfo = (): ChainInfo => ({
    chainId: chainId,
    chainName: chainId,
    rpc: "http://0.0.0.0:26657",
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
});
```

Take note that the `chainId` value has to match exactly that returned by `client.getChainId()` or the transaction signer will balk. If you wonder where such a strange object comes from, it is copied from the one you used for Theta in the first steps section.

Next, you need to add code in the files that do the actions.

## Create a new game

This modal window pops up when you click on <kbd>New Game</kbd>:

![Modal window to create game](/window-create-game.png)

The player names look ready-made to take the player's Cosmos addresses.

Look around the code and you see that the action takes place in `src/components/Menu/NewGameModal/NewGameModal.tsx`. So it is here that you are going to work.

1. Make sure to pass the `rpcUrl` along the routing chain:

    * In `NewGameModal.tsx`:

        ```typescript
        interface INewGameModalProps {
            ...
            rpcUrl: string;
        }
        ```

    * In `Menu.tsx`:

        ```typescript
        interface IMenuProps {
            ...
            rpcUrl: string;
        }
        ...
        <NewGameModal
            ...
            rpcUrl={props.rpcUrl}
        />
        ```

    * In `MenuContainer.tsx`:

        ```typescript
        <Menu
            ...
            rpcUrl={this.props.rpcUrl}
        />
        ```

2. Add a signing client to the component's state, as well as the potential address of the Keplr user:

    ```typescript
    interface INewGameModalState {
        ...
        creator: string;
        signingClient: CheckersSigningStargateClient | undefined;
    }
    ```

    Do not forget to initialize them to nothing in the constructor:

    ```typescript
    this.state = {
        ...
        creator: "",
        signingClient: undefined,
    };
    ```

3. Add a function that obtains the signing client and signer's address, a.k.a. `creator`, by setting up Keplr and connecting to it:

    ```typescript
    interface CreatorInfo {
        creator: string;
        signingClient: CheckersSigningStargateClient;
    }

    protected async getSigningStargateClient(): Promise<CreatorInfo> {
        if (this.state.creator && this.state.signingClient)
            return {
                creator: this.state.creator,
                signingClient: this.state.signingClient,
            };
        const { keplr } = window;
        if (!keplr) {
            alert("You need to install Keplr");
            throw new Error("You need to install Keplr");
        }
        await keplr.experimentalSuggestChain(getCheckersChainInfo());
        const offlineSigner: OfflineSigner = keplr.getOfflineSigner!(chainId);
        const creator = (await offlineSigner.getAccounts())[0].address;
        const client: CheckersSigningStargateClient =
            await CheckersSigningStargateClient.connectWithSigner(
                this.props.rpcUrl,
                offlineSigner,
                {
                    gasPrice: GasPrice.fromString("1stake"),
                }
            );
        this.setState({ creator: creator, signingClient: client });
        return { creator: creator, signingClient: client };
    }
    ```

    Remember that setting up Keplr is idempotent so doing it more than once is harmless.

4. Add a convenience function in your `CheckersSigningStargateClient` that encapsulates knowledge about how to get the newly created game index out of the events:

    ```typescript
    public async createGuiGame(
        creator: string,
        black: string,
        red: string
    ): Promise<IGameInfo> {
        const response: DeliverTxResponse = await this.createGame(
            creator,
            black,
            red,
            "stake",
            Long.ZERO,
            "auto"
        );
        const gameId: string = JSON.parse(
            response.rawLog!
        )[0].events[0].attributes.find(
            (attribute: any) => attribute.key === "Index"
        ).value;
        return storedToGameInfo(
            (await this.checkersQueryClient!.checkers.getStoredGame(gameId))!
        );
    }
    ```

    Note how for the sake of simplicity, a possible wager is completely omitted.


5. Since you are going to paste addresses into the name field, make sure that the GUI does not truncate them. In `src/components/Menu/NewGameModal/PlayerNameInput.tsx`:

    ```typescript
    ...
    maxLength={45}
    ```

6. Back in `NewGameModal`, change the declaration of `handleSubmit`, and make it `async`:

    ```typescript
    private async handleSubmit(event: any): Promise<void>
    ```

7. In `handleSubmit`, do the necessary in place of saving to local storage:

    ```typescript
    const { client, signingClient } =
        await this.getSigningStargateClient();
    const game: IGameInfo = await signingClient.createGuiGame(
        creator,
        p1Name,
        p2Name
    );
    ```

8. And finish off by sending the player directly to the newly created game:

    ```typescript
    this.props.close();
    window.location.replace("/play/" + game.index);
    ```

9. Don't forget to change the React link around the `Button` into a regular `div` so that your window redirection appears smooth:

    ```typescript
    public render() {
        return (
            ...
            <div
                style={this.linkStyles}
                onClick={this.handleSubmit}
            >
                <Button color="success" size="lg">
                    Play Game!
                </Button>
            </div>
            ...
        )
    }
    ```

And there you have it. You just added a game creation to your GUI.

To test properly, you need to:

1. Run the initialization code by pretending to create a game. This makes Keplr prompt you to accept adding the _Checkers_ network and accessing your account. Accept both but reject the prompt to accept a transaction because at this stage your balance is zero.

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

4. Start again to create a game, for real this time. Accept the transaction, and a few seconds later, you are redirected to the game page.

Time to play this game.

## Play a game

Back to the `GameContainer.tsx`, you see that there are a `makeMove` and a `saveGame` functions. In your blockchain context, the `saveGame` does not make much sense. Instead, on each move done with a transaction, the game will be automatically _saved_ in the blockchain.

Observing `makeMove`, add a `console.log` to see what the format is:

```typescript
const move: Position[] = keys.map(
    (k: string): Position => k.split(",").map(Number) as Position
);
console.log(move);
```

Then play a move with the current interface. Say you move your first black like so:

![Black moves first piece](/black-moves-first-piece.png)

In the blockchain code, this is a `fromX: 1, fromY: 2, toX: 2, toY: 3`. However, the GUI prints:

```
[ [ 2, 1 ], [ 3, 2 ] ]
```

It is safe to assume that, on each position, X and Y are flipped. No problem, you can encapsulate this knowledge in a helper function:

```typescript
export function guiMoveToPos(move: number[]): Pos {
    return { x: move[1], y: move[0] };
}
```

You can do some more preparation:

1. In `CheckersStargateClient`, create a convenience function to check whether the move is valid with parameters as they are given in the GUI components:

    ```javascript
    public async canPlayGuiMove(
        gameIndex: string,
        playerId: number,
        move: number[][]
    ): Promise<QueryCanPlayMoveResponse> {
        if (playerId < 1 || 2 < playerId)
            throw new Error(`Wrong playerId: ${playerId}`);
        return await this.checkersQueryClient!.checkers.canPlayMove(
            gameIndex,
            playerId === 1 ? "b" : "r",
            guiMoveToPos(move[0]),
            guiMoveToPos(move[1])
        );
    }
    ```

2. In `CheckersSigningStargateClient`, create a convenience Gui function to actually make the move with parameters as they are given in the GUI components:

    ```typescript
    public async playGuiMove(
        gameIndex: string,
        playerId: number,
        move: number[][]
    ): Promise<void> {
        if (playerId < 1 || 2 < playerId)
            throw new Error(`Wrong playerId: ${playerId}`);
        const game: StoredGame | undefined =
            (await this.checkersQueryClient!.checkers.getStoredGame(
                gameIndex
            ))!;
        await this.playMove(
            playerId === 1 ? game.black : game.red,
            gameIndex,
            guiMoveToPos(move[0]),
            guiMoveToPos(move[1]),
            "auto"
        );
    }
    ```

    Note, how for the sake of simplicity an extra call is made to get the game's player addresses. This means that this function makes two calls to the RPC. If you kept the addresses directly in `GameContainer`, you could avoid this inefficiency and make a single call.

With this done:

1. Repeat what you did in `NewGameModal` by keeping a signing client in state:

    ```typescript
    interface IGameContainerState {
        ...
        signingClient: CheckersSigningStargateClient | undefined;
    }
    ```

    Don't forget to initialize it in the constructor.

2. Add a `getSigningStargateClient` function similar to the one you added in `NewGameModal`:

    ```typescript
    protected async getSigningStargateClient(): Promise<CheckersSigningStargateClient> {
        if (this.state.signingClient) return this.state.signingClient;
        const { keplr } = window;
        if (!keplr) {
            alert("You need to install Keplr");
            throw new Error("You need to install Keplr");
        }
        await keplr.experimentalSuggestChain(getCheckersChainInfo());
        const offlineSigner: OfflineSigner = keplr.getOfflineSigner!(chainId);
        const client: CheckersSigningStargateClient =
            await CheckersSigningStargateClient.connectWithSigner(
                this.props.rpcUrl,
                offlineSigner,
                {
                    gasPrice: GasPrice.fromString("1stake"),
                }
            );
        this.setState({ signingClient: client });
        return client;
    }
    ```

3. Change the declaration of `makeMove` to make it `async`:

    ```typescript
    public async makeMove(): Promise<void>
    ```

4. Then  in `makeMove`, make sure that the move is likely to be accepted, right after the existing code that extracts the move. You can choose to use the read-only `StargateClient` so that players can look around as far as they can without being asked to disclose their address:

    ```typescript
    const move: Position[] = keys.map(
        (k: string): Position => k.split(",").map(Number) as Position
    );

    const client = await this.getStargateClient();
    const canPlayOrNot = await client.canPlayGuiMove(
        this.props.match.params.index,
        this.state.board.current_player,
        move
    );
    if (!canPlayOrNot.possible) {
        const error = `Cannot make this move ${canPlayOrNot.reason}`;
        alert(error);
        throw new Error(error);
    }
    ```

5. With this assurance, you can make the move for real:

    ```typescript
    const signingClient = await this.getSigningStargateClient();
    await signingClient.playGuiMove(
        this.props.match.params.index,
        this.state.board.current_player,
        move
    );
    ```

6. And finish with a reload of the game, in order to show its new state:

    ```typescript
    return this.loadGame();
    ```

Now you can try yourself in the GUI. Of course, make sure you put your Keplr address as the black player, so that you start with this one. Then either you have a second account on Keplr with which to play red, or you play red from the command line. Either way, you have now made it possible to play the game from the GUI.

## Further exercise ideas

* You can use the <kbd>Quit Game</kbd> button to handle a reject for instance.
* All the usual GUI bells and whistles where, for instance, buttons are disabled when you cannot do the action.
* Implement a Web socket to listen to changes. That would be useful when there are two players who cannot communicate otherwise.
* You will notice that, when a double (or more) capture is possible, the GUI allows you to make the multiple move in one fell swoop, i.e. with `move.length >= 2`. However as it is coded, you handle only a single hop, i.e. `move[0]` and `move[1]`. It is possible however to pack more than one `PlayMove` message in a single transaction, thereby saving the player the hassle of sending multiple transactions.
