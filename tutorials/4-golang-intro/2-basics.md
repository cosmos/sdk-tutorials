---
title: "Go Basics"
order: 3
description: Basic types, string formatting, functions, and methods
tags: 
  - tutorial
---
# Go Basics

This section introduces basic types and string formatting. After that, you will dive into functions and methods in Golang.

## Numbers

Integer types are:

```golang
int         int8        int16       int32       int64
uint        uint8       uint16      uint32      uint64      uintptr
```

* **int** will be 32 or 64 bits long depending on the OS. However, one can specify precisely how many bits are used with 8, 16, 32, and 64.
* **uint** defines the unsigned integers, which are simply positive integers.

There are two aliases:

* **byte** for **uint8**
* **run** for **int32**
* **uintptr** is an integer ["to hold the bit pattern of any pointer"](https://golang.org/pkg/builtin/#uintptr).

The types for floating-point arithmetic are `float32` and `float64`. These are only an *approximation* for real numbers because of the [finite precision](https://en.wikipedia.org/wiki/Floating-point_arithmetic#Accuracy_problems).

`complex64` and `complex128` represent complex numbers. These are useful in geospatial coordinate systems and scientific applications, among others. They have "real" and "imaginary" parts that are always `floats`. When the real and imaginary parts are `float32`, the complex number is a `complex64`. Likewise, when the real and imaginary parts are `float64`, the complex number is a `complex128`.

## Strings

In Go, a `string` is a read-only sequence of bytes. Therefore strings are immutable. They're encoded in UTF8 by default.

## Booleans

A `bool` is a special 1-bit integer. It can represent `true` or `false`.

## Type declaration

In Go, the name comes before the type in the declaration. There are two ways to initialize a variable in Go.

First:

```golang
var s string = "initial"
```

Second:

```golang
s := "initial"
```

You can also use **var** to define variables without initialization:

```golang
var (
    a, b int
    s string
    c complex64
)
```

This is equivalent to:

```golang
var a, b int
var s string
var c complex64
```

Without initialization, variables have so-called *zero values* which depend on their type.

To define constants, you must use the `const` keyword instead of `var` or `:=` keywords.

<HighlightBox type=note>

Constants can be *typed* or *untyped*. For example, an untyped constant:

```golang
const hello = "Hello, World!"
```

The untyped constant means that the type of `hello` is not defined yet.

</HighlightBox>

Because of static types in Go, you have more freedom with untyped constants than with typed ones. Compare the following two examples:

```golang
const number = 2
var f float64 = number
```

This first example **works**: the "number" constant is untyped, so the variable "f" can accept it (despite itself being typed `float64`).

```golang
const number int = 2
var f float64 = number
```

This second example **does not work**: the "number" constant and the variable "f" are differently typed (`int` and `float64` respectively).

## String formatting

`fmt.Printf` writes to standard output and returns the number of bytes written and the write error. The string formatting is:

```golang
%v for a value, which will be converted into a string with default options. 
%T for the type of a value
%x for the hex encoding
%d for integer
%f for float, %e and %E for scientific notation
%s for string
%p for the pointer address of the variable
```

Here is an example code:

```golang
package main
import "fmt"
func main() {
    a, b := 2, 3
    c := float64(a + b)
    fmt.Printf("%v + %v = %f = %v, stored as %T", a, b, c, c, c)
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/7Uvyt1jI-5r).

</HighlightBox>

Compile this to see the output.

## Functions

Functions can take zero or more arguments and can return zero or more arguments. The syntax looks like the following:

```golang
func myFunc(v1, v2 type12, v3 type3, v4 type3,....) (ret1 returntype1, ret2 returntype2, ...) {
    return
}
```

If return variable names are given in the declaration, you do not need to explicitly return them.

For example, consider a swap function that switches the values of `x` and `y`:

```golang
func swap(x, y string) (string, string) {
    return y, x
}
```

You could also write:

```golang
func swap(x, y string) (r1 string, r2 string) {
    r1, r2 = y, x
    return
}
```

Go also offers function closures:

```golang
func fibonacci() func() int {
    x, y := 0, 1
    return func() int {
        x, y = y, x + y
        return x
    }
}
```

Let's walk through `func fibonacci()` in more detail:

1. Go supports *anonymous functions*, which you return.
2. You declare `x` and `y` inside `fibonacci()`, and use them inside the *anonymous function*.

<HighlightBox type="note">

`x, y = y, x + y` works because the right side is evaluated fully before the left side.

</HighlightBox>

Now write less idiomatic code to highlight some more aspects:

```golang
package main
import "fmt"
func fibonacci() func() int {
    x, y := 0, 1
    return func() int {
        x, y = y, x + y
        return x
    }
}
func loop(n int, f func() int) {
    if n > 0 {
        fmt.Println(f())
        loop(n - 1, f)
    }
}
func main() {
    loop(10, fibonacci())
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/Y9LnhYgirCZ).

</HighlightBox>

This will print the first 10 Fibonacci numbers.

<HighlightBox type=note>

Important here is that `fibonacci()` returns a function, and this function is passed into `loop()` as `f`. On subsequent iterations, `loop(n-1,f)` passes this anonymous function into itself recursively.

</HighlightBox>

Here you used the control statement `if` for the first time, to break out of the recursion. Each `fibonacci()`, stored as `f` in `loop`, has its own `x` and `y` - this is called a **closure**. So, what happens if you split the loop into 2?

```golang
func main() {
    loop(5, fibonacci())
    loop(5, fibonacci())
}
```

This will give the first 5 Fibonacci numbers twice.

To get the first 10, try the following:

```golang
func main() {
    f:= fibonacci()
    loop(5, f)
    loop(5, f)
}
```

Do you see why that works?

## Methods

Methods are defined on types. Go does not have classes. First, define a structure type:

```golang
type Rectangle struct {
    a, b int
}
```

You can use this structure for a variable declaration:

```golang
r1 := Rectangle{2, 3}
```

You also have access to members through the `.` operator:

```golang
fmt.Println(r1.a, r1.b)
```

Now you can declare a method on it:

```golang
func (r Rectangle) Area() int {
    return r.a * r.b
}
```

Methods are functions, but they have a so-called *receiver* argument (in the previous example `r Rectangle`). You can use such a method with the `.` operator:

```golang
fmt.Println(r1.Area())
```

Do you see how `Area()` became a method of `Rectangle`?

<HighlightBox type=note>

You can declare a method with a receiver only in the same package as the type is defined.

</HighlightBox>

The following example is not declared on a `struct` type:

```golang
package main
import "fmt"
type MyNumber int
func (f MyNumber) Abs() MyNumber {
    if f <  0 {
        return -f
    }
    return f
}
func main() {
    f := MyNumber(2)
    fmt.Println(f.Abs())
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/6aMJsTmRm2S).

</HighlightBox>

Do you see how `Abs()` became a method of the new type, `MyNumber`?

## Pointer

A function argument is copied into the function. If you want to change the argument, you will require pointers. Pointers are addresses of variables. Look at an example:

```golang
func increase(i int) {
    i= i + 1
}
```

The following function will not change `i`:

```golang
increase(i int)
```

Instead, try it this way:

```golang
package main
import "fmt"
func increase(i int) {
    i = i + 1
}
func main() {
    i := 0
    fmt.Println(i)
    increase(i)
    fmt.Println(i)
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/Wkt9tVnlcun).

</HighlightBox>

The previous attempt will get the same result (`0`) twice. Nothing happened to `i`.

Now see what happens if you include a pointer:

```golang
package main
import "fmt"
func increase(i *int) {
    *i = *i + 1
}
func main() {
    i := 0
    fmt.Println(i)
    increase(&i)
    fmt.Println(i)
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/nCbLaAbRa49).

</HighlightBox>

Now you see that the value of `i` changes. What happened is as follows:

1. `&i` gives the address with type `*int`, which is a pointer and expected by the function `func increase(i *int)`.
2. `*i` is the value the pointer points to.

You can also use pointers in methods to modify the receiver:

```golang
package main
import "fmt"
type Rectangle struct {
    a, b int
}
func (r *Rectangle) doubleIt() {
    r.a *= 2
    r.b *= 2
}
func main() {
    r := Rectangle{3, 4}
    fmt.Println(r.a, r.b)
    r.doubleIt()
    fmt.Println(r.a, r.b)
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/khjFSJ0hsAE).

</HighlightBox>

<HighlightBox type=note>

`r.b` is the same as `(*r).b` in this context, but it is easier to read.

</HighlightBox>

Pointers are important.

## Rob demonstrates Go functions and methods on play.golang.org

<YoutubePlayer videoId="kaUULN0V4Gs"/>

<HighlightBox type="reading">

**Further readings:**

* [Go Playground](https://play.golang.org/)
* [Go by Example: Pointers](https://gobyexample.com/pointers)

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* The basic **types** (including numbers, strings, booleans, and type declarations), **string formatting**, **functions**, and **methods** employed in Golang.
* Where to access online tests to practice implementing some simple coding examples for yourself.

</HighlightBox>

<!--## Next up

Now that you covered your Go basics, get an overview of interfaces in Go in the [next section](./3-interfaces.md).-->
