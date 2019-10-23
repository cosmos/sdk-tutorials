---
order: 1
---

# Introduction

If you have your go environment set up then you skip this part of the tutorial, if you do not please read the instructions below.

## Setups

### Mac

- If you are using a Mac then the easiest way and quickest way to install Golang is through [HomwBrew](https://brew.sh/). If you do not have Homebrew install I would recommend installing at as many application, not only Golang, use it for easy install.

Once HomeBrew is installed you can:

```bash
brew install go
```

- If you would like to not install HomeBrew then you can download the go binary [here](https://golang.org/doc/install).

After you have installed the binary:

```bash
tar -C /usr/local -xzf go$VERSION.$OS-$ARCH.tar.gz

export PATH=$PATH:/usr/local/go/bin
```

These instructions can be used for linux and FreeBSD.

### Windows

If you are using windows, there are instructions on how to download the binary as a zip [here](https://golang.org/doc/install#windows)

## Test

At this point you should have installed Golang, to test it out type:

```bash
go version
```

The output of this command should be the version of go you are using. The version is recommended to be 1.13+.
