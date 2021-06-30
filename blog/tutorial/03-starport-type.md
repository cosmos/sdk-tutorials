---
order: 3
---

# Use Starport type

Navigate to `http://localhost:12345`, and you'll see the landing page for your application. 


## What is `starport type`

As mentioned previously, you can use the `starport type` command to generate transaction types on-the-fly, adding the functionality you implemented earlier in the tutorial for the `post` type.

## Add a `comment` type

If you want to add functionality for users to comment on posts, that functionality requires creating a type `comment` that can be created when a user sends a `body` and a relevant `postID`. Instead of manually performing all the same changes you made earlier and modifying it to support `comment`, you can run the following command:

```
starport type comment body postID
```

This command creates and adds all the core functionality for the create, ready, update and delete (CRUD) transaction type `comment`, including registering entrypoints in `rest/` and `cli/`, as well as define the relevant `types`, `handler`, `messages`, `keeper`, and `proto`.


After this is done, run `starport chain serve`.

This command starts up your backend server, the consensus engine, and a frontend user interface. This information is available when you run your application and visit `localhost:12345`.
