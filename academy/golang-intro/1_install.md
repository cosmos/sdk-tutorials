---
title: "First Steps"
order: 2
description: Get started with Golang
tag: deep-dive
---

# Go Introduction - First Steps

Golang (Go) is an open-source, statically typed, and compiled programming language introduced by Google and first released in 2012. It has a BSD-style license. Its Git repository is located at [https://go.googlesource.com/go](https://go.googlesource.com/go).

Start with the basics. In this section, you will install Go and learn some general things about it.

## Install

Installing Go depends on your machine. See the [Getting Started page](https://golang.org/doc/install) and follow the instructions to install Go.

## Workflow

Go has a different workflow from most other programming tools. You have all Go dependencies contained in the `GOPATH`. You can print it by typing `$ go env GOPATH` in your console. For more information about `GOPATH`, type `$ go help gopath`.

A version control system is helpful because you have only one workspace. You should use Git for this.

## Hello, World!

Let's start with the ever-popular "Hello, World!" program. Let's see how it looks in Go:

```golang
package main
import "fmt"
func main() {
    fmt.Printf("Hello, World!\n")
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/1u5bSZlh80h).

</HighlightBox>

<HighlightBox type="info">

Function names determine visibility outside of packages. `Printf`'s first character is upper case and this means it's visible outside of `fmt`– a.k.a public. Package names are always written in lower case, like `fmt` (short for "format").

</HighlightBox>

Every Go program starts with the package declaration. Each package consists of one or more Go source files in a single directory. If the name of the package is `main`, Go creates an executable file.

After package declaration, import the package `fmt`. Note that the package name is the last element of the package's file path. For example, if you import the package "lib/math", then you use it as "math".

`fmt` implements input and output, and is part of Go's standard library. Later you are going to describe some of its functions in more detail.

Execution starts in the function called `main()`.

This function simply calls the Go I/O function `Printf()` from the package `fmt`.

Now compile this program. Create the file `hello.go` in a folder of your choice. In a terminal:

```
$ go mod init hello
$ go build
```

If all goes well, `go` builds the executable. Go only prints errors, so you should not see any output or another command prompt unless something goes wrong.

Now test your program:

```
./hello
```

<HighlightBox type="tip">

If you use `go install` instead of `go build`, Go installs the executable in `$GOPATH/bin/`.

</HighlightBox>

<HighlightBox type="reading">

**Further readings:**

* [Go's Getting Started Page](https://golang.org/doc/install)
* [Understanding Golang Packages](https://thenewstack.io/understanding-golang-packages/)

</HighlightBox>

## Next up

In the [next section](./2_basics.md), you can take a look at further Golang foundations and discover basic types, string formatting, functions, and methods.
