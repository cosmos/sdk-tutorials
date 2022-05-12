---
title: Get an external GUI
order: 24
description: Find a Checkers GUI before you integrate with CosmJS
tag: deep-dive
---

# Get an external GUI

<HighlightBox type="synopsis">

Make sure you have everything you need before proceeding:

* You have the checkers blockchain codebase up to the CosmJS messages. If not, follow the [previous steps](./cosmjs-messages.md) or check out the [relevant version](https://github.com/cosmos/academy-checkers-ui/tree/signing-stargate).

The purpose of this section is to obtain a working and fairly recent Checkers GUI. If you already have one, you can skip to the [next section](./cosmjs-gui.md) on how to integrate it with CosmJS.

This section does not introduce anything related to CosmJS.

</HighlightBox>

In the previous sections, you created the objects, messages, and clients that allow you to interface with your Checkers blockchain. Before you use them in an existing Checkers GUI, you need one.

The point of this exercise is not to create a GUI from the ground up for the game of checkers. Instead, it is to show how to prepare a GUI for use with the checkers blockchain. So pick a checkers GUI you like.

[This one](https://github.com/nablsi14/react-checkers) is a good choice. However, it has not been updated recently, so to avoid any version incompatibilities you are going to:

* Reuse `react-checkers` components instead of the whole repository.
* Reuse them in a new React app.

The actions that you need to take:

* Create a separate new React app.
* Copy and install newer and exact versions of the app elements into your repo.
* Take the existing GUI into your repo.
* Fix errors related to changes in the package versions.
* Tighten the code slightly.

## Prepare the files and folders

### Create a new React app

In a separate folder, run:

```sh
$ npx create-react-app checkers-gui-tmp --template typescript
```

Confirm that the app works normally by running it:

```sh
$ cd checkers-gui-tmp
$ npm start
```

It should automatically open the browser and you should see a simple page. If not, open [`http://localhost:3000`](http://localhost:3000).

### Copy the React app files

Copy into your own project all the files created for the React app. If you followed from the previous section, then:

* The `tsconfig.json` file and the `public` and `src` folders will have no conflicts.
* For `.gitignore` [just add the content](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/.gitignore#L3-L21) to your own `.gitignore`.
* For `package.json`:
    * [Copy-paste the difference](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/package.json#L57-L74) for everything **except the dependencies**.
    * Remove the [`"homepage"`](https://github.com/cosmos/academy-checkers-ui/blob/f9e1375/package.json#L18) field or it will confuse React.

For the package dependencies, it is better to use an exact method. Click on the expandable box below:

<ExpansionPanel title="Get the exact dependencies">

Run the following in the React app folder to get exact versions of the dependencies installed by the initialization script:

```sh
$ npm list @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest @types/react @types/react-dom react react-dom react-scripts typescript web-vitals --depth=0
```

Which prints something like:

```
├── @testing-library/jest-dom@5.16.4
├── @testing-library/react@13.1.1
├── @testing-library/user-event@13.5.0
├── @types/jest@27.4.1
├── @types/react-dom@18.0.1
├── @types/react@18.0.5
├── react-dom@18.0.0
├── react-scripts@5.0.1
├── react@18.0.0
├── typescript@4.6.3
└── web-vitals@2.1.4
```

Next, repeat this information in a new install command:

```sh
$ npm install react-dom@18.0.0 react-scripts@5.0.1 react@18.0.0 web-vitals@2.1.4 --save-exact
$ npm install @testing-library/jest-dom@5.16.4 @testing-library/react@13.1.1 @testing-library/user-event@13.5.0 @types/jest@27.4.1 @types/react-dom@18.0.1 @types/react@18.0.5 typescript@4.6.3 --save-exact --save-dev
```

This should update your [`package.json`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/package.json#L23-L55) and lock files.

</ExpansionPanel>

To make sure that editing `package.json` does not reformat it with Prettier, add the ignore file `.prettierignore` with the following in it:

``` [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/.prettierignore#L1]
package.json
```

### Fix a compilation error

There may be a Typescript compilation error on a CosmJS-generated file, so add [`"downlevelIteration": true,`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/tsconfig.json#L13) to `.compilerOptions` in `tsconfig.json`.

Confirm that you get the React simple page by running `npm start` in your own project root folder.

You created this new React app in order to work around the fact that the existing Checkers GUI is old. You can now delete your `checkers-gui-tmp` folder.

### Get the external Checkers GUI files

Clone [the Checkers GUI repository](https://github.com/nablsi14/react-checkers) as a separate project somewhere other than your current project. You ought to have a feel for this GUI before you use its parts. Go in the folder and install the GUI elements:

```sh
$ cd react-checkers
$ npm install
```

Make sure it works:

```sh
$ npm start
```

If it does not open automatically, open your browser at [`http://localhost:3000`](http://localhost:3000). Explore, play a few games, and get acquainted with how the GUI works.

### Copy the GUI files

Copy the files you need from the cloned `react-checkers` repository into your own project:

* Overwrite in the `public` folder if necessary. Remove the now-obsolete React logo files.
* The [`src/components`](https://github.com/cosmos/academy-checkers-ui/tree/4ea0bdb/src/components), [`src/images`](https://github.com/cosmos/academy-checkers-ui/tree/4ea0bdb/src/images), and [`src/util`](https://github.com/cosmos/academy-checkers-ui/tree/4ea0bdb/src/util) folders have no conflicts, you can copy their content completely.
* The [`src/registerServiceWorker.ts`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/registerServiceWorker.ts), [`src/sharedTypes.ts`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/sharedTypes.ts), [`images.d.ts`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/images.d.ts), [`json.d.ts`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/json.d.ts), [`tslint.json`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/tslint.json), and the [two extra](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/tsconfig.prod.json) [`tsconfig`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/tsconfig.test.json) files also have no conflicts.
* In `src/index.tsx`, [add the missing](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/index.tsx#L10-L13) [lines](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/index.tsx#L29) and update the [location of `App.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/index.tsx#L6). You can delete the old `src/App.tsx`, `src/App.test.tsx`, and `src/App.css`.

For the new Node packages, do a study in `react-checkers` similar to the one your did for the React app:

<ExpansionPanel title="Get the exact dependencies">

With `npm list --depth=0` in `react-checkers`, you see the following packages and their versions that are not yet installed in your project:

```
...
├── @types/lockr@0.8.6
├── @types/query-string@5.1.0
├── @types/react-fontawesome@1.6.3
├── @types/react-icons@2.2.5
├── @types/react-loadable@5.4.1
├── @types/react-router-dom@4.2.6
├── @types/reactstrap@5.0.25
├── bootstrap@4.1.1
├── jquery@3.3.1
├── lockr@0.8.4
├── query-string@5.1.1
├── react-icons@2.2.7
├── react-loadable@5.5.0
├── react-router-dom@4.2.2
└── reactstrap@6.0.1
```

However, because the React app already uses **version 18**, [version adjustments](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/package.json#L22-L56) are needed:

```npm
@types/query-string@6.3.0
@types/react-fontawesome@1.6.5
@types/react-icons@3.0.0
@types/react-loadable@5.5.6
@types/react-router-dom@5.3.3
@types/reactstrap@8.7.2
bootstrap@5.1.3
query-string@7.1.1
react-icons@4.3.1
react-loadable@5.5.0
react-router-dom@6.3.0
reactstrap@9.0.2
```

Run the following:

```sh
$ npm install bootstrap@5.1.3 jquery@3.3.1 lockr@0.8.4 query-string@7.1.1 react-icons@4.3.1 react-loadable@5.5.0 react-router-dom@6.3.0 reactstrap@9.0.2 --save-exact
$ npm install @types/lockr@0.8.6 @types/query-string@6.3.0 @types/react-fontawesome@1.6.5 @types/react-icons@3.0.0 @types/react-loadable@5.5.6 @types/react-router-dom@5.3.3 @types/reactstrap@8.7.2 --save-exact --save-dev
```

</ExpansionPanel>

With the packages installed, **fix the GUI code** to work with the installed versions:

<ExpansionPanel title="Adjust FontAwesome in a few files">

Adjust the copied files to be compatible with the new version of `react-fontawesome`:

1. In [`Menu.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/Menu/Menu.tsx#L2), [`MenuItemButtons.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/Menu/MenuItemButtons.tsx#L2), [`HowToPlay.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/HowToPlay/HowToPlay.tsx#L2), and [`BoardMenu.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/Game/BoardMenu/BoardMenu.tsx#L2) replace:

    ```typescript
    import * as FontAwesome from "react-icons/lib/fa"
    ```

    With:

    ```typescript
    import * as FontAwesome from "react-icons/fa"
    ```

2. In `HowToPlay.tsx`, replace `FaLongArrowLeft` with [`FaLongArrowAltLeft`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/HowToPlay/HowToPlay.tsx#L60).
3. In `BoardMenu.tsx`, replace `FaFloppyO` with [`FaSave`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/Game/BoardMenu/BoardMenu.tsx#L34).

</ExpansionPanel>

<ExpansionPanel title="In GameContainer.tsx">

The use of `match` in `BrowserRouter` no longer works:

1. The props will directly mention the `index` of the game. Replace:

    ```typescript
    interface IGameContainerProps {
        location: any;
        match: match<{ index: number }>;
    }
    ```

    With:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/Game/GameContainer.tsx#L11-L14]
    interface IGameContainerProps {
        location: any
        index: string
    }
    ```

2. To convert `index` to a number when needed, replace:

    ```typescript
    let index: number = this.props.match.params.index;
    ```

    With:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/Game/GameContainer.tsx#L67]
    let index: number = parseInt(this.props.index)
    ```

</ExpansionPanel>

<ExpansionPanel title="In HowToPlay.tsx">

In `HowToPlay.tsx`, fix the following:

1. A JSON import error:

    ```typescript
    import * as data from "./htp.json"
    ```

    Replace it with:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/HowToPlay/HowToPlay.tsx#L4]
    import data from "./htp.json"
    ```

2. Change the component props:

    ```typescript
    interface IHTPProps {
        history: any;
    }
    ```

    Replace it with:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/HowToPlay/HowToPlay.tsx#L13-L15]
    interface IHTPProps {
        goBack: () => void
    }
    ```

3. Identify instances of the following:

    ```typescript
    <Button color="primary" onClick={this.props.history.goBack}>
    ```

    Replace them with:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/HowToPlay/HowToPlay.tsx#L59]
    <Button color="primary" onClick={this.props.goBack}>
    ```

</ExpansionPanel>

<ExpansionPanel title="In Section.tsx">

Fix a Typescript compilation error in `Section.tsx`:

```typescript
const TitleTag = `h${
    props.level < 6 ? (props.level > 0 ? props.level : 1) : 6
}`
```

Replace it with:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/HowToPlay/Section.tsx#L11-L13]
const tags: ("h1" | "h2" | "h3" | "h4" | "h5" | "h6")[] = ["h1", "h2", "h3", "h4", "h5", "h6"]
const level = props.level < 6 ? (props.level > 0 ? props.level : 1) : 6
const TitleTag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = tags[level]
```

</ExpansionPanel>

<ExpansionPanel title="In App.tsx">

You need to change how the React router operates:

```typescript
const App = () => (
    <BrowserRouter>
        <Container style={ styles }>
            <div className="well">
                <div style={ titleStyles }>Checkers</div>
                <Routes />
            </div>
            <Footer />
        </Container>
    </BrowserRouter>
);
```

Replace it with:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/App.tsx#L21-L48]
const GameContainerWrapper = () => <GameContainer index={useParams().index!} location={useLocation()} />

const AsyncGameContainer = Loadable({
    loader: () => Promise.resolve(GameContainerWrapper),
    loading: Loading,
})
const AsyncHowToPlay = Loadable({
    loader: () => import("./HowToPlay/HowToPlay"),
    loading: Loading,
})

const App = () => {
    const navigate = useNavigate()
    return (
        <Container style={styles}>
            <div className="well">
                <div style={titleStyles}>Checkers</div>
                <Routes>
                    <Route path="menu" element={<MenuContainer location={""} />} />
                    <Route path="play/:index" element={<AsyncGameContainer />} />
                    <Route path="howtoplay" element={<AsyncHowToPlay goBack={() => navigate(-1)} />} />
                    <Route path="*" element={<Navigate to="/menu" replace={true} />} />
                </Routes>
            </div>
            <Footer />
        </Container>
    )
}
```

Several implications to consider:

* You should delete the `Routes.tsx` file, as the list of `Route`s is now in `App`.
* The `Routes` component here is now coming from `react-router`.
* The `BrowserRouter` component is sent up to [`index.tsx`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/index.tsx#L20-L22) so that `App` can use the `useNavigator` hook.
* `GameContainerWrapper` exists only to make use of `useParams` and `useLocation`, which is not available on a class component like `GameContainer`.

</ExpansionPanel>

<ExpansionPanel title="In index.tsx">

Locate the following:

```typescript
ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
```

Replace it with:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/index.tsx#L17-L24]
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
```

This inserts the `BrowserRouter` that used to be in `App`, so that `App` can have access to the [`useNavigate`](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/App.tsx#L33) hook.

</ExpansionPanel>

### Tighten up the GUI code

The existing GUI code takes some shortcuts. To facilitate writing further code, close these shortcuts.

Make an explicit `IBoardMenuState`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/Game/BoardMenu/BoardMenu.tsx#L12-L16]
interface IBoardMenuState {
    showTooltip: boolean
}
export default class BoardMenu extends Component<IBoardMenuProps, IBoardMenuState> {}
```

Make an explicit `INewGameModalState`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/Menu/NewGameModal/NewGameModal.tsx#L15-L19]
interface INewGameModalState {
    showAlert: boolean;
}

export default class NewGameModal extends Component<INewGameModalProps, INewGameModalState> {}
```

Make an explicit `IMenuContainerProps`:

```typescript [https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/src/components/Menu/MenuContainer.tsx#L10-L20]
export interface IMenuContainerProps {
    location?: any;
}
export default class MenuContainer extends Component<IMenuContainerProps, IMenuContainerState> {
    constructor(props: IMenuContainerProps)...
}
```

## Next up

You now have a working Checkers GUI. This rather long preparatory effort was made in order to use recent packages. You are now ready to integrate it with the Checkers blockchain.

This is the objective of the [next section](./cosmjs-gui.md).
