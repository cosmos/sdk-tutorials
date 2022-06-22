---
title: "Go Introduction - Standard Packages in Go"
order: 8
description: fmt, strconv, and errors
tag: deep-dive
---

# Standard Packages in Go

Like other languages, Go offers a lot of useful standard packages. You will look at:

1. *fmt*
2. *strconv*
4. *errors*

## fmt

*fmt* (format) implements are formatted I/O - you covered a good number of its *verbs* in module 1. Now you will see a range of additional useful verbs:

* `%%`  for the percent sign
* `%#v` for the Go-syntax representation
* `%t`  for a boolean; it formats a value as `true` or `false`
* `%b`  for an integer; it formats the integer to its binary representation
* `%c`  for an integer; it formats the integer to its corresponding Unicode character

If you use an invalid verb, you will get a string beginning with `"%!"` and a description.

To write to `stdout`:

1. `func Print(a ...interface{}) (n int, err error)` formats with default formats.
2. `func Println(a ...interface{}) (n int, err error)` formats with default formats and appends a newline.
3. `func Printf(format string, a ...interface{}) (n int, err error)` formats with given format.

These three functions return the number of bytes written and any applicable error.

To read from `stdin`:

1. `func Scan(a ...interface{}) (n int, err error)` parses using default formats. Values are space-separated. Newlines count as spaces.
2. `func Scanln(a ...interface{}) (n int, err error)` parses using default formats and stops at a newline.
3. `func Scanf(format string, a ...interface{}) (n int, err error)` parses using the given format. The verb `%c` matches every rune (space, tab, newline, etc.).

These three functions return the number of items scanned and an error if the count of items parsed is smaller than the count of arguments.

Perhaps you noticed a kind of function declaration we did not speak about: the *variadic function* can be called with any number of arguments. You can iterate over the arguments as follows:

```golang
func variadicFunction(a ...interface{}) {
    for _,s:= range a {
        // do something
    }
}
```

There are formatting functions on *io.Writer* and *io.Reader*, so we also have:

1. `func Fprint(w io.Writer, a...interface{}) (n int, err error)`: same as `Print` but writes to `w`.
2. `func Fprintln(w io.Writer, a...interface{}) (n int, err error)`: same as `Println` but writes to `w`.
3. `func Fprintf(w io.Writer, a...interface{}) (n int, err error)`: same as `Printf` but writes to `w`.
4.  `func Fscan(r io.Reader, a...interface{}) (n int, err error)`: same as `Fscan` but scans from `r`.
5. `func Fscanln(r io.Reader, a...interface{}) (n int, err error)`: same as `Fscanln` but scans from `r`.
6. `func Fscanf(r io.Reader, a...interface{}) (n int, err error)`: same as `Fscanf` but scans from `r`.

`io.Writer` is the interface that declares the `Write` method. `io.Reader` is also an interface and it declares the `Read` method.

The functions `Sprint`, `Sprintln`, and `Sprintf` are similar to `Print`, `Println`, and `Printf`, with the difference that they return a `string` instead of writing to `stdout`.

The functions `Sscan`, `Scanln`, and `Sscanf` are similar to `Fscan`, `Fscanln`, and `Fscanf` with the difference that they scan from a `string` given as an argument.

The function `Errorf` formats according to a format and returns it as an error.

<HighlightBox type="reading">

**Further readings:**

* [String formatting example](https://gobyexample.com/string-formatting)
* [Go walkthrough fmt](https://medium.com/go-walkthrough/go-walkthrough-fmt-55a14bbbfc53)
* [Regular expressions example](https://gobyexample.com/regular-expressions)
* [JSON example](https://gobyexample.com/json)
* [Io writer interface](https://medium.com/@as27/a-simple-beginners-tutorial-to-io-writer-in-golang-2a13bfefea02)

</HighlightBox>

## strconv

The package *strconv* offers conversions to and from strings of basic data types.

### Convert from string

Start with an example for using [strconv](https://golang.org/pkg/strconv):

```golang
package main
import (
    "fmt"
    "strconv"
)
func main() {
    v32 := "-354634382"
    if s, err := strconv.ParseInt(v32, 10, 32); err == nil {
        fmt.Printf("%T, %v\n", s, s)
    }
    if s, err := strconv.ParseInt(v32, 16, 32); err == nil {
        fmt.Printf("%T, %v\n", s, s)
    }
    v64 := "-3546343826724305832"
    if s, err := strconv.ParseInt(v64, 10, 64); err == nil {
        fmt.Printf("%T, %v\n", s, s)
    }
    if s, err := strconv.ParseInt(v64, 16, 64); err == nil {
        fmt.Printf("%T, %v\n", s, s)
    }
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/GXstxF-6XVO).

</HighlightBox>

* The function `ParseInt(s string, base int, bitSize int) (i int64, err error)` interprets `s` as an integer in base `base`, from `2` to `36`; and with type `bitSize`, whereby `0` means `int`, `8` means `int8`, `16` means `int16`, `32` means `int32`, and `64` means `int64`.
* `ParseUint` is similar, with the difference that it returns an unsigned integer.
* The `func Atoi(s string) (int, error)` returns `ParseInt(s, 10, 0)` as type `int`.

### Convert to string

1. `func FormatBool(b bool) string` returns `"true"` or `"false"` according to `b`.
2. `func FormatFloat(f float64, fmt vyte, prec, bitSize int) string` returns a string representation of `f` with format `fmt` and with precision `prec`.
3. `func FormatInt(i int64, base int) string` returns the string representation of `i` in base `base`.
4. `func FormatUint(i uint, base int) string` is the same as `FormatInt`, but it takes a unsigned integer.
5. `func Itoa(i int) string` is shorthand for `FormatInt(int64(i), 10)`, so it gives a decimal representation of `i` as a string.

<HighlightBox type="reading">

**Further reading:**

* [Go walkthrough - includes also string operations](https://gobyexample.com/string-formatting)

</HighlightBox>

## Errors

In Go, errors are values. The convention is that the last return value of a function is the error. This is the entire code of errors package:

```golang
// Copyright 2011 The Go Authors. All rights reserved.
  // Use of this source code is governed by a BSD-style
  // license that can be found in the LICENSE file.
  
 // Package errors implements functions to manipulate errors.
  package errors
  
 // New returns an error that formats as the given text.
  func New(text string) error {
      return &errorString{text}
  }
  
 // errorString is a trivial implementation of error.
  type errorString struct {
      s string
  }
  
 func (e *errorString) Error() string {
      return e.s
  }
```

You use `func New(text string) error` to create an error. An example is as follows:

```golang
package main
import (
    "errors"
    "fmt"
)
func div(a, b float64) (float64, error) {
    if b == 0 {
        return -1, errors.New("can't perform division by zero")
    }
    return a / b, nil
}
func main() {
    for i := 2.; i >= -2; i = i - 0.5 {
        if x, err := div(3, i); err != nil {
            fmt.Println(err)
        } else {
            fmt.Printf("3/%v=%v\n", i, x)
        }
    }
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/k9U_6uCkL1r).

</HighlightBox>

In this case, `nil` means no error. For best practice, you should always check for errors. However, take the time to review the following list, because Go error handling differs from other languages.

<HighlightBox type="reading">

**Further reading:**

* [A tour of Go](https://tour.golang.org/)

</HighlightBox>

## Next up

Before diving into running a node, take a look at Go's built-in concurrency by exploring _Goroutine_ and _channels_ in the [next section](./7_concurrency.md).

