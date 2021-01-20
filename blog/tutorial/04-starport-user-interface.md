---
order: 6
---

# User interface

Once you navigate to the UI, the following `vue` UI at `localhost:8080` - 

![](./userinterface.png)

After using the mnemonic from the output of `starport serve`, you can use this UI to perform `create` and `list` operations for your blog application's `post` and `comment` types.

### vue/src/views/Index.vue

To see a form for creating `post` items in your app add a `<sp-type-form/>` component:

```vue
  <div class="sp-container">
    <!-- sp-sign-in, sp-bank-balances, etc. -->
    <sp-type-form path="example.blog.blog" type="post" :fields="[ ['creator', 1, 'string'] , ['title', 2, 'string'] , ['body', 3, 'string'] ]" />
  </div>
```