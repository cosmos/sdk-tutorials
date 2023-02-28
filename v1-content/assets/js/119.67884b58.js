(window.webpackJsonp=window.webpackJsonp||[]).push([[119],{738:function(e,t,o){"use strict";o.r(t);var a=o(1),s=Object(a.a)({},(function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[o("h1",{attrs:{id:"ignite-cli"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#ignite-cli"}},[e._v("#")]),e._v(" Ignite CLI")]),e._v(" "),o("HighlightBox",{attrs:{type:"prerequisite"}},[o("p",[e._v("Before diving into the details of how Ignite CLI helps you scaffold the basics for your application blockchain make sure to understand the main concepts presented in the following sections:")]),e._v(" "),o("ul",[o("li",[o("RouterLink",{attrs:{to:"/academy/2-main-concepts/architecture.html"}},[e._v("A Blockchain App Architecture")])],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/academy/2-main-concepts/accounts.html"}},[e._v("Accounts")])],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/academy/2-main-concepts/transactions.html"}},[e._v("Transactions")])],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/academy/2-main-concepts/messages.html"}},[e._v("Messages")])],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/academy/2-main-concepts/modules.html"}},[e._v("Modules")])],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/academy/2-main-concepts/protobuf.html"}},[e._v("Protobuf")])],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/academy/2-main-concepts/base-app.html"}},[e._v("BaseApp")])],1)])]),e._v(" "),o("HighlightBox",{attrs:{type:"learning"}},[o("p",[e._v("In this section, you will:")]),e._v(" "),o("ul",[o("li",[e._v("Install the Ignite CLI.")]),e._v(" "),o("li",[e._v("Scaffold a blockchain.")]),e._v(" "),o("li",[e._v("Use the CLI.")]),e._v(" "),o("li",[e._v("Start the Ignite UI server.")]),e._v(" "),o("li",[e._v("Send your first message.")])]),e._v(" "),o("p",[e._v("You can follow a hands-on exercise for Ignite CLI in the sections that follow this introduction.")])]),e._v(" "),o("p",[e._v("The Cosmos SDK provides the building blocks for a complete Tendermint blockchain, which implements the Inter-Blockchain Communication Protocol (IBC). The "),o("em",[e._v("BaseApp")]),e._v(" of the Cosmos SDK assembles these building blocks and provides a fully-running blockchain. All there is left to do for the specific blockchain application is to create specific modules and integrate them with BaseApp to make the application "),o("em",[e._v("your own")]),e._v(".")]),e._v(" "),o("HighlightBox",{attrs:{type:"info"}},[o("p",[e._v("Ignite CLI assists with scaffolding modules and integrating them with BaseApp. Ignite CLI is a command-line tool that writes code files and updates them when instructed to do so. If you come from an "),o("em",[e._v("on Rails")]),e._v(" world, the concept will look familiar to you.\n"),o("br"),o("br"),e._v("\nIgnite CLI also handles some compilation, runs a local blockchain node, and helps you with other tasks.")])]),e._v(" "),o("YoutubePlayer",{attrs:{videoId:"MTUQQ6nOkZo"}}),e._v(" "),o("h2",{attrs:{id:"install"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#install"}},[e._v("#")]),e._v(" Install")]),e._v(" "),o("HighlightBox",{attrs:{type:"reading"}},[o("p",[e._v("Want to dedicate some time to dive deeper into installing Ignite CLI? Learn "),o("a",{attrs:{href:"https://docs.ignite.com/guide/install.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("how to install Ignite CLI in the Ignite CLI Developer Guide"),o("OutboundLink")],1),e._v(".")])]),e._v(" "),o("p",[e._v("This entire exercise was built using the Ignite CLI version 0.17.3. To install it at the command line:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjdXJsIGh0dHBzOi8vZ2V0Lmlnbml0ZS5jb20vY2xpQHYwLjE3LjMhIHwgYmFzaAo="}}),e._v(" "),o("p",[e._v("Or if you install it in a Linux VM:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjdXJsIGh0dHBzOi8vZ2V0Lmlnbml0ZS5jb20vY2xpQHYwLjE3LjMhIHwgc3VkbyBiYXNoCg=="}}),e._v(" "),o("p",[e._v("You can verify the version of Ignite CLI you have once it is installed:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBpZ25pdGUgdmVyc2lvbgo="}}),e._v(" "),o("p",[e._v("This prints its old name and its version:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"undefined",base64:"c3RhcnBvcnQgdmVyc2lvbiB2MC4xNy4zCi4uLgo="}}),e._v(" "),o("HighlightBox",{attrs:{type:"info"}},[o("p",[e._v("This entire exercise was built using the Ignite CLI version noted above. Using a newer version could work, but you might run into compatibility issues if you clone any code made with "),o("em",[e._v("this")]),e._v(" version of Ignite CLI and then try to continue the project with "),o("em",[e._v("your")]),e._v(" version of Ignite CLI.\n"),o("br"),o("br"),e._v("\nIf you need to install the latest version of Ignite CLI, use:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjdXJsIGh0dHBzOi8vZ2V0Lmlnbml0ZS5jb20vY2xpQCEgfCBiYXNoCg=="}}),e._v(" "),o("p",[e._v("When you then run "),o("code",[e._v("ignite version")]),e._v(", it prints its new name and its version:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"undefined",base64:"SWduaXRlIENMSSB2ZXJzaW9uOiB2MC4yMC40Cg=="}})],1),e._v(" "),o("HighlightBox",{attrs:{type:"docs"}},[o("p",[e._v("If you'd like to upgrade an existing project to the latest version of Ignite CLI, you can follow the "),o("a",{attrs:{href:"https://docs.ignite.com/migration/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Ignite CLI migration documentation"),o("OutboundLink")],1),e._v(".")])]),e._v(" "),o("p",[e._v("You can also just type "),o("code",[e._v("ignite")]),e._v(" to see the offered commands:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"undefined",base64:"SWduaXRlIENMSSBpcyBhIHRvb2wgZm9yIGNyZWF0aW5nIHNvdmVyZWlnbiBibG9ja2NoYWlucyBidWlsdCB3aXRoIENvc21vcyBTREssIHRoZSB3b3JsZOKAmXMKbW9zdCBwb3B1bGFyIG1vZHVsYXIgYmxvY2tjaGFpbiBmcmFtZXdvcmsuIElnbml0ZSBDTEkgb2ZmZXJzIGV2ZXJ5dGhpbmcgeW91IG5lZWQgdG8gc2NhZmZvbGQsCnRlc3QsIGJ1aWxkLCBhbmQgbGF1bmNoIHlvdXIgYmxvY2tjaGFpbi4KClRvIGdldCBzdGFydGVkIGNyZWF0ZSBhIGJsb2NrY2hhaW46CgppZ25pdGUgc2NhZmZvbGQgY2hhaW4gZ2l0aHViLmNvbS9jb3Ntb25hdXQvbWFycwoKVXNhZ2U6CiAgaWduaXRlIFtjb21tYW5kXQoKQXZhaWxhYmxlIENvbW1hbmRzOgogIHNjYWZmb2xkICAgIFNjYWZmb2xkIGEgbmV3IGJsb2NrY2hhaW4sIG1vZHVsZSwgbWVzc2FnZSwgcXVlcnksIGFuZCBtb3JlCiAgY2hhaW4gICAgICAgQnVpbGQsIGluaXRpYWxpemUgYW5kIHN0YXJ0IGEgYmxvY2tjaGFpbiBub2RlIG9yIHBlcmZvcm0gb3RoZXIgYWN0aW9ucyBvbiB0aGUgYmxvY2tjaGFpbgogIGdlbmVyYXRlICAgIEdlbmVyYXRlIGNsaWVudHMsIEFQSSBkb2NzIGZyb20gc291cmNlIGNvZGUKICBuZXR3b3JrICAgICBMYXVuY2ggYSBibG9ja2NoYWluIG5ldHdvcmsgaW4gcHJvZHVjdGlvbgogIHJlbGF5ZXIgICAgIENvbm5lY3RzIGJsb2NrY2hhaW5zIHZpYSBJQkMgcHJvdG9jb2wKICB0b29scyAgICAgICBUb29scyBmb3IgYWR2YW5jZWQgdXNlcnMKICBkb2NzICAgICAgICBTaG93IElnbml0ZSBDTEkgZG9jcwogIHZlcnNpb24gICAgIFByaW50IHRoZSBjdXJyZW50IGJ1aWxkIGluZm9ybWF0aW9uCiAgaGVscCAgICAgICAgSGVscCBhYm91dCBhbnkgY29tbWFuZAoKRmxhZ3M6CiAgLWgsIC0taGVscCAgIGhlbHAgZm9yIGlnbml0ZQoKVXNlICZxdW90O2lnbml0ZSBbY29tbWFuZF0gLS1oZWxwJnF1b3Q7IGZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGEgY29tbWFuZC4K"}}),e._v(" "),o("h2",{attrs:{id:"your-chain"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#your-chain"}},[e._v("#")]),e._v(" Your chain")]),e._v(" "),o("p",[e._v("Start by scaffolding a basic chain called "),o("code",[e._v("checkers")]),e._v(" that you will place under the GitHub path "),o("code",[e._v("alice")]),e._v(":")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBpZ25pdGUgc2NhZmZvbGQgY2hhaW4gZ2l0aHViLmNvbS9hbGljZS9jaGVja2Vycwo="}}),e._v(" "),o("ExpansionPanel",{attrs:{title:"Troubleshooting"}},[o("p",[e._v("For the sake of good support, the versions of all software used are communicated as encountered throughout the chapters and sections. It is natural that after the writing of the course material some version changes will appear, and it may occur that something breaks. Instead of using different versions of the software from the ones in the course, please look at the following list, which might fix problems you are running into.")]),e._v(" "),o("p",[e._v(" ")]),e._v(" "),o("PanelListItem",{attrs:{number:"1"}},[o("p",[o("strong",[e._v("Apple M1")])]),e._v(" "),o("p",[e._v("If you work with a machine using M1 architecture, make sure:")]),e._v(" "),o("ol",[o("li",[e._v("You follow this course in a "),o("a",{attrs:{href:"https://www.courier.com/blog/tips-and-tricks-to-setup-your-apple-m1-for-development/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Rosetta"),o("OutboundLink")],1),e._v(" terminal.")]),e._v(" "),o("li",[e._v("You install "),o("a",{attrs:{href:"https://brew.sh/index",target:"_blank",rel:"noopener noreferrer"}},[e._v("Homebrew"),o("OutboundLink")],1),e._v(".")]),e._v(" "),o("li",[e._v("You install Golang with "),o("code",[e._v("brew install go")]),e._v(".")])])]),e._v(" "),o("PanelListItem",{attrs:{number:"2"}},[o("p",[o("strong",[e._v("Building Errors during "),o("code",[e._v("scaffold")])])]),e._v(" "),o("p",[e._v("If you work with Go 1.18, you may need to install the following:")]),e._v(" "),o("ul",[o("li",[e._v("go install github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway@latest")]),e._v(" "),o("li",[e._v("go install github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger@latest")]),e._v(" "),o("li",[e._v("go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2@latest")]),e._v(" "),o("li",[e._v("git clone https://github.com/regen-network/cosmos-proto\ncd cosmos-proto/protoc-gen-gocosmos\ngo install")]),e._v(" "),o("li",[e._v("go get github.com/golangci/golangci-lint/cmd/golangci-lint")]),e._v(" "),o("li",[e._v("go get golang.org/x/crypto/ssh/terminal@v0.0.0-20220411220226-7b82a4e95df4")])])])],1),e._v(" "),o("p",[e._v("The scaffolding takes some time as it generates the source code for a fully functional, ready-to-use blockchain. Ignite CLI creates a folder named "),o("code",[e._v("checkers")]),e._v(" and scaffolds the chain inside it.")]),e._v(" "),o("p",[e._v("The "),o("code",[e._v("checkers")]),e._v(" folder contains several generated files and directories that make up the structure of a Cosmos SDK blockchain. It contains the following folders:")]),e._v(" "),o("ul",[o("li",[o("code",[e._v("app")]),e._v(": a folder for the application.")]),e._v(" "),o("li",[o("code",[e._v("cmd")]),e._v(": a folder for the command-line interface commands.")]),e._v(" "),o("li",[o("code",[e._v("proto")]),e._v(": a folder for the Protobuf objects definitions.")]),e._v(" "),o("li",[o("code",[e._v("vue")]),e._v(": a folder for the UI.")]),e._v(" "),o("li",[o("code",[e._v("x")]),e._v(": a folder for all your modules, in particular "),o("code",[e._v("checkers")]),e._v(".")])]),e._v(" "),o("HighlightBox",{attrs:{type:"docs"}},[o("p",[e._v("If Vue.js is something new to you, check out the "),o("a",{attrs:{href:"https://vuejs.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Vue.js website"),o("OutboundLink")],1),e._v(" for more on this JavaScript framework.")])]),e._v(" "),o("p",[e._v("If you look at the code that Ignite CLI generates, for instance in "),o("code",[e._v("./x/checkers/module.go")]),e._v(", you will often see comments like the following:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Ly8gdGhpcyBsaW5lIGlzIHVzZWQgYnkgc3RhcnBvcnQgc2NhZmZvbGRpbmcgIyAxCg=="}}),e._v(" "),o("HighlightBox",{attrs:{type:"warn"}},[o("p",[e._v("Do not remove or replace any lines like these in your code as they provide markers for Ignite CLI on where to add further code when instructed to do so. For the same reason, do not rename or move any file that contains such a line.")])]),e._v(" "),o("p",[e._v("Go to the "),o("code",[e._v("checkers")]),e._v(" folder and run:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjZCBjaGVja2VycwokIGlnbml0ZSBjaGFpbiBzZXJ2ZQo="}}),e._v(" "),o("p",[e._v("The "),o("code",[e._v("ignite chain serve")]),e._v(" command downloads dependencies and compiles the source code into a binary called "),o("code",[e._v("checkersd")]),e._v(". The command:")]),e._v(" "),o("ul",[o("li",[e._v("Installs all dependencies.")]),e._v(" "),o("li",[e._v("Builds Protobuf files.")]),e._v(" "),o("li",[e._v("Compiles the application.")]),e._v(" "),o("li",[e._v("Initializes the node with a single validator.")]),e._v(" "),o("li",[e._v("Adds accounts.")])]),e._v(" "),o("p",[e._v("After this command completes, you have a local testnet with a running node. What about the added accounts? Take a look:")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"config.yml",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"yaml",base64:"YWNjb3VudHM6CiAgLSBuYW1lOiBhbGljZQogICAgY29pbnM6IFsmcXVvdDsyMDAwMHRva2VuJnF1b3Q7LCAmcXVvdDsyMDAwMDAwMDBzdGFrZSZxdW90O10KICAtIG5hbWU6IGJvYgogICAgY29pbnM6IFsmcXVvdDsxMDAwMHRva2VuJnF1b3Q7LCAmcXVvdDsxMDAwMDAwMDBzdGFrZSZxdW90O10KdmFsaWRhdG9yOgogIG5hbWU6IGFsaWNlCiAgc3Rha2VkOiAmcXVvdDsxMDAwMDAwMDBzdGFrZSZxdW90OwpjbGllbnQ6CiAgdnVleDoKICAgIHBhdGg6ICZxdW90O3Z1ZS9zcmMvc3RvcmUmcXVvdDsKICBvcGVuYXBpOgogICAgcGF0aDogJnF1b3Q7ZG9jcy9zdGF0aWMvb3BlbmFwaS55bWwmcXVvdDsKZmF1Y2V0OgogIG5hbWU6IGJvYgogIGNvaW5zOiBbJnF1b3Q7NXRva2VuJnF1b3Q7LCAmcXVvdDsxMDAwMDBzdGFrZSZxdW90O10K"}})],1)],1),e._v(" "),o("p",[e._v("In this file you can set the accounts, the accounts' starting balances, and the validator. You can also let Ignite CLI generate a client and a faucet. The faucet gives away five "),o("code",[e._v("token")]),e._v(" and 100,000 "),o("code",[e._v("stake")]),e._v(" tokens belonging to Bob each time it is called.")]),e._v(" "),o("p",[e._v("You can observe the endpoints of the blockchain in the output of the "),o("code",[e._v("ignite chain serve")]),e._v(" command:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"undefined",base64:"8J+MjSBUZW5kZXJtaW50IG5vZGU6IGh0dHA6Ly8wLjAuMC4wOjI2NjU3CvCfjI0gQmxvY2tjaGFpbiBBUEk6IGh0dHA6Ly8wLjAuMC4wOjEzMTcK8J+MjSBUb2tlbiBmYXVjZXQ6IGh0dHA6Ly8wLjAuMC4wOjQ1MDAK"}}),e._v(" "),o("HighlightBox",{attrs:{type:"info"}},[o("p",[e._v("Ignite CLI can detect any change to the source code. When it does, it immediately rebuilds the binaries before restarting the blockchain and keeping the state.")])]),e._v(" "),o("h2",{attrs:{id:"interact-via-the-cli"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#interact-via-the-cli"}},[e._v("#")]),e._v(" Interact via the CLI")]),e._v(" "),o("p",[e._v("You can already interact with your running chain. With the chain running in its shell, open another shell and try:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjaGVja2Vyc2Qgc3RhdHVzCg=="}}),e._v(" "),o("p",[e._v("This prints:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"eyZxdW90O05vZGVJbmZvJnF1b3Q7OnsmcXVvdDtwcm90b2NvbF92ZXJzaW9uJnF1b3Q7OnsmcXVvdDtwMnAmcXVvdDs6JnF1b3Q7OCZxdW90OywmcXVvdDtibG9jayZxdW90OzomcXVvdDsxMSZxdW90OywmcXVvdDthcHAmcXVvdDs6JnF1b3Q7MCZxdW90O30sJnF1b3Q7aWQmcXVvdDs6JnF1b3Q7NjNkYzEwNTMyMjk5MDVkN2FkYmE2YTUxNjFmMGMyMTJlNmY1YWNhYiZxdW90OywmcXVvdDtsaXN0ZW5fYWRkciZxdW90OzomcXVvdDt0Y3A6Ly8wLjAuMC4wOjI2NjU2JnF1b3Q7LCZxdW90O25ldHdvcmsmcXVvdDs6JnF1b3Q7Y2hlY2tlcnMmcXVvdDssJnF1b3Q7dmVyc2lvbiZxdW90OzomcXVvdDswLjM0LjExJnF1b3Q7LCZxdW90O2NoYW5uZWxzJnF1b3Q7OiZxdW90OzQwMjAyMTIyMjMzMDM4NjA2MTAwJnF1b3Q7LCZxdW90O21vbmlrZXImcXVvdDs6JnF1b3Q7bXlub2RlJnF1b3Q7LCZxdW90O290aGVyJnF1b3Q7OnsmcXVvdDt0eF9pbmRleCZxdW90OzomcXVvdDtvbiZxdW90OywmcXVvdDtycGNfYWRkcmVzcyZxdW90OzomcXVvdDt0Y3A6Ly8wLjAuMC4wOjI2NjU3JnF1b3Q7fX0sJnF1b3Q7U3luY0luZm8mcXVvdDs6eyZxdW90O2xhdGVzdF9ibG9ja19oYXNoJnF1b3Q7OiZxdW90Ozc3Qzc4MDRGRjc1QUU3OUJBRTU1N0Y1QUExRjAwQUJDMzk5RDc2MjRGMEYzQTJCOTRBQjE2OEUzRThCRDQwMDYmcXVvdDssJnF1b3Q7bGF0ZXN0X2FwcF9oYXNoJnF1b3Q7OiZxdW90OzczQzRCOEJGNDBDMTMzQ0YyMTZFN0VCMjUwNjlBMzE2QzQxMjYyRDA5MjMwNkVFRTY2MEZCOTUyRkY1NkVCMkQmcXVvdDssJnF1b3Q7bGF0ZXN0X2Jsb2NrX2hlaWdodCZxdW90OzomcXVvdDsxNDImcXVvdDssJnF1b3Q7bGF0ZXN0X2Jsb2NrX3RpbWUmcXVvdDs6JnF1b3Q7MjAyMS0xMi0yMFQxNTowOTowNC4wMjg5MTNaJnF1b3Q7LCZxdW90O2VhcmxpZXN0X2Jsb2NrX2hhc2gmcXVvdDs6JnF1b3Q7MzRBQTZBNjU4N0Y0NUY0NEZGREE0Rjc3QjBEM0RGRTFBREU1M0NFNTA3NzI4QUM3QUI1RDA0MEUxNzIxRjI5OCZxdW90OywmcXVvdDtlYXJsaWVzdF9hcHBfaGFzaCZxdW90OzomcXVvdDtFM0IwQzQ0Mjk4RkMxQzE0OUFGQkY0Qzg5OTZGQjkyNDI3QUU0MUU0NjQ5QjkzNENBNDk1OTkxQjc4NTJCODU1JnF1b3Q7LCZxdW90O2VhcmxpZXN0X2Jsb2NrX2hlaWdodCZxdW90OzomcXVvdDsxJnF1b3Q7LCZxdW90O2VhcmxpZXN0X2Jsb2NrX3RpbWUmcXVvdDs6JnF1b3Q7MjAyMS0xMi0yMFQxNTowNjoyNy4yNjgxOFomcXVvdDssJnF1b3Q7Y2F0Y2hpbmdfdXAmcXVvdDs6ZmFsc2V9LCZxdW90O1ZhbGlkYXRvckluZm8mcXVvdDs6eyZxdW90O0FkZHJlc3MmcXVvdDs6JnF1b3Q7RDhCNDhGMkFFNEM2QTlGODU4MjE0NjFEM0NGMEUxQUI1MzExRTAwOCZxdW90OywmcXVvdDtQdWJLZXkmcXVvdDs6eyZxdW90O3R5cGUmcXVvdDs6JnF1b3Q7dGVuZGVybWludC9QdWJLZXlFZDI1NTE5JnF1b3Q7LCZxdW90O3ZhbHVlJnF1b3Q7OiZxdW90O25xT21odkZ6NnAxaU1VNkNTWk54NjBqRHJBb1lTM3NKNkJ4a3ZjNkpEUlE9JnF1b3Q7fSwmcXVvdDtWb3RpbmdQb3dlciZxdW90OzomcXVvdDsxMDAmcXVvdDt9fQo="}}),e._v(" "),o("p",[e._v("In there you can see a hint of liveness: "),o("code",[e._v('"latest_block_height":"142"')]),e._v(". You can use this one-liner for better display:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjaGVja2Vyc2Qgc3RhdHVzIDImZ3Q7JmFtcDsxIHwganEK"}}),e._v(" "),o("p",[e._v("You can learn a lot by going through the possibilities with:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjaGVja2Vyc2QgLS1oZWxwCiQgY2hlY2tlcnNkIHN0YXR1cyAtLWhlbHAKJCBjaGVja2Vyc2QgcXVlcnkgLS1oZWxwCg=="}}),e._v(" "),o("p",[e._v("And so on.")]),e._v(" "),o("h2",{attrs:{id:"your-gui"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#your-gui"}},[e._v("#")]),e._v(" Your GUI")]),e._v(" "),o("p",[e._v("Boot up the frontend created by Ignite CLI by using the commands provided in the "),o("code",[e._v("readme.md")]),e._v(" file of the "),o("code",[e._v("checkers")]),e._v(" folder. Let the chain run in its own process and open a new terminal window in your "),o("code",[e._v("checkers")]),e._v(" folder. In this terminal execute:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjZCB2dWUKJCBucG0gaW5zdGFsbAokIG5wbSBydW4gc2VydmUK"}}),e._v(" "),o("ExpansionPanel",{attrs:{title:"Troubleshooting"}},[o("PanelListItem",{attrs:{number:"1"}},[o("p",[e._v("If Vue complains about linting, for instance with:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"undefined",base64:"U3ludGF4IEVycm9yOiBFcnJvcjogRmFpbGVkIHRvIGxvYWQgY29uZmlnICZxdW90O3ByZXR0aWVyJnF1b3Q7IHRvIGV4dGVuZCBmcm9tLgpSZWZlcmVuY2VkIGZyb206IC9ob21lL2FsaWNlL2NoZWNrZXJzL3Z1ZS9ub2RlX21vZHVsZXMvZXNsaW50LXBsdWdpbi1wcmV0dGllci9lc2xpbnQtcGx1Z2luLXByZXR0aWVyLmpzCg=="}}),e._v(" "),o("p",[e._v("You can safely tell it to ignore linting. To do that, in "),o("code",[e._v("package.json")]),e._v(", change the "),o("code",[e._v('"serve"')]),e._v(" script to:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"ewogICAgLi4uCiAgICAmcXVvdDtzY3JpcHRzJnF1b3Q7OiB7CiAgICAgICAgLi4uCiAgICAgICAgJnF1b3Q7c2VydmUmcXVvdDs6ICZxdW90O3Z1ZS1jbGktc2VydmljZSBzZXJ2ZSAtLXNraXAtcGx1Z2lucyBAdnVlL2NsaS1wbHVnaW4tZXNsaW50JnF1b3Q7LAogICAgfQp9Cg=="}})],1),e._v(" "),o("PanelListItem",{attrs:{number:"2",last:!0}},[o("p",[e._v("If "),o("code",[e._v("npm run serve")]),e._v(" (Node v16) complains about "),o("code",[e._v("node-sass")]),e._v(", these versions should work in "),o("code",[e._v("package.json")]),e._v(":")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"JnF1b3Q7ZGVwZW5kZW5jaWVzJnF1b3Q7OiB7CiAgICAmcXVvdDtAc3RhcnBvcnQvdnVlJnF1b3Q7OiAmcXVvdDswLjEuNTMmcXVvdDssCiAgICAmcXVvdDtAc3RhcnBvcnQvdnVleCZxdW90OzogJnF1b3Q7MC4xLjUzJnF1b3Q7LCAgICAKfSwKJnF1b3Q7ZGV2RGVwZW5kZW5jaWVzJnF1b3Q7OiB7CiAgICAmcXVvdDtub2RlLXNhc3MmcXVvdDs6ICZxdW90O142LjAuMSZxdW90OywKICAgICZxdW90O3Nhc3MtbG9hZGVyJnF1b3Q7OiAmcXVvdDteMTAuMC4wJnF1b3Q7Cn0K"}}),e._v(" "),o("p",[e._v("Do not forget to redo "),o("code",[e._v("npm install")]),e._v(".")]),e._v(" "),o("p",[e._v("In case you face a blank page, please look in the browser console for an error message.")]),e._v(" "),o("p",[e._v("If you see that "),o("code",[e._v("regeneratorRuntime")]),e._v(" is missing, run "),o("code",[e._v("npm install --save regenerator-runtime")]),e._v(" in the Vue folder and include "),o("code",[e._v('const regeneratorRuntime = require("regenerator-runtime");')]),e._v(" into the "),o("code",[e._v("<script>")]),e._v(" block of the "),o("code",[e._v("src/App.vue")]),e._v(".")])],1)],1),e._v(" "),o("p",[e._v("Navigate to "),o("a",{attrs:{href:"http://localhost:8080/",target:"_blank",rel:"noopener noreferrer"}},[e._v("localhost:8080"),o("OutboundLink")],1),e._v(". On the client-side, no wallets have been created or imported yet. Load Alice's wallet in the GUI to have some tokens. You will need to use the mnemonic for Alice, which you can find in the output of the "),o("code",[e._v("ignite chain serve")]),e._v(" command. If you do not see the mnemonic, it is because the mnemonic was shown to you the first time you ran the command and you did not copy it. So reset with "),o("code",[e._v("ignite chain serve --reset-once")]),e._v(". Copy and paste it to "),o("em",[e._v("import a wallet")]),e._v(".")]),e._v(" "),o("p",[e._v("Now you should see the balance of Alice's account and can act on her behalf.")]),e._v(" "),o("p",[e._v("Select "),o("strong",[e._v("Custom Type")]),e._v(" in the sidebar to see custom types. There are no custom types yet, this page is empty for now.")]),e._v(" "),o("HighlightBox",{attrs:{type:"best-practice"}},[o("p",[e._v("Make a Git commit before you create a new "),o("code",[e._v("message")]),e._v(". In fact, it is generally recommended to make a Git commit before running "),o("strong",[e._v("any")]),e._v(" "),o("code",[e._v("ignite scaffold")]),e._v(" command. A Git commit protects the work you have done so far and makes it easier to see what the "),o("code",[e._v("scaffold")]),e._v(" command added. It also makes it easy to just revert all changes if you are unsatisfied and want to run a different "),o("code",[e._v("scaffold")]),e._v(" command.")])]),e._v(" "),o("h2",{attrs:{id:"your-first-message"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#your-first-message"}},[e._v("#")]),e._v(" Your first message")]),e._v(" "),o("p",[e._v("After your Git commit, create a simple "),o("code",[e._v("message")]),e._v(" with:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBpZ25pdGUgc2NhZmZvbGQgbWVzc2FnZSBjcmVhdGVQb3N0IHRpdGxlIGJvZHkK"}}),e._v(" "),o("p",[e._v("The "),o("code",[e._v("ignite scaffold message")]),e._v(" command accepts a message name (here "),o("code",[e._v("createPost")]),e._v(") as the first argument, and a list of fields for the message (here "),o("code",[e._v("title")]),e._v(" and "),o("code",[e._v("body")]),e._v("), which are "),o("code",[e._v("string")]),e._v(" fields unless mentioned otherwise.")]),e._v(" "),o("p",[e._v("A message is scaffolded in a module with a name that matches the name of the project by default. It is named "),o("code",[e._v("checkers")]),e._v(" in this case. Alternatively you could have used "),o("code",[e._v("--module checkers")]),e._v(". Learn more about your options with:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBpZ25pdGUgc2NhZmZvbGQgbWVzc2FnZSAtLWhlbHAK"}}),e._v(" "),o("p",[e._v("You can see a list of files that were created or modified by the "),o("code",[e._v("scaffold message")]),e._v(" command in the Terminal output:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"undefined",base64:"bW9kaWZ5IHByb3RvL2NoZWNrZXJzL3R4LnByb3RvCm1vZGlmeSB4L2NoZWNrZXJzL2NsaWVudC9jbGkvdHguZ28KY3JlYXRlIHgvY2hlY2tlcnMvY2xpZW50L2NsaS90eF9jcmVhdGVfcG9zdC5nbwptb2RpZnkgeC9jaGVja2Vycy9oYW5kbGVyLmdvCmNyZWF0ZSB4L2NoZWNrZXJzL2tlZXBlci9tc2dfc2VydmVyX2NyZWF0ZV9wb3N0LmdvCm1vZGlmeSB4L2NoZWNrZXJzL3R5cGVzL2NvZGVjLmdvCmNyZWF0ZSB4L2NoZWNrZXJzL3R5cGVzL21lc3NhZ2VfY3JlYXRlX3Bvc3QuZ28K"}}),e._v(" "),o("p",[e._v("The "),o("code",[e._v("modify")]),e._v(" was made possible thanks to the lines like "),o("code",[e._v("// this line is used by starport scaffolding # 1")]),e._v(" that you did not remove.")]),e._v(" "),o("p",[e._v("So where is everything? You can find the root definition of your new message in:")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"proto/checkers/tx.proto",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"protobuf",base64:"Ly8gdGhpcyBsaW5lIGlzIHVzZWQgYnkgc3RhcnBvcnQgc2NhZmZvbGRpbmcgIyBwcm90by90eC9tZXNzYWdlCm1lc3NhZ2UgTXNnQ3JlYXRlUG9zdCB7CiAgc3RyaW5nIGNyZWF0b3IgPSAxOwogIHN0cmluZyB0aXRsZSA9IDI7CiAgc3RyaW5nIGJvZHkgPSAzOwp9Cg=="}})],1)],1),e._v(" "),o("p",[e._v("Ignite CLI also wired a new command into your chain's CLI in:")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"x/checkers/client/cli/tx_create_post.go",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyBDbWRDcmVhdGVQb3N0KCkgKmNvYnJhLkNvbW1hbmQgewogIGNtZCA6PSAmYW1wO2NvYnJhLkNvbW1hbmR7CiAgICBVc2U6ICAgJnF1b3Q7Y3JlYXRlLXBvc3QgW3RpdGxlXSBbYm9keV0mcXVvdDssCiAgICBTaG9ydDogJnF1b3Q7QnJvYWRjYXN0IG1lc3NhZ2UgY3JlYXRlUG9zdCZxdW90OywKICAgIEFyZ3M6ICBjb2JyYS5FeGFjdEFyZ3MoMiksCiAgICAuLi4KICB9Cn0K"}})],1)],1),e._v(" "),o("p",[e._v("Ignite CLI scaffolded GUI elements relating to your message with a Vue.js frontend framework. You can, for instance, start with this function in:")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"vue/src/store/generated/alice/checkers/alice.checkers.checkers/index.ts",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"YXN5bmMgTXNnQ3JlYXRlUG9zdCh7IHJvb3RHZXR0ZXJzIH0sIHsgdmFsdWUgfSkgewogICAgdHJ5IHsKICAgICAgICBjb25zdCB0eENsaWVudD1hd2FpdCBpbml0VHhDbGllbnQocm9vdEdldHRlcnMpCiAgICAgICAgY29uc3QgbXNnID0gYXdhaXQgdHhDbGllbnQubXNnQ3JlYXRlUG9zdCh2YWx1ZSkKICAgICAgICByZXR1cm4gbXNnCiAgICB9IGNhdGNoIChlKSB7CiAgICAgICAgaWYgKGUgPT0gTWlzc2luZ1dhbGxldEVycm9yKSB7CiAgICAgICAgICAgIHRocm93IG5ldyBTcFZ1ZXhFcnJvcignVHhDbGllbnQ6TXNnQ3JlYXRlUG9zdDpJbml0JywgJ0NvdWxkIG5vdCBpbml0aWFsaXplIHNpZ25pbmcgY2xpZW50LiBXYWxsZXQgaXMgcmVxdWlyZWQuJykKICAgICAgICB9ZWxzZXsKICAgICAgICAgICAgdGhyb3cgbmV3IFNwVnVleEVycm9yKCdUeENsaWVudDpNc2dDcmVhdGVQb3N0OkNyZWF0ZScsICdDb3VsZCBub3QgY3JlYXRlIG1lc3NhZ2U6ICcgKyBlLm1lc3NhZ2UpCgogICAgICAgIH0KICAgIH0KfSwK"}})],1),e._v(" "),o("CodeGroupItem",{attrs:{title:"index.js"}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"javascript",base64:"YXN5bmMgTXNnQ3JlYXRlUG9zdCh7IHJvb3RHZXR0ZXJzIH0sIHsgdmFsdWUgfSkgewogICAgdHJ5IHsKICAgICAgICBjb25zdCB0eENsaWVudCA9IGF3YWl0IGluaXRUeENsaWVudChyb290R2V0dGVycyk7CiAgICAgICAgY29uc3QgbXNnID0gYXdhaXQgdHhDbGllbnQubXNnQ3JlYXRlUG9zdCh2YWx1ZSk7CiAgICAgICAgcmV0dXJuIG1zZzsKICAgIH0KICAgIGNhdGNoIChlKSB7CiAgICAgICAgaWYgKGUgPT0gTWlzc2luZ1dhbGxldEVycm9yKSB7CiAgICAgICAgICAgIHRocm93IG5ldyBTcFZ1ZXhFcnJvcignVHhDbGllbnQ6TXNnQ3JlYXRlUG9zdDpJbml0JywgJ0NvdWxkIG5vdCBpbml0aWFsaXplIHNpZ25pbmcgY2xpZW50LiBXYWxsZXQgaXMgcmVxdWlyZWQuJyk7CiAgICAgICAgfQogICAgICAgIGVsc2UgewogICAgICAgICAgICB0aHJvdyBuZXcgU3BWdWV4RXJyb3IoJ1R4Q2xpZW50Ok1zZ0NyZWF0ZVBvc3Q6Q3JlYXRlJywgJ0NvdWxkIG5vdCBjcmVhdGUgbWVzc2FnZTogJyArIGUubWVzc2FnZSk7CiAgICAgICAgfQogICAgfQp9Cg=="}})],1)],1),e._v(" "),o("h2",{attrs:{id:"next-up"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#next-up"}},[e._v("#")]),e._v(" Next up")]),e._v(" "),o("p",[e._v("You just created a fully working Cosmos SDK chain, one that forms the basis of the "),o("RouterLink",{attrs:{to:"/academy/3-my-own-chain/exercise-intro.html"}},[e._v("following exercise")]),e._v(".")],1),e._v(" "),o("HighlightBox",{attrs:{type:"info"}},[o("p",[e._v("You can remove the "),o("code",[e._v("MsgCreatePost")]),e._v(" message as it is not part of the guided exercise in the next sections. You can clean it all by running:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBnaXQgY2hlY2tvdXQgLWYgJmFtcDsmYW1wOyBnaXQgY2xlYW4gLWZkCg=="}})],1)],1)}),[],!1,null,null,null);t.default=s.exports}}]);