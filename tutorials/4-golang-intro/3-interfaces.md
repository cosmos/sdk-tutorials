---
title: "Go Interfaces"
order: 4
description: Get an overview of interfaces in Go
tags: 
  - tutorial
---

# Go Interfaces

It is time to look at interfaces in Go. After that, you will briefly examine testing in Go.

Go offers the so-called "interface type". This is a collection of method signatures. An interface value can hold any value that implements those methods. Try it:

```golang
package main
import (
    "fmt"
    "math"
)
type Vector3D struct {
    x, y, z float64
}
type Vector2D struct {
    x, y float64
}
type Number float64
type Euclid interface {
    Norm() float64
}
func (v Vector3D) Norm() float64 {
    return math.Sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
}
func (v Vector2D) Norm() float64 {
    return math.Sqrt(v.x*v.x + v.y + v.y)
}
func (n Number) Norm() float64 {
    if n > 0 {
        return float64(n)
    }
    return -float64(n)
}
func main() {
    var v Euclid
    v = Vector3D{1, 2, 3}
    fmt.Println(v.Norm())
    v = Vector2D{1, 2}
    fmt.Println(v.Norm())
    v = Number(-2.5)
    fmt.Println(v.Norm())
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/lOEgFlWL2JI).

</HighlightBox>

You see the declaration of the three types and methods as before. You have also declared an additional interface, `Euclid`, which includes a method signature `Norm() float64`. Since all defined types implement the `Norm` method, You can now use the `Euclid` interface to hold the instances of those types.

There is a special empty interface: `interface{}`. Because it has no method signatures, it is implemented by all types and can be used to hold values of any type:
    
```golang
package main
import "fmt"
func main() {
    var i interface{}
    i = 2
    fmt.Println(i)
    i = "Test"
    fmt.Println(i)
    s, ok := i.(string)
    fmt.Println(s, ok)
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/p9bTIVlCPfr).

</HighlightBox>

The syntax for direct access to the underlying value of the interface value is `i.(T)`. This is useful for *type switches*. In the next module, you will learn the control constructs.

## Simple unit test

Go offers the testing package `testing` and a tool called `go test`. These are very helpful.

To explore the basics, first, write a function `sum`. This is the function you will test:

```
package sumutil
func Sum(a,b int) (s int) {
    for i:=a; i<=b; i++ {
        s+=i
    } 
    return
}
```

You should be able to see what this does and know that it probably works. Even so, you should test it.

Save the previous program as `sum.go` in a folder `sumutil`. Then make another file with the following:

```
package sumutil
import "testing"
func TestSum(t *testing.T) {
    cases := []struct {
        start, end, result int
    }{
            { 5, 6, 11 },
            { 1, 9, 45 }, // (1+9)+(2+8)+(3+7)+(4+6)+5=45
            { 0, 9, 45 }, 
            { 1, 3, 6 },
            { 10, 19, 145 }, // 10+(10+1)+(10+2)+...+(10+9)=
                         // 10*10+sum(1,9)=145
    }
    for _, c := range cases {
        if got := Sum(c.start, c.end); got != c.result {
            t.Errorf("Sum(%v,%v) got %v, want %v", c.start, c.end,got, c.result)
        }
    }
}
func BenchmarkSum(b *testing.B) {
    for i:=0; i<b.N; i++ {
        Sum(0,i)
    }
}
```

Save this file as `sum_test.go`. Now run `go test`.

You will see that it passes the test.

<HighlightBox type="note">

A test function has the syntax `TestXXX`.
<br/><br/>
A benchmark function has the syntax `BenchXXX`.

</HighlightBox>

Use `go test -help` to see what you need to run benchmarks.

## Rob demonstrates Go interfaces

<YoutubePlayer videoId="F3k9lGOuLnw"/>

<HighlightBox type="reading">

**Further readings:**

* [Testing package](https://golang.org/pkg/testing/)
* [Writing unit tests](https://blog.alexellis.io/golang-writing-unit-tests/)

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How the "interface type" offered by Go is a collection of method signatures, and an interface value is used to implement those methods.
* How the `Euclid` interface can hold instances of all defined types implementing the `Norm` method.
* How the special empty interface `interface{}` can be implemented by all types and hold values of any type because it has no method signatures.
* How to use Go's testing package `testing` and the `go test` tool.

</HighlightBox>

<!--## Next up

Basics and interfaces are covered, what's next? Take a closer look at the control structures in Go by diving into `if`, `switch`, and `for` statements in the [next section](./4-control.md).-->

