---
order: 8
---

# Errors Exercise

Errors are an important tool for all applications. We approach this by allowing the developer to set there own custom errors.

To start create an `errors.go` file

- You must create some constants starting with a DefaultCodeSpace (type sdk.CodespaceType) that will be used to debug from which module the error is coming.

- Now when you are you are defining the codes for the errors (type sdk.CodeType) of the application they predominately start with the number 100.

  - We will be defining four error types: CodeBidSmaller, CodeAuctionOver, CodeAuctionNotFound, CodeOwnerInvalid

- For each one of these error constants they have a function associated with them.

```go
func ErrType(codespace sdk.CodespaceType) sdk.Error {
  return sdk.NewError(codespace sdk.CodespaceType, code sdk.CodeType, format string, args ...interface{})
}
```

Now it is your turn to create the functions associated with the errors listed above.

### The next page will consist of the answer
