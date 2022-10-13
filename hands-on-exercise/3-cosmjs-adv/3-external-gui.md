---
title: "Get an External GUI"
order: 4
description: Find a checkers GUI before integrating with CosmJS
tags: 
  - guided-coding
  - cosmos-sdk
  - cosm-js
---

# Get an External GUI

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You have created the Protobuf types and objects for [queries](./1-cosmjs-objects.md) and [messages](./2-cosmjs-messages.md) in the previous two steps. If not, you can go ahead and clone and checkout [this branch](https://github.com/cosmos/academy-checkers-ui/tree/signing-stargate) to get the version needed for this tutorial.

The purpose of this section is to obtain a working and fairly recent checkers GUI. If you already have one, you can skip to the [next section](./4-cosmjs-gui.md) on how to integrate it with CosmJS.
<br></br>
This section does not introduce anything related to CosmJS, but sets you up with a template of a graphical user interface which you will later wire to CosmJS.

</HighlightBox>

In the previous sections, you created the objects, messages, and clients that allow you to interface with your checkers blockchain. The point of this exercise is not to create a GUI from the ground up for the game of checkers. Instead, you will integrate an existing frontend project with the previous CosmJS work you've done so far.

Clone the following [repo](https://github.com/b9lab/react-checkers) that was originally made by [`nablsi14`](https://github.com/nablsi14) and now updated to a recent React version:

```sh
$ git clone https://github.com/b9lab/react-checkers
```

## Prepare the files and folders

In order to integrate this project, you will have to move the relevant files into your own repository. But first test if the app works on your machine.

### Testing the app

Go to the `react-checkers` folder and install the correct packages:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ cd react-checkers
$ npm install
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ cd react-checkers
$ docker run --rm -it -v $(pwd):/react-checkers -w /react-checkers node:18.7 npm install
```

</CodeGroupItem>

</CodeGroup>

Confirm that the app works normally by running it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm start
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/client -w /client -p 3000:3000 node:18.7 npm start
```

</CodeGroupItem>

</CodeGroup>

It should automatically open the browser and you should see a simple page. If not, open [`http://localhost:3000`](http://localhost:3000).

### Copy the React app files

Move the files from the `react-checkers` folder into the repo that contains your CosmJS work so far. If you followed from the previous section or cloned the branch mentioned above, then:

* The `tsconfig.json`, `images.d.ts`, and `json.d.ts` files, and the `public` and `src` folders should have no conflicts.
* For `.gitignore` [just add the content](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/.gitignore#L3-L21) to your own `.gitignore`.
* For `package.json` there are some more things to consider:
    * Copy and paste the `"scripts"`. Rename the incoming `"test"` to `"test-react"`.
    * Copy and paste the `"browserlist"`.
    * Remove the [`"homepage"`](https://github.com/cosmos/academy-checkers-ui/blob/f9e1375/package.json#L18) field or it will confuse React.
    * Copy only the missing `dependencies` and `devDependencies`. If there is a conflict between versions, overwrite with the highest version.

Everything should now be integrated.

### Testing your own repo

Go to your own repo folder that contains your CosmJS work and the newly copied and edited files, and install the correct packages:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm install
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/client -w /client node:18.7 npm install
```

</CodeGroupItem>

</CodeGroup>

Confirm that the app works normally by running it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm start
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/client -w /client -p 3000:3000 node:18.7 npm start
```

</CodeGroupItem>

</CodeGroup>

The application should now open again in the browser at [`http://localhost:3000`](http://localhost:3000).

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to obtain a functioning and fairly recent external GUI for your checkers blockchain, including how to prepare your files and folders, testing the app to ensure it functions on your machine, where to move or copy files, and testing the app on your own repo after installation.

</HighlightBox>

<!--## Next up

You now have a working Checkers GUI! You are ready to start interfacing with the Checkers blockchain in the [next section](./4-cosmjs-gui.md).-->
