# Setting Up Visual Studio Code 

1. Install [Visual Studio Code](https://vscode-docs.readthedocs.io/en/latest/editor/setup/).
1. Click **Extensions** in the sidebar. 
1. Install this extension:
    - Go for VS Code The official Go extension for Visual Studio Code
1. When prompted:
    - `go get -v golang.org/x/tools/gopls`
    - Select `Install all` for all packages


## GitHub Integration

Click the GitHub icon in the sidebar for GitHub integration and follow the prompts.

## Clone the repos you work in

- Fork or clone the <https://github.com/cosmos/sdk-tutorials/> repository. Internal Tendermint users have different permissions, if you're not sure, fork the repo.


## Terminal Tips 

Master your terminal to be happy.

1. On MacOS, install the [iTerm2](https://iterm2.com/) OSS terminal emulator. 

1. Install and set up [zsh](https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH) as the default shell.

1. Install these plugins:
    - [zsh-auto-suggestions](https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md#oh-my-zsh)
    - [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting/blob/master/INSTALL.md#oh-my-zsh)

1. Edit your `~/.zshrc` file to add the plugins to load on startup:

    ```sh
    plugins=(
      git
      zsh-autosuggestions
      zsh-syntax-highlighting
    )
    ```

1. Log out and log back in to the terminal to use your new default shell.


## Install Go 

This installation method removes existing Go installations, installs Go in `/usr/local/go/bin/go`, and sets the environmental variables.

1. Go to <https://golang.org/dl>.
1. Download the binary release that is suitable for your system. 
1. Follow the installation instructions.

**Note:** We recommend not using brew to install Go.



what is the best way to be awesome in our technical setup?
the first technical hurdle for devs is how to get started with
cosmos sdk and tendermint and gaia how to run these applications
how to clone sdk repos
simapp 
how to test changes in cosmos sdk

https://github.com/cosmos/cosmos-sdk/tree/master/simapp 


