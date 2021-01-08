---
order: 6
---

# User interface

Once you navigate to the UI, the following `vue` UI at `localhost:8080` - 

![](./ui2.png)

After using the mnemonic from the output of `starport serve`, you can use this UI to perform `create` and `list` operations for your blog application's `post` and `comment` types.

You can modify which fields to allow when creating the types in `vue/src/store/app.js` - 

### vue/src/views/Index.vue

```vue
  <div class="sp-container">
    <sp-sign-in />
    <sp-bank-balances />
    <sp-token-send />
    <!-- this line is used by starport scaffolding # 4 -->
    <sp-type-form type="posts" :fields="['title', 'body']"/>
  </div>
```

