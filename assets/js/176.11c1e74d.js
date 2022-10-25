(window.webpackJsonp=window.webpackJsonp||[]).push([[176],{788:function(t,o,e){"use strict";e.r(o);var a=e(1),s=Object(a.a)({},(function(){var t=this,o=t.$createElement,e=t._self._c||o;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("h1",{attrs:{id:"understand-the-gov-module"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#understand-the-gov-module"}},[t._v("#")]),t._v(" Understand the Gov Module")]),t._v(" "),e("p",[t._v("The "),e("a",{attrs:{href:"https://docs.cosmos.network/v0.46/modules/gov",target:"_blank",rel:"noopener noreferrer"}},[e("code",[t._v("gov")]),e("OutboundLink")],1),t._v(" module enables governance on Cosmos SDK. It allows you to create proposals of any message type, and vote on them.")]),t._v(" "),e("h2",{attrs:{id:"usage-of-the-gov-module"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#usage-of-the-gov-module"}},[t._v("#")]),t._v(" Usage of the gov module")]),t._v(" "),e("p",[t._v("When the gov module is enabled on a chain (for example the Cosmos Hub), the users can submit a proposal to be voted on by the community.")]),t._v(" "),e("p",[t._v("A proposal can be an upgrade of the chain, a change of the parameters of the chain, a simple text proposal, or any other message type. This tutorial will focus on how you can participate in governance, by creating and voting on proposals.")]),t._v(" "),e("p",[t._v("Before starting, review some terminology:")]),t._v(" "),e("ul",[e("li",[e("p",[e("strong",[t._v("Proposal:")]),t._v(" A proposal is a suggestion that is submitted to the network for voting. Once a proposal is submitted, it is identified by a unique proposal ID.")])]),t._v(" "),e("li",[e("p",[e("strong",[t._v("Message:")]),t._v(" A proposal includes an array of "),e("code",[t._v("sdk.Msgs")]),t._v(" which are executed automatically if the proposal passes. This means you can submit a proposal about any action on which the governance module has "),e("code",[t._v("authority")]),t._v(".")])]),t._v(" "),e("li",[e("p",[e("strong",[t._v("Deposit period:")]),t._v(" To prevent spam, proposals must be submitted with a deposit in the coins defined by the chain. At this point, for instance, the Cosmos Hub requires a "),e("a",{attrs:{href:"https://mintscan.io/cosmos/parameters",target:"_blank",rel:"noopener noreferrer"}},[e("code",[t._v("64 ATOM")]),t._v(" deposit"),e("OutboundLink")],1),t._v(". The deposit is always refunded to the depositors after voting, unless the proposal is vetoed: in that case, the deposit is burned.")]),t._v(" "),e("HighlightBox",{attrs:{type:"tip"}},[e("p",[t._v("The proposer is not obliged to submit the totality of the deposit amount. Other users can also contribute to the deposit.")])])],1),t._v(" "),e("li",[e("p",[e("strong",[t._v("Voting period:")]),t._v(" After the minimum deposit is reached, the proposal enters the voting period. During this period, users can vote on the proposal. The voting period is a parameter of individual chains. For instance, the Cosmos Hub has a "),e("a",{attrs:{href:"https://mintscan.io/cosmos/parameters",target:"_blank",rel:"noopener noreferrer"}},[e("code",[t._v("2 weeks")]),t._v(" voting period"),e("OutboundLink")],1),t._v(".")])]),t._v(" "),e("li",[e("p",[e("strong",[t._v("Voting options:")]),t._v(" Voters can choose between "),e("code",[t._v("Yes")]),t._v(", "),e("code",[t._v("No")]),t._v(", "),e("code",[t._v("NoWithVeto")]),t._v(", and "),e("code",[t._v("Abstain")]),t._v(". "),e("code",[t._v("NoWithVeto")]),t._v(" allows the voter to cast a "),e("code",[t._v("No")]),t._v(" vote, but also to veto the proposal. If a proposal is vetoed, it is automatically rejected and the deposit burned. "),e("code",[t._v("Abstain")]),t._v(" allows the voter to abstain from voting. With a majority of "),e("code",[t._v("Yes")]),t._v(", the proposal pass and its messages are executed. "),e("code",[t._v("Abstain")]),t._v(" is different from not voting at all, as voting contributes to reaching the quorum.")])]),t._v(" "),e("li",[e("p",[e("strong",[t._v("Voting weight:")]),t._v(" A.k.a. "),e("strong",[t._v("voting power")]),t._v(". Each vote is weighted by the voter's staked tokens at the time the vote tally is computed. For the avoidance of doubt, it means that the number of staked tokens at the time the vote transaction is sent is irrelevant.")])]),t._v(" "),e("li",[e("p",[e("strong",[t._v("Quorum:")]),t._v(" Quorum is defined as the minimum percentage of voting power that needs to be cast on a proposal for the result to be valid. If the quorum is not reached, the proposal is rejected.")])])]),t._v(" "),e("p",[t._v("More information about the governance concepts can be found in the "),e("a",{attrs:{href:"https://docs.cosmos.network/v0.46/modules/gov/01_concepts.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("Cosmos SDK documentation"),e("OutboundLink")],1),t._v(".")]),t._v(" "),e("h2",{attrs:{id:"requirements"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#requirements"}},[t._v("#")]),t._v(" Requirements")]),t._v(" "),e("p",[t._v("In the Cosmos SDK "),e("a",{attrs:{href:"https://docs.cosmos.network/v0.46/modules/gov/",target:"_blank",rel:"noopener noreferrer"}},[t._v("v0.46.0 release"),e("OutboundLink")],1),t._v(", the gov module has been "),e("a",{attrs:{href:"https://github.com/cosmos/cosmos-sdk/blob/main/UPGRADING.md#xgov-1",target:"_blank",rel:"noopener noreferrer"}},[t._v("upgraded from "),e("code",[t._v("v1beta1")]),t._v(" to "),e("code",[t._v("v1")]),e("OutboundLink")],1),t._v(". To follow this tutorial, you must use the binary of a chain with the "),e("em",[t._v("v1")]),t._v(" gov module, for instance with a v0.46+ version of the SDK. For demonstration purposes, you will use "),e("code",[t._v("simd")]),t._v(", the simulation app of the Cosmos SDK.")]),t._v(" "),e("p",[t._v("To install "),e("code",[t._v("simd")]),t._v(", first clone the Cosmos SDK GitHub repository and checkout the right version:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBnaXQgY2xvbmUgaHR0cHM6Ly9naXRodWIuY29tL2Nvc21vcy9jb3Ntb3Mtc2RrIC0tZGVwdGg9MSAtLWJyYW5jaCB2MC40Ni4yCg=="}}),t._v(" "),e("p",[t._v("You are installing "),e("code",[t._v("v0.46.2")]),t._v(" because this version added the command "),e("code",[t._v("draft-proposal")]),t._v(". You will learn later what it does.")]),t._v(" "),e("p",[t._v("Go to the cloned directory:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjZCBjb3Ntb3Mtc2RrCg=="}}),t._v(" "),e("p",[t._v("Install "),e("code",[t._v("simd")]),t._v(":")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBtYWtlIGluc3RhbGwK"}}),t._v(" "),e("p",[t._v("Make sure the installation was successful:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHZlcnNpb24K"}}),t._v(" "),e("p",[t._v("The returned version number should be equal to "),e("code",[t._v("0.46.2")]),t._v(".")]),t._v(" "),e("h2",{attrs:{id:"configuration"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#configuration"}},[t._v("#")]),t._v(" Configuration")]),t._v(" "),e("HighlightBox",{attrs:{type:"tip"}},[e("p",[t._v("If you have used "),e("code",[t._v("simd")]),t._v(" before, you might already have a "),e("code",[t._v(".simapp")]),t._v(" directory in your home directory. You can skip to the next section or remove the chain directory ("),e("code",[t._v("rm -rf ~/.simapp")]),t._v(").")])]),t._v(" "),e("p",[t._v("To configure "),e("code",[t._v("simd")]),t._v(", you have to set the chain ID and the keyring backend.")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIGNvbmZpZyBjaGFpbi1pZCBkZW1vCiQgc2ltZCBjb25maWcga2V5cmluZy1iYWNrZW5kIHRlc3QK"}}),t._v(" "),e("p",[t._v("Secondly, you need to add keys for chain users. Call them Alice and Bob:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIGtleXMgYWRkIGFsaWNlCiQgc2ltZCBrZXlzIGFkZCBib2IK"}}),t._v(" "),e("p",[t._v("With "),e("code",[t._v("simd keys list")]),t._v(" you can verify that your two users have been added.")]),t._v(" "),e("HighlightBox",{attrs:{type:"tip"}},[e("p",[t._v("To avoid having to copy and paste the user addresses, now is a good time to export the user keys to variables that you can access and use for this tutorial.")])]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBleHBvcnQgQUxJQ0U9JChzaW1kIGtleXMgc2hvdyBhbGljZSAtLWFkZHJlc3MpCiQgZXhwb3J0IEJPQj0kKHNpbWQga2V5cyBzaG93IGJvYiAtLWFkZHJlc3MpCg=="}}),t._v(" "),e("p",[t._v("Now you are ready to fund Alice and Bob's respective accounts and use the Alice account as a validator:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIGluaXQgdGVzdCAtLWNoYWluLWlkIGRlbW8K"}}),t._v(" "),e("p",[t._v("The default voting period is "),e("strong",[t._v("172800s")]),t._v(" (two days). It is too long to wait for the tutorial, so you will change it to "),e("strong",[t._v("180s")]),t._v(" (three minutes). To do so, edit the "),e("code",[t._v("~/.simapp/config/genesis.json")]),t._v(" file:")]),t._v(" "),e("CodeGroup",[e("CodeGroupItem",{attrs:{title:"v0.46",active:""}},[e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjYXQgJmx0OyZsdDsmbHQ7ICQoanEgJy5hcHBfc3RhdGUuZ292LnZvdGluZ19wYXJhbXMudm90aW5nX3BlcmlvZCA9ICZxdW90OzE4MHMmcXVvdDsnIH4vLnNpbWFwcC9jb25maWcvZ2VuZXNpcy5qc29uKSAmZ3Q7IH4vLnNpbWFwcC9jb25maWcvZ2VuZXNpcy5qc29uCg=="}})],1),t._v(" "),e("CodeGroupItem",{attrs:{title:"v0.47+"}},[e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjYXQgJmx0OyZsdDsmbHQ7ICQoanEgJy5hcHBfc3RhdGUuZ292LnBhcmFtcy52b3RpbmdfcGVyaW9kID0gJnF1b3Q7MTgwcyZxdW90Oycgfi8uc2ltYXBwL2NvbmZpZy9nZW5lc2lzLmpzb24pICZndDsgfi8uc2ltYXBwL2NvbmZpZy9nZW5lc2lzLmpzb24K"}})],1)],1),t._v(" "),e("p",[t._v("Then add the genesis accounts:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIGFkZC1nZW5lc2lzLWFjY291bnQgYWxpY2UgNTAwMDAwMDAwMHN0YWtlIC0ta2V5cmluZy1iYWNrZW5kIHRlc3QKJCBzaW1kIGFkZC1nZW5lc2lzLWFjY291bnQgYm9iIDUwMDAwMDAwMDBzdGFrZSAtLWtleXJpbmctYmFja2VuZCB0ZXN0CiQgc2ltZCBnZW50eCBhbGljZSAxMDAwMDAwc3Rha2UgLS1jaGFpbi1pZCBkZW1vCiQgc2ltZCBjb2xsZWN0LWdlbnR4cwo="}}),t._v(" "),e("p",[t._v("Lastly, start the chain:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHN0YXJ0Cg=="}}),t._v(" "),e("p",[e("code",[t._v("simapp")]),t._v(" is now configured and running. You can play with the gov module.")]),t._v(" "),e("h2",{attrs:{id:"create-a-proposal"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#create-a-proposal"}},[t._v("#")]),t._v(" Create a proposal")]),t._v(" "),e("HighlightBox",{attrs:{type:"note"}},[e("p",[t._v("Prior to submitting a proposal on the Cosmos Hub, it is good practice and also requested to publish a draft of the proposal on the "),e("a",{attrs:{href:"https://forum.cosmos.network",target:"_blank",rel:"noopener noreferrer"}},[t._v("Cosmos Hub Forum"),e("OutboundLink")],1),t._v(". This allows the community to discuss the proposal before it appears on chain.")])]),t._v(" "),e("p",[t._v("Before sending anything to the blockchain, to create the files that describe a proposal in the proper format, you can use the following interactive command:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdvdiBkcmFmdC1wcm9wb3NhbAo="}}),t._v(" "),e("p",[t._v("You will first create a simple text proposal. A text proposal does not contain any message, but only proposal "),e("a",{attrs:{href:"https://docs.cosmos.network/v0.46/modules/gov/08_metadata.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("metadata"),e("OutboundLink")],1),t._v(".")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"VXNlIHRoZSBhcnJvdyBrZXlzIHRvIG5hdmlnYXRlOiDihpMg4oaRIOKGkiDihpAgCj8gU2VsZWN0IHByb3Bvc2FsIHR5cGU6IAogIOKWuCB0ZXh0CiAgICBjb21tdW5pdHktcG9vbC1zcGVuZAogICAgc29mdHdhcmUtdXBncmFkZQogICAgY2FuY2VsLXNvZnR3YXJlLXVwZ3JhZGUKICAgIG90aGVyCg=="}}),t._v(" "),e("p",[t._v("Then enter the proposal title, authors, and other proposal metadata:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"4pyUIHRleHQK4pyUIEVudGVyIHByb3Bvc2FsIHRpdGxlOiBUZXN0IFByb3Bvc2FsCuKclCBFbnRlciBwcm9wb3NhbCBhdXRob3JzOiBBbGljZQrinJQgRW50ZXIgcHJvcG9zYWwgc3VtbWFyeTogQSB0ZXN0IHByb3Bvc2FsIHdpdGggc2ltYXBwCuKclCBFbnRlciBwcm9wb3NhbCBkZXRhaWxzOiAtCuKclCBFbnRlciBwcm9wb3NhbCBwcm9wb3NhbCBmb3J1bSB1cmw6IGh0dHBzOi8vZXhhbXBsZS5vcmcvcHJvcG9zYWwvMeKWiArinJQgRW50ZXIgcHJvcG9zYWwgdm90ZSBvcHRpb24gY29udGV4dDogWUVTOiBYWCwgTk86IFlYLCBBQlNUQUlOOiBYWSwgTk9fV0lUSF9WRVRPOiBZWQo="}}),t._v(" "),e("p",[t._v("Then enter the proposal deposit:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"4pyUIEVudGVyIHByb3Bvc2FsIGRlcG9zaXQ6IDEwc3Rha2UKWW91ciBkcmFmdCBwcm9wb3NhbCBoYXMgc3VjY2Vzc2Z1bGx5IGJlZW4gZ2VuZXJhdGVkLgpQcm9wb3NhbHMgc2hvdWxkIGNvbnRhaW4gb2ZmLWNoYWluIG1ldGFkYXRhLCBwbGVhc2UgdXBsb2FkIHRoZSBtZXRhZGF0YSBKU09OIHRvIElQRlMuClRoZW4sIHJlcGxhY2UgdGhlIGdlbmVyYXRlZCBtZXRhZGF0YSBmaWVsZCB3aXRoIHRoZSBJUEZTIENJRC4K"}}),t._v(" "),e("p",[t._v("The "),e("code",[t._v("draft-proposal")]),t._v(" command has now generated two files:")]),t._v(" "),e("ul",[e("li",[e("strong",[t._v("draft_metadata.json")])]),t._v(" "),e("li",[e("strong",[t._v("draft_proposal.json")])])]),t._v(" "),e("p",[t._v("The content of "),e("code",[t._v("draft_metadata.json")]),t._v(" contains the information you have just entered:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"ewogICZxdW90O3RpdGxlJnF1b3Q7OiAmcXVvdDtUZXN0IFByb3Bvc2FsJnF1b3Q7LAogICZxdW90O2F1dGhvcnMmcXVvdDs6ICZxdW90O0FsaWNlJnF1b3Q7LAogICZxdW90O3N1bW1hcnkmcXVvdDs6ICZxdW90O0EgdGVzdCBwcm9wb3NhbCB3aXRoIHNpbWFwcCZxdW90OywKICAmcXVvdDtkZXRhaWxzJnF1b3Q7OiAmcXVvdDstJnF1b3Q7LAogICZxdW90O3Byb3Bvc2FsX2ZvcnVtX3VybCZxdW90OzogJnF1b3Q7aHR0cHM6Ly9leGFtcGxlLm9yZy9wcm9wb3NhbC8xJnF1b3Q7LAogICZxdW90O3ZvdGVfb3B0aW9uX2NvbnRleHQmcXVvdDs6ICZxdW90O1lFUzogWFgsIE5POiBZWCwgQUJTVEFJTjogWFksIE5PX1dJVEhfVkVUTzogWVkmcXVvdDsKfQo="}}),t._v(" "),e("p",[t._v("This json should be "),e("a",{attrs:{href:"https://tutorials.cosmos.network/tutorials/how-to-use-ipfs/",target:"_blank",rel:"noopener noreferrer"}},[t._v("pinned on IPFS"),e("OutboundLink")],1),t._v(".")]),t._v(" "),e("HighlightBox",{attrs:{type:"note"}},[e("p",[t._v("In fact, this file is already pinned on IPFS. Its CID is "),e("code",[t._v("QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49")]),t._v(". You can verify its content on "),e("a",{attrs:{href:"https://ipfs.io/ipfs/QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49",target:"_blank",rel:"noopener noreferrer"}},[t._v("https://ipfs.io/ipfs/QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49"),e("OutboundLink")],1),t._v(".")])]),t._v(" "),e("p",[t._v("Now look at the content of the generated "),e("code",[t._v("draft_proposal.json")]),t._v(":")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"ewogICZxdW90O21ldGFkYXRhJnF1b3Q7OiAmcXVvdDtpcGZzOi8vQ0lEJnF1b3Q7LAogICZxdW90O2RlcG9zaXQmcXVvdDs6ICZxdW90OzEwc3Rha2UmcXVvdDsKfQo="}}),t._v(" "),e("p",[t._v("Replace the "),e("code",[t._v("metadata")]),t._v(" field with "),e("code",[t._v("ipfs://QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49")]),t._v(".")]),t._v(" "),e("p",[t._v("Submit the proposal on chain from alice:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdvdiBzdWJtaXQtcHJvcG9zYWwgZHJhZnRfcHJvcG9zYWwuanNvbiAtLWZyb20gYWxpY2UgLS1rZXlyaW5nLWJhY2tlbmQgdGVzdAo="}}),t._v(" "),e("p",[t._v("The command outputs a transaction hash. You can use it to query the proposal:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IHR4IEQ4RjExNjVBQUIzNDNFQjk0MTZGMURGM0QzMEYyODgzRDI2RTExMjVBRUQ3MzM4NzhDNTkwRTYwMjU2RUQ5QzkK"}}),t._v(" "),e("h2",{attrs:{id:"view-and-vote-on-proposals"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#view-and-vote-on-proposals"}},[t._v("#")]),t._v(" View and vote on proposals")]),t._v(" "),e("p",[t._v("In your case, the proposal ID is "),e("code",[t._v("1")]),t._v(". You can query the proposal with the following command:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdvdiBwcm9wb3NhbCAxCg=="}}),t._v(" "),e("p",[t._v("Which returns:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"ZGVwb3NpdF9lbmRfdGltZTogJnF1b3Q7MjAyMi0wOS0yMFQxNjozNjowNC43NDE0Mjc3NjhaJnF1b3Q7CmZpbmFsX3RhbGx5X3Jlc3VsdDoKICBhYnN0YWluX2NvdW50OiAmcXVvdDswJnF1b3Q7CiAgbm9fY291bnQ6ICZxdW90OzAmcXVvdDsKICBub193aXRoX3ZldG9fY291bnQ6ICZxdW90OzAmcXVvdDsKICB5ZXNfY291bnQ6ICZxdW90OzAmcXVvdDsKaWQ6ICZxdW90OzEmcXVvdDsKbWVzc2FnZXM6IFtdCm1ldGFkYXRhOiBpcGZzOi8vUW1ibWhZMWVOWGRtY1ZWOFFQcVY1ZW53TFptMW1qSDdpdjhhWVRRNFJKQ0g0OQpzdGF0dXM6IFBST1BPU0FMX1NUQVRVU19ERVBPU0lUX1BFUklPRApzdWJtaXRfdGltZTogJnF1b3Q7MjAyMi0wOS0xOFQxNjozNjowNC43NDE0Mjc3NjhaJnF1b3Q7CnRvdGFsX2RlcG9zaXQ6Ci0gYW1vdW50OiAmcXVvdDsxMCZxdW90OwogIGRlbm9tOiBzdGFrZQp2b3RpbmdfZW5kX3RpbWU6IG51bGwKdm90aW5nX3N0YXJ0X3RpbWU6IG51bGwK"}}),t._v(" "),e("p",[t._v("As you can see, the proposal is in the deposit period. This means that the deposit associated with it has not yet reached the minimum required, so you cannot vote on it just yet. Find out what is the minimum proposal deposit for a chain with the following command:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdvdiBwYXJhbXMgLS1vdXRwdXQganNvbiB8IGpxIC5kZXBvc2l0X3BhcmFtcy5taW5fZGVwb3NpdAo="}}),t._v(" "),e("p",[t._v("It returns:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"WwogIHsKICAgICZxdW90O2Rlbm9tJnF1b3Q7OiAmcXVvdDtzdGFrZSZxdW90OywKICAgICZxdW90O2Ftb3VudCZxdW90OzogJnF1b3Q7MTAwMDAwMDAmcXVvdDsKICB9Cl0K"}}),t._v(" "),e("p",[t._v("Therefore, since you submitted the proposal with "),e("code",[t._v("10stake")]),t._v(", you need to top up the deposit with "),e("code",[t._v("9999990stake")]),t._v(". You can do so with Bob and the following command:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdvdiBkZXBvc2l0IDEgOTk5OTk5MHN0YWtlIC0tZnJvbSBib2IgLS1rZXlyaW5nLWJhY2tlbmQgdGVzdAo="}}),t._v(" "),e("p",[t._v("The proposal is now in the voting period. Do not forget, you have three minutes ("),e("code",[t._v("180s")]),t._v(" as per the gov parameters) to vote on the proposal.")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdvdiBwcm9wb3NhbCAxIC0tb3V0cHV0IGpzb24gfCBqcSAuc3RhdHVzCg=="}}),t._v(" "),e("p",[t._v("You can vote on it with the following command:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdvdiB2b3RlIDEgeWVzIC0tZnJvbSBhbGljZSAtLWtleXJpbmctYmFja2VuZCB0ZXN0CiQgc2ltZCB0eCBnb3Ygdm90ZSAxIG5vIC0tZnJvbSBib2IgLS1rZXlyaW5nLWJhY2tlbmQgdGVzdAo="}}),t._v(" "),e("p",[t._v("After waiting for the voting period, you can see that the proposal has passed.")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdvdiBwcm9wb3NhbCAxIC0tb3V0cHV0IGpzb24gfCBqcSAuc3RhdHVzCg=="}}),t._v(" "),e("p",[t._v("This is because the governance proposal weights each vote by the number of tokens staked. Alice owns staked tokens, while Bob had no staked tokens at the end of the voting period. So Bob's vote was not taken into consideration in the tally of the result.")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IHN0YWtpbmcgZGVsZWdhdGlvbnMgJEFMSUNFCiQgc2ltZCBxdWVyeSBzdGFraW5nIGRlbGVnYXRpb25zICRCT0IK"}}),t._v(" "),e("p",[t._v("After a proposal execution, the deposit is refunded (unless a weighted majority voted "),e("code",[t._v("No with veto")]),t._v("). You can check the balance of Alice and Bob with the following commands:")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGJhbmsgYmFsYW5jZXMgJEFMSUNFCiQgc2ltZCBxdWVyeSBiYW5rIGJhbGFuY2VzICRCT0IK"}}),t._v(" "),e("h2",{attrs:{id:"🎉-congratulations-🎉"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#🎉-congratulations-🎉"}},[t._v("#")]),t._v(" 🎉 Congratulations 🎉")]),t._v(" "),e("p",[t._v("By completing this tutorial, you have learned how to use the "),e("code",[t._v("gov")]),t._v(" module!")]),t._v(" "),e("HighlightBox",{attrs:{type:"synopsis"}},[e("p",[t._v("To summarize, this tutorial has explained:")]),t._v(" "),e("ul",[e("li",[t._v("How to a create proposal.")]),t._v(" "),e("li",[t._v("How to submit a proposal")]),t._v(" "),e("li",[t._v("How to vote on a proposal.")])])]),t._v(" "),e("p",[t._v("For more information about what else you can do with the CLI, please refer to the module help.")]),t._v(" "),e("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdvdiAtLWhlbHAKJCBzaW1kIHF1ZXJ5IGdvdiAtLWhlbHAK"}}),t._v(" "),e("p",[t._v("To learn more about the gov specs, check out the "),e("a",{attrs:{href:"https://docs.cosmos.network/main/modules/gov",target:"_blank",rel:"noopener noreferrer"}},[t._v("group"),e("OutboundLink")],1),t._v(" module developer documentation.\nIf you want to learn more about the Cosmos Hub governance, please refer to the "),e("a",{attrs:{href:"https://hub.cosmos.network/main/governance",target:"_blank",rel:"noopener noreferrer"}},[t._v("Cosmos Hub governance"),e("OutboundLink")],1),t._v(" documentation.")])],1)}),[],!1,null,null,null);o.default=s.exports}}]);