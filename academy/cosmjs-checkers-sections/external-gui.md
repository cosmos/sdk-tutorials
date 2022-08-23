---
title: "Get an External GUI"
order: 4
description: Find a checkers GUI before integrating with CosmJS
tag: deep-dive
---

# Get an External GUI

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You have created the Protobuf types and objects for [queries](./cosmjs-objects.md) and [messages](./cosmjs-messages.md) in the previous two steps. If not, you can go ahead and clone and checkout [this branch](https://github.com/cosmos/academy-checkers-ui/tree/signing-stargate) to get the version needed for this tutorial.

The purpose of this section is to obtain a working and fairly recent Checkers GUI. If you already have one, you can skip to the [next section](./cosmjs-gui.md) on how to integrate it with CosmJS.
<br></br>
This section does not introduce anything related to CosmJS, but sets you up with a template of a graphical user interface which you'll later wire to CosmJS.

</HighlightBox>

In the previous sections, you created the objects, messages, and clients that allow you to interface with your Checkers blockchain. The point of this exercise is not to create a GUI from the ground up for the game of checkers. Instead, you will integrate an existing frontend project with the previous CosmJS work you've done so far.

Clone the following [repo](https://github.com/b9lab/react-checkers) that was originally made by [`nablsi14`](https://github.com/nablsi14) and now updated to a recent React version:

```sh
$ git clone https://github.com/b9lab/react-checkers
```

## Prepare the files and folders

In order to integrate this project, you'll have to move the relevant files into your own repo. But first test if the app works on your machine.

### Testing the app

Go to the `react-checkers` folder and install the correct packages:

```sh
$ cd react-checkers
$ npm install
```

Confirm that the app works normally by running it:

```sh
$ npm start
```

It should automatically open the browser and you should see a simple page. If not, open [`http://localhost:3000`](http://localhost:3000).

### Copy the React app files

You'll have to move some files from the `react-checkers` folder into the repo that contains your CosmJS work so far. If you followed from the previous section or cloned the branch mentioned above, then:

* The `tsconfig.json` file and the `public` and `src` folders should have no conflicts.
* For `.gitignore` [just add the content](https://github.com/cosmos/academy-checkers-ui/blob/4ea0bdb/.gitignore#L3-L21) to your own `.gitignore`.
* For `package.json` there are some more things to consider:
    * Copy and paste the `"scripts"` and `"browserlist"`.
    * Remove the [`"homepage"`](https://github.com/cosmos/academy-checkers-ui/blob/f9e1375/package.json#L18) field or it will confuse React.
    * Copy only the missing `dependencies` and `devDependencies`. If there is a conflict between versions, overwrite with the highest version.

Everything should now be integrated.

### Testing your own repo

Go to your own repo folder that contains your CosmJS work and the newly copied and edited files, and install the correct packages:

```sh
$ npm install
```

Confirm that the app works normally by running it:

```sh
$ npm start
```

The application should now open again in the browser at [`http://localhost:3000`](http://localhost:3000).

## Next up

You now have a working Checkers GUI! You are ready to start interfacing with the Checkers blockchain in the [next section](./cosmjs-gui.md).
