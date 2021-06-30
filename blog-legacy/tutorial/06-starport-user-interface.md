---
order: 6
---

# User interface

Once you navigate to the UI, the following `vue` UI should be displayed at `localhost:8080` - 

![](./userinterface.png)

Use the **mnemonic** created after `starport chain serve` -> `Created an account. Password (mnemonic): ...` to login and enable user to perform `create` and `list` operations for your blog application's `post` and `comment` types.

### vue/src/views/Index.vue

To see a form for creating `post` items in your app add a `<sp-type-form/>` component:

```vue
  <div class="sp-container">
    <!-- sp-sign-in, sp-bank-balances, etc. -->
    <sp-type-form type="posts" :fields="['title', 'body']"/>
  </div>
```