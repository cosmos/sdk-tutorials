# How To [Build/Create/Do Something] using the Cosmos SDK

<!--
Use this tutorial template as a quick starting point when writing Cosmos SDK how-to tutorials. 

After you review the template, delete the comments and begin writing your outline or article. Examples of Markdown formatting syntax are provided at the bottom of this template.

As you write, refer to industry style and formatting guidelines. 

We admire, respect, and rely on these resources:

- Google developer documentation [style guide](https://developers.google.com/style)
- Digital Ocean style guide [do.co/style](https://do.co/style)

[Create an issue](https://github.com/cosmos/sdk-tutorials/issues/new/choose) to let us know if you have questions. 

-->

<!-- To preview a content deploy so you can see what your article looks like before it is published, see [../CONTRIBUTING.md#viewing-tutorial-builds]. 

Our users must be able to follow the tutorial from beginning to end on their own computer. Before submitting a tutorial for PR review, be sure to test the content by completing all steps from start to finish exactly as they are written. Cut and paste commands from the article into your terminal to make sure that typos are not present in the commands. If you find yourself executing a command that isn't in the article, incorporate that command into the article to make sure the user gets the exact same results. 
-->

<!-- Use Title Case for all Titles, see https://capitalizemytitle.com/ -->

<!-- Use GitHub flavored Markdown, see [Mastering Markdown](https://guides.github.com/features/mastering-markdown/)  -->

<!-- Our articles have a specific structure. How-To tutorials follow this structure:

* Front Matter Metadata
* Title
* Introduction and Purpose (Level 2 heading)
* Prerequisites (Level 2 heading)
* Step 1 — Doing Something (Level 2 heading)
* Step 2 — Doing Something (Level 2 heading)
...
* Step 5 — Doing Something (Level 2 heading)
* Conclusion (Level 2 heading)

 -->

### Introduction and Purpose

Introductory paragraph about the topic that explains what this topic is about and why the user should care; what problem does the tutorial solve?

In this guide, you will [accomplish/build/] [some thing]...

- Build ...
- Create ... 
- Do ...

When you're finished, you'll be able to...

## Prerequisites

<!-- Prerequisites let you leverage existing tutorials so you don't have to repeat installation or setup steps in your tutorial. -->

To complete this tutorial, you will need:

- prerequisite 1
- prerequisite 2
- (Optional) List any other accounts needed.

<!-- Example - uncomment to use

- A text editor like [Visual Studio Code](https://code.visualstudio.com/download) or [Atom](https://atom.io/). 
- A web browser like [Chrome](https://www.google.com/chrome/) or [Firefox](https://www.mozilla.org/en-US/firefox/new/).

-->

## Step 1 — Doing Something

Introduction to the step. What are you going to do and why are you doing it?

First....

Next...

Finally...

<!-- When showing a command, explain the command first by talking about what it does. Then show the command. Then describe the output and then show its output in a separate output block, like https://docs.cosmos.network/master/run-node/interact-node.html -->

To verify the version of Go you have installed, run the following command:

```sh
go version
```

You'll see version details like the following output:

```
go version go1.16.4 darwin/amd64
```

<!-- When asking the user to open a file, be sure to specify the file name:

Define the query commands in the `query.go` file.

When showing the contents of a file, try to show only the relevant parts and explain what needs to change. -->

Leave a blank line above and below code fences. Use triple tick marks with the correct syntax notation:

```go
...
func GetAccountCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "account [address]",
		Short: "Query for account by address",
...
```


Now transition to the next step by telling the user what's next.

## Step 2 — Title Case

Another introduction

Your content that guides the user to accomplish a specific step

Transition to the next step.

## Step 3 — Title Case

Another introduction

Your content

Transition to the next step.

## Conclusion

In this article you [accomplished/built] [something]. Now you can....

<!-- Speak to the benefits of this technique or procedure and optionally provide places for further exploration. -->

<!------------ Formatting ------------------------->

<!-- Some examples of how to mark up various things

This is _italics_ and this is **bold**.

Use italics and bold for specific things. 

This is `inline code`. Use single tick marks for filenames and commands. Do not overuse code syntax. 

Here's a command you can type on a command line:

```sh
which go
```

Here's output from a command:

```bash
/usr/local/go/bin/go
```

Write key presses in ALLCAPS.

Use a plus symbol (+) if keys need to be pressed simultaneously: `CTRL+C`.

**Note:** This is a note.

**Tip:** This is a tip.

Add diagrams and screenshots in PNG format with a self-describing filename. Embed them in the article using the following format:

![Alt text for screen readers](/path/to/img.png)

-->