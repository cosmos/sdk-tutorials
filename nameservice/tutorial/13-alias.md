---
order: 13
---

# Alias

Start by navigating to the `./x/nameservice/alias.go` file. The main reason for having this file is to prevent import cycles. You can read more about import cycles in go here: [Golang import cycles](https://stackoverflow.com/questions/28256923/import-cycle-not-allowed)

First start by importing the "types" folder you have created.

### There are three kinds of types we will create in the alias.go file.

- A constant, this is where you will define immutable variables.
- A variable, which you will define to contain information such as your messages.
- A type, here you will define the types you have created in the types folder.

<<< @/nameservice/x/nameservice/alias.go

Now you have aliased your needed constants, variables, and types. We can move forward with the creation of the module.

 Register your types in the Amino encoding format next.
