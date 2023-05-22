(window.webpackJsonp=window.webpackJsonp||[]).push([[194],{810:function(e,o,t){"use strict";t.r(o);var a=t(1),s=Object(a.a)({},(function(){var e=this,o=e.$createElement,t=e._self._c||o;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"group-module"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#group-module"}},[e._v("#")]),e._v(" Group Module")]),e._v(" "),t("p",[e._v("The "),t("a",{attrs:{href:"https://docs.cosmos.network/v0.46/modules/group/",target:"_blank",rel:"noopener noreferrer"}},[t("code",[e._v("group")]),t("OutboundLink")],1),e._v(" module enables the creation and management of multisig accounts and enables voting for message execution based on configurable decision policies.")]),e._v(" "),t("h2",{attrs:{id:"usage-of-the-group-module"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#usage-of-the-group-module"}},[e._v("#")]),e._v(" Usage of the group module")]),e._v(" "),t("p",[e._v("When the group module is enabled in a chain (say the Cosmos Hub), this means that users can create groups and submit group proposals.\nThis means that any number of users can be part of a group and vote on the group's proposals. You can think of it as an enhanced multisig or DAO.")]),e._v(" "),t("p",[e._v("Before starting, let's first review some terminology:")]),e._v(" "),t("ul",[t("li",[t("strong",[e._v("Group Admin")]),e._v(": the account that creates the group is the group administrator. The group administrator is the account that can add, remove and change the group members, but does not need to be a member of the group itself. Choose it wisely.")]),e._v(" "),t("li",[t("strong",[t("a",{attrs:{href:"https://docs.cosmos.network/main/modules/group/01_concepts.html#group-policy",target:"_blank",rel:"noopener noreferrer"}},[e._v("Group Policy"),t("OutboundLink")],1)]),e._v(": a group policy is an account associated with a group and a decision policy. In order to perform actions on this account, a proposal must be approved by a majority of the group members; or as defined in the decision policy. For the avoidance of doubt, note that a group can have multiple group policies.")]),e._v(" "),t("li",[t("strong",[t("a",{attrs:{href:"https://docs.cosmos.network/main/modules/group/01_concepts.html#decision-policy",target:"_blank",rel:"noopener noreferrer"}},[e._v("Decision Policy"),t("OutboundLink")],1)]),e._v(": a policy that defines how the group members can vote on a proposal and how the vote outcome is calculated. A decision policy is associated to a group policy. This means that it is possible for a group to have different decision policies for each of its different group policies.")]),e._v(" "),t("li",[t("strong",[e._v("Proposal")]),e._v(": A group proposal works the same way as a governance proposal: group members can submit proposals to the group and vote on proposals with a "),t("em",[e._v("Yes")]),e._v(", "),t("em",[e._v("No")]),e._v(", "),t("em",[e._v("No with Veto")]),e._v(" and "),t("em",[e._v("Abstain")]),e._v(".")])]),e._v(" "),t("p",[e._v("In this tutorial, you will learn how to create a group, manage its members, submit a group proposal and vote on it.\nAfter that you'll be able to create your own on-chain DAO for your own use case.")]),e._v(" "),t("h2",{attrs:{id:"requirements"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#requirements"}},[e._v("#")]),e._v(" Requirements")]),e._v(" "),t("p",[e._v("The group module has been introduced in the "),t("a",{attrs:{href:"https://docs.cosmos.network/v0.46/modules/group/",target:"_blank",rel:"noopener noreferrer"}},[e._v("v0.46.0 release"),t("OutboundLink")],1),e._v(" of the Cosmos SDK.\nIn order to follow the tutorial, you must use the binary of a chain with the group module, using a v0.46+ version of the SDK.\nFor demonstration purposes, you will use "),t("code",[e._v("simd")]),e._v(", the simulation app of the Cosmos SDK.")]),e._v(" "),t("p",[e._v("To install "),t("code",[e._v("simd")]),e._v(", first clone the Cosmos SDK GitHub repository and checkout the right version:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBnaXQgY2xvbmUgaHR0cHM6Ly9naXRodWIuY29tL2Nvc21vcy9jb3Ntb3Mtc2RrIC0tZGVwdGg9MSAtLWJyYW5jaCB2MC40Ni4wCg=="}}),e._v(" "),t("p",[e._v("Go to the cloned directory:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBjZCBjb3Ntb3Mtc2RrCg=="}}),e._v(" "),t("p",[e._v("Install "),t("code",[e._v("simd")])]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBtYWtlIGluc3RhbGwK"}}),e._v(" "),t("p",[e._v("Make sure the installation was successful:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHZlcnNpb24K"}}),e._v(" "),t("p",[e._v("The version number should be greater than or equal to "),t("code",[e._v("0.46.0")]),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"configuration"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#configuration"}},[e._v("#")]),e._v(" Configuration")]),e._v(" "),t("HighlightBox",{attrs:{type:"tip"}},[t("p",[e._v("If you have used "),t("code",[e._v("simd")]),e._v(" before, you might already have a "),t("code",[e._v(".simapp")]),e._v(" directory in your home directory. You can skip to the next section or remove the chain directory ("),t("code",[e._v("rm -rf ~/.simapp")]),e._v(").")])]),e._v(" "),t("p",[e._v("In order to configure "),t("code",[e._v("simd")]),e._v(", you need to set the chain ID and the keyring backend.")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIGNvbmZpZyBjaGFpbi1pZCBkZW1vCiQgc2ltZCBjb25maWcga2V5cmluZy1iYWNrZW5kIHRlc3QK"}}),e._v(" "),t("p",[e._v("Secondly, you need to add keys for group users. Call them Alice and Bob.")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIGtleXMgYWRkIGFsaWNlCiQgc2ltZCBrZXlzIGFkZCBib2IK"}}),e._v(" "),t("p",[e._v("With "),t("code",[e._v("simd keys list")]),e._v(" you can verify that your two users have been added.")]),e._v(" "),t("HighlightBox",{attrs:{type:"tip"}},[t("p",[e._v("To avoid having to copy and paste the user addresses, now is a good time to export the user keys to variables that you can access and use for this tutorial.")])]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBleHBvcnQgQUxJQ0U9JChzaW1kIGtleXMgc2hvdyBhbGljZSAtLWFkZHJlc3MpCiQgZXhwb3J0IEJPQj0kKHNpbWQga2V5cyBzaG93IGJvYiAtLWFkZHJlc3MpCg=="}}),e._v(" "),t("p",[e._v("Now you are ready to fund Alice and Bob accounts and use the Alice account as validator:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIGluaXQgdGVzdCAtLWNoYWluLWlkIGRlbW8KJCBzaW1kIGFkZC1nZW5lc2lzLWFjY291bnQgYWxpY2UgNTAwMDAwMDAwMHN0YWtlIC0ta2V5cmluZy1iYWNrZW5kIHRlc3QKJCBzaW1kIGFkZC1nZW5lc2lzLWFjY291bnQgYm9iIDUwMDAwMDAwMDBzdGFrZSAtLWtleXJpbmctYmFja2VuZCB0ZXN0CiQgc2ltZCBnZW50eCBhbGljZSAxMDAwMDAwc3Rha2UgLS1jaGFpbi1pZCBkZW1vCiQgc2ltZCBjb2xsZWN0LWdlbnR4cwo="}}),e._v(" "),t("p",[e._v("Lastly, start the chain:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHN0YXJ0Cg=="}}),e._v(" "),t("p",[t("code",[e._v("simapp")]),e._v(" is now configured and running. You can now play with the group module.")]),e._v(" "),t("h2",{attrs:{id:"create-a-group"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#create-a-group"}},[e._v("#")]),e._v(" Create a group")]),e._v(" "),t("p",[e._v("To create a group, you must decide who is the admin and who are the members.\nAll members have a voting weight that is used to calculate their voting power in the group.")]),e._v(" "),t("p",[e._v("Create a "),t("code",[e._v("members.json")]),e._v(" file that contains group members of a football association.\nReplace "),t("code",[e._v("aliceaddr")]),e._v(" and "),t("code",[e._v("bobaddr")]),e._v(" with the literal addresses of Alice ("),t("code",[e._v("$ALICE")]),e._v(") and Bob ("),t("code",[e._v("$BOB")]),e._v(") respectively.")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"ewogICAgJnF1b3Q7bWVtYmVycyZxdW90OzogWwogICAgICAgIHsKICAgICAgICAgICAgJnF1b3Q7YWRkcmVzcyZxdW90OzogJnF1b3Q7YWxpY2VhZGRyJnF1b3Q7LCAvLyAkQUxJQ0UKICAgICAgICAgICAgJnF1b3Q7d2VpZ2h0JnF1b3Q7OiAmcXVvdDsxJnF1b3Q7LAogICAgICAgICAgICAmcXVvdDttZXRhZGF0YSZxdW90OzogJnF1b3Q7cHJlc2lkZW50JnF1b3Q7CiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAgICZxdW90O2FkZHJlc3MmcXVvdDs6ICZxdW90O2JvYmFkZHImcXVvdDssIC8vICRCT0IKICAgICAgICAgICAgJnF1b3Q7d2VpZ2h0JnF1b3Q7OiAmcXVvdDsxJnF1b3Q7LAogICAgICAgICAgICAmcXVvdDttZXRhZGF0YSZxdW90OzogJnF1b3Q7dHJlYXN1cmVyJnF1b3Q7CiAgICAgICAgfQogICAgXQp9Cg=="}}),e._v(" "),t("p",[e._v("For the avoidance of doubt, in the JSON above, Alice is labeled with some metadata that identifies her as the "),t("code",[e._v('"president"')]),e._v(". The presence of this metadata does not make her the administrator of the group. It only identifies her as a member of the group. Presumably one to whom the group's other members will look up.")]),e._v(" "),t("p",[e._v("Create the group:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdyb3VwIGNyZWF0ZS1ncm91cCAkQUxJQ0UgJnF1b3Q7YmVzdCBmb290YmFsbCBhc3NvY2lhdGlvbiZxdW90OyBtZW1iZXJzLmpzb24K"}}),e._v(" "),t("p",[e._v("It is here, by sending the create transaction, that Alice becomes the administrator of the group.")]),e._v(" "),t("p",[e._v("At what ID was the group created? Recall the transaction and look for the attributes of the event whose type is "),t("code",[e._v('"cosmos.group.v1.EventCreateGroup"')]),e._v(". For instance:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IHR4IDA3OUQ5QjIxM0RDREU5OURCMEUzMUE4QUZFOUIwRkRDNjA1QzgxQzE4ODBEMDhEOTlBNDkzQTdCQzUyRkFDMjMgLS1vdXRwdXQganNvbiB8IGpxICZxdW90Oy5ldmVudHMmcXVvdDsgfCBqcSAnLltdIHwgc2VsZWN0KC50eXBlID09ICZxdW90O2Nvc21vcy5ncm91cC52MS5FdmVudENyZWF0ZUdyb3VwJnF1b3Q7KSB8IC5hdHRyaWJ1dGVzJwo="}}),e._v(" "),t("p",[e._v("This returns something like:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"WwogIHsKICAgICZxdW90O2tleSZxdW90OzogJnF1b3Q7WjNKdmRYQmZhV1E9JnF1b3Q7LAogICAgJnF1b3Q7dmFsdWUmcXVvdDs6ICZxdW90O0lqRWkmcXVvdDssCiAgICAmcXVvdDtpbmRleCZxdW90OzogdHJ1ZQogIH0KXQo="}}),e._v(" "),t("p",[e._v("Where "),t("code",[e._v("Z3JvdXBfaWQ=")]),e._v(" is a "),t("a",{attrs:{href:"https://www.browserling.com/tools/base64-decode",target:"_blank",rel:"noopener noreferrer"}},[e._v("Base64 encoding"),t("OutboundLink")],1),e._v(" of "),t("code",[e._v("group_id")]),e._v(", and "),t("code",[e._v("IjEi")]),e._v(" is a Base64 encoding of "),t("code",[e._v('"1"')]),e._v(", including the "),t("code",[e._v('"')]),e._v(". Therefore your group ID is "),t("code",[e._v("1")]),e._v(". Or with a one-liner:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBleHBvcnQgR1JPVVBfSUQ9JChzaW1kIHF1ZXJ5IHR4IDA3OUQ5QjIxM0RDREU5OURCMEUzMUE4QUZFOUIwRkRDNjA1QzgxQzE4ODBEMDhEOTlBNDkzQTdCQzUyRkFDMjMgLS1vdXRwdXQganNvbiB8IGpxICcuZXZlbnRzJyB8IGpxIC1yICcuW10gfCBzZWxlY3QoLnR5cGUgPT0gJnF1b3Q7Y29zbW9zLmdyb3VwLnYxLkV2ZW50Q3JlYXRlR3JvdXAmcXVvdDspIHwgLmF0dHJpYnV0ZXNbMF0udmFsdWUnIHwgYmFzZTY0IC0tZGVjb2RlIHwganEgLXIgJy4nKQo="}}),e._v(" "),t("p",[e._v("Query and verify the group that you just created and its ID that you just extracted:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdyb3VwIGdyb3Vwcy1ieS1hZG1pbiAkQUxJQ0UK"}}),e._v(" "),t("p",[e._v("This last command outputs "),t("code",[e._v("1")]),e._v(" too. This shows you that the group and its "),t("code",[e._v("id")]),e._v(" can be recalled. Use that "),t("code",[e._v("id")]),e._v(" for querying the group members.")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdyb3VwIGdyb3VwLW1lbWJlcnMgJEdST1VQX0lECg=="}}),e._v(" "),t("p",[e._v("Nice! Your group has "),t("code",[e._v("best football association")]),e._v(" as metadata (which you can recall with the "),t("code",[e._v("group-info")]),e._v(" command), Alice as group admin, and Alice and Bob as group members.")]),e._v(" "),t("h2",{attrs:{id:"manage-group-members"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#manage-group-members"}},[e._v("#")]),e._v(" Manage group members")]),e._v(" "),t("p",[e._v("To update the group's members, you send a transaction using the "),t("code",[e._v("update-group-members")]),e._v(" command and a JSON file modeled on the previous "),t("code",[e._v("members.json")]),e._v(". The file only needs to contain the changes to the membership. Unchanged members do not need to be included in the "),t("code",[e._v("members_updates.json")]),e._v(".")]),e._v(" "),t("p",[e._v("To add a member to the group, you mention it in the JSON, and to remove a member from the group, you mention it and set this member's voting weight to "),t("code",[e._v("0")]),e._v(".")]),e._v(" "),t("p",[e._v("Let's add Carol, Dave and Emma as group members and remove Bob. Create "),t("code",[e._v("members_update.json")]),e._v(" with:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"ewogICAgJnF1b3Q7bWVtYmVycyZxdW90OzogWwogICAgICAgIHsKICAgICAgICAgICAgJnF1b3Q7YWRkcmVzcyZxdW90OzogJnF1b3Q7Ym9iYWRkciZxdW90OywgLy8gJEJPQgogICAgICAgICAgICAmcXVvdDt3ZWlnaHQmcXVvdDs6ICZxdW90OzAmcXVvdDsgLy8gdGhpcyBkZWxldGVzIGJvYgogICAgICAgICAgICAvLyBUaGUgbWV0YWRhdGEgZG9lcyBub3QgbmVlZCB0byBiZSBtZW50aW9uZWQKICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICAgJnF1b3Q7YWRkcmVzcyZxdW90OzogJnF1b3Q7Y2Fyb2xhZGRyJnF1b3Q7LAogICAgICAgICAgICAmcXVvdDt3ZWlnaHQmcXVvdDs6ICZxdW90OzEmcXVvdDssCiAgICAgICAgICAgICZxdW90O21ldGFkYXRhJnF1b3Q7OiAmcXVvdDt0cmVhc3VyZXImcXVvdDsKICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICAgJnF1b3Q7YWRkcmVzcyZxdW90OzogJnF1b3Q7ZGF2ZWFkZHImcXVvdDssCiAgICAgICAgICAgICZxdW90O3dlaWdodCZxdW90OzogJnF1b3Q7MSZxdW90OywKICAgICAgICAgICAgJnF1b3Q7bWV0YWRhdGEmcXVvdDs6ICZxdW90O3BsYXllciZxdW90OwogICAgICAgIH0sCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICZxdW90O2FkZHJlc3MmcXVvdDs6ICZxdW90O2VtbWFhZGRyJnF1b3Q7LAogICAgICAgICAgICAmcXVvdDt3ZWlnaHQmcXVvdDs6ICZxdW90OzEmcXVvdDssCiAgICAgICAgICAgICZxdW90O21ldGFkYXRhJnF1b3Q7OiAmcXVvdDtwbGF5ZXImcXVvdDsKICAgICAgICB9LAogICAgXQp9Cg=="}}),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdyb3VwIHVwZGF0ZS1ncm91cC1tZW1iZXJzICRBTElDRSAkR1JPVVBfSUQgbWVtYmVyc191cGRhdGVzLmpzb24K"}}),e._v(" "),t("p",[e._v("You can verify that the group members are updated:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdyb3VwIGdyb3VwLW1lbWJlcnMgJEdST1VQX0lECg=="}}),e._v(" "),t("p",[e._v("As an exercise, please add Bob back in the group and go to the next section.")]),e._v(" "),t("h2",{attrs:{id:"create-a-group-policy"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#create-a-group-policy"}},[e._v("#")]),e._v(" Create a group policy")]),e._v(" "),t("p",[e._v("Next you need to create a group policy and its decision policy. This defines how long a proposal can be voted on and how its outcome is calculated. Here you use the "),t("a",{attrs:{href:"https://github.com/cosmos/cosmos-sdk/blob/release/v0.46.x/proto/cosmos/group/v1/types.proto#L53-L62",target:"_blank",rel:"noopener noreferrer"}},[t("code",[e._v("ThresholdDecisionPolicy")]),t("OutboundLink")],1),e._v(" as decision policy. It defines the threshold that the tally of weighted "),t("em",[e._v("yes")]),e._v(" votes must reach in order for a proposal to pass. Each member's vote is weighted by its weight as defined in the group.")]),e._v(" "),t("p",[e._v("Following is the content of the "),t("code",[e._v("policy.json")]),e._v(". It states that:")]),e._v(" "),t("ul",[t("li",[e._v("A proposal can be voted on for a maximum of 10 minutes.")]),e._v(" "),t("li",[e._v("A proposal requires only one vote to pass.")])]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"ewogICAgJnF1b3Q7QHR5cGUmcXVvdDs6ICZxdW90Oy9jb3Ntb3MuZ3JvdXAudjEuVGhyZXNob2xkRGVjaXNpb25Qb2xpY3kmcXVvdDssCiAgICAmcXVvdDt0aHJlc2hvbGQmcXVvdDs6ICZxdW90OzEmcXVvdDssCiAgICAmcXVvdDt3aW5kb3dzJnF1b3Q7OiB7CiAgICAgICAgJnF1b3Q7dm90aW5nX3BlcmlvZCZxdW90OzogJnF1b3Q7MTBtJnF1b3Q7LAogICAgICAgICZxdW90O21pbl9leGVjdXRpb25fcGVyaW9kJnF1b3Q7OiAmcXVvdDswcyZxdW90OwogICAgfQp9Cg=="}}),e._v(" "),t("p",[e._v("Have the group administrator create the group policy with metadata that identifies it as one with a quick turnaround:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdyb3VwIGNyZWF0ZS1ncm91cC1wb2xpY3kgJEFMSUNFICRHUk9VUF9JRCAmcXVvdDtxdWljayB0dXJuYXJvdW5kJnF1b3Q7IHBvbGljeS5qc29uCg=="}}),e._v(" "),t("p",[e._v("Check and verify your newly created group policy and in particular the address you just created:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBleHBvcnQgR1JPVVBfUE9MSUNZX0FERFJFU1M9JChzaW1kIHF1ZXJ5IHR4IDA2REI1NkMyNTQ1N0UxMENDQUI1NDc2QzhCRTg0NTM0RUJDNkUxMDI0MTk1M0MxMzdBRUM5Q0Q2QzM1QTVGM0IgLS1vdXRwdXQganNvbiB8IGpxICcuZXZlbnRzJyB8IGpxIC1yICcuW10gfCBzZWxlY3QoLnR5cGUgPT0gJnF1b3Q7Y29zbW9zLmdyb3VwLnYxLkV2ZW50Q3JlYXRlR3JvdXBQb2xpY3kmcXVvdDspIHwgLmF0dHJpYnV0ZXNbMF0udmFsdWUnIHwgYmFzZTY0IC0tZGVjb2RlIHwganEgLXIgJy4nKQo="}}),e._v(" "),t("p",[e._v("You can as well find the group policy by querying the group:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdyb3VwIGdyb3VwLXBvbGljaWVzLWJ5LWdyb3VwICRHUk9VUF9JRAokIHNpbWQgcXVlcnkgZ3JvdXAgZ3JvdXAtcG9saWNpZXMtYnktZ3JvdXAgJEdST1VQX0lEIC0tb3V0cHV0IGpzb24gfCBqcSAtciAnLmdyb3VwX3BvbGljaWVzWzBdLmFkZHJlc3MnCg=="}}),e._v(" "),t("p",[e._v("Note how the decision policy's address, at "),t("code",[e._v("cosmos")]),e._v(" plus 59 characters is longer than a "),t("em",[e._v("regular")]),e._v(" account's address. This is because a group address is a derived address. You can learn more on that in "),t("a",{attrs:{href:"https://github.com/cosmos/cosmos-sdk/blob/main/docs/architecture/adr-028-public-key-addresses.md#derived-addresses",target:"_blank",rel:"noopener noreferrer"}},[e._v("ADR-28"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"create-a-proposal"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#create-a-proposal"}},[e._v("#")]),e._v(" Create a proposal")]),e._v(" "),t("p",[e._v("Now that you have a group with a few members and a group policy, you submit your first group proposal.\nLike for members management, you need to create a "),t("code",[e._v("proposal.json")]),e._v(" file that contains the proposal.")]),e._v(" "),t("p",[e._v("A proposal can contain any number of messages defined on the current blockchain.")]),e._v(" "),t("p",[e._v("For this tutorial, you continue with your example of an association. The treasurer, Bob, who wants to send money to a third party to pay the bills, creates a "),t("code",[e._v("proposal.json")]),e._v(":")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"ewogICAgJnF1b3Q7Z3JvdXBfcG9saWN5X2FkZHJlc3MmcXVvdDs6ICZxdW90O2Nvc21vczEuLi4mcXVvdDsgLCAvLyB0aGUgJEdST1VQX1BPTElDWV9BRERSRVNTCiAgICAvLyBhcnJheSBvZiBwcm90by1KU09OLWVuY29kZWQgc2RrLk1zZ3MKICAgICZxdW90O21lc3NhZ2VzJnF1b3Q7OiBbCiAgICAgICAgewogICAgICAgICAgICAmcXVvdDtAdHlwZSZxdW90OzogJnF1b3Q7L2Nvc21vcy5iYW5rLnYxYmV0YTEuTXNnU2VuZCZxdW90OywKICAgICAgICAgICAgJnF1b3Q7ZnJvbV9hZGRyZXNzJnF1b3Q7OiAmcXVvdDtjb3Ntb3MxLi4uJnF1b3Q7LCAvLyB0aGUgJEdST1VQX1BPTElDWV9BRERSRVNTCiAgICAgICAgICAgICZxdW90O3RvX2FkZHJlc3MmcXVvdDs6ICZxdW90O2Nvc21vczF6eXp1MzVybWN0ZmQyZnFubnl0dGhoZXVncXM5NnF4c25lNjdhZCZxdW90OywgLy8gYSB0aGlyZC1wYXJ0eQogICAgICAgICAgICAmcXVvdDthbW91bnQmcXVvdDs6IFsKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAmcXVvdDtkZW5vbSZxdW90OzogJnF1b3Q7c3Rha2UmcXVvdDssCiAgICAgICAgICAgICAgICAgICAgJnF1b3Q7YW1vdW50JnF1b3Q7OiAmcXVvdDsxMDAmcXVvdDsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgXQogICAgICAgIH0KICAgIF0sCiAgICAmcXVvdDttZXRhZGF0YSZxdW90OzogJnF1b3Q7dXRpbGl0aWVzIGJpbGwmcXVvdDssCiAgICAmcXVvdDtwcm9wb3NlcnMmcXVvdDs6IFsgJnF1b3Q7Ym9iYWRkciZxdW90OyBdIC8vICRCT0IKfQo="}}),e._v(" "),t("p",[e._v("This proposal, if passed, will send 100 "),t("code",[e._v("stake")]),e._v(" to "),t("code",[e._v("cosmos1zyzu35rmctfd2fqnnytthheugqs96qxsne67ad")]),e._v(" to pay the bills.\nThe tokens will be sent from the decision policy address.")]),e._v(" "),t("HighlightBox",{attrs:{type:"tip"}},[t("p",[e._v("The decision policy has no funds yet. You can fund it by sending a transaction with "),t("code",[e._v("simd tx bank send alice $GROUP_POLICY_ADDRESS 100stake")]),e._v(".")])]),e._v(" "),t("p",[e._v("Submit the proposal:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdyb3VwIHN1Ym1pdC1wcm9wb3NhbCBwcm9wb3NhbC5qc29uIC0tZnJvbSBib2IK"}}),e._v(" "),t("p",[e._v("Once more, extract the proposal ID (remember to use the transaction hash you got at the previous command):")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBleHBvcnQgUFJPUE9TQUxfSUQ9JChzaW1kIHF1ZXJ5IHR4IEUzQ0JFNjkzMjI1NDA4OEQ1QTgwQ0Q1Q0IxOEJCMEY0RDM1Mzk2QTU0MkJEMjA3MzFFMUI2Qjk5N0UxQjA4NDcgLS1vdXRwdXQganNvbiB8IGpxICcuZXZlbnRzJyB8IGpxIC1yICcuW10gfCBzZWxlY3QoLnR5cGUgPT0gJnF1b3Q7Y29zbW9zLmdyb3VwLnYxLkV2ZW50U3VibWl0UHJvcG9zYWwmcXVvdDspIHwgLmF0dHJpYnV0ZXNbMF0udmFsdWUnIHwgYmFzZTY0IC0tZGVjb2RlIHwganEgLXIgJy4nKQo="}}),e._v(" "),t("p",[e._v("You can also find the proposal id via your group policy:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdyb3VwIHByb3Bvc2Fscy1ieS1ncm91cC1wb2xpY3kgJEdST1VQX1BPTElDWV9BRERSRVNTIC0tb3V0cHV0IGpzb24gfCBqcSAnLnByb3Bvc2Fsc1swXScK"}}),e._v(" "),t("h2",{attrs:{id:"view-and-vote-on-proposals"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#view-and-vote-on-proposals"}},[e._v("#")]),e._v(" View and vote on proposals")]),e._v(" "),t("p",[e._v("You can see that your proposal has been submitted. And that it contains a lot of information. For instance, confirm that its final tally is empty:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdyb3VwIHByb3Bvc2FsICRQUk9QT1NBTF9JRCAtLW91dHB1dCBqc29uIHwganEgJy5wcm9wb3NhbC5maW5hbF90YWxseV9yZXN1bHQnCg=="}}),e._v(" "),t("p",[e._v("Which returns:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"json",base64:"ewogICZxdW90O3llc19jb3VudCZxdW90OzogJnF1b3Q7MCZxdW90OywKICAmcXVvdDthYnN0YWluX2NvdW50JnF1b3Q7OiAmcXVvdDswJnF1b3Q7LAogICZxdW90O25vX2NvdW50JnF1b3Q7OiAmcXVvdDswJnF1b3Q7LAogICZxdW90O25vX3dpdGhfdmV0b19jb3VudCZxdW90OzogJnF1b3Q7MCZxdW90Owp9Cg=="}}),e._v(" "),t("p",[e._v("And that it is in the "),t("code",[e._v("PROPOSAL_STATUS_SUBMITTED")]),e._v(" status:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdyb3VwIHByb3Bvc2Fscy1ieS1ncm91cC1wb2xpY3kgJEdST1VQX1BPTElDWV9BRERSRVNTIC0tb3V0cHV0IGpzb24gfCBqcSAtciAnLnByb3Bvc2Fsc1swXS5zdGF0dXMnCg=="}}),e._v(" "),t("p",[e._v("Next, have Alice and Bob vote "),t("em",[e._v("Yes")]),e._v(" on the proposal and verify that both their votes are tallied using the proper query command:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdyb3VwIHZvdGUgJFBST1BPU0FMX0lEICRBTElDRSBWT1RFX09QVElPTl9ZRVMgJnF1b3Q7YWdyZWUmcXVvdDsKJCBzaW1kIHR4IGdyb3VwIHZvdGUgJFBST1BPU0FMX0lEICRCT0IgVk9URV9PUFRJT05fWUVTICZxdW90O2F5ZSZxdW90OwokIHNpbWQgcXVlcnkgZ3JvdXAgdGFsbHktcmVzdWx0ICRQUk9QT1NBTF9JRAo="}}),e._v(" "),t("p",[e._v("While you wait for the policy-prescribed 10 minutes, you can confirm that the final tally is still empty. After the 10 minutes have gone by your proposal should have passed, because the weighted tally of "),t("em",[e._v("Yes")]),e._v(" votes is above the decision policy threshold. Confirm this by looking at its "),t("code",[e._v("status")]),e._v(". It should be "),t("code",[e._v("PROPOSAL_STATUS_ACCEPTED")]),e._v(":")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdyb3VwIHByb3Bvc2FsICRQUk9QT1NBTF9JRAo="}}),e._v(" "),t("p",[e._v("By default proposals are not executed immediately. You can confirm this by looking at the proposal, it contains "),t("code",[e._v("executor_result: PROPOSAL_EXECUTOR_RESULT_NOT_RUN")]),e._v(".")]),e._v(" "),t("HighlightBox",{attrs:{type:"remember"}},[t("p",[e._v("This is to account for the fact that not everything may be in place to successfully execute the proposal's messages. As you recall, you already funded the group policy. If you did not fund it ahead of time, now is the time to do it.")]),e._v(" "),t("p",[e._v("Next time, if you wish to try to execute a proposal immediately after its submission, you can do so by using the "),t("code",[e._v("--exec 1")]),e._v(" flag. It will count the proposers signatures as "),t("em",[e._v("Yes")]),e._v(" votes.")])]),e._v(" "),t("p",[e._v("Execute the proposal now:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdyb3VwIGV4ZWMgJFBST1BPU0FMX0lEIC0tZnJvbSBhbGljZQo="}}),e._v(" "),t("HighlightBox",{attrs:{type:"note"}},[t("p",[e._v("If there were any errors when executing the proposal messages, none of the messages will be executed and the proposal will be marked as "),t("em",[e._v("Failed")]),e._v(".")])]),e._v(" "),t("p",[e._v("Verify that the proposal has been executed:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGdyb3VwIHByb3Bvc2FsICRQUk9QT1NBTF9JRAo="}}),e._v(" "),t("p",[e._v("It should return an error: "),t("code",[e._v("Error: rpc error: code = Unknown desc = load proposal: not found: unknown request")]),e._v(". That is because it has been entirely removed.")]),e._v(" "),t("p",[e._v("Confirm that the tokens have been received by the intended recipient:")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHF1ZXJ5IGJhbmsgYmFsYW5jZXMgY29zbW9zMXp5enUzNXJtY3RmZDJmcW5ueXR0aGhldWdxczk2cXhzbmU2N2FkCg=="}}),e._v(" "),t("h2",{attrs:{id:"🎉-congratulations-🎉"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#🎉-congratulations-🎉"}},[e._v("#")]),e._v(" 🎉 Congratulations 🎉")]),e._v(" "),t("p",[e._v("By completing this tutorial, you have learned how to use the "),t("code",[e._v("group")]),e._v(" module. In particular how to:")]),e._v(" "),t("ul",[t("li",[e._v("Create a group.")]),e._v(" "),t("li",[e._v("Manage its members.")]),e._v(" "),t("li",[e._v("Add a group policy.")]),e._v(" "),t("li",[e._v("Submit a group proposal.")]),e._v(" "),t("li",[e._v("Vote on a proposal.")]),e._v(" "),t("li",[e._v("Execute an accepted proposal.")])]),e._v(" "),t("p",[e._v("For more information about what else you can do with the CLI, please refer to its help.")]),e._v(" "),t("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBzaW1kIHR4IGdyb3VwIC0taGVscAokIHNpbWQgcXVlcnkgZ3JvdXAgLS1oZWxwCg=="}}),e._v(" "),t("p",[e._v("To learn more about the group module specs, check out the "),t("a",{attrs:{href:"https://docs.cosmos.network/main/modules/group",target:"_blank",rel:"noopener noreferrer"}},[e._v("group"),t("OutboundLink")],1),e._v(" module developer documentation.")])],1)}),[],!1,null,null,null);o.default=s.exports}}]);