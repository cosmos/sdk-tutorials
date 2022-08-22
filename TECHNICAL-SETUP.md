# Setting Up Visual Studio Code 

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

## GitHub Integration

Click the GitHub icon in the sidebar for GitHub integration and follow the prompts.

## Clone the repos you work in

* Fork or clone the <https://github.com/cosmos/sdk-tutorials/> repository. Internal Tendermint users have different permissions, if you're not sure, fork the repo.


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

There is a separate folder for files with different content for the IDA platform in the repository root, named `ida-customisations`. When building the IDA platform, the content of this folder is copied into the main folder, overwriting the main platform files. For example, the file `/academy/6-whats-next/index.md` (main platform) has an IDA variation in `/ida-customisations/academy/6-whats-next/index.md`. When building the IDA platform, the original file will be overwritten with the IDA file version before building. Similiarly, there is an IDA specific config in `/ida-customisations/.vuepress/config.js`

### Switching variants

There are two helper scripts available to switch between the main platform and the ida platform variants.

* `npm run switch-ida` to change your local filesystem to the IDA platform variant (copy in IDA files).
* `npm run switch-main` to switch back to the main platform variant (this moves your changes into the `ida-customisations` folder).

**NOTE: Your working directory must be clean before switching to the IDA files**.

When you switch back to the main variant, changes will be moved into the `ida-customisations` folder, and the original files are being restored. The script uses `git stash` to restore the main files, so in case of an inadvertently switch (or any error), you can restore your original changes (see `git stash list` and `git stash pop`). Note however that **changes in the `ida-customisations` folder will be overwritten** by this script!


### Workflows

To work on the IDA platform files, starting from a clean `master`:

* Run `npm run switch-ida` to switch your local filesystem to the IDA variant.
* You can now run `npm run serve` and work on the files as normal.
* Once you are done with your updates, stop your server and run `npm run switch-main`. This will move your changes into the `ida-customisations` folder and restore the main platform files.
* Add the files in `ida-customisations` to your commit and push as usual, to `master`.
