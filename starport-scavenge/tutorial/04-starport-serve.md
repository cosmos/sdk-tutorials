---
order: 4
---

# Starting our application

Let's follow the commands to run our application.

```bash
$ cd scavenge
$ starport serve

📦 Installing dependencies...
🛠️  Building the app...
🙂 Created an account. Password (mnemonic): wheat wonder cherry please actor armed angry suggest square fringe confirm unusual equip access symbol visit cry hen one fat absorb stamp miracle alone
🙂 Created an account. Password (mnemonic): idea snack life aware merit rough end shadow pond tide sweet column visual report multiply bronze claw cry bamboo payment taxi glare process immune
🌍 Running a Cosmos 'scavenge' app with Tendermint at http://localhost:26657.
🌍 Running a server at http://localhost:1317 (LCD)

🚀 Get started: http://localhost:12345/

```

From the contents above, we can see the following has occurred:
- Two accounts were created with the respective [mnemonics](https://support.mycrypto.com/general-knowledge/cryptography/how-do-mnemonic-phrases-work). Later on in this tutuorial, you'll use these to log in and interact with your application.
- Our Tendermint consensus engine (think of it as a database) is running at `http://localhost:26657`
- A web server is running at `http://localhost:1317`
- A landing page is running at `http://localhost:12345`


Let's navigate to [`localhost:12345`](http://localhost:12345), where we should see the following landing page:

![](./img/ui.png)

This landing page re-iterates the fact that we have a web server, consensus engine, and frontend vue application running.

Let's visit our vue app at `localhost:8080`:

![](./img/fe.png)

You can use this page to sign in using the mnemonics provided in your terminal, as well perform CRUD operations on your application.

Since we didn't add any types, we can start defining them in the next section.
