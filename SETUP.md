# Development Environment Setup

You'll need `go-lang 1.13+`, `git` and `make` on your machine to go through the tutorials.

Use an Editor or an IDE of your choice, e.g. [Visual Studio Code](https://code.visualstudio.com/download).

To download golang visit the [official golang download page](https://golang.org/dl/). Below are some added instructions on how to down load `make` and `git`.

## Ubuntu 18.04

```sh
sudo add-apt-repository ppa:longsleep/golang-backports
sudo apt-get update
sudo apt-get install golang-go

go version  # should be go1.13.x

# add go env GOPATH to the system PATH
echo 'export PATH=$PATH:$(go env GOPATH)/bin' >> ~/.profile
source ~/.profile
```

`git` and `make` are already installed, if not:

```sh
sudo apt-get install git make
```

## Other *nix, Mac

Use the package-manager of your system.

- Mac: Brew is recommended

## Windows

Windows native is not tested/supported.

You can use WSL (Windows Subsystem for Linux) or another virtual machine running ubuntu 18.04.