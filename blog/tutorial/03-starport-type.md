---
order: 3
---

# Use Starport type

Navigate to `http://localhost:12345`, and you'll see the landing page for your application. 


## What is `starport type`

As mentioned previously, we can use the `starport type` command to generate transaction types on-the-fly, adding the functionality we implemented earlier in the tutorial for the `post` type.

## Add a `comment` type

Let's say we want to add functionality for users to comment on posts, which would require creating a type `comment`, which can be created when a user sends a `body` and a relevant `postID`. Instead of manually performing all the same changes we made earlier and modifying it to support `comment`, we can run the following command:

```
starport type comment body postID
```

This command will create and add all the core functionality for the create, ready, update and delete (CRUD) transaction type `comment`, including registering entrypoints in `rest/` and `cli/`, as well as define the relevant `types`, `handler`, `messages`, `keeper`, and `proto`.


Once this is done, run `starport serve` and it will start up your backend server, the consensus engine, and a frontend user interface. This information is available when you run your application and visit `localhost:12345`.
