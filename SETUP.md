# Development Environment Setup

## Supported OS

The example instructions are for Ubuntu 18.04 and for any other OS using ubuntu on a virtual machine (Windows: WSL, VirtualBox, Docker.

Native setup on other *nix systems should be similar.

Windows native is not tested/supported, use WSL (Windows Subsystem for Linux) or another virtual machine running ubuntu 18.04.

## Setup


The go-language 1.13 and higher (for full info: [official go download page](https://golang.org/dl/) )

```sh
sudo add-apt-repository ppa:longsleep/golang-backports
sudo apt-get update
sudo apt-get install golang-go

go version  # should be go1.13.x

# add go env GOPATH to the system PATH
echo 'export PATH=$PATH:$(go env GOPATH)/bin' >> ~/.profile
source ~/.profile
```

