---
title: "Concurrency in Go"
order: 
description: 
tag: deep-dive
---

# Concurrency in Go

Go has built-in concurrency. Note, that concurrency and parallel execution are different things; you need concurrency (*program structure*) to enable parallel execution. Actual parallelism during execution depends on hardware. 

For concurrency, Go offers so called *Goroutines* and *Channels*.

## Goroutines

A *Gouroutine* is a concurrent thread managed by the Go runtime. 

Let's see, how to call a goroutine:

```golang
package main

import (
    "fmt"
    "time"
)

func doSomething(size int) {
    for i := 0; i < size; i++ {
        fmt.Println(i)
        time.Sleep(time.Second)
    }
}

func main() {
    go doSomething(10) // go statement before a function creates a goroutine
    go doSomething(10)
    time.Sleep(10*time.Second)
}

```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/6c1vJ2Xz9WB).

</HighlightBox>

If you run this programm, you will see, that both `doSomething(10)` functions work concurrently. We wait with `time.Sleep(10*time.Second)` to see this in action. 

## Channels

Go offers *channels* for commincation between goroutines. Channels may be buffered or unbuffered. First, let's see how we can create an *unbuffered* channel:

```golang
ch:= make(chan type)
```

Now, we can use this channel to send and receive messages. We use the `<-` operator:

```golang
ch <- v
```

to send to channel `ch` and:

```golang
v := <-ch
```

to read from channel `ch`.

Ok let us write an example using channels:

```golang
package main

import (
    "fmt"
    "time"
)

func doSomething(size int, c chan int) {
    for i := 0; i < size; i++ {
        time.Sleep(100 * time.Millisecond)
    }
    c <- size
}

func main() {
    c := make(chan int)
    go doSomething(10, c)
    go doSomething(20, c)
    go doSomething(30, c)
    
    x, y, z := <-c, <-c, <-c
    fmt.Println(x, y, z)
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/MYdZRhyG36y)

</HighlightBox>

Run this programm. What happened there?

We don't need to use `time.Sleep` anymore because sends and receives block until the other side is ready. To avoid blocking, one can create *buffered* channels.

```golang
c:= make(chan int, 100)
```

When a *buffered* channel is full, sends block. When and if it is empty the channel receives blocks.

You can iterate over the values of a channel, if it is closed:

```golang
package main

import (
    "fmt"
    "time"
)

func doSomething(size int, c chan int) {
    for i := 0; i < size; i++ {
        time.Sleep(100 * time.Millisecond)
    }
    c <- size
}

func doAll(c chan int) {
    d:= make(chan int)
    go doSomething(10, d)
    go doSomething(20, d)
    go doSomething(30, d)
    c <- (<-d)
    c <- (<-d)
    c <- (<-d)
    close(c)
}

func main() {
    c := make(chan int)
    
    go doAll(c)
    for i := range c {
        fmt.Println(i)
    }
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/uYYXtXOO-72)

</HighlightBox>

Don't forget to close the channel (c) before you iterate over it. If you want to wait for multiple communication operations, Go offers `select`. It works similar to `switch`:

```golang
package main

import (
    "fmt"
    "time"
)

func doSomething(size int, c chan int) {
    for i := 0; i < size; i++ {
        time.Sleep(100 * time.Millisecond)
    }
    c <- size
}

func main() {
    c, q := make(chan int), make(chan int)
    jobs := 5

    go func() {
        for i := 1; i <= jobs; i++ {
            doSomething(i*10, c)
        }
        q <- 0 // done
    }()

    for {
        select {
        case x := <-c: // if we have a result
            fmt.Println(x)
        case <-q: // if we are done
            fmt.Println("Finished")
            return
        default: // if we are waiting
            fmt.Print("...")
            time.Sleep(time.Second)
        }
    }
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/BExHhvrWp5Z).

</HighlightBox>

The default case will run if no other channel is ready. 

<HighlightBox type="reading">

**Further readings:**

Have a look into Mutexes, which we did not talk about. This can be important for managing concurrency:

* [Dancing with Go's Mutexes](https://hackernoon.com/dancing-with-go-s-mutexes-92407ae927bf)
* [Go by example](https://gobyexample.com/mutexes)

</HighlightBox>