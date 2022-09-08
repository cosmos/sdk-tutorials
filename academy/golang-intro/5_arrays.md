---
title: "Arrays and Slices in Go"
order: 6
description: A closer look at arrays and slices
tag: deep-dive
---

# Arrays and Slices in Go

In this section, arrays and slices are introduced.

## Arrays

In Go, the size of an array is a part of the type. Therefore, arrays have a fixed size. The declaration has the following syntax:

```golang
var array [size]type
```

You can access the data with `array[index]`. You can see this with a cross product:

```golang
package main
import (
    "fmt"
)
func main() {
    v1 := [3]float64{7, 5, 4}
    var v2 [3]float64
    v2 = [3]float64{2, 4, 6}
    for v3,i := [...]float64{0, 0, 0}, 0; i < len(v3); i++ {
        v3[i] = v1[(i + 1) % 3] * v2[(i + 2) % 3] - v1[(i + 2) % 3] * v2[(i + 1) % 3]
        defer fmt.Printf("%t\n", v3)
    }
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/dHKzLGNNjxC).

</HighlightBox>

The compiler fits the array depending on the number of elements.

<HighlightBox type="note">

The previous example code is not well-written, but it demonstrates different aspects of arrays.
<br></br>
`len(array)` is a built-in function that gives the size of an array.
<br></br>
`defer` is used to defer the execution of last-in-first-out order until surrounding functions return.

</HighlightBox>

## Slices

In Go, a *slice* is an abstraction built on top of arrays. Slices are more flexible than arrays and are used more often than arrays because of this flexibility.

A slice does not have a fixed size. To declare a slice, use the following:

```golang
var slice []type
```

A slice has a length (`len(slice)`) and a capacity (`cap(slice)`).

You can also use a built-in function to declare a slice: `func make([]type, length, capacity) []type`. This returns a slice with the given length, capacity, and type. It allocates an array, which is referred to by the returned slice.

Now create a simple slice with three vectors, and then add a vector with the built-in `func append(s []T, vs ...T) [] T` function:

```golang
package main
import "fmt"
func main() {
    vectors := []struct {
        x,y,z float64
    } {
        { 1, 2, 3 },
        { 3.2, 4, 6 },
        { 4, 3, 1},
    }
    fmt.Printf("type %#T and value %v\n", vectors, vectors)
    vectors = append(vectors, struct{ x, y, z float64 }{ 7, 7, 7 })
    fmt.Printf("type %#T and value %v\n", vectors[3:], vectors[3:])
    fmt.Printf("type %#T and value %v\n", vectors[3], vectors[3])
    for i, v := range vectors {
        fmt.Println(i, " : ", v)
    }
    numbers := make([]int, 10, 10) // create a slice with an underlying array
    fmt.Println(numbers)
    for i := range numbers {
        numbers[i] = i
    }
    fmt.Println(numbers)
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/T8Ppscz5YjO).

</HighlightBox>

You can use `range` to iterate over an array, a slice, or a map. `i` is the index, and `v` is the value of that index.

There is also a built-in `func copy(dst, src []T) int` to copy one slice into another and return the number of copied elements.

## Maps

Maps are stored key/value pairs. The declaration is as follows:

```golang
var m map[keyType]valueType
```

However, this creates a `nil` map, which is not so useful. You can read such a map but not write to it. You use `make` to initialize a map so you can write to it. The following is more useful:

```golang
m := make(map[keyType]valueType)
```

Now you can work with maps:

```golang
package main
import "fmt"
func main() {
    age := map[string]int {"max": 24, "tom": 28}
    fmt.Println("map:", age)
    m := make(map[string]float64)
    m["E"]  = 2.7182818284
    m["Pi"] = 3.1415926535
    m["Phi"]= 1.6180339887
    
    for key, v := range m {
        fmt.Printf("Key: %v, Value: %v, Value: %v \n", key, v, m[key])
    }
    delete(m, "E") // does not return anything. It does nothing, if the key does not exist.
    fmt.Println("len:", len(m))
    fmt.Println("map:", m)
    
    _, ok := m["E"] // does the key exists?
    fmt.Println("ok:", ok)
}
```

<HighlightBox type="tip">

[Test it online](https://go.dev/play/p/1Ny9l13nHUg).

</HighlightBox>

The built-in function `func delete(m map[Type]Type1, key Type)` deletes the element with the key from the map.

<HighlightBox type="warn">

When iterating over maps, the order is not deterministic.

</HighlightBox>

<HighlightBox type="reading">

**Further reading:**

* [Go slices](https://blog.golang.org/go-slices-usage-and-internals)

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How the size of an array is part of the type, therefor arrays have a fixed size.
* How slices are flexible abstractions built on top of arrays. 
* How maps are stored key/value pairs.

</HighlightBox>

<!--## Next up

After discovering slices and arrays, you can now dive into some of the useful standard packages Go offers. In the [next section](./6_packages.md), you can explore _fmt_, _strconv_, and _errors_.-->
