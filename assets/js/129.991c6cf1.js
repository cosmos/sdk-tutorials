(window.webpackJsonp=window.webpackJsonp||[]).push([[129],{748:function(e,t,o){"use strict";o.r(t);var a=o(1),s=Object(a.a)({},(function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[o("h1",{attrs:{id:"play-with-cross-chain-tokens"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#play-with-cross-chain-tokens"}},[e._v("#")]),e._v(" Play With Cross-Chain Tokens")]),e._v(" "),o("HighlightBox",{attrs:{type:"prerequisite"}},[o("p",[e._v("Make sure you have all you need before proceeding:")]),e._v(" "),o("ul",[o("li",[e._v("You understand the concepts of "),o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/4-messages.html"}},[e._v("messages")]),e._v(", "),o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/6-protobuf.html"}},[e._v("Protobuf")]),e._v(", and "),o("RouterLink",{attrs:{to:"/academy/3-ibc/1-what-is-ibc.html"}},[e._v("IBC")]),e._v(".")],1),e._v(" "),o("li",[e._v("Go is installed.")]),e._v(" "),o("li",[e._v("You have the checkers blockchain codebase up to the "),o("em",[e._v("can play")]),e._v(" query. If not, follow some "),o("RouterLink",{attrs:{to:"/hands-on-exercise/2-ignite-cli-adv/9-can-play.html"}},[e._v("previous steps")]),e._v(" or check out the "),o("a",{attrs:{href:"https://github.com/cosmos/b9-checkers-academy-draft/tree/can-play-move-handler",target:"_blank",rel:"noopener noreferrer"}},[e._v("relevant version"),o("OutboundLink")],1),e._v(".")],1)])]),e._v(" "),o("HighlightBox",{attrs:{type:"learning"}},[o("p",[e._v("In this section, you will:")]),e._v(" "),o("ul",[o("li",[e._v("Discover the Inter-Blockchain Communication Protocol.")]),e._v(" "),o("li",[e._v("Accept wagers with tokens from other chains.")]),e._v(" "),o("li",[e._v("Refactor unit and integration tests.")])])]),e._v(" "),o("p",[e._v("When you "),o("RouterLink",{attrs:{to:"/hands-on-exercise/2-ignite-cli-adv/5-game-wager.html"}},[e._v("introduced a wager")]),e._v(" you enabled players to play a game and bet on the outcome using the base staking token of your blockchain. What if your players want to play with "),o("em",[e._v("other")]),e._v(" currencies? Your blockchain can represent a token from any other connected blockchain by using the Inter-Blockchain Communication Protocol (IBC).")],1),e._v(" "),o("p",[e._v("Thus, you could expand the pool of your potential players by extending the pool of possible wager denominations via the use of IBC. How can you do this?")]),e._v(" "),o("HighlightBox",{attrs:{type:"info"}},[o("p",[e._v("Your checkers application will be agnostic regarding tokens and relayers. Your only task is to enable the use of "),o("em",[e._v("foreign")]),e._v(" tokens.")])]),e._v(" "),o("h2",{attrs:{id:"some-initial-thoughts"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#some-initial-thoughts"}},[e._v("#")]),e._v(" Some initial thoughts")]),e._v(" "),o("p",[e._v("Before diving into the exercise, ask yourself:")]),e._v(" "),o("ul",[o("li",[e._v("What new information do you need?")]),e._v(" "),o("li",[e._v("How do you sanitize the inputs?")]),e._v(" "),o("li",[e._v("Are there new errors to report back?")]),e._v(" "),o("li",[e._v("What event should you emit?")])]),e._v(" "),o("h2",{attrs:{id:"code-needs"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#code-needs"}},[e._v("#")]),e._v(" Code needs")]),e._v(" "),o("p",[e._v("When it comes to the code itself:")]),e._v(" "),o("ul",[o("li",[e._v("What Ignite CLI commands, if any, assist you?")]),e._v(" "),o("li",[e._v("How do you adjust what Ignite CLI created for you?")]),e._v(" "),o("li",[e._v("How would you unit-test these new elements?")]),e._v(" "),o("li",[e._v("How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?")])]),e._v(" "),o("h2",{attrs:{id:"new-information"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#new-information"}},[e._v("#")]),e._v(" New information")]),e._v(" "),o("p",[e._v("Instead of defaulting to "),o("code",[e._v('"stake"')]),e._v(", let players decide what string represents their token:")]),e._v(" "),o("ol",[o("li",[o("p",[e._v("Update the stored game:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-protobuf",base64:"ICAgIG1lc3NhZ2UgU3RvcmVkR2FtZSB7CiAgICAgICAgLi4uCisgICAgICBzdHJpbmcgZGVub20gPSAxMjsKICAgIH0K",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/proto/checkers/stored_game.proto#L18"}})],1),e._v(" "),o("li",[o("p",[e._v("Update the message to create a game:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-protobuf",base64:"ICAgIG1lc3NhZ2UgTXNnQ3JlYXRlR2FtZSB7CiAgICAgICAgLi4uCisgICAgICBzdHJpbmcgZGVub20gPSA1OwogICAgfQo=",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/proto/checkers/tx.proto#L20"}})],1),e._v(" "),o("li",[o("p",[e._v("Instruct the Ignite CLI and Protobuf to recompile both files:")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"Local",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBpZ25pdGUgZ2VuZXJhdGUgcHJvdG8tZ28K"}})],1),e._v(" "),o("CodeGroupItem",{attrs:{title:"Docker"}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBkb2NrZXIgcnVuIC0tcm0gLWl0IFwKICAgIC12ICQocHdkKTovY2hlY2tlcnMgXAogICAgLXcgL2NoZWNrZXJzIFwKICAgIGNoZWNrZXJzX2kgXAogICAgaWduaXRlIGdlbmVyYXRlIHByb3RvLWdvCg=="}})],1)],1)],1),e._v(" "),o("li",[o("p",[e._v("It is recommended to also update the "),o("code",[e._v("MsgCreateGame")]),e._v(" constructor:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"LSAgZnVuYyBOZXdNc2dDcmVhdGVHYW1lKGNyZWF0b3Igc3RyaW5nLCBibGFjayBzdHJpbmcsIHJlZCBzdHJpbmcsIHdhZ2VyIHVpbnQ2NCkgKk1zZ0NyZWF0ZUdhbWUgeworICBmdW5jIE5ld01zZ0NyZWF0ZUdhbWUoY3JlYXRvciBzdHJpbmcsIGJsYWNrIHN0cmluZywgcmVkIHN0cmluZywgd2FnZXIgdWludDY0LCBkZW5vbSBzdHJpbmcpICpNc2dDcmVhdGVHYW1lIHsKICAgICAgICByZXR1cm4gJmFtcDtNc2dDcmVhdGVHYW1lewogICAgICAgICAgICAuLi4KKyAgICAgICAgICBEZW5vbTogZGVub20sCiAgICAgICAgfQogICAgfQo=",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/types/message_create_game.go#L12-L18"}})],1),e._v(" "),o("li",[o("p",[e._v("Not to forget the CLI client:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"ICAgIGZ1bmMgQ21kQ3JlYXRlR2FtZSgpICpjb2JyYS5Db21tYW5kIHsKICAgICAgICBjbWQgOj0gJmFtcDtjb2JyYS5Db21tYW5kewotICAgICAgICAgIFVzZTogICAmcXVvdDtjcmVhdGUtZ2FtZSBbYmxhY2tdIFtyZWRdIFt3YWdlcl0mcXVvdDssCisgICAgICAgICAgVXNlOiAgICZxdW90O2NyZWF0ZS1nYW1lIFtibGFja10gW3JlZF0gW3dhZ2VyXSBbZGVub21dJnF1b3Q7LAogICAgICAgICAgICBTaG9ydDogJnF1b3Q7QnJvYWRjYXN0IG1lc3NhZ2UgY3JlYXRlR2FtZSZxdW90OywKLSAgICAgICAgICBBcmdzOiAgY29icmEuRXhhY3RBcmdzKDMpLAorICAgICAgICAgIEFyZ3M6ICBjb2JyYS5FeGFjdEFyZ3MoNCksCiAgICAgICAgICAgIFJ1bkU6IGZ1bmMoY21kICpjb2JyYS5Db21tYW5kLCBhcmdzIFtdc3RyaW5nKSAoZXJyIGVycm9yKSB7CiAgICAgICAgICAgICAgICAuLi4KKyAgICAgICAgICAgICAgYXJnRGVub20gOj0gYXJnc1szXQoKICAgICAgICAgICAgICAgIGNsaWVudEN0eCwgZXJyIDo9IGNsaWVudC5HZXRDbGllbnRUeENvbnRleHQoY21kKQogICAgICAgICAgICAgICAgLi4uCiAgICAgICAgICAgICAgICBtc2cgOj0gdHlwZXMuTmV3TXNnQ3JlYXRlR2FtZSgKICAgICAgICAgICAgICAgICAgICAuLi4KKyAgICAgICAgICAgICAgICAgIGFyZ0Rlbm9tLAogICAgICAgICAgICAgICAgKQogICAgICAgICAgICAgICAgLi4uCiAgICAgICAgICAgIH0sCiAgICAgICAgfQogICAgICAgIC4uLgogICAgfQo=",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/client/cli/tx_create_game.go#L17-L39"}})],1),e._v(" "),o("li",[o("p",[e._v("This new field will be emitted during game creation, so add a new event key as a constant:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"ICAgIGNvbnN0ICgKICAgICAgICAuLi4KKyAgICAgIEdhbWVDcmVhdGVkRXZlbnREZW5vbSA9ICZxdW90O2Rlbm9tJnF1b3Q7CiAgICApCg==",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/types/keys.go#L37"}})],1)]),e._v(" "),o("h2",{attrs:{id:"additional-handling"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#additional-handling"}},[e._v("#")]),e._v(" Additional handling")]),e._v(" "),o("p",[e._v("The token denomination has been integrated into the relevant data structures. Now the proper denomination values need to be inserted in the right instances at the right locations:")]),e._v(" "),o("ol",[o("li",[o("p",[e._v("In the helper function to create the "),o("code",[e._v("Coin")]),e._v(" in "),o("code",[e._v("full_game.go")]),e._v(":")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"ICAgIGZ1bmMgKHN0b3JlZEdhbWUgKlN0b3JlZEdhbWUpIEdldFdhZ2VyQ29pbigpICh3YWdlciBzZGsuQ29pbikgewotICAgICAgcmV0dXJuIHNkay5OZXdDb2luKHNkay5EZWZhdWx0Qm9uZERlbm9tLCBzZGsuTmV3SW50KGludDY0KHN0b3JlZEdhbWUuV2FnZXIpKSkKKyAgICAgIHJldHVybiBzZGsuTmV3Q29pbihzdG9yZWRHYW1lLkRlbm9tLCBzZGsuTmV3SW50KGludDY0KHN0b3JlZEdhbWUuV2FnZXIpKSkKICAgIH0K",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/types/full_game.go#L69"}})],1),e._v(" "),o("li",[o("p",[e._v("In the handler that instantiates a game:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"ICAgIHN0b3JlZEdhbWUgOj0gdHlwZXMuU3RvcmVkR2FtZXsKICAgICAgICAuLi4KKyAgICAgIERlbm9tOiAgICAgICBtc2cuRGVub20sCiAgICB9Cg==",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game.go#L34"}}),e._v(" "),o("p",[e._v("Also where it emits an event:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"ICAgIGN0eC5FdmVudE1hbmFnZXIoKS5FbWl0RXZlbnQoCiAgICAgICAgc2RrLk5ld0V2ZW50KHNkay5FdmVudFR5cGVNZXNzYWdlLAogICAgICAgICAgICAuLi4KKyAgICAgICAgICBzZGsuTmV3QXR0cmlidXRlKHR5cGVzLkdhbWVDcmVhdGVkRXZlbnREZW5vbSwgbXNnLkRlbm9tKSwKICAgICAgICApCiAgICApCg==",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game.go#L56"}})],1)]),e._v(" "),o("h2",{attrs:{id:"unit-tests"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#unit-tests"}},[e._v("#")]),e._v(" Unit tests")]),e._v(" "),o("p",[e._v("The point of the tests is to make sure that the token denomination is correctly used. So you ought to add a denomination "),o("a",{attrs:{href:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L28",target:"_blank",rel:"noopener noreferrer"}},[e._v("when creating a game"),o("OutboundLink")],1),e._v(" and add it to "),o("a",{attrs:{href:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L67",target:"_blank",rel:"noopener noreferrer"}},[e._v("all the stored games"),o("OutboundLink")],1),e._v(" you check and all the "),o("a",{attrs:{href:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L121",target:"_blank",rel:"noopener noreferrer"}},[e._v("emitted events"),o("OutboundLink")],1),e._v(" you check. Choose a "),o("code",[e._v('"stake"')]),e._v(" for all first games and something else for additional games, for instance "),o("a",{attrs:{href:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L185",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v('"coin"')]),o("OutboundLink")],1),e._v(" and "),o("a",{attrs:{href:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L226",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v('"gold"')]),o("OutboundLink")],1),e._v(" respectively.")]),e._v(" "),o("p",[e._v("Adjust your test helpers too:")]),e._v(" "),o("ul",[o("li",[o("p",[e._v("The coins factory now needs to care about the denomination too:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"LSAgZnVuYyBjb2luc09mKGFtb3VudCB1aW50NjQpIHNkay5Db2lucyB7CisgIGZ1bmMgY29pbnNPZihhbW91bnQgdWludDY0LCBkZW5vbSBzdHJpbmcpIHNkay5Db2lucyB7CiAgICAgICAgcmV0dXJuIHNkay5Db2luc3sKICAgICAgICAgICAgc2RrLkNvaW57Ci0gICAgICAgICAgICAgIERlbm9tOiAgc2RrLkRlZmF1bHRCb25kRGVub20sCisgICAgICAgICAgICAgIERlbm9tOiAgZGVub20sCiAgICAgICAgICAgICAgICBBbW91bnQ6IHNkay5OZXdJbnQoaW50NjQoYW1vdW50KSksCiAgICAgICAgICAgIH0sCiAgICAgICAgfQogICAgfQo=",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/testutil/bank_escrow_helpers.go#L16-L19"}})],1),e._v(" "),o("li",[o("p",[e._v("To minimize the amount of work to redo, add an "),o("code",[e._v("ExpectPayWithDenom")]),e._v(" helper, and have the earlier "),o("code",[e._v("ExpectPay")]),e._v(" use it with the "),o("code",[e._v('"stake"')]),e._v(" denomination:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"ICAgIGZ1bmMgKGVzY3JvdyAqTW9ja0JhbmtFc2Nyb3dLZWVwZXIpIEV4cGVjdFBheShjb250ZXh0IGNvbnRleHQuQ29udGV4dCwgd2hvIHN0cmluZywgYW1vdW50IHVpbnQ2NCkgKmdvbW9jay5DYWxsIHsKKyAgICAgIHJldHVybiBlc2Nyb3cuRXhwZWN0UGF5V2l0aERlbm9tKGNvbnRleHQsIHdobywgYW1vdW50LCBzZGsuRGVmYXVsdEJvbmREZW5vbSkKKyAgfQorCisgIGZ1bmMgKGVzY3JvdyAqTW9ja0JhbmtFc2Nyb3dLZWVwZXIpIEV4cGVjdFBheVdpdGhEZW5vbShjb250ZXh0IGNvbnRleHQuQ29udGV4dCwgd2hvIHN0cmluZywgYW1vdW50IHVpbnQ2NCwgZGVub20gc3RyaW5nKSAqZ29tb2NrLkNhbGwgewogICAgICAgIHdob0FkZHIsIGVyciA6PSBzZGsuQWNjQWRkcmVzc0Zyb21CZWNoMzIod2hvKQogICAgICAgIGlmIGVyciAhPSBuaWwgewogICAgICAgICAgICBwYW5pYyhlcnIpCiAgICAgICAgfQotICAgICAgcmV0dXJuIGVzY3Jvdy5FWFBFQ1QoKS5TZW5kQ29pbnNGcm9tQWNjb3VudFRvTW9kdWxlKHNkay5VbndyYXBTREtDb250ZXh0KGNvbnRleHQpLCB3aG9BZGRyLCB0eXBlcy5Nb2R1bGVOYW1lLCBjb2luc09mKGFtb3VudCkpCisgICAgICByZXR1cm4gZXNjcm93LkVYUEVDVCgpLlNlbmRDb2luc0Zyb21BY2NvdW50VG9Nb2R1bGUoc2RrLlVud3JhcFNES0NvbnRleHQoY29udGV4dCksIHdob0FkZHIsIHR5cGVzLk1vZHVsZU5hbWUsIGNvaW5zT2YoYW1vdW50LCBkZW5vbSkpCiAgICB9Cg==",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/testutil/bank_escrow_helpers.go#L25-L34"}}),e._v(" "),o("p",[e._v("Do the same with "),o("a",{attrs:{href:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/testutil/bank_escrow_helpers.go#L37-L46",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v("ExpectRefund")]),o("OutboundLink")],1),e._v(".")])],1)]),e._v(" "),o("p",[e._v("With the new helpers in, you can pepper call expectations with "),o("a",{attrs:{href:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/end_block_server_game_test.go#L239",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v('"coin"')]),o("OutboundLink")],1),e._v(" or "),o("code",[e._v('"gold"')]),e._v(".")]),e._v(" "),o("h2",{attrs:{id:"integration-tests"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#integration-tests"}},[e._v("#")]),e._v(" Integration tests")]),e._v(" "),o("p",[e._v("You have fixed your unit tests. You need to do the same for your integration tests.")]),e._v(" "),o("h3",{attrs:{id:"adjustments"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#adjustments"}},[e._v("#")]),e._v(" Adjustments")]),e._v(" "),o("p",[e._v("You can also take this opportunity to expand the genesis state so that it includes a different coin.")]),e._v(" "),o("ul",[o("li",[o("p",[e._v("Make sure your helper to make a balance cares about the denomination:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"LSAgZnVuYyBtYWtlQmFsYW5jZShhZGRyZXNzIHN0cmluZywgYmFsYW5jZSBpbnQ2NCkgYmFua3R5cGVzLkJhbGFuY2UgeworICBmdW5jIG1ha2VCYWxhbmNlKGFkZHJlc3Mgc3RyaW5nLCBiYWxhbmNlIGludDY0LCBkZW5vbSBzdHJpbmcpIGJhbmt0eXBlcy5CYWxhbmNlIHsKICAgICAgICByZXR1cm4gYmFua3R5cGVzLkJhbGFuY2V7CiAgICAgICAgICAgIEFkZHJlc3M6IGFkZHJlc3MsCiAgICAgICAgICAgIENvaW5zOiBzZGsuQ29pbnN7CiAgICAgICAgICAgICAgICBzZGsuQ29pbnsKLSAgICAgICAgICAgICAgICAgIERlbm9tOiAgc2RrLkRlZmF1bHRCb25kRGVub20sCisgICAgICAgICAgICAgICAgICBEZW5vbTogIGRlbm9tLAogICAgICAgICAgICAgICAgICAgIEFtb3VudDogc2RrLk5ld0ludChiYWxhbmNlKSwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgIH0sCiAgICAgICAgfQogICAgfQo=",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L65-L75"}})],1),e._v(" "),o("li",[o("p",[e._v("Since you want to add more coins, make a specific function to sum balances per denomination:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyBhZGRBbGwoYmFsYW5jZXMgW11iYW5rdHlwZXMuQmFsYW5jZSkgc2RrLkNvaW5zIHsKICAgIHRvdGFsIDo9IHNkay5OZXdDb2lucygpCiAgICBmb3IgXywgYmFsYW5jZSA6PSByYW5nZSBiYWxhbmNlcyB7CiAgICAgICAgdG90YWwgPSB0b3RhbC5BZGQoYmFsYW5jZS5Db2lucy4uLikKICAgIH0KICAgIHJldHVybiB0b3RhbAp9Cg==",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L77-L83"}})],1),e._v(" "),o("li",[o("p",[e._v("In the bank genesis creation, add new balances:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"ICAgIGZ1bmMgZ2V0QmFua0dlbmVzaXMoKSAqYmFua3R5cGVzLkdlbmVzaXNTdGF0ZSB7CiAgICAgICAgY29pbnMgOj0gW11iYW5rdHlwZXMuQmFsYW5jZXsKLSAgICAgICAgICBtYWtlQmFsYW5jZShhbGljZSwgYmFsQWxpY2UpLAotICAgICAgICAgIG1ha2VCYWxhbmNlKGJvYiwgYmFsQm9iKSwKLSAgICAgICAgICBtYWtlQmFsYW5jZShjYXJvbCwgYmFsQ2Fyb2wpLAorICAgICAgICAgIG1ha2VCYWxhbmNlKGFsaWNlLCBiYWxBbGljZSwgJnF1b3Q7c3Rha2UmcXVvdDspLAorICAgICAgICAgIG1ha2VCYWxhbmNlKGJvYiwgYmFsQm9iLCAmcXVvdDtzdGFrZSZxdW90OyksCisgICAgICAgICAgbWFrZUJhbGFuY2UoYm9iLCBiYWxCb2IsICZxdW90O2NvaW4mcXVvdDspLAorICAgICAgICAgIG1ha2VCYWxhbmNlKGNhcm9sLCBiYWxDYXJvbCwgJnF1b3Q7c3Rha2UmcXVvdDspLAorICAgICAgICAgIG1ha2VCYWxhbmNlKGNhcm9sLCBiYWxDYXJvbCwgJnF1b3Q7Y29pbiZxdW90OyksCiAgICAgICAgfQogICAgICAgIHN1cHBseSA6PSBiYW5rdHlwZXMuU3VwcGx5ewotICAgICAgICAgIFRvdGFsOiBjb2luc1swXS5Db2lucy5BZGQoY29pbnNbMV0uQ29pbnMuLi4pLkFkZChjb2luc1syXS5Db2lucy4uLiksCisgICAgICAgICAgVG90YWw6IGFkZEFsbChjb2lucyksCiAgICAgICAgfQogICAgICAgIC4uLgogICAgfQo=",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L85-L95"}})],1),e._v(" "),o("li",[o("p",[e._v("Also adjust the helper that checks bank balances. Add a function to reduce the amount of refactoring:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"ICAgIGZ1bmMgKHN1aXRlICpJbnRlZ3JhdGlvblRlc3RTdWl0ZSkgUmVxdWlyZUJhbmtCYWxhbmNlKGV4cGVjdGVkIGludCwgYXRBZGRyZXNzIHN0cmluZykgeworICAgICAgc3VpdGUuUmVxdWlyZUJhbmtCYWxhbmNlV2l0aERlbm9tKGV4cGVjdGVkLCAmcXVvdDtzdGFrZSZxdW90OywgYXRBZGRyZXNzKQorICB9CisKKyAgZnVuYyAoc3VpdGUgKkludGVncmF0aW9uVGVzdFN1aXRlKSBSZXF1aXJlQmFua0JhbGFuY2VXaXRoRGVub20oZXhwZWN0ZWQgaW50LCBkZW5vbSBzdHJpbmcsIGF0QWRkcmVzcyBzdHJpbmcpIHsKICAgICAgICBzZGtBZGQsIGVyciA6PSBzZGsuQWNjQWRkcmVzc0Zyb21CZWNoMzIoYXRBZGRyZXNzKQogICAgICAgIHN1aXRlLlJlcXVpcmUoKS5OaWwoZXJyLCAmcXVvdDtGYWlsZWQgdG8gcGFyc2UgYWRkcmVzczogJXMmcXVvdDssIGF0QWRkcmVzcykKICAgICAgICBzdWl0ZS5SZXF1aXJlKCkuRXF1YWwoCiAgICAgICAgICAgIGludDY0KGV4cGVjdGVkKSwKLSAgICAgICAgICBzdWl0ZS5hcHAuQmFua0tlZXBlci5HZXRCYWxhbmNlKHN1aXRlLmN0eCwgc2RrQWRkLCBzZGsuRGVmYXVsdEJvbmREZW5vbSkuQW1vdW50LkludDY0KCkpCisgICAgICAgICAgc3VpdGUuYXBwLkJhbmtLZWVwZXIuR2V0QmFsYW5jZShzdWl0ZS5jdHgsIHNka0FkZCwgZGVub20pLkFtb3VudC5JbnQ2NCgpKQogICAgfQo=",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/tests/integration/checkers/keeper/keeper_integration_suite_test.go#L110-L120"}})],1)]),e._v(" "),o("h3",{attrs:{id:"additional-test"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#additional-test"}},[e._v("#")]),e._v(" Additional test")]),e._v(" "),o("p",[e._v("With the helpers in place, you can add a test with three players playing two games with different tokens:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyAoc3VpdGUgKkludGVncmF0aW9uVGVzdFN1aXRlKSBUZXN0UGxheU1vdmVUb1dpbm5lckJhbmtQYWlkRGlmZmVyZW50VG9rZW5zKCkgewogICAgc3VpdGUuc2V0dXBTdWl0ZVdpdGhPbmVHYW1lRm9yUGxheU1vdmUoKQogICAgZ29DdHggOj0gc2RrLldyYXBTREtDb250ZXh0KHN1aXRlLmN0eCkKICAgIHN1aXRlLm1zZ1NlcnZlci5DcmVhdGVHYW1lKGdvQ3R4LCAmYW1wO3R5cGVzLk1zZ0NyZWF0ZUdhbWV7CiAgICAgICAgQ3JlYXRvcjogYWxpY2UsCiAgICAgICAgQmxhY2s6ICAgYm9iLAogICAgICAgIFJlZDogICAgIGNhcm9sLAogICAgICAgIFdhZ2VyOiAgIDQ2LAogICAgICAgIERlbm9tOiAgICZxdW90O2NvaW4mcXVvdDssCiAgICB9KQogICAgc3VpdGUuUmVxdWlyZUJhbmtCYWxhbmNlKGJhbEFsaWNlLCBhbGljZSkKICAgIHN1aXRlLlJlcXVpcmVCYW5rQmFsYW5jZVdpdGhEZW5vbSgwLCAmcXVvdDtjb2luJnF1b3Q7LCBhbGljZSkKICAgIHN1aXRlLlJlcXVpcmVCYW5rQmFsYW5jZShiYWxCb2IsIGJvYikKICAgIHN1aXRlLlJlcXVpcmVCYW5rQmFsYW5jZVdpdGhEZW5vbShiYWxCb2IsICZxdW90O2NvaW4mcXVvdDssIGJvYikKICAgIHN1aXRlLlJlcXVpcmVCYW5rQmFsYW5jZShiYWxDYXJvbCwgY2Fyb2wpCiAgICBzdWl0ZS5SZXF1aXJlQmFua0JhbGFuY2VXaXRoRGVub20oYmFsQ2Fyb2wsICZxdW90O2NvaW4mcXVvdDssIGNhcm9sKQogICAgc3VpdGUuUmVxdWlyZUJhbmtCYWxhbmNlKDAsIGNoZWNrZXJzTW9kdWxlQWRkcmVzcykKICAgIHBsYXlBbGxNb3ZlcyhzdWl0ZS5UKCksIHN1aXRlLm1zZ1NlcnZlciwgc2RrLldyYXBTREtDb250ZXh0KHN1aXRlLmN0eCksICZxdW90OzEmcXVvdDssIGJvYiwgY2Fyb2wsIGdhbWUxTW92ZXMpCiAgICBwbGF5QWxsTW92ZXMoc3VpdGUuVCgpLCBzdWl0ZS5tc2dTZXJ2ZXIsIHNkay5XcmFwU0RLQ29udGV4dChzdWl0ZS5jdHgpLCAmcXVvdDsyJnF1b3Q7LCBib2IsIGNhcm9sLGdhbWUxTW92ZXMpCiAgICBzdWl0ZS5SZXF1aXJlQmFua0JhbGFuY2UoYmFsQWxpY2UsIGFsaWNlKQogICAgc3VpdGUuUmVxdWlyZUJhbmtCYWxhbmNlV2l0aERlbm9tKDAsICZxdW90O2NvaW4mcXVvdDssIGFsaWNlKQogICAgc3VpdGUuUmVxdWlyZUJhbmtCYWxhbmNlKGJhbEJvYis0NSwgYm9iKQogICAgc3VpdGUuUmVxdWlyZUJhbmtCYWxhbmNlV2l0aERlbm9tKGJhbEJvYis0NiwgJnF1b3Q7Y29pbiZxdW90OywgYm9iKQogICAgc3VpdGUuUmVxdWlyZUJhbmtCYWxhbmNlKGJhbENhcm9sLTQ1LCBjYXJvbCkKICAgIHN1aXRlLlJlcXVpcmVCYW5rQmFsYW5jZVdpdGhEZW5vbShiYWxDYXJvbC00NiwgJnF1b3Q7Y29pbiZxdW90OywgY2Fyb2wpCiAgICBzdWl0ZS5SZXF1aXJlQmFua0JhbGFuY2UoMCwgY2hlY2tlcnNNb2R1bGVBZGRyZXNzKQogICAgc3VpdGUuUmVxdWlyZUJhbmtCYWxhbmNlV2l0aERlbm9tKDAsICZxdW90O2NvaW4mcXVvdDssIGNoZWNrZXJzTW9kdWxlQWRkcmVzcykKfQo=",url:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/tests/integration/checkers/keeper/msg_server_play_move_test.go#L323-L350"}}),e._v(" "),o("p",[e._v("All your tests should now pass.")]),e._v(" "),o("h2",{attrs:{id:"interact-via-the-cli"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#interact-via-the-cli"}},[e._v("#")]),e._v(" Interact via the CLI")]),e._v(" "),o("p",[e._v("Restart Ignite with "),o("code",[e._v("chain serve")]),e._v(". If you recall, Alice's and Bob's balances have two token denominations. Query:")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"Local",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjaGVja2Vyc2QgcXVlcnkgYmFuayBiYWxhbmNlcyAkYWxpY2UK"}})],1),e._v(" "),o("CodeGroupItem",{attrs:{title:"Docker"}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBkb2NrZXIgZXhlYyAtaXQgY2hlY2tlcnMgXAogICAgY2hlY2tlcnNkIHF1ZXJ5IGJhbmsgYmFsYW5jZXMgJGFsaWNlCg=="}})],1)],1),e._v(" "),o("p",[e._v("This returns what you would expect from the "),o("a",{attrs:{href:"https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/config.yml#L2-L5",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v("config.yml")]),o("OutboundLink")],1),e._v(":")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"txt",base64:"YmFsYW5jZXM6Ci0gYW1vdW50OiAmcXVvdDsxMDAwMDAwMDAmcXVvdDsKICBkZW5vbTogc3Rha2UKLSBhbW91bnQ6ICZxdW90OzIwMDAwJnF1b3Q7CiAgZGVub206IHRva2VuCnBhZ2luYXRpb246CiAgbmV4dF9rZXk6IG51bGwKICB0b3RhbDogJnF1b3Q7MCZxdW90Owo="}}),e._v(" "),o("p",[e._v("You can make use of this other "),o("code",[e._v("token")]),e._v(" to create a new game that costs "),o("code",[e._v("1 token")]),e._v(":")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"Local",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjaGVja2Vyc2QgdHggY2hlY2tlcnMgY3JlYXRlLWdhbWUgXAogICAgJGFsaWNlICRib2IgMSB0b2tlbiBcCiAgICAtLWZyb20gJGFsaWNlCg=="}})],1),e._v(" "),o("CodeGroupItem",{attrs:{title:"Docker"}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBkb2NrZXIgZXhlYyAtaXQgY2hlY2tlcnMgXAogICAgY2hlY2tlcnNkIHR4IGNoZWNrZXJzIGNyZWF0ZS1nYW1lIFwKICAgICRhbGljZSAkYm9iIDEgdG9rZW4gXAogICAgLS1mcm9tICRhbGljZQo="}})],1)],1),e._v(" "),o("p",[e._v("Which mentions:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"txt",base64:"Li4uCi0ga2V5OiB3YWdlcgogIHZhbHVlOiAmcXVvdDsxJnF1b3Q7Ci0ga2V5OiBkZW5vbQogIHZhbHVlOiB0b2tlbgouLi4K"}}),e._v(" "),o("p",[e._v("Have Alice play once:")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"Local",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjaGVja2Vyc2QgdHggY2hlY2tlcnMgcGxheS1tb3ZlIDEgMSAyIDIgMyAtLWZyb20gJGFsaWNlCg=="}})],1),e._v(" "),o("CodeGroupItem",{attrs:{title:"Docker"}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBkb2NrZXIgZXhlYyAtaXQgY2hlY2tlcnMgXAogICAgY2hlY2tlcnNkIHR4IGNoZWNrZXJzIHBsYXktbW92ZSAxIDEgMiAyIDMgLS1mcm9tICRhbGljZQo="}})],1)],1),e._v(" "),o("p",[e._v("Which mentions:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"txt",base64:"LSBhdHRyaWJ1dGVzOgogIC0ga2V5OiByZWNpcGllbnQKICAgIHZhbHVlOiBjb3Ntb3MxNnh4MGU0NTdobThteXdkaHh0bXJhcjl0MDl6MG1xdDl4N3NybTMKICAtIGtleTogc2VuZGVyCiAgICB2YWx1ZTogY29zbW9zMTgwZzBrYXh6enJlOTVmOWd3dzkzdDhjcWhzaGp5ZGF6dTdnMzVuCiAgLSBrZXk6IGFtb3VudAogICAgdmFsdWU6IDF0b2tlbgogIHR5cGU6IHRyYW5zZmVyCg=="}}),e._v(" "),o("p",[e._v("This seems to indicate that Alice has been charged the wager. As a side node, "),o("code",[e._v("cosmos16xx0e457hm8mywdhxtmrar9t09z0mqt9x7srm3")]),e._v(" is the checkers module's address. Confirm it:")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"Local",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjaGVja2Vyc2QgcXVlcnkgYmFuayBiYWxhbmNlcyAkYWxpY2UK"}})],1),e._v(" "),o("CodeGroupItem",{attrs:{title:"Docker"}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBkb2NrZXIgZXhlYyAtaXQgY2hlY2tlcnMgXAogICAgY2hlY2tlcnNkIHF1ZXJ5IGJhbmsgYmFsYW5jZXMgJGFsaWNlCg=="}})],1)],1),e._v(" "),o("p",[e._v("This returns:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"txt",base64:"YmFsYW5jZXM6Ci0gYW1vdW50OiAmcXVvdDsxMDAwMDAwMDAmcXVvdDsKICBkZW5vbTogc3Rha2UKLSBhbW91bnQ6ICZxdW90OzE5OTk5JnF1b3Q7CiAgZGVub206IHRva2VuCnBhZ2luYXRpb246CiAgbmV4dF9rZXk6IG51bGwKICB0b3RhbDogJnF1b3Q7MCZxdW90Owo="}}),e._v(" "),o("p",[e._v("Correct. You made it possible to wager any token. That includes IBC tokens.")]),e._v(" "),o("p",[e._v("Now check the checkers module's balance:")]),e._v(" "),o("CodeGroup",[o("CodeGroupItem",{attrs:{title:"Local",active:""}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjaGVja2Vyc2QgcXVlcnkgYmFuayBiYWxhbmNlcyBjb3Ntb3MxNnh4MGU0NTdobThteXdkaHh0bXJhcjl0MDl6MG1xdDl4N3NybTMK"}})],1),e._v(" "),o("CodeGroupItem",{attrs:{title:"Docker"}},[o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBkb2NrZXIgZXhlYyAtaXQgY2hlY2tlcnMgXAogICAgY2hlY2tlcnNkIHF1ZXJ5IGJhbmsgYmFsYW5jZXMgY29zbW9zMTZ4eDBlNDU3aG04bXl3ZGh4dG1yYXI5dDA5ejBtcXQ5eDdzcm0zCg=="}})],1)],1),e._v(" "),o("p",[e._v("This prints:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"txt",base64:"YmFsYW5jZXM6Ci0gYW1vdW50OiAmcXVvdDsxJnF1b3Q7CiAgZGVub206IHRva2VuCnBhZ2luYXRpb246CiAgbmV4dF9rZXk6IG51bGwKICB0b3RhbDogJnF1b3Q7MCZxdW90Owo="}}),e._v(" "),o("p",[e._v("That is correct.")]),e._v(" "),o("HighlightBox",{attrs:{type:"synopsis"}},[o("p",[e._v("To summarize, this section has explored:")]),e._v(" "),o("ul",[o("li",[e._v("How to enable the use of cross-chain tokens to make wagers on checkers games as well as your blockchain's base staking token, by making use of the Inter-Blockchain Communication Protocol (IBC).")]),e._v(" "),o("li",[e._v("How to update the stored game and the game creation message to allow players to decide what string represents their token.")]),e._v(" "),o("li",[e._v("Where to insert the necessary values to allow recognition of token denominations.")]),e._v(" "),o("li",[e._v("How to fix your existing tests due to the introduction of a new field and a new event, and how to add a new test when a player makes their first move.")]),e._v(" "),o("li",[e._v("How to interact via the CLI to confirm the presence of the new token denomination in a player's balance and that using these tokens to make a wager functions as required.")]),e._v(" "),o("li",[e._v("How to demonstrate that your application will accept IBC-foreign tokens from another blockchain, using Ignite CLI's built-in TypeScript relayer as a convenient small-scale local testing tool.")])])]),e._v(" "),o("p",[e._v("Alternatively, you can learn how to create the "),o("RouterLink",{attrs:{to:"/hands-on-exercise/3-cosmjs-adv/1-cosmjs-objects.html"}},[e._v("TypeScript client elements")]),e._v(" for your blockchain.")],1)],1)}),[],!1,null,null,null);t.default=s.exports}}]);