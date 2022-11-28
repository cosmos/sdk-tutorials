---
title: Prepare the Software to Run
order: 3
description: Build and deploy
tags:
  - guided-coding
  - cosmos-sdk
  - dev-ops
---

# Prepare the Software to Run

To get to production, the first order of business is to build the binary that the nodes will run. If you used Ignite CLI, then you already did this under the hood with the `ignite chain serve` command.

## Target platforms

Because you are going to run the nodes on different machines, they may use different operating systems and CPU types. You need to account for that when building the binary. In particular, the computer on which you build may be entirely different from the one on which you eventually run the binary. In the jargon, you need to specify the target platform(s).

What target platforms are available? Because you built your entire blockchain with Go, you can rely on [Go target platforms](https://go.dev/doc/install/source#environment) for that. Or a nicely presented one [such as this](https://gist.github.com/asukakenji/f15ba7e588ac42795f421b48b8aede63). To get the targets specific to your version of Go, just run:

```sh
$ go tool dist list
```

For instance, for `go version go1.18.3 linux/amd64`, it returns:

```txt
aix/ppc64
android/386
android/amd64
android/arm
android/arm64
darwin/amd64
darwin/arm64
dragonfly/amd64
freebsd/386
freebsd/amd64
freebsd/arm
freebsd/arm64
illumos/amd64
ios/amd64
ios/arm64
js/wasm
linux/386
linux/amd64
linux/arm
linux/arm64
linux/mips
linux/mips64
linux/mips64le
linux/mipsle
linux/ppc64
linux/ppc64le
linux/riscv64
linux/s390x
netbsd/386
netbsd/amd64
netbsd/arm
netbsd/arm64
openbsd/386
openbsd/amd64
openbsd/arm
openbsd/arm64
openbsd/mips64
plan9/386
plan9/amd64
plan9/arm
solaris/amd64
windows/386
windows/amd64
windows/arm
windows/arm64
```

As a side note, some of these platforms are first-class ports of Go while the others are not. If you want to only see the first class ports and have installed the `jq` tool, you can run:

```sh
$ go tool dist list -json \
  | jq -r '.[] | select(.FirstClass) | [.GOOS , .GOARCH] | join("/")'
```

<HighlightBox type="note">

Notice the `GOOS` and `GOARCH` keywords in the command above. You will see them again later.

</HighlightBox>

The list is now much shorter:

```txt
darwin/amd64
darwin/arm64
linux/386
linux/amd64
linux/arm
linux/arm64
windows/386
windows/amd64
```

Imagine you are going to run the node:

* On regular office Linux boxes, so target `linux/amd64`.
* Also on AWS EC2 instances with a Graviton processor, so target `linux/arm64`.
* Validator operators are going to generate their genesis transactions on Mac computers with Intel CPUs, so target `darwin/amd64`.

## Build and package

There are several ways to build an executable. Pick the one that works best for your situation.

### With `go build`

Your Cosmos blockchain project is at heart a Go project, so you can build it with a `go build` command.

First, you need to locate your `func main()`. In fact, you may have more than one. For instance, choose the one in `cmd/myprojectd/main.go`:

```sh
$ env GOOS=linux GOARCH=amd64 go build -o ./build/myproject-linux-amd64 ./cmd/myprojectd/main.go
$ env GOOS=linux GOARCH=arm64 go build -o ./build/myproject-linux-arm64 ./cmd/myprojectd/main.go
$ env GOOS=darwin GOARCH=amd64 go build -o ./build/myproject-darwin-amd64 ./cmd/myprojectd/main.go
```

This is all you need to do. If your computer is of the `linux/amd64` platform type, you can run:

```sh
$ ./build/myproject-linux-amd64
```

This should return something you will recognize:

```txt
Stargate CosmosHub App

Usage:
  myprojectd [command]

Available Commands:
  add-genesis-account Add a genesis account to genesis.json
  collect-gentxs      Collect genesis txs and output a genesis.json file
  config              Create or query an application CLI configuration file
...
```

### With Ignite

Whether you prepared your project with or without Ignite, you can still [build it with Ignite](https://docs.ignite.com/cli#ignite-chain-build). To see how to write a build command you can do:

```sh
$ ignite chain build --help
```

You need to adjust the syntax of targets from `linux/amd64` to `linux:amd64`. Also, to give a path for the built files. In a project made by Ignite, `release` is already added to the `.gitignore` so it is as good a choice of build folder as any other.

```sh
$ ignite chain build \
    --release.targets linux:amd64 \
    --release.targets linux:arm64 \
    --release.targets darwin:amd64 \
    --output ./release \
    --release
```

This creates zipped files and checksums:

```txt
myproject_linux_amd64.tar.gz
myproject_linux_arm64.tar.gz
myproject_darwin_amd64.tar.gz
release_checksum
```

The checksum file contains:

```txt
60669d05ba56104d4d999e147c688b228efee93aad9829c1d8418e4ba318ea56 myproject_linux_amd64.tar.gz
2fd5f17498dcc2697a276821a0fa4d24d5d80a924f7a092f2d07b7bdd6b661f8 myproject_linux_arm64.tar.gz
67f760ac8964a4abe684ec272b34abb9658b103468a960fced12e4f148030a1e myproject_darwin_arm64.tar.gz
```

If you want to confirm a match between the written checksum values and their calculated values, run:

```sh
$ cd release && sha256sum -c release_checksum
```

This should output:

```txt
myproject_linux_amd64.tar.gz: OK
myproject_linux_arm64.tar.gz: OK
myproject_darwin_amd64.tar.gz: OK
```

The checksum is performed on the zipped file, not the executable itself. This is just as well as you can expect to send the zipped file around. When on the computer where it needs to run, you can unzip it with:

```sh
$ tar xzf myproject_linux_amd64.tar.gz
```

This creates a `myprojectd` executable file.

### With a Makefile

A [`Makefile`](https://tutorialedge.net/golang/makefiles-for-go-developers/) is just a way to keep track of potentially complex commands and summon them with simpler commands. Create your own `Makefile` in the root folder of your project with:

```make
build-all:
    GOOS=linux GOARCH=amd64 go build -o ./build/myproject-linux-amd64 ./cmd/myprojectd/main.go
    GOOS=linux GOARCH=arm64 go build -o ./build/myproject-linux-arm64 ./cmd/myprojectd/main.go
    GOOS=darwin GOARCH=amd64 go build -o ./build/myproject-darwin-amd64 ./cmd/myprojectd/main.go

do-checksum:
    cd build && sha256sum myproject-linux-amd64 myproject-linux-arm64 myproject-darwin-amd64 > myproject_checksum

build-with-checksum: build-all do-checksum
```

<HighlightBox type="note">

Note the lines that add a checksum file as does Ignite. Also, make sure that if you copy paste you have a <kbd>Tab</kbd> before each command and not spaces.

</HighlightBox>

If you do not have it yet, install the `make` tool. For instance, on Ubuntu:

```sh
$ sudo apt-get install --yes make
```

With `make` you can then call a build with checksums with:

```sh
$ make build-with-checksum
```

If you want to see what a vastly more complex `Makefile` looks like, head to the [Cosmos Hub's own `Makefile`](https://github.com/cosmos/gaia/blob/main/Makefile).

### With a Makefile within Docker

If you do not want to install Go or `make` on your build computer, and [have Docker](https://docs.docker.com/engine/install/), you can:

* Reuse the `Makefile` from above.
* Pick a Docker image that already has Go 1.18.3 and `make`. [`golang:1.18.3`](https://hub.docker.com/layers/golang/library/golang/1.18.3/images/sha256-ea66badd7cf7b734e2484a1905b6545bd944ef3bdeea18be833db3e2219f1153?context=explore) is a good choice.

Run the command:

```sh
$ docker run --rm -it \
  -v $(pwd):/myproject \
  -w /myproject \
  golang:1.18.3 \
  make build-with-checksum
```

## Deploy

**To keep? To modify?**

Eventually, you will run these executables on computers. The command will be a perhaps-complex version of:

```sh
$ myprojectd start
```

By default, Tendermint and the Cosmos app are launched together, run together, and communicate via sockets. This is the recommended way of launching. It is not the only way of launching, though.

You can launch the Tendermint and the Cosmos app separately, and even on different computers. If you do so, ensure that only your Tendermint app can contact the Cosmos app on the ABCI.

For instance:

* To start only the Tendermint node, run:

  ```sh
  $ myprojectd start --proxy_app tcp://192.168.0.5:26658
  ```

  Where `192.168.0.5` is the address where you launch the Cosmos app.

* To start only the Cosmos app, you run:

  ```sh
  $ myprojectd start --with-tendermint=false --abci grpc --address tcp://192.168.0.5:26658
  ```

Again, this is not recommended for performance reasons - for example, due to network latency.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to build the binary that the nodes will run, using `go build`, Ignite CLI, a `Makefile`, or a `Makefile` within Docker.
* Different methods of deploying, such as by launching Tendermint and the Cosmos app simultaneously, or by starting either one independently of the other.
* The importance of ensuring the binary will run equally well on computers using different OS and CPU types.

</HighlightBox>
