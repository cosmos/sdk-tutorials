# Overview

This Node.js application uses [Vuepress](https://vuepress.vuejs.org/) to render a static documentation page.

## Clone

This repository uses a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) for the [theme](https://github.com/b9lab/vuepress-theme-cosmos/tree/b9lab-theme-updates). Use

```
git clone --recursive git@github.com:cosmos/sdk-tutorials.git
```

to initialize and update all submodules automatically.

## Install

This application requires **node version >=14**! Install the application with:

```
npm install
```

## Local preview server

You can run a live preview of the platform using:

```
npm run serve
```

This will start a local server on [localhost:8081](http://localhost:8081/).

## Build

A distribution package can be built using:

```
npm run build
```

The build output can be found in `./vuepress/dist`.


# For content authors

**WIP** - Information for content authors (internal and external)

This sections lists technical details for content authors. For general information, language, and style details, see the [Contribution Guidelines](CONTRIBUTING.md).

## Main config file

The main config file is located in `.vuepress/config.js`

## Navigation components

The platform has multiple navigation components:

* Sidebar menu - main menu at the left, overview of all modules and sections
* Right sidebar - On-page navigation (automatically created from headlines)
* End of page navigation (Back/Next)
* Landingpages
* Footer
* Top bar

### Sidebar menu

The main menu is configured in the main config, within the `sidebar` - `nav` object. This config defines both the sidebar as well as the end of page navigation.

An example configuration might look like this:

```
{
  title: "Cosmos Academy",
  children: [
    {
      title: "Welcome",
      path: "/academy/0-welcome/",
      directory: false,
    },
    {
      title: "What is Cosmos?",
      path: "/academy/1-what-is-cosmos",
      directory: true,
    }
}
```

Where each module is defined as a children of the root. 

* `title` - Module name
* `path` - Full path to the folder
* `directory` - When enabled, all content files found in the folder will be linked as child pages automatically. This creates an expendable Module in the sidebar. Otherwise, only one link will be added to the sidebar, pointing to the file specified in `path`. If this is a folder, the `index.md` inside it will be linked.


You can also define the children pages of a module manually:

```
{
  title: "Week 1 - Cosmos and Its Main Concepts",
  directory: true,
  order: 2,
  children: [
    {
      title: "Cosmos and its Main Concepts",
      path: "/course-ida/landingpages/week1-lp.html"
    },
    {
      title: "Blockchain Technology and Cosmos",
      path: "/academy/1-what-is-cosmos/blockchain-and-cosmos.html"
    }
}
```

#### Adding new modules and pages

You can extend the main config to add new modules and pages. However, if you add a new folder on the root level, you must also adjust the file search patterns at the very end of the config:

```
patterns: [
  "README.md",
  "academy/*/*.md",
  "tutorials/*/*.md"
]
```

If you create a new folder named `myfiles`, add `"myfiles/*/*.md"` to the list.

### Landingpages

#### Main landingpage

#### Sub landingpage

#### Module landingpages


## Content pages

### Header

### Images

**Images must be linked using an absolute path!** On build, images are automatically resized and compressed into a set with different sizes, defined in the vuepress config:

```
assetsOptimization: {
   breakpoints: [200, 600, 988, 1200]
}
```

The platform also has a zoom feature, which is automatically enabled on all embedded images.

### Custom components

There is a hidden file (not linked in the main menu) published at [/feature-test](/feature-test/index.md), which demonstrates the use of all custom components used on this platform. This page is also available on the deployed website at [https://tutorials.cosmos.network/feature-test/](https://tutorials.cosmos.network/feature-test/).


### Vuepress features and issues


## Platform Variants

This repository contains the content for two different deployments at once:

* The main platform, deployed to [tutorials.cosmos.network](https://tutorials.cosmos.network).
* The Interchain Developer Academy platform (IDA) [interchainacademy.cosmos.network](https://interchainacademy.cosmos.network/).


### Working with Platform Variants

The content for both platforms lives on the `master` branch. When building the project (`npm run build` and `npm run serve`), you are building the main platform. The IDA platform uses the same base files, but then adds additional changes ontop of them (mostly different landingpages, menu adjustments and small differences on a few content pages).

In general, there are three types of files:

* Files only used on one platform.
* Files used on both platforms, with the same content.
* Files used on both platforms with **different content**. This includes config files (`.vuepress/config.js`)

The first two types of files don't require any special treatment. Only the last type - files used on both platforms - require to be treated differently. 

### IDA platform

There is a separate folder for files with different content for the IDA platform in the repository root, named `ida-customizations`. When building the IDA platform, the content of this folder is copied into the main folder, overwriting the main platform files. For example, the file `/academy/6-whats-next/index.md` (main platform) has an IDA variation in `/ida-customizations/academy/6-whats-next/index.md`. When building the IDA platform, the original file will be overwritten with the IDA file version before building. Similiarly, there is an IDA specific config in `/ida-customizations/.vuepress/config.js`

### Switching variants

There are two helper scripts available to switch between the main platform and the ida platform variants.

* `npm run switch-ida` to change your local filesystem to the IDA platform variant (copy in IDA files).
* `npm run switch-main` to switch back to the main platform variant (this moves your changes into the `ida-customizations` folder).

**NOTE: Your working directory must be clean before switching to the IDA files**.

When you switch back to the main variant, changes will be moved into the `ida-customizations` folder, and the original files are being restored. The script uses `git stash` to restore the main files, so in case of an inadvertently switch (or any error), you can restore your original changes (see `git stash list` and `git stash pop`). Note however that **changes in the `ida-customizations` folder will be overwritten** by this script!


### Workflows

To work on the IDA platform files, starting from a clean `master`:

* Run `npm run switch-ida` to switch your local filesystem to the IDA variant.
* You can now run `npm run serve` and work on the files as usual.
* Once you are done with your updates, stop your server and run `npm run switch-main`. This will move your changes into the `ida-customizations` folder and restore the main platform files.
* Add the files in `ida-customizations` to your commit and push to `master`.


# Environments

## Visual Studio Code 

1. Install [Visual Studio Code](https://vscode-docs.readthedocs.io/en/latest/editor/setup/).
1. Click **Extensions** in the sidebar. 
1. Install these extensions:
    * [Go for VS Code](https://marketplace.visualstudio.com/items?itemName=golang.Go)
    * [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) 
1. When prompted:
    * `go get -v golang.org/x/tools/gopls`
    * Select `Install all` for all packages

Be sure to set up [Visual Studio Code](https://code.visualstudio.com/docs/setup/setup-overview) for your environment. 

**Tip** On MacOS, install `code` in $PATH to enable [Launching Visual Studio Code from the command line](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line). Open the Command Palette (Cmd+Shift+P) and type 'shell command'.  

### GitHub Integration

Click the GitHub icon in the sidebar for GitHub integration and follow the prompts.


## Terminal Tips 

Master your terminal to be happy.

### iTerm2 Terminal Emulator

On macOS, install the [iTerm2](https://iterm2.com/) OSS terminal emulator as a replacement for the default Terminal app. Installing iTerm2 as a replacement for Terminal provides an updated version of the Bash shell that supports useful features like programmable completion.

### Using ZSH as Your Default Shell

The Z shell, also known as zsh, is a UNIX shell that is built on top of the macOS default Bourne shell.

1. If you want to set your default shell to zsh, install and set up [zsh](https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH) as the default shell.

1. Install these plugins:
    * [zsh-auto-suggestions](https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md#oh-my-zsh)
    * [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting/blob/master/INSTALL.md#oh-my-zsh)

1. Edit your `~/.zshrc` file to add the plugins to load on startup:

    ```sh
    plugins=(
      git
      zsh-autosuggestions
      zsh-syntax-highlighting
    )
    ```

1. Log out and log back in to the terminal to use your new default zsh shell.


## Install Go 

This installation method removes existing Go installations, installs Go in `/usr/local/go/bin/go`, and sets the environment variables.

1. Go to <https://golang.org/dl>.
1. Download the binary release that is suitable for your system. 
1. Follow the installation instructions.

**Note:** We recommend not using brew to install Go.



# For content authors

**WIP** - Information for content authors (internal and external)


## Platform Variants

This repository contains the content for two different deployments at once:

* The main platform, deployed to [tutorials.cosmos.network](https://tutorials.cosmos.network).
* The Interchain Developer Academy platform (IDA) [interchainacademy.cosmos.network](https://interchainacademy.cosmos.network/).


### Working with Platform Variants

The content for both platforms lives on the `master` branch. When building the project (`npm run build` and `npm run serve`), you are building the main platform. The IDA platform uses the same base files, but then adds additional changes ontop of them (mostly different landingpages, menu adjustments and small differences on a few content pages).

In general, there are three types of files:

* Files only used on one platform.
* Files used on both platforms, with the same content.
* Files used on both platforms with **different content**. This includes config files (`.vuepress/config.js`)

The first two types of files don't require any special treatment. Only the last type - files used on both platforms - require to be treated differently. 

### IDA platform

There is a separate folder for files with different content for the IDA platform in the repository root, named `ida-customizations`. When building the IDA platform, the content of this folder is copied into the main folder, overwriting the main platform files. For example, the file `/academy/6-whats-next/index.md` (main platform) has an IDA variation in `/ida-customizations/academy/6-whats-next/index.md`. When building the IDA platform, the original file will be overwritten with the IDA file version before building. Similiarly, there is an IDA specific config in `/ida-customizations/.vuepress/config.js`

### Switching variants

There are two helper scripts available to switch between the main platform and the ida platform variants.

* `npm run switch-ida` to change your local filesystem to the IDA platform variant (copy in IDA files).
* `npm run switch-main` to switch back to the main platform variant (this moves your changes into the `ida-customizations` folder).

**NOTE: Your working directory must be clean before switching to the IDA files**.

When you switch back to the main variant, changes will be moved into the `ida-customizations` folder, and the original files are being restored. The script uses `git stash` to restore the main files, so in case of an inadvertently switch (or any error), you can restore your original changes (see `git stash list` and `git stash pop`). Note however that **changes in the `ida-customizations` folder will be overwritten** by this script!


### Workflows

To work on the IDA platform files, starting from a clean `master`:

* Run `npm run switch-ida` to switch your local filesystem to the IDA variant.
* You can now run `npm run serve` and work on the files as usual.
* Once you are done with your updates, stop your server and run `npm run switch-main`. This will move your changes into the `ida-customizations` folder and restore the main platform files.
* Add the files in `ida-customizations` to your commit and push to `master`.
