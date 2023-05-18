(window.webpackJsonp=window.webpackJsonp||[]).push([[106],{724:function(e,t,l){"use strict";l.r(t);var d=l(1),a=Object(d.a)({},(function(){var e=this,t=e.$createElement,l=e._self._c||t;return l("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[l("h1",{attrs:{id:"integrate-ibc-middleware-into-a-chain"}},[l("a",{staticClass:"header-anchor",attrs:{href:"#integrate-ibc-middleware-into-a-chain"}},[e._v("#")]),e._v(" Integrate IBC Middleware Into a Chain")]),e._v(" "),l("HighlightBox",{attrs:{type:"learning"}},[l("p",[e._v("Learn how to integrate Inter-Blokchain Communication Protocol (IBC) middleware(s) with a base application to your chain. The following only applies to Cosmos SDK chains.")])]),e._v(" "),l("p",[e._v("You have now seen how to develop an IBC middleware, and the final step in order to use it is to integrate it into the chain. You can distinguish between a single piece of middleware and a stack of middleware, and between middleware that is stateful or stateless.")]),e._v(" "),l("p",[e._v("To integrate middleware (or a middleware stack) you must do the following in "),l("code",[e._v("app.go")]),e._v(":")]),e._v(" "),l("ul",[l("li",[l("p",[e._v("If the middleware is maintaining its state, processing SDK messages, or both, then it should "),l("strong",[e._v("create and register its SDK module with the module manager")]),e._v(". Make sure not to create multiple "),l("code",[e._v("moduleManager")]),e._v("s but to register all modules in the same one.")]),e._v(" "),l("ExpansionPanel",{attrs:{title:"Example code"}},[l("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Ly9hcHAuZ28KCi8vIGNyZWF0ZSBhIGtlZXBlciBmb3IgdGhlIHN0YXRlZnVsIG1pZGRsZXdhcmUKbXcxS2VlcGVyIDo9IG13MS5OZXdLZWVwZXIoc3RvcmVLZXkxKQptdzNLZWVwZXIgOj0gbXczLk5ld0tlZXBlcihzdG9yZUtleTMpCgovLyBpbnN0YW50aWF0ZSB0aGUgbWlkZGxld2FyZSBhcyBJQkNNb2R1bGVzCm13MUlCQ01vZHVsZSA6PSBtdzEuTmV3SUJDTW9kdWxlKG13MUtlZXBlcikKbXcySUJDTW9kdWxlIDo9IG13Mi5OZXdJQkNNb2R1bGUoKSAvLyBvcHRpb25hbDogbWlkZGxld2FyZTIgaXMgc3RhdGVsZXNzIG1pZGRsZXdhcmUKbXczSUJDTW9kdWxlIDo9IG13My5OZXdJQkNNb2R1bGUobXczS2VlcGVyKQoKLy8gcmVnaXN0ZXIgdGhlIG1pZGRsZXdhcmUgaW4gYXBwIG1vZHVsZQovLyBpZiB0aGUgbW9kdWxlIG1haW50YWlucyBhbiBpbmRlcGVuZGVudCBzdGF0ZSBhbmQvb3IgcHJvY2Vzc2VzIHNkay5Nc2dzCmFwcC5tb2R1bGVNYW5hZ2VyID0gbW9kdWxlLk5ld01hbmFnZXIoCiAgICAuLi4KICAgIG13MS5OZXdBcHBNb2R1bGUobXcxS2VlcGVyKSwKICAgIG13My5OZXdBcHBNb2R1bGUobXczS2VlcGVyKSwKICAgIHRyYW5zZmVyLk5ld0FwcE1vZHVsZSh0cmFuc2ZlcktlZXBlciksCiAgICBjdXN0b20uTmV3QXBwTW9kdWxlKGN1c3RvbUtlZXBlcikKKQo="}})],1)],1),e._v(" "),l("li",[l("p",[e._v("As mentioned in the previous section, if the middleware wishes to send a packet or acknowledgement without the involvement of the underlying application, it should be given access to the same "),l("code",[e._v("scopedKeeper")]),e._v(" as the base application so that it can retrieve the capabilities by itself.")]),e._v(" "),l("ExpansionPanel",{attrs:{title:"Example code"}},[l("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Ly9hcHAuZ28KCi8vIGFkZCBzY29wZWQga2VlcGVycyBpbiBjYXNlIHRoZSBtaWRkbGV3YXJlIHdpc2hlcyB0bwovLyBzZW5kIGEgcGFja2V0IG9yIGFja25vd2xlZGdlbWVudCB3aXRob3V0Ci8vIHRoZSBpbnZvbHZlbWVudCBvZiB0aGUgdW5kZXJseWluZyBhcHBsaWNhdGlvbgpzY29wZWRLZWVwZXJUcmFuc2ZlciA6PSBjYXBhYmlsaXR5S2VlcGVyLk5ld1Njb3BlZEtlZXBlcigmcXVvdDt0cmFuc2ZlciZxdW90OykKc2NvcGVkS2VlcGVyQ3VzdG9tMSA6PSBjYXBhYmlsaXR5S2VlcGVyLk5ld1Njb3BlZEtlZXBlcigmcXVvdDtjdXN0b20xJnF1b3Q7KQpzY29wZWRLZWVwZXJDdXN0b20yIDo9IGNhcGFiaWxpdHlLZWVwZXIuTmV3U2NvcGVkS2VlcGVyKCZxdW90O2N1c3RvbTImcXVvdDspCg=="}})],1),e._v(" "),l("p",[e._v("For example, if the middleware "),l("code",[e._v("mw1")]),e._v(" needs the ability to send a packet on custom2's port without involving the underlying application "),l("code",[e._v("custom2")]),e._v(", it would require access to the latter's "),l("code",[e._v("scopedKeeper")]),e._v(":")]),e._v(" "),l("tm-code-block",{staticClass:"codeblock",attrs:{language:"diff-go",base64:"LSBtdzFLZWVwZXIgOj0gbXcxLk5ld0tlZXBlcihzdG9yZUtleTEpCisgbXcxS2VlcGVyIDo9IG13MS5OZXdLZWVwZXIoc3RvcmVLZXkxLCBzY29wZWRLZWVwZXJDdXN0b20yKQo="}}),e._v(" "),l("HighlightBox",{attrs:{type:"note"}},[l("p",[e._v("If no middleware (or other modules for that matter) need access to the "),l("code",[e._v("scopedKeeper")]),e._v(", there is no need to define them.")])])],1),e._v(" "),l("li",[l("p",[e._v("Each application stack must reserve its own unique port with core IBC. Thus, two stacks with the same base application must bind to separate ports.")]),e._v(" "),l("ExpansionPanel",{attrs:{title:"Example code"}},[l("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Ly8gaW5pdGlhbGl6ZSBiYXNlIElCQyBhcHBsaWNhdGlvbnMKLy8KLy8gaWYgeW91IHdhbnQgdG8gY3JlYXRlIHR3byBkaWZmZXJlbnQgc3RhY2tzIHdpdGggdGhlIHNhbWUgYmFzZSBhcHBsaWNhdGlvbiwKLy8gdGhleSBtdXN0IGJlIGdpdmVuIGRpZmZlcmVudCBzY29wZWRLZWVwZXJzIGFuZCBhc3NpZ25lZCBkaWZmZXJlbnQgcG9ydHMKdHJhbnNmZXJJQkNNb2R1bGUgOj0gdHJhbnNmZXIuTmV3SUJDTW9kdWxlKHRyYW5zZmVyS2VlcGVyKQpjdXN0b21JQkNNb2R1bGUxIDo9IGN1c3RvbS5OZXdJQkNNb2R1bGUoY3VzdG9tS2VlcGVyLCAmcXVvdDtwb3J0Q3VzdG9tMSZxdW90OykKY3VzdG9tSUJDTW9kdWxlMiA6PSBjdXN0b20uTmV3SUJDTW9kdWxlKGN1c3RvbUtlZXBlciwgJnF1b3Q7cG9ydEN1c3RvbTImcXVvdDspCg=="}})],1)],1),e._v(" "),l("li",[l("p",[l("strong",[e._v("The order of middleware matters.")]),e._v(" Function calls from IBC to the application travel from top-level middleware through to bottom-level middleware and then to the application. Function calls from the application to IBC rise from the bottom middleware to the top middleware and then to core IBC handlers. Thus the same set of middleware arranged in different orders may produce different effects.")]),e._v(" "),l("HighlightBox",{attrs:{type:"tip"}},[l("p",[e._v("In addition to the diagram shown in the "),l("RouterLink",{attrs:{to:"/academy/3-ibc/10-ibc-mw-intro.html"}},[e._v("introduction")]),e._v(", also note the direction of information flow through the middleware by looking at the interface:")],1),e._v(" "),l("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"dHlwZSBNaWRkbGV3YXJlIGludGVyZmFjZSB7CiAgICBJQkNNb2R1bGUKICAgIElDUzRXcmFwcGVyCn0K"}}),e._v(" "),l("p",[e._v("The packet and channel callbacks defined by "),l("code",[e._v("IBCModule")]),e._v(" run from IBC Core to the base application; the methods defined by "),l("code",[e._v("ICS4Wrapper")]),e._v(" run from the base application to IBC Core.")])],1),e._v(" "),l("p",[e._v("In the code snippet below, three different stacks are defined:")]),e._v(" "),l("ExpansionPanel",{attrs:{title:"Example code"}},[l("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Ly8gY3JlYXRlIElCQyBzdGFja3MgYnkgY29tYmluaW5nIG1pZGRsZXdhcmUgd2l0aCB0aGUgYmFzZSBhcHBsaWNhdGlvbgovLyBOT1RFOiBzaW5jZSBtaWRkbGV3YXJlMiBpcyBzdGF0ZWxlc3MgaXQgZG9lcyBub3QgcmVxdWlyZSBhIEtlZXBlcgovLyBzdGFjayAxIGNvbnRhaW5zIG13MSAtJmd0OyBtdzMgLSZndDsgdHJhbnNmZXIKc3RhY2sxIDo9IG13MS5OZXdJQkNNaWRkbGV3YXJlKG13My5OZXdJQkNNaWRkbGV3YXJlKHRyYW5zZmVySUJDTW9kdWxlLCBtdzNLZWVwZXIpLCBtdzFLZWVwZXIpCi8vIHN0YWNrIDIgY29udGFpbnMgbXczIC0mZ3Q7IG13MiAtJmd0OyBjdXN0b20xCnN0YWNrMiA6PSBtdzMuTmV3SUJDTWlkZGxld2FyZShtdzIuTmV3SUJDTWlkZGxld2FyZShjdXN0b21JQkNNb2R1bGUxKSwgbXczS2VlcGVyKQovLyBzdGFjayAzIGNvbnRhaW5zIG13MiAtJmd0OyBtdzEgLSZndDsgY3VzdG9tMgpzdGFjazMgOj0gbXcyLk5ld0lCQ01pZGRsZXdhcmUobXcxLk5ld0lCQ01pZGRsZXdhcmUoY3VzdG9tSUJDTW9kdWxlMiwgbXcxS2VlcGVyKSkKLy8gYXNzb2NpYXRlIGVhY2ggc3RhY2sgd2l0aCB0aGUgbW9kdWxlTmFtZSBwcm92aWRlZCBieSB0aGUgdW5kZXJseWluZyBzY29wZWRLZWVwZXIK"}})],1)],1),e._v(" "),l("li",[l("p",[e._v("All middleware must be connected to the IBC router and wrap over an underlying base IBC application. An IBC application may be wrapped by many layers of middleware, "),l("strong",[e._v("but only the top-layer middleware should be hooked to the IBC router")]),e._v(", with all underlying middlewares and application getting wrapped by it.")]),e._v(" "),l("ExpansionPanel",{attrs:{title:"Example code"}},[l("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Ly8gYXNzb2NpYXRlIGVhY2ggc3RhY2sgd2l0aCB0aGUgbW9kdWxlTmFtZSBwcm92aWRlZCBieSB0aGUgdW5kZXJseWluZyBzY29wZWRLZWVwZXIKaWJjUm91dGVyIDo9IHBvcnR0eXBlcy5OZXdSb3V0ZXIoKQppYmNSb3V0ZXIuQWRkUm91dGUoJnF1b3Q7dHJhbnNmZXImcXVvdDssIHN0YWNrMSkKaWJjUm91dGVyLkFkZFJvdXRlKCZxdW90O2N1c3RvbTEmcXVvdDssIHN0YWNrMikKaWJjUm91dGVyLkFkZFJvdXRlKCZxdW90O2N1c3RvbTImcXVvdDssIHN0YWNrMykKYXBwLklCQ0tlZXBlci5TZXRSb3V0ZXIoaWJjUm91dGVyKQo="}})],1)],1)]),e._v(" "),l("p",[e._v("Next, take a look at a full example integration, combining all of the above code snippets.")]),e._v(" "),l("h2",{attrs:{id:"example-integration"}},[l("a",{staticClass:"header-anchor",attrs:{href:"#example-integration"}},[e._v("#")]),e._v(" Example integration")]),e._v(" "),l("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Ly8gYXBwLmdvCgpzY29wZWRLZWVwZXJUcmFuc2ZlciA6PSBjYXBhYmlsaXR5S2VlcGVyLk5ld1Njb3BlZEtlZXBlcigmcXVvdDt0cmFuc2ZlciZxdW90OykKc2NvcGVkS2VlcGVyQ3VzdG9tMSA6PSBjYXBhYmlsaXR5S2VlcGVyLk5ld1Njb3BlZEtlZXBlcigmcXVvdDtjdXN0b20xJnF1b3Q7KQpzY29wZWRLZWVwZXJDdXN0b20yIDo9IGNhcGFiaWxpdHlLZWVwZXIuTmV3U2NvcGVkS2VlcGVyKCZxdW90O2N1c3RvbTImcXVvdDspCgptdzFLZWVwZXIgOj0gbXcxLk5ld0tlZXBlcihzdG9yZUtleTEpCm13M0tlZXBlciA6PSBtdzMuTmV3S2VlcGVyKHN0b3JlS2V5MykKCm13MUlCQ01vZHVsZSA6PSBtdzEuTmV3SUJDTW9kdWxlKG13MUtlZXBlcikKbXcySUJDTW9kdWxlIDo9IG13Mi5OZXdJQkNNb2R1bGUoKQptdzNJQkNNb2R1bGUgOj0gbXczLk5ld0lCQ01vZHVsZShtdzNLZWVwZXIpCgphcHAubW9kdWxlTWFuYWdlciA9IG1vZHVsZS5OZXdNYW5hZ2VyKAogICAgLi4uCiAgICBtdzEuTmV3QXBwTW9kdWxlKG13MUtlZXBlciksCiAgICBtdzMuTmV3QXBwTW9kdWxlKG13M0tlZXBlciksCiAgICB0cmFuc2Zlci5OZXdBcHBNb2R1bGUodHJhbnNmZXJLZWVwZXIpLAogICAgY3VzdG9tLk5ld0FwcE1vZHVsZShjdXN0b21LZWVwZXIpCikKCnRyYW5zZmVySUJDTW9kdWxlIDo9IHRyYW5zZmVyLk5ld0lCQ01vZHVsZSh0cmFuc2ZlcktlZXBlcikKY3VzdG9tSUJDTW9kdWxlMSA6PSBjdXN0b20uTmV3SUJDTW9kdWxlKGN1c3RvbUtlZXBlciwgJnF1b3Q7cG9ydEN1c3RvbTEmcXVvdDspCmN1c3RvbUlCQ01vZHVsZTIgOj0gY3VzdG9tLk5ld0lCQ01vZHVsZShjdXN0b21LZWVwZXIsICZxdW90O3BvcnRDdXN0b20yJnF1b3Q7KQoKc3RhY2sxIDo9IG13MS5OZXdJQkNNaWRkbGV3YXJlKG13My5OZXdJQkNNaWRkbGV3YXJlKHRyYW5zZmVySUJDTW9kdWxlLCBtdzNLZWVwZXIpLCBtdzFLZWVwZXIpCi8vIHN0YWNrIDIgY29udGFpbnMgbXczIC0mZ3Q7IG13MiAtJmd0OyBjdXN0b20xCnN0YWNrMiA6PSBtdzMuTmV3SUJDTWlkZGxld2FyZShtdzIuTmV3SUJDTWlkZGxld2FyZShjdXN0b21JQkNNb2R1bGUxKSwgbXczS2VlcGVyKQovLyBzdGFjayAzIGNvbnRhaW5zIG13MiAtJmd0OyBtdzEgLSZndDsgY3VzdG9tMgpzdGFjazMgOj0gbXcyLk5ld0lCQ01pZGRsZXdhcmUobXcxLk5ld0lCQ01pZGRsZXdhcmUoY3VzdG9tSUJDTW9kdWxlMiwgbXcxS2VlcGVyKSkKCmliY1JvdXRlciA6PSBwb3J0dHlwZXMuTmV3Um91dGVyKCkKaWJjUm91dGVyLkFkZFJvdXRlKCZxdW90O3RyYW5zZmVyJnF1b3Q7LCBzdGFjazEpCmliY1JvdXRlci5BZGRSb3V0ZSgmcXVvdDtjdXN0b20xJnF1b3Q7LCBzdGFjazIpCmliY1JvdXRlci5BZGRSb3V0ZSgmcXVvdDtjdXN0b20yJnF1b3Q7LCBzdGFjazMpCmFwcC5JQkNLZWVwZXIuU2V0Um91dGVyKGliY1JvdXRlcikK"}}),e._v(" "),l("HighlightBox",{attrs:{type:"synopsis"}},[l("p",[e._v("To summarize, this section has explored:")]),e._v(" "),l("ul",[l("li",[e._v("How to integrate IBC middleware(s) with a base application to Cosmos SDK blockchains.")]),e._v(" "),l("li",[e._v("Creating and registering a middleware's SDK module with the module manager, if the middleware is maintaining its state, processing SDK messages, or both.")]),e._v(" "),l("li",[e._v("The importance of registering all modules to the same "),l("code",[e._v("moduleManger")]),e._v(" rather than creating multiple ones.")]),e._v(" "),l("li",[e._v("How middleware needing to send packets or acknowledgements without involving the underlying application will need access to the same "),l("code",[e._v("scopedKeeper")]),e._v(" as the base application.")]),e._v(" "),l("li",[e._v("How each application stack must reserve a unique port with core IBC, even if two stacks share the same base application.")]),e._v(" "),l("li",[e._v("The importance of middleware ordering within a stack, since changes in the position of middlewares may produce different effects as function calls from and to the application transition up or down through the layers of the stack.")]),e._v(" "),l("li",[e._v("How only the top-layer middleware should be hooked to the IBC router, regardless of how many underlying middlewares are wrapped by it along with the application.")])])])],1)}),[],!1,null,null,null);t.default=a.exports}}]);