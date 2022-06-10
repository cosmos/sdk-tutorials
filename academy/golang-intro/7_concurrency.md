---
title: "Concurrency in Go"
order: 
description: 
tag: deep-dive
---

# Concurrency in Go

Go has built-in concurrency. Concurrency and parallel execution are different things: you need concurrency (*program structure*) to enable parallel execution; actual parallelism during execution depends on hardware. 

For concurrency, Go offers so-called *Goroutines* and *Channels*.


## Goroutines

A *Gouroutine* is a concurrent thread managed by the Go runtime. 

To call a goroutine use the following:

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

If you run this programm, you will see that both `doSomething(10)` functions work concurrently. You can wait with `time.Sleep(10*time.Second)` to see this in action.


## Channels

Go offers *channels* for commincation between goroutines. Channels may be buffered or unbuffered. You can create an *unbuffered* channel with the following:

```golang
ch:= make(chan type)
```

You can use this channel to send and receive messages with the `<-` operator. 

**Send to** channel `ch` as follows:

```golang
ch <- v
```

**Read from** channel `ch` as follows:

```golang
v := <-ch
```

Now write an example using channels:

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

Run this programm. What happened?

In this case you don't need to use `time.Sleep` anymore, because sends and receives are blocked until the other side is ready. 

To avoid blocking, you can create *buffered* channels:

```golang
c:= make(chan int, 100)
```

When a buffered channel is full, sends to it are blocked. When one is empty, receives from it are blocked.

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

[Test it online](https://go.dev/play/p/uYYXtXOO-72).

</HighlightBox>

Always close the channel (c) before you iterate over it. If you want to wait for multiple communication operations, Go offers `select`. This works similar to `switch`:

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

**Further reading:**

Look into Mutexes, which we did not talk about here. This can be important for managing concurrency:

* [Dancing with Go's Mutexes](https://hackernoon.com/dancing-with-go-s-mutexes-92407ae927bf)
* [Go by example](https://gobyexample.com/mutexes)

</HighlightBox>