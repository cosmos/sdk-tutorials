---
order: 3
---

## What is `starport scaffold list`

As mentioned previously, you can use the `starport scaffold list` command to generate CRUD functionality for a custom new type on-the-fly, adding the functionality you implemented earlier in the tutorial for the `post` type.

## Add a `comment` type

If you want to add functionality for users to comment on posts, that functionality requires creating a type `comment` that can be created when a user sends a `body` and a relevant `postID`. Instead of manually performing all the same changes you made earlier and modifying it to support `comment`, you can run the following command:

```bash
starport scaffold list comment body postID
```

This command creates and adds all the core functionality for the create, ready, update and delete (CRUD) transaction type `comment`, including registering entrypoints in `rest/` and `cli/`, as well as define the relevant `types`, `handler`, `messages`, `keeper`, and `proto`.

After this is done, run `starport chain serve`.

This command starts up your backend server and the consensus engine.
