---
title: "Control Structures in Go"
order: 
description: 
tag: deep-dive
---

# Control Structures in Go

Let's talk about control structures in Go. You will start with the `if` statement.

## `if` statement

The syntax is:

```golang
if boolean_expression_1 {
    // execute, if boolean_expression_1 is true
} else if boolean_expression_2 {
    // execute, if boolean_expression_1 is false but boolean_expression_2 
    // is true
// } else if ...
} else if boolean_expression_n {
    // execute, if boolean_expression_1, ... , boolean_expression_(n-1) are
    // false, but boolean_expression_n is true
} else {
    // execute, if boolean_expression_1, ... , boolean_expression_n are false
}
```

You need brackets `{}` for each `if` statement. The `{` bracket needs to be on the same line as the `if` statement. If you want to use an `else if` or `else` statement, note that they have to be on the same line as the `}` bracket of the previous block. We can also give `if` or `else if` a short statement to execute before the condition:

```golang
if s := 10%2; s==0 {
    fmt.Println(s)
}
```

Boolean expressions evaluate for `true` or `false`. The comparison operators are:

```golang
== equal
!= not equal
< less
<= less or equal
> greater
>= greater or equal
```

The `if` statement is also used for error handling. So, you will often see code like:

```golang
 if err != nil {
        fmt.Printf(err)
    }
```

## `switch` statement

The syntax of a `switch` statement is:

```golang
switch expression {
    case value_1:
        // do something if expression is equal to value_1
    case value_2:
        // do something if expression is equal to value_2
    // ...
    case value_n:
        // do something if expression is equal to value_n
    default:
        // do something if value_1 ... value_n does not match expression
}
```

Cases are evaluated from top to bottom. The `switch` finishes, if a `case` succeeds. Note that, `values_x` must have the same type as `expression`.

If you do not give an expression to `switch`, then Go interprets it as `switch true`. This gives us another way to write `if-else if-else` chains:

```golang
switch {
    case boolean_expression_1:
        // if true is equal to boolean_expression_1
        // which is the same as if boolean_expression_1 is true.
    case boolean_expression_2:
        // else if
    // ...
    case boolean_expression_n:
        // else if
    default: 
        // else
}
```

<div class="b9-warning">
Unlike other languages (like <code>C</code>), you don't need to use <code>break</code> to avoid fall-through. In Go, you need to <code>fallthrough</code> explicity. <code>fallthrough</code> will enter the next case, even if the expression does not match.
</div>

There are so-called type switches in Go:

```golang
var i interface{}
switch i.(type) {
    case bool:
        // if i has type bool
        fmt.Printf("Value of i is %v\n", i.(bool))
    case int32, in64:
        // ...
    // ...
    default:
        // i has another type
}
```

One last thing: You can use multiple value cases like `case 1, 2, 4, 9, 16:`.

## `for` statement

`for` is the only looping statement in Go. The syntax is:

```golang
for init_statement; condition_expression; post_statement {
    // do something
}
```

Before the iterations starts, it will first execute the `init_statement`. 
The loop body will be executed as long as `condition_expression` is true. The `post_statement` will be executed at the end of every iteration.

Note, that `init_statement` and `post_statement` are optional - Without them, the `for` statement is like the `while` statement in other languages.

You can use `continue` to skip the iteration or `break` to terminate the execution, like in C, C#, Java etc.

<HighlightBox type="reading">

**Further reading:**

* [Errors are values](https://blog.golang.org/errors-are-values)

</HighlightBox>
