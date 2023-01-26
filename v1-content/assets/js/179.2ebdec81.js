(window.webpackJsonp=window.webpackJsonp||[]).push([[179],{796:function(g,I,C){"use strict";C.r(I);var A=C(1),t=Object(A.a)({},(function(){var g=this,I=g.$createElement,C=g._self._c||I;return C("ContentSlotsDistributor",{attrs:{"slot-key":g.$parent.slotKey}},[C("h1",{attrs:{id:"learn-to-integrate-keplr"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#learn-to-integrate-keplr"}},[g._v("#")]),g._v(" Learn to Integrate Keplr")]),g._v(" "),C("HighlightBox",{attrs:{type:"learning"}},[C("p",[g._v("Build applicatiosn that interact with the Keplr browser extension.\n"),C("br"),C("br"),g._v("\nIn this section, you will learn more about:")]),g._v(" "),C("ul",[C("li",[g._v("Detecting Keplr.")]),g._v(" "),C("li",[g._v("Getting chain information.")]),g._v(" "),C("li",[g._v("Working with the user interaction flow.")])])]),g._v(" "),C("p",[g._v("CosmJS allows you to connect with "),C("a",{attrs:{href:"https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap",target:"_blank",rel:"noopener noreferrer"}},[g._v("Keplr"),C("OutboundLink")],1),g._v(", the widely used browser extension, to manage your private keys. In a previous section you used the command-line and CosmJS to issue commands to the Cosmos Hub Testnet. In this tutorial, you are working on a browser application that interacts with the Keplr extension.")]),g._v(" "),C("p",[g._v("You will again connect to the Cosmos Hub Testnet. Optionally, connect to your locally running Cosmos blockchain using "),C("code",[g._v("simapp")]),g._v(" as explained "),C("RouterLink",{attrs:{to:"/academy/xl-cosmjs/first-steps.html"}},[g._v("before")]),g._v(".")],1),g._v(" "),C("p",[g._v("To keep the focus on CosmJS and Keplr, you are going to use ready-made pages created by the Next.js framework. Do not worry if you routinely use another framework, the CosmJS-specific code in this tutorial can be applied similarly in Angular, Vue, and other frameworks.")]),g._v(" "),C("h2",{attrs:{id:"creating-your-simple-next-js-project"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#creating-your-simple-next-js-project"}},[g._v("#")]),g._v(" Creating your simple Next.js project")]),g._v(" "),C("p",[g._v("In your project folder create the ready-made Next.js app, which automatically places it in a subfolder for you. This follows "),C("a",{attrs:{href:"https://nextjs.org/docs",target:"_blank",rel:"noopener noreferrer"}},[g._v("the docs"),C("OutboundLink")],1),g._v(":")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBucHggY3JlYXRlLW5leHQtYXBwQGxhdGVzdCAtLXR5cGVzY3JpcHQK"}}),g._v(" "),C("p",[g._v("Which guides you with:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"undefined",base64:"Li4uCj8gV2hhdCBpcyB5b3VyIHByb2plY3QgbmFtZWQ/IOKAuiBjb3NtanMta2VwbHIK"}}),g._v(" "),C("p",[g._v("This created a new "),C("code",[g._v("cosmjs-keplr")]),g._v(" folder. There you can find a "),C("code",[g._v("/pages")]),g._v(" folder, which contains an "),C("code",[g._v("index.tsx")]),g._v(". That's your first page.")]),g._v(" "),C("p",[g._v("Run it, in the "),C("code",[g._v("cosmjs-keplr")]),g._v(" folder:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBucG0gcnVuIGRldgo="}}),g._v(" "),C("p",[g._v("Which returns:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"undefined",base64:"cmVhZHkgLSBzdGFydGVkIHNlcnZlciBvbiAwLjAuMC4wOjMwMDAsIHVybDogaHR0cDovL2xvY2FsaG9zdDozMDAwCi4uLgo="}}),g._v(" "),C("p",[g._v("You should see the result, a welcome page with links, in your browser by visiting "),C("a",{attrs:{href:"http://localhost:3000",target:"_blank",rel:"noopener noreferrer"}},[g._v("http://localhost:3000"),C("OutboundLink")],1),g._v(". Next.js uses "),C("a",{attrs:{href:"https://reactjs.org/",target:"_blank",rel:"noopener noreferrer"}},[g._v("React"),C("OutboundLink")],1),g._v(" under the hood.")]),g._v(" "),C("h2",{attrs:{id:"html-elements"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#html-elements"}},[g._v("#")]),g._v(" HTML elements")]),g._v(" "),C("p",[g._v("The goal of the exercise is to find token balances, yours and the faucet's, and then send some tokens back to the faucet. Before introducing any CosmJS, you can already create a React component that includes the basic user interface that you need. By convention, create a "),C("code",[g._v("/components")]),g._v(" folder and then copy the following code inside a new file called "),C("code",[g._v("FaucetSender.tsx")]),g._v(":")]),g._v(" "),C("ExpansionPanel",{attrs:{title:"FaucetSender.tsx"}},[C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"aW1wb3J0IHsgQ2hhbmdlRXZlbnQsIENvbXBvbmVudCwgTW91c2VFdmVudCB9IGZyb20gJnF1b3Q7cmVhY3QmcXVvdDsKaW1wb3J0IHN0eWxlcyBmcm9tICcuLi9zdHlsZXMvSG9tZS5tb2R1bGUuY3NzJwoKaW50ZXJmYWNlIEZhdWNldFNlbmRlclN0YXRlIHsKICAgIGRlbm9tOiBzdHJpbmcKICAgIGZhdWNldEJhbGFuY2U6IHN0cmluZwogICAgbXlBZGRyZXNzOiBzdHJpbmcKICAgIG15QmFsYW5jZTogc3RyaW5nCiAgICB0b1NlbmQ6IHN0cmluZwp9CgpleHBvcnQgaW50ZXJmYWNlIEZhdWNldFNlbmRlclByb3BzIHsKICAgIGZhdWNldEFkZHJlc3M6IHN0cmluZwogICAgcnBjVXJsOiBzdHJpbmcKfQoKZXhwb3J0IGNsYXNzIEZhdWNldFNlbmRlciBleHRlbmRzIENvbXBvbmVudCZsdDtGYXVjZXRTZW5kZXJQcm9wcywgRmF1Y2V0U2VuZGVyU3RhdGUmZ3Q7IHsKCgogICAgLy8gU2V0IHRoZSBpbml0aWFsIHN0YXRlCiAgICBjb25zdHJ1Y3Rvcihwcm9wczpGYXVjZXRTZW5kZXJQcm9wcykgewogICAgICAgIHN1cGVyKHByb3BzKQogICAgICAgIHRoaXMuc3RhdGUgPSB7CiAgICAgICAgICAgIGRlbm9tOiAmcXVvdDtMb2FkaW5nLi4uJnF1b3Q7LAogICAgICAgICAgICBmYXVjZXRCYWxhbmNlOiAmcXVvdDtMb2FkaW5nLi4uJnF1b3Q7LAogICAgICAgICAgICBteUFkZHJlc3M6ICZxdW90O0NsaWNrIGZpcnN0JnF1b3Q7LAogICAgICAgICAgICBteUJhbGFuY2U6ICZxdW90O0NsaWNrIGZpcnN0JnF1b3Q7LAogICAgICAgICAgICB0b1NlbmQ6ICZxdW90OzAmcXVvdDssCiAgICAgICAgfQogICAgfQoKICAgIC8vIFN0b3JlIGNoYW5nZWQgdG9rZW4gYW1vdW50IHRvIHN0YXRlCiAgICBvblRvU2VuZENoYW5nZWQgPSAoZTogQ2hhbmdlRXZlbnQmbHQ7SFRNTElucHV0RWxlbWVudCZndDspID0mZ3Q7IHRoaXMuc2V0U3RhdGUoewogICAgICAgIHRvU2VuZDogZS5jdXJyZW50VGFyZ2V0LnZhbHVlCiAgICB9KQoKICAgIC8vIFdoZW4gdGhlIHVzZXIgY2xpY2tzIHRoZSAmcXVvdDtzZW5kIHRvIGZhdWNldCBidXR0b24mcXVvdDsKICAgIG9uU2VuZENsaWNrZWQgPSBhc3luYyhlOiBNb3VzZUV2ZW50Jmx0O0hUTUxCdXR0b25FbGVtZW50Jmd0OykgPSZndDsgewogICAgICAgIGFsZXJ0KCZxdW90O1RPRE8mcXVvdDspCiAgICB9CgogICAgLy8gVGhlIHJlbmRlciBmdW5jdGlvbiB0aGF0IGRyYXdzIHRoZSBjb21wb25lbnQgYXQgaW5pdCBhbmQgYXQgc3RhdGUgY2hhbmdlCiAgICByZW5kZXIoKSB7CiAgICAgICAgY29uc3QgeyBkZW5vbSwgZmF1Y2V0QmFsYW5jZSwgbXlBZGRyZXNzLCBteUJhbGFuY2UsIHRvU2VuZCB9ID0gdGhpcy5zdGF0ZQogICAgICAgIGNvbnN0IHsgZmF1Y2V0QWRkcmVzcyB9ID0gdGhpcy5wcm9wcwogICAgICAgIGNvbnNvbGUubG9nKHRvU2VuZCkKICAgICAgICAvLyBUaGUgd2ViIHBhZ2Ugc3RydWN0dXJlIGl0c2VsZgogICAgICAgIHJldHVybiAmbHQ7ZGl2Jmd0OwogICAgICAgICAgICAmbHQ7ZmllbGRzZXQgY2xhc3NOYW1lPXtzdHlsZXMuY2FyZH0mZ3Q7CiAgICAgICAgICAgICAgICAmbHQ7bGVnZW5kJmd0O0ZhdWNldCZsdDsvbGVnZW5kJmd0OwogICAgICAgICAgICAgICAgJmx0O3AmZ3Q7QWRkcmVzczoge2ZhdWNldEFkZHJlc3N9Jmx0Oy9wJmd0OwogICAgICAgICAgICAgICAgJmx0O3AmZ3Q7QmFsYW5jZToge2ZhdWNldEJhbGFuY2V9Jmx0Oy9wJmd0OwogICAgICAgICAgICAmbHQ7L2ZpZWxkc2V0Jmd0OwogICAgICAgICAgICAmbHQ7ZmllbGRzZXQgY2xhc3NOYW1lPXtzdHlsZXMuY2FyZH0mZ3Q7CiAgICAgICAgICAgICAgICAmbHQ7bGVnZW5kJmd0O1lvdSZsdDsvbGVnZW5kJmd0OwogICAgICAgICAgICAgICAgJmx0O3AmZ3Q7QWRkcmVzczoge215QWRkcmVzc30mbHQ7L3AmZ3Q7CiAgICAgICAgICAgICAgICAmbHQ7cCZndDtCYWxhbmNlOiB7bXlCYWxhbmNlfSZsdDsvcCZndDsKICAgICAgICAgICAgJmx0Oy9maWVsZHNldCZndDsKICAgICAgICAgICAgJmx0O2ZpZWxkc2V0IGNsYXNzTmFtZT17c3R5bGVzLmNhcmR9Jmd0OwogICAgICAgICAgICAgICAgJmx0O2xlZ2VuZCZndDtTZW5kJmx0Oy9sZWdlbmQmZ3Q7CiAgICAgICAgICAgICAgICAmbHQ7cCZndDtUbyBmYXVjZXQ6Jmx0Oy9wJmd0OwogICAgICAgICAgICAgICAgJmx0O2lucHV0IHZhbHVlPXt0b1NlbmR9IHR5cGU9JnF1b3Q7bnVtYmVyJnF1b3Q7IG9uQ2hhbmdlPXt0aGlzLm9uVG9TZW5kQ2hhbmdlZH0vJmd0OyB7ZGVub219CiAgICAgICAgICAgICAgICAmbHQ7YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25TZW5kQ2xpY2tlZH0mZ3Q7U2VuZCB0byBmYXVjZXQmbHQ7L2J1dHRvbiZndDsKICAgICAgICAgICAgJmx0Oy9maWVsZHNldCZndDsKICAgICAgICAmbHQ7L2RpdiZndDsKICAgIH0KfQo="}})],1),g._v(" "),C("HighlightBox",{attrs:{type:"note"}},[C("p",[g._v("The "),C("strong",[g._v("properties")]),g._v(" of "),C("code",[g._v("FaucetSender.tsx")]),g._v(" only contain the things it knows at build time. It keeps a "),C("strong",[g._v("state")]),g._v(", and this state is either updated by the user or after a fetch. It reuses a default style you can find in "),C("code",[g._v("/styles")]),g._v(".")])]),g._v(" "),C("p",[g._v("The component is still unused. You do not need the default page that comes with create-next-app, so you can replace the contents of "),C("code",[g._v("index.tsx")]),g._v(" with the following code that imports the new component:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"aW1wb3J0IHR5cGUgeyBOZXh0UGFnZSB9IGZyb20gJ25leHQnCmltcG9ydCB7IEZhdWNldFNlbmRlciB9IGZyb20gJy4uL2NvbXBvbmVudHMvRmF1Y2V0U2VuZGVyJwoKY29uc3QgSG9tZTogTmV4dFBhZ2UgPSAoKSA9Jmd0OyB7CiAgcmV0dXJuICZsdDtGYXVjZXRTZW5kZXIKICAgIGZhdWNldEFkZHJlc3M9JnF1b3Q7Y29zbW9zMTVhcHRkcW1tN2RkZ3Rjcmp2YzVoczk4OHJscmt6ZTQwbDRxMGhlJnF1b3Q7CiAgICBycGNVcmw9JnF1b3Q7aHR0cHM6Ly9ycGMuc2VudHJ5LTAxLnRoZXRhLXRlc3RuZXQucG9seXBvcmUueHl6JnF1b3Q7IC8mZ3Q7Cn0KCmV4cG9ydCBkZWZhdWx0IEhvbWUK"}}),g._v(" "),C("p",[g._v("The faucet address was found in the "),C("RouterLink",{attrs:{to:"/academy/xl-cosmjs/first-steps.html"}},[g._v("previous section")]),g._v(", as well as the RPC endpoint that connects to the Cosmos Hub Testnet.")],1),g._v(" "),C("p",[g._v("When "),C("code",[g._v("npm run dev")]),g._v(' picks up the changes, you should see that your page has changed to what you created. In particular, it alerts you with "TODO" when you click on the button.')]),g._v(" "),C("p",[g._v("Your page is not very useful yet, make it more so.")]),g._v(" "),C("h2",{attrs:{id:"installing-cosmjs"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#installing-cosmjs"}},[g._v("#")]),g._v(" Installing CosmJS")]),g._v(" "),C("p",[g._v("Now that you have a working Next.js project and ready page, it is time to add the necessary CosmJS elements to the project:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBucG0gaW5zdGFsbCBAY29zbWpzL3N0YXJnYXRlIGNvc21qcy10eXBlcyAtLXNhdmUK"}}),g._v(" "),C("h2",{attrs:{id:"displaying-information-without-user-input"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#displaying-information-without-user-input"}},[g._v("#")]),g._v(" Displaying information without user input")]),g._v(" "),C("p",[g._v("When building a user interface, it is good practice to not ask your user's address until it becomes necessary (e.g. if they click a relevant button). You should start by showing information that is knowable without user input. In this case, this is the token "),C("code",[g._v("denom")]),g._v(" (denomination) and the faucet's balance. Add the following function that gets the balance from the faucet and place it above the "),C("code",[g._v("onToSendChanged")]),g._v(" function inside "),C("code",[g._v("FaucetSender.tsx")]),g._v(":")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"Ly8gR2V0IHRoZSBmYXVjZXQncyBiYWxhbmNlCnVwZGF0ZUZhdWNldEJhbGFuY2UgPSBhc3luYyhjbGllbnQ6IFN0YXJnYXRlQ2xpZW50KSA9Jmd0OyB7CiAgICBjb25zdCBiYWxhbmNlczogcmVhZG9ubHkgQ29pbltdID0gYXdhaXQgY2xpZW50LmdldEFsbEJhbGFuY2VzKHRoaXMucHJvcHMuZmF1Y2V0QWRkcmVzcykKICAgIGNvbnN0IGZpcnN0OiBDb2luID0gYmFsYW5jZXNbMF0KICAgIHRoaXMuc2V0U3RhdGUoewogICAgICAgIGRlbm9tOiBmaXJzdC5kZW5vbSwKICAgICAgICBmYXVjZXRCYWxhbmNlOiBmaXJzdC5hbW91bnQsCiAgICB9KQp9Cg=="}}),g._v(" "),C("p",[g._v("Note that it only cares about the first coin type stored in "),C("code",[g._v("balances[0]")]),g._v(": this is to keep the exercise simple, but there could be multiple coins in that array of balances. It extracts the "),C("code",[g._v("denom")]),g._v(", which is then displayed to the user as the unit to transfer. Add the denom that in the constructor as well so that it runs on load via another specific function:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"Y29uc3RydWN0b3IocHJvcHM6RmF1Y2V0U2VuZGVyUHJvcHMpIHsKICAgIC4uLgogICAgc2V0VGltZW91dCh0aGlzLmluaXQsIDUwMCkKfQoKaW5pdCA9IGFzeW5jKCkgPSZndDsgdGhpcy51cGRhdGVGYXVjZXRCYWxhbmNlKGF3YWl0IFN0YXJnYXRlQ2xpZW50LmNvbm5lY3QodGhpcy5wcm9wcy5ycGNVcmwpKQo="}}),g._v(" "),C("p",[g._v("After "),C("code",[g._v("run dev")]),g._v(" picks the changes, you should see that your page starts showing the relevant information.")]),g._v(" "),C("p",[g._v("Now, add elements that handle your user's information.")]),g._v(" "),C("h2",{attrs:{id:"getting-testnet-tokens"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#getting-testnet-tokens"}},[g._v("#")]),g._v(" Getting testnet tokens")]),g._v(" "),C("p",[g._v("Refer to the previous section on how to "),C("RouterLink",{attrs:{to:"/academy/xl-cosmjs/first-steps.html"}},[g._v("get Cosmos Hub Testnet tokens")]),g._v(". This time you should use your Keplr address. If you have not set up one yet, do so now. Your Cosmos Hub Testnet address is the same one that Keplr shows you for the Cosmos Hub mainnet.")],1),g._v(" "),C("h2",{attrs:{id:"detecting-keplr"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#detecting-keplr"}},[g._v("#")]),g._v(" Detecting Keplr")]),g._v(" "),C("p",[g._v("Following "),C("a",{attrs:{href:"https://docs.keplr.app/api/#how-to-detect-keplr",target:"_blank",rel:"noopener noreferrer"}},[g._v("Keplr's documentation"),C("OutboundLink")],1),g._v(", it is time to add a function to see if Keplr is installed on the browser. For convenience and type hinting, install the TypeScript Keplr types from within the folder of your project:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBucG0gaW5zdGFsbCBAa2VwbHItd2FsbGV0L3R5cGVzIC0tc2F2ZS1kZXYK"}}),g._v(" "),C("p",[g._v("After this package is installed, inform TypeScript that "),C("code",[g._v("window")]),g._v(" may have a "),C("code",[g._v(".keplr")]),g._v(" field with the help of "),C("a",{attrs:{href:"https://github.com/chainapsis/keplr-wallet/tree/master/docs/api#keplr-specific-features",target:"_blank",rel:"noopener noreferrer"}},[g._v("this helper"),C("OutboundLink")],1),g._v(", by adding it below your imports to "),C("code",[g._v("FaucetSender.tsx")]),g._v(":")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"aW1wb3J0IHsgV2luZG93IGFzIEtlcGxyV2luZG93IH0gZnJvbSAmcXVvdDtAa2VwbHItd2FsbGV0L3R5cGVzJnF1b3Q7OwoKZGVjbGFyZSBnbG9iYWwgewogICAgaW50ZXJmYWNlIFdpbmRvdyBleHRlbmRzIEtlcGxyV2luZG93IHt9Cn0K"}}),g._v(" "),C("p",[g._v("Detecting Keplr can be done at any time, but to keep the number of functions low for this exercise do it in "),C("code",[g._v("onSendClicked")]),g._v(". You want to avoid detecting Keplr on page load if not absolutely necessary. This is generally considered bad user experience for users who might just want to browse your page and not interact with it. Replace the "),C("code",[g._v("onSendClicked")]),g._v(" with the following:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"b25TZW5kQ2xpY2tlZCA9IGFzeW5jKGU6IE1vdXNlRXZlbnQmbHQ7SFRNTEJ1dHRvbkVsZW1lbnQmZ3Q7KSA9Jmd0OyB7CiAgICBjb25zdCB7IGtlcGxyIH0gPSB3aW5kb3cKICAgIGlmICgha2VwbHIpIHsKICAgICAgICBhbGVydCgmcXVvdDtZb3UgbmVlZCB0byBpbnN0YWxsIEtlcGxyJnF1b3Q7KQogICAgICAgIHJldHVybgogICAgfQp9Cg=="}}),g._v(" "),C("p",[g._v("Hopefully, when you click on the button it does not show an alert. It does not do anything else either. As an optional confirmation, if you disable Keplr from Chrome's extension manager, when you click the button the page tells you to install it.")]),g._v(" "),C("h2",{attrs:{id:"prepare-keplr"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#prepare-keplr"}},[g._v("#")]),g._v(" Prepare Keplr")]),g._v(" "),C("p",[g._v("Keplr is now detected. By default, Keplr lets its users only connect to the blockchains it knows about. Unfortunately, the Cosmos Hub Testnet is not one of them, but there is a feature where you can instruct it to handle any Cosmos blockchain, provided you give its parameters. Here is "),C("a",{attrs:{href:"https://github.com/chainapsis/keplr-example/blob/master/src/main.js",target:"_blank",rel:"noopener noreferrer"}},[g._v("an example"),C("OutboundLink")],1),g._v(". In the case of Cosmos Hub Testnet, these parameters are available, as mentioned on the "),C("a",{attrs:{href:"https://github.com/cosmos/testnets/tree/master/v7-theta#add-to-keplr-1",target:"_blank",rel:"noopener noreferrer"}},[g._v("testnet page"),C("OutboundLink")],1),g._v(". Add a new function for them as shown in the expandable box:")]),g._v(" "),C("ExpansionPanel",{attrs:{title:"getTestnetChainInfo"}},[C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"Z2V0VGVzdG5ldENoYWluSW5mbyA9ICgpOiBDaGFpbkluZm8gPSZndDsgKHsKICAgIGNoYWluSWQ6ICZxdW90O3RoZXRhLXRlc3RuZXQtMDAxJnF1b3Q7LAogICAgY2hhaW5OYW1lOiAmcXVvdDt0aGV0YS10ZXN0bmV0LTAwMSZxdW90OywKICAgIHJwYzogJnF1b3Q7aHR0cHM6Ly9ycGMuc2VudHJ5LTAxLnRoZXRhLXRlc3RuZXQucG9seXBvcmUueHl6LyZxdW90OywKICAgIHJlc3Q6ICZxdW90O2h0dHBzOi8vcmVzdC5zZW50cnktMDEudGhldGEtdGVzdG5ldC5wb2x5cG9yZS54eXovJnF1b3Q7LAogICAgYmlwNDQ6IHsKICAgICAgICBjb2luVHlwZTogMTE4LAogICAgfSwKICAgIGJlY2gzMkNvbmZpZzogewogICAgICAgIGJlY2gzMlByZWZpeEFjY0FkZHI6ICZxdW90O2Nvc21vcyZxdW90OywKICAgICAgICBiZWNoMzJQcmVmaXhBY2NQdWI6ICZxdW90O2Nvc21vcyZxdW90OyArICZxdW90O3B1YiZxdW90OywKICAgICAgICBiZWNoMzJQcmVmaXhWYWxBZGRyOiAmcXVvdDtjb3Ntb3MmcXVvdDsgKyAmcXVvdDt2YWxvcGVyJnF1b3Q7LAogICAgICAgIGJlY2gzMlByZWZpeFZhbFB1YjogJnF1b3Q7Y29zbW9zJnF1b3Q7ICsgJnF1b3Q7dmFsb3BlcnB1YiZxdW90OywKICAgICAgICBiZWNoMzJQcmVmaXhDb25zQWRkcjogJnF1b3Q7Y29zbW9zJnF1b3Q7ICsgJnF1b3Q7dmFsY29ucyZxdW90OywKICAgICAgICBiZWNoMzJQcmVmaXhDb25zUHViOiAmcXVvdDtjb3Ntb3MmcXVvdDsgKyAmcXVvdDt2YWxjb25zcHViJnF1b3Q7LAogICAgfSwKICAgIGN1cnJlbmNpZXM6IFsKICAgICAgICB7CiAgICAgICAgICAgIGNvaW5EZW5vbTogJnF1b3Q7QVRPTSZxdW90OywKICAgICAgICAgICAgY29pbk1pbmltYWxEZW5vbTogJnF1b3Q7dWF0b20mcXVvdDssCiAgICAgICAgICAgIGNvaW5EZWNpbWFsczogNiwKICAgICAgICAgICAgY29pbkdlY2tvSWQ6ICZxdW90O2Nvc21vcyZxdW90OywKICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICAgY29pbkRlbm9tOiAmcXVvdDtUSEVUQSZxdW90OywKICAgICAgICAgICAgY29pbk1pbmltYWxEZW5vbTogJnF1b3Q7dGhldGEmcXVvdDssCiAgICAgICAgICAgIGNvaW5EZWNpbWFsczogMCwKICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICAgY29pbkRlbm9tOiAmcXVvdDtMQU1CREEmcXVvdDssCiAgICAgICAgICAgIGNvaW5NaW5pbWFsRGVub206ICZxdW90O2xhbWJkYSZxdW90OywKICAgICAgICAgICAgY29pbkRlY2ltYWxzOiAwLAogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgICBjb2luRGVub206ICZxdW90O1JITyZxdW90OywKICAgICAgICAgICAgY29pbk1pbmltYWxEZW5vbTogJnF1b3Q7cmhvJnF1b3Q7LAogICAgICAgICAgICBjb2luRGVjaW1hbHM6IDAsCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAgIGNvaW5EZW5vbTogJnF1b3Q7RVBTSUxPTiZxdW90OywKICAgICAgICAgICAgY29pbk1pbmltYWxEZW5vbTogJnF1b3Q7ZXBzaWxvbiZxdW90OywKICAgICAgICAgICAgY29pbkRlY2ltYWxzOiAwLAogICAgICAgIH0sCiAgICBdLAogICAgZmVlQ3VycmVuY2llczogWwogICAgICAgIHsKICAgICAgICAgICAgY29pbkRlbm9tOiAmcXVvdDtBVE9NJnF1b3Q7LAogICAgICAgICAgICBjb2luTWluaW1hbERlbm9tOiAmcXVvdDt1YXRvbSZxdW90OywKICAgICAgICAgICAgY29pbkRlY2ltYWxzOiA2LAogICAgICAgICAgICBjb2luR2Vja29JZDogJnF1b3Q7Y29zbW9zJnF1b3Q7LAogICAgICAgIH0sCiAgICBdLAogICAgc3Rha2VDdXJyZW5jeTogewogICAgICAgIGNvaW5EZW5vbTogJnF1b3Q7QVRPTSZxdW90OywKICAgICAgICBjb2luTWluaW1hbERlbm9tOiAmcXVvdDt1YXRvbSZxdW90OywKICAgICAgICBjb2luRGVjaW1hbHM6IDYsCiAgICAgICAgY29pbkdlY2tvSWQ6ICZxdW90O2Nvc21vcyZxdW90OywKICAgIH0sCiAgICBjb2luVHlwZTogMTE4LAogICAgZ2FzUHJpY2VTdGVwOiB7CiAgICAgICAgbG93OiAxLAogICAgICAgIGF2ZXJhZ2U6IDEsCiAgICAgICAgaGlnaDogMSwKICAgIH0sCiAgICBmZWF0dXJlczogWyZxdW90O3N0YXJnYXRlJnF1b3Q7LCAmcXVvdDtpYmMtdHJhbnNmZXImcXVvdDssICZxdW90O25vLWxlZ2FjeS1zdGRUeCZxdW90O10sCn0pCg=="}})],1),g._v(" "),C("p",[g._v("You need to add another import from the "),C("code",[g._v("@keplr-wallet")]),g._v(" package so that your script understands what "),C("code",[g._v("ChainInfo")]),g._v(" is:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"aW1wb3J0IHsgQ2hhaW5JbmZvLCBXaW5kb3cgYXMgS2VwbHJXaW5kb3cgfSBmcm9tICZxdW90O0BrZXBsci13YWxsZXQvdHlwZXMmcXVvdDsK"}}),g._v(" "),C("p",[g._v("Note that it mentions the "),C("code",[g._v('chainId: "theta-testnet-001"')]),g._v(". In effect, this adds the Cosmos Hub Testnet to Keplr's registry of blockchains, under the label "),C("code",[g._v("theta-testnet-001")]),g._v(". Whenever you want to prompt the user to add the Cosmos Hub Testnet to Keplr, add the line:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"YXdhaXQgd2luZG93LmtlcGxyIS5leHBlcmltZW50YWxTdWdnZXN0Q2hhaW4odGhpcy5nZXRUZXN0bmV0Q2hhaW5JbmZvKCkpCg=="}}),g._v(" "),C("p",[g._v("This needs to be done once, which in this case is in the "),C("code",[g._v("onSendClicked")]),g._v(" function after having detected Keplr, but repeating the line elsewhere is generally not a problem.")]),g._v(" "),C("p",[g._v("Keplr is now detected and prepared. Now try to do something useful with the user's information.")]),g._v(" "),C("h2",{attrs:{id:"your-address-and-balance"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#your-address-and-balance"}},[g._v("#")]),g._v(" Your address and balance")]),g._v(" "),C("p",[g._v("In "),C("code",[g._v("onSendClicked")]),g._v(", similar to the previous section, you can:")]),g._v(" "),C("ol",[C("li",[g._v("Prepare Keplr, with "),C("code",[g._v("keplr.experimentalSuggestChain")]),g._v(".")]),g._v(" "),C("li",[g._v("Get the signer for your user's accounts, with "),C("code",[g._v("KeplrWindow")]),g._v("'s "),C("code",[g._v("window.getOfflineSigner")]),g._v(".")]),g._v(" "),C("li",[g._v("Create your signing client.")]),g._v(" "),C("li",[g._v("Get the address and balance of your user's first account.")]),g._v(" "),C("li",[g._v("Send the requested coins to the faucet.")]),g._v(" "),C("li",[g._v("Inform and update.")])]),g._v(" "),C("p",[g._v("In practice, the code for "),C("code",[g._v("onSendClicked")]),g._v(" looks like this:")]),g._v(" "),C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"b25TZW5kQ2xpY2tlZCA9IGFzeW5jKGU6IE1vdXNlRXZlbnQmbHQ7SFRNTEJ1dHRvbkVsZW1lbnQmZ3Q7KSA9Jmd0OyB7CiAgICAvLyBEZXRlY3QgS2VwbHIKICAgIGNvbnN0IHsga2VwbHIgfSA9IHdpbmRvdwogICAgaWYgKCFrZXBscikgewogICAgICAgIGFsZXJ0KCZxdW90O1lvdSBuZWVkIHRvIGluc3RhbGwgS2VwbHImcXVvdDspCiAgICAgICAgcmV0dXJuCiAgICB9CiAgICAvLyBHZXQgdGhlIGN1cnJlbnQgc3RhdGUgYW5kIGFtb3VudCBvZiB0b2tlbnMgdGhhdCB3ZSB3YW50IHRvIHRyYW5zZmVyCiAgICBjb25zdCB7IGRlbm9tLCB0b1NlbmQgfSA9IHRoaXMuc3RhdGUKICAgIGNvbnN0IHsgZmF1Y2V0QWRkcmVzcywgcnBjVXJsIH0gPSB0aGlzLnByb3BzCiAgICAvLyBTdWdnZXN0IHRoZSB0ZXN0bmV0IGNoYWluIHRvIEtlcGxyCiAgICBhd2FpdCBrZXBsci5leHBlcmltZW50YWxTdWdnZXN0Q2hhaW4odGhpcy5nZXRUZXN0bmV0Q2hhaW5JbmZvKCkpCiAgICAvLyBDcmVhdGUgdGhlIHNpZ25pbmcgY2xpZW50CiAgICBjb25zdCBvZmZsaW5lU2lnbmVyOiBPZmZsaW5lU2lnbmVyID0KICAgICAgICB3aW5kb3cuZ2V0T2ZmbGluZVNpZ25lciEoJnF1b3Q7dGhldGEtdGVzdG5ldC0wMDEmcXVvdDspCiAgICBjb25zdCBzaWduaW5nQ2xpZW50ID0gYXdhaXQgU2lnbmluZ1N0YXJnYXRlQ2xpZW50LmNvbm5lY3RXaXRoU2lnbmVyKAogICAgICAgIHJwY1VybCwKICAgICAgICBvZmZsaW5lU2lnbmVyLAogICAgKQogICAgLy8gR2V0IHRoZSBhZGRyZXNzIGFuZCBiYWxhbmNlIG9mIHlvdXIgdXNlcgogICAgY29uc3QgYWNjb3VudDogQWNjb3VudERhdGEgPSAoYXdhaXQgb2ZmbGluZVNpZ25lci5nZXRBY2NvdW50cygpKVswXQogICAgdGhpcy5zZXRTdGF0ZSh7CiAgICAgICAgbXlBZGRyZXNzOiBhY2NvdW50LmFkZHJlc3MsCiAgICAgICAgbXlCYWxhbmNlOiAoYXdhaXQgc2lnbmluZ0NsaWVudC5nZXRCYWxhbmNlKGFjY291bnQuYWRkcmVzcywgZGVub20pKQogICAgICAgICAgICAuYW1vdW50LAogICAgfSkKICAgIC8vIFN1Ym1pdCB0aGUgdHJhbnNhY3Rpb24gdG8gc2VuZCB0b2tlbnMgdG8gdGhlIGZhdWNldAogICAgY29uc3Qgc2VuZFJlc3VsdCA9IGF3YWl0IHNpZ25pbmdDbGllbnQuc2VuZFRva2VucygKICAgICAgICBhY2NvdW50LmFkZHJlc3MsCiAgICAgICAgZmF1Y2V0QWRkcmVzcywKICAgICAgICBbCiAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgIGRlbm9tOiBkZW5vbSwKICAgICAgICAgICAgICAgIGFtb3VudDogdG9TZW5kLAogICAgICAgICAgICB9LAogICAgICAgIF0sCiAgICAgICAgewogICAgICAgICAgICBhbW91bnQ6IFt7IGRlbm9tOiAmcXVvdDt1YXRvbSZxdW90OywgYW1vdW50OiAmcXVvdDs1MDAmcXVvdDsgfV0sCiAgICAgICAgICAgIGdhczogJnF1b3Q7MjAwMDAwJnF1b3Q7LAogICAgICAgIH0sCiAgICApCiAgICAvLyBQcmludCB0aGUgcmVzdWx0IHRvIHRoZSBjb25zb2xlCiAgICBjb25zb2xlLmxvZyhzZW5kUmVzdWx0KQogICAgLy8gVXBkYXRlIHRoZSBiYWxhbmNlIGluIHRoZSB1c2VyIGludGVyZmFjZQogICAgdGhpcy5zZXRTdGF0ZSh7CiAgICAgICAgbXlCYWxhbmNlOiAoYXdhaXQgc2lnbmluZ0NsaWVudC5nZXRCYWxhbmNlKGFjY291bnQuYWRkcmVzcywgZGVub20pKQogICAgICAgICAgICAuYW1vdW50LAogICAgICAgIGZhdWNldEJhbGFuY2U6ICgKICAgICAgICAgICAgYXdhaXQgc2lnbmluZ0NsaWVudC5nZXRCYWxhbmNlKGZhdWNldEFkZHJlc3MsIGRlbm9tKQogICAgICAgICkuYW1vdW50LAogICAgfSkKfQo="}}),g._v(" "),C("HighlightBox",{attrs:{type:"note"}},[C("p",[g._v("Keplr is only tasked with signing transactions. The transactions are broadcast with the RPC endpoint of your choice.")])]),g._v(" "),C("p",[g._v("Now run the full script. In the refreshed page, enter an amount of "),C("code",[g._v("uatom")]),g._v(" (for example "),C("code",[g._v("1000000")]),g._v(") and click "),C("kbd",[g._v("Send to faucet")]),g._v(". A number of events happen:")]),g._v(" "),C("ol",[C("li",[g._v("Keplr asks for confirmation that you agree to add the testnet network. It does not install any network without your approval, as that would be a security risk. It asks this only the first time you add a given network, which is why doing it in "),C("code",[g._v("onSendClicked")]),g._v(" is harmless.\n"),C("tm-image",{attrs:{src:"/academy/xl-cosmjs/images/keplr_testnet_addition.png"}})],1),g._v(" "),C("li",[g._v("Keplr asks whether you agree to share your account information, because this involves a potential security risk. Again, it asks this only once per web page + network combination.\n"),C("tm-image",{attrs:{src:"/academy/xl-cosmjs/images/keplr_share_account.png"}})],1),g._v(" "),C("li",[g._v("Your address and balance fields are updated and visible.")]),g._v(" "),C("li",[g._v("Keplr asks whether you agree to sign the transaction, a very important action that requires approval "),C("strong",[g._v("every time")]),g._v(".\n"),C("tm-image",{attrs:{src:"/academy/xl-cosmjs/images/keplr_send_to_faucet.png"}})],1)]),g._v(" "),C("p",[g._v("After this is done, your balance updates again, and in the browser console you see the transaction result.")]),g._v(" "),C("p",[g._v("If you want to double check if you got everything right, you can find the full component's code in the expandable box below:")]),g._v(" "),C("ExpansionPanel",{attrs:{title:"Final FaucetSender.tsx file"}},[C("tm-code-block",{staticClass:"codeblock",attrs:{language:"typescript",base64:"aW1wb3J0IHsgQ29pbiwgU2lnbmluZ1N0YXJnYXRlQ2xpZW50LCBTdGFyZ2F0ZUNsaWVudCB9IGZyb20gJnF1b3Q7QGNvc21qcy9zdGFyZ2F0ZSZxdW90OwppbXBvcnQgeyBBY2NvdW50RGF0YSwgT2ZmbGluZVNpZ25lciB9IGZyb20gJnF1b3Q7QGNvc21qcy9wcm90by1zaWduaW5nJnF1b3Q7CmltcG9ydCB7IENoYWluSW5mbywgV2luZG93IGFzIEtlcGxyV2luZG93IH0gZnJvbSAmcXVvdDtAa2VwbHItd2FsbGV0L3R5cGVzJnF1b3Q7CmltcG9ydCB7IENoYW5nZUV2ZW50LCBDb21wb25lbnQsIE1vdXNlRXZlbnQgfSBmcm9tICZxdW90O3JlYWN0JnF1b3Q7CmltcG9ydCBzdHlsZXMgZnJvbSAmcXVvdDsuLi9zdHlsZXMvSG9tZS5tb2R1bGUuY3NzJnF1b3Q7CgpkZWNsYXJlIGdsb2JhbCB7CiAgICBpbnRlcmZhY2UgV2luZG93IGV4dGVuZHMgS2VwbHJXaW5kb3cge30KfQoKaW50ZXJmYWNlIEZhdWNldFNlbmRlclN0YXRlIHsKICAgIGRlbm9tOiBzdHJpbmcKICAgIGZhdWNldEJhbGFuY2U6IHN0cmluZwogICAgbXlBZGRyZXNzOiBzdHJpbmcKICAgIG15QmFsYW5jZTogc3RyaW5nCiAgICB0b1NlbmQ6IHN0cmluZwp9CgpleHBvcnQgaW50ZXJmYWNlIEZhdWNldFNlbmRlclByb3BzIHsKICAgIGZhdWNldEFkZHJlc3M6IHN0cmluZwogICAgcnBjVXJsOiBzdHJpbmcKfQoKZXhwb3J0IGNsYXNzIEZhdWNldFNlbmRlciBleHRlbmRzIENvbXBvbmVudCZsdDsKICAgIEZhdWNldFNlbmRlclByb3BzLAogICAgRmF1Y2V0U2VuZGVyU3RhdGUKJmd0OyB7CiAgICAvLyBTZXQgdGhlIGluaXRpYWwgc3RhdGUKICAgIGNvbnN0cnVjdG9yKHByb3BzOiBGYXVjZXRTZW5kZXJQcm9wcykgewogICAgICAgIHN1cGVyKHByb3BzKQogICAgICAgIHRoaXMuc3RhdGUgPSB7CiAgICAgICAgICAgIGRlbm9tOiAmcXVvdDtMb2FkaW5nLi4uJnF1b3Q7LAogICAgICAgICAgICBmYXVjZXRCYWxhbmNlOiAmcXVvdDtMb2FkaW5nLi4uJnF1b3Q7LAogICAgICAgICAgICBteUFkZHJlc3M6ICZxdW90O0NsaWNrIGZpcnN0JnF1b3Q7LAogICAgICAgICAgICBteUJhbGFuY2U6ICZxdW90O0NsaWNrIGZpcnN0JnF1b3Q7LAogICAgICAgICAgICB0b1NlbmQ6ICZxdW90OzAmcXVvdDssCiAgICAgICAgfQogICAgICAgIHNldFRpbWVvdXQodGhpcy5pbml0LCA1MDApCiAgICB9CgogICAgLy8gQ29ubmVjdGluZyB0byB0aGUgZW5kcG9pbnQgdG8gZmV0Y2ggdGhlIGZhdWNldCBiYWxhbmNlCiAgICBpbml0ID0gYXN5bmMgKCkgPSZndDsKICAgICAgICB0aGlzLnVwZGF0ZUZhdWNldEJhbGFuY2UoCiAgICAgICAgICAgIGF3YWl0IFN0YXJnYXRlQ2xpZW50LmNvbm5lY3QodGhpcy5wcm9wcy5ycGNVcmwpLAogICAgICAgICkKCiAgICAvLyBHZXQgdGhlIGZhdWNldCdzIGJhbGFuY2UKICAgIHVwZGF0ZUZhdWNldEJhbGFuY2UgPSBhc3luYyAoY2xpZW50OiBTdGFyZ2F0ZUNsaWVudCkgPSZndDsgewogICAgICAgIGNvbnN0IGJhbGFuY2VzOiByZWFkb25seSBDb2luW10gPSBhd2FpdCBjbGllbnQuZ2V0QWxsQmFsYW5jZXMoCiAgICAgICAgICAgIHRoaXMucHJvcHMuZmF1Y2V0QWRkcmVzcywKICAgICAgICApCiAgICAgICAgY29uc3QgZmlyc3Q6IENvaW4gPSBiYWxhbmNlc1swXQogICAgICAgIHRoaXMuc2V0U3RhdGUoewogICAgICAgICAgICBkZW5vbTogZmlyc3QuZGVub20sCiAgICAgICAgICAgIGZhdWNldEJhbGFuY2U6IGZpcnN0LmFtb3VudCwKICAgICAgICB9KQogICAgfQoKICAgIC8vIFN0b3JlIGNoYW5nZWQgdG9rZW4gYW1vdW50IHRvIHN0YXRlCiAgICBvblRvU2VuZENoYW5nZWQgPSAoZTogQ2hhbmdlRXZlbnQmbHQ7SFRNTElucHV0RWxlbWVudCZndDspID0mZ3Q7CiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7CiAgICAgICAgICAgIHRvU2VuZDogZS5jdXJyZW50VGFyZ2V0LnZhbHVlLAogICAgICAgIH0pCgogICAgLy8gV2hlbiB0aGUgdXNlciBjbGlja3MgdGhlICZxdW90O3NlbmQgdG8gZmF1Y2V0IGJ1dHRvbiZxdW90OwogICAgb25TZW5kQ2xpY2tlZCA9IGFzeW5jIChlOiBNb3VzZUV2ZW50Jmx0O0hUTUxCdXR0b25FbGVtZW50Jmd0OykgPSZndDsgewogICAgICAgIC8vIERldGVjdCBLZXBscgogICAgICAgIGNvbnN0IHsga2VwbHIgfSA9IHdpbmRvdwogICAgICAgIGlmICgha2VwbHIpIHsKICAgICAgICAgICAgYWxlcnQoJnF1b3Q7WW91IG5lZWQgdG8gaW5zdGFsbCBLZXBsciZxdW90OykKICAgICAgICAgICAgcmV0dXJuCiAgICAgICAgfQogICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBzdGF0ZSBhbmQgYW1vdW50IG9mIHRva2VucyB0aGF0IHdlIHdhbnQgdG8gdHJhbnNmZXIKICAgICAgICBjb25zdCB7IGRlbm9tLCB0b1NlbmQgfSA9IHRoaXMuc3RhdGUKICAgICAgICBjb25zdCB7IGZhdWNldEFkZHJlc3MsIHJwY1VybCB9ID0gdGhpcy5wcm9wcwogICAgICAgIC8vIFN1Z2dlc3QgdGhlIHRlc3RuZXQgY2hhaW4gdG8gS2VwbHIKICAgICAgICBhd2FpdCBrZXBsci5leHBlcmltZW50YWxTdWdnZXN0Q2hhaW4odGhpcy5nZXRUZXN0bmV0Q2hhaW5JbmZvKCkpCiAgICAgICAgLy8gQ3JlYXRlIHRoZSBzaWduaW5nIGNsaWVudAogICAgICAgIGNvbnN0IG9mZmxpbmVTaWduZXI6IE9mZmxpbmVTaWduZXIgPQogICAgICAgICAgICB3aW5kb3cuZ2V0T2ZmbGluZVNpZ25lciEoJnF1b3Q7dGhldGEtdGVzdG5ldC0wMDEmcXVvdDspCiAgICAgICAgY29uc3Qgc2lnbmluZ0NsaWVudCA9IGF3YWl0IFNpZ25pbmdTdGFyZ2F0ZUNsaWVudC5jb25uZWN0V2l0aFNpZ25lcigKICAgICAgICAgICAgcnBjVXJsLAogICAgICAgICAgICBvZmZsaW5lU2lnbmVyLAogICAgICAgICkKICAgICAgICAvLyBHZXQgdGhlIGFkZHJlc3MgYW5kIGJhbGFuY2Ugb2YgeW91ciB1c2VyCiAgICAgICAgY29uc3QgYWNjb3VudDogQWNjb3VudERhdGEgPSAoYXdhaXQgb2ZmbGluZVNpZ25lci5nZXRBY2NvdW50cygpKVswXQogICAgICAgIHRoaXMuc2V0U3RhdGUoewogICAgICAgICAgICBteUFkZHJlc3M6IGFjY291bnQuYWRkcmVzcywKICAgICAgICAgICAgbXlCYWxhbmNlOiAoYXdhaXQgc2lnbmluZ0NsaWVudC5nZXRCYWxhbmNlKGFjY291bnQuYWRkcmVzcywgZGVub20pKQogICAgICAgICAgICAgICAgLmFtb3VudCwKICAgICAgICB9KQogICAgICAgIC8vIFN1Ym1pdCB0aGUgdHJhbnNhY3Rpb24gdG8gc2VuZCB0b2tlbnMgdG8gdGhlIGZhdWNldAogICAgICAgIGNvbnN0IHNlbmRSZXN1bHQgPSBhd2FpdCBzaWduaW5nQ2xpZW50LnNlbmRUb2tlbnMoCiAgICAgICAgICAgIGFjY291bnQuYWRkcmVzcywKICAgICAgICAgICAgZmF1Y2V0QWRkcmVzcywKICAgICAgICAgICAgWwogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgIGRlbm9tOiBkZW5vbSwKICAgICAgICAgICAgICAgICAgICBhbW91bnQ6IHRvU2VuZCwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgIF0sCiAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgIGFtb3VudDogW3sgZGVub206ICZxdW90O3VhdG9tJnF1b3Q7LCBhbW91bnQ6ICZxdW90OzUwMCZxdW90OyB9XSwKICAgICAgICAgICAgICAgIGdhczogJnF1b3Q7MjAwMDAwJnF1b3Q7LAogICAgICAgICAgICB9LAogICAgICAgICkKICAgICAgICAvLyBQcmludCB0aGUgcmVzdWx0IHRvIHRoZSBjb25zb2xlCiAgICAgICAgY29uc29sZS5sb2coc2VuZFJlc3VsdCkKICAgICAgICAvLyBVcGRhdGUgdGhlIGJhbGFuY2UgaW4gdGhlIHVzZXIgaW50ZXJmYWNlCiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7CiAgICAgICAgICAgIG15QmFsYW5jZTogKGF3YWl0IHNpZ25pbmdDbGllbnQuZ2V0QmFsYW5jZShhY2NvdW50LmFkZHJlc3MsIGRlbm9tKSkKICAgICAgICAgICAgICAgIC5hbW91bnQsCiAgICAgICAgICAgIGZhdWNldEJhbGFuY2U6ICgKICAgICAgICAgICAgICAgIGF3YWl0IHNpZ25pbmdDbGllbnQuZ2V0QmFsYW5jZShmYXVjZXRBZGRyZXNzLCBkZW5vbSkKICAgICAgICAgICAgKS5hbW91bnQsCiAgICAgICAgfSkKICAgIH0KCiAgICAvLyBUaGUgQ29zbW9zIEh1YiBUZXN0bmV0IGNoYWluIHBhcmFtZXRlcnMKICAgIGdldFRlc3RuZXRDaGFpbkluZm8gPSAoKTogQ2hhaW5JbmZvID0mZ3Q7ICh7CiAgICAgICAgY2hhaW5JZDogJnF1b3Q7dGhldGEtdGVzdG5ldC0wMDEmcXVvdDssCiAgICAgICAgY2hhaW5OYW1lOiAmcXVvdDt0aGV0YS10ZXN0bmV0LTAwMSZxdW90OywKICAgICAgICBycGM6ICZxdW90O2h0dHBzOi8vcnBjLnNlbnRyeS0wMS50aGV0YS10ZXN0bmV0LnBvbHlwb3JlLnh5ei8mcXVvdDssCiAgICAgICAgcmVzdDogJnF1b3Q7aHR0cHM6Ly9yZXN0LnNlbnRyeS0wMS50aGV0YS10ZXN0bmV0LnBvbHlwb3JlLnh5ei8mcXVvdDssCiAgICAgICAgYmlwNDQ6IHsKICAgICAgICAgICAgY29pblR5cGU6IDExOCwKICAgICAgICB9LAogICAgICAgIGJlY2gzMkNvbmZpZzogewogICAgICAgICAgICBiZWNoMzJQcmVmaXhBY2NBZGRyOiAmcXVvdDtjb3Ntb3MmcXVvdDssCiAgICAgICAgICAgIGJlY2gzMlByZWZpeEFjY1B1YjogJnF1b3Q7Y29zbW9zJnF1b3Q7ICsgJnF1b3Q7cHViJnF1b3Q7LAogICAgICAgICAgICBiZWNoMzJQcmVmaXhWYWxBZGRyOiAmcXVvdDtjb3Ntb3MmcXVvdDsgKyAmcXVvdDt2YWxvcGVyJnF1b3Q7LAogICAgICAgICAgICBiZWNoMzJQcmVmaXhWYWxQdWI6ICZxdW90O2Nvc21vcyZxdW90OyArICZxdW90O3ZhbG9wZXJwdWImcXVvdDssCiAgICAgICAgICAgIGJlY2gzMlByZWZpeENvbnNBZGRyOiAmcXVvdDtjb3Ntb3MmcXVvdDsgKyAmcXVvdDt2YWxjb25zJnF1b3Q7LAogICAgICAgICAgICBiZWNoMzJQcmVmaXhDb25zUHViOiAmcXVvdDtjb3Ntb3MmcXVvdDsgKyAmcXVvdDt2YWxjb25zcHViJnF1b3Q7LAogICAgICAgIH0sCiAgICAgICAgY3VycmVuY2llczogWwogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICBjb2luRGVub206ICZxdW90O0FUT00mcXVvdDssCiAgICAgICAgICAgICAgICBjb2luTWluaW1hbERlbm9tOiAmcXVvdDt1YXRvbSZxdW90OywKICAgICAgICAgICAgICAgIGNvaW5EZWNpbWFsczogNiwKICAgICAgICAgICAgICAgIGNvaW5HZWNrb0lkOiAmcXVvdDtjb3Ntb3MmcXVvdDssCiAgICAgICAgICAgIH0sCiAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgIGNvaW5EZW5vbTogJnF1b3Q7VEhFVEEmcXVvdDssCiAgICAgICAgICAgICAgICBjb2luTWluaW1hbERlbm9tOiAmcXVvdDt0aGV0YSZxdW90OywKICAgICAgICAgICAgICAgIGNvaW5EZWNpbWFsczogMCwKICAgICAgICAgICAgfSwKICAgICAgICAgICAgewogICAgICAgICAgICAgICAgY29pbkRlbm9tOiAmcXVvdDtMQU1CREEmcXVvdDssCiAgICAgICAgICAgICAgICBjb2luTWluaW1hbERlbm9tOiAmcXVvdDtsYW1iZGEmcXVvdDssCiAgICAgICAgICAgICAgICBjb2luRGVjaW1hbHM6IDAsCiAgICAgICAgICAgIH0sCiAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgIGNvaW5EZW5vbTogJnF1b3Q7UkhPJnF1b3Q7LAogICAgICAgICAgICAgICAgY29pbk1pbmltYWxEZW5vbTogJnF1b3Q7cmhvJnF1b3Q7LAogICAgICAgICAgICAgICAgY29pbkRlY2ltYWxzOiAwLAogICAgICAgICAgICB9LAogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICBjb2luRGVub206ICZxdW90O0VQU0lMT04mcXVvdDssCiAgICAgICAgICAgICAgICBjb2luTWluaW1hbERlbm9tOiAmcXVvdDtlcHNpbG9uJnF1b3Q7LAogICAgICAgICAgICAgICAgY29pbkRlY2ltYWxzOiAwLAogICAgICAgICAgICB9LAogICAgICAgIF0sCiAgICAgICAgZmVlQ3VycmVuY2llczogWwogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICBjb2luRGVub206ICZxdW90O0FUT00mcXVvdDssCiAgICAgICAgICAgICAgICBjb2luTWluaW1hbERlbm9tOiAmcXVvdDt1YXRvbSZxdW90OywKICAgICAgICAgICAgICAgIGNvaW5EZWNpbWFsczogNiwKICAgICAgICAgICAgICAgIGNvaW5HZWNrb0lkOiAmcXVvdDtjb3Ntb3MmcXVvdDssCiAgICAgICAgICAgIH0sCiAgICAgICAgXSwKICAgICAgICBzdGFrZUN1cnJlbmN5OiB7CiAgICAgICAgICAgIGNvaW5EZW5vbTogJnF1b3Q7QVRPTSZxdW90OywKICAgICAgICAgICAgY29pbk1pbmltYWxEZW5vbTogJnF1b3Q7dWF0b20mcXVvdDssCiAgICAgICAgICAgIGNvaW5EZWNpbWFsczogNiwKICAgICAgICAgICAgY29pbkdlY2tvSWQ6ICZxdW90O2Nvc21vcyZxdW90OywKICAgICAgICB9LAogICAgICAgIGNvaW5UeXBlOiAxMTgsCiAgICAgICAgZ2FzUHJpY2VTdGVwOiB7CiAgICAgICAgICAgIGxvdzogMSwKICAgICAgICAgICAgYXZlcmFnZTogMSwKICAgICAgICAgICAgaGlnaDogMSwKICAgICAgICB9LAogICAgICAgIGZlYXR1cmVzOiBbJnF1b3Q7c3RhcmdhdGUmcXVvdDssICZxdW90O2liYy10cmFuc2ZlciZxdW90OywgJnF1b3Q7bm8tbGVnYWN5LXN0ZFR4JnF1b3Q7XSwKICAgIH0pCgogICAgLy8gVGhlIHJlbmRlciBmdW5jdGlvbiB0aGF0IGRyYXdzIHRoZSBjb21wb25lbnQgYXQgaW5pdCBhbmQgYXQgc3RhdGUgY2hhbmdlCiAgICByZW5kZXIoKSB7CiAgICAgICAgY29uc3QgeyBkZW5vbSwgZmF1Y2V0QmFsYW5jZSwgbXlBZGRyZXNzLCBteUJhbGFuY2UsIHRvU2VuZCB9ID0KICAgICAgICAgICAgdGhpcy5zdGF0ZQogICAgICAgIGNvbnN0IHsgZmF1Y2V0QWRkcmVzcyB9ID0gdGhpcy5wcm9wcwogICAgICAgIC8vIFRoZSB3ZWIgcGFnZSBzdHJ1Y3R1cmUgaXRzZWxmCiAgICAgICAgcmV0dXJuICgKICAgICAgICAgICAgJmx0O2RpdiZndDsKICAgICAgICAgICAgICAgICZsdDtmaWVsZHNldCBjbGFzc05hbWU9e3N0eWxlcy5jYXJkfSZndDsKICAgICAgICAgICAgICAgICAgICAmbHQ7bGVnZW5kJmd0O0ZhdWNldCZsdDsvbGVnZW5kJmd0OwogICAgICAgICAgICAgICAgICAgICZsdDtwJmd0O0FkZHJlc3M6IHtmYXVjZXRBZGRyZXNzfSZsdDsvcCZndDsKICAgICAgICAgICAgICAgICAgICAmbHQ7cCZndDtCYWxhbmNlOiB7ZmF1Y2V0QmFsYW5jZX0mbHQ7L3AmZ3Q7CiAgICAgICAgICAgICAgICAmbHQ7L2ZpZWxkc2V0Jmd0OwogICAgICAgICAgICAgICAgJmx0O2ZpZWxkc2V0IGNsYXNzTmFtZT17c3R5bGVzLmNhcmR9Jmd0OwogICAgICAgICAgICAgICAgICAgICZsdDtsZWdlbmQmZ3Q7WW91Jmx0Oy9sZWdlbmQmZ3Q7CiAgICAgICAgICAgICAgICAgICAgJmx0O3AmZ3Q7QWRkcmVzczoge215QWRkcmVzc30mbHQ7L3AmZ3Q7CiAgICAgICAgICAgICAgICAgICAgJmx0O3AmZ3Q7QmFsYW5jZToge215QmFsYW5jZX0mbHQ7L3AmZ3Q7CiAgICAgICAgICAgICAgICAmbHQ7L2ZpZWxkc2V0Jmd0OwogICAgICAgICAgICAgICAgJmx0O2ZpZWxkc2V0IGNsYXNzTmFtZT17c3R5bGVzLmNhcmR9Jmd0OwogICAgICAgICAgICAgICAgICAgICZsdDtsZWdlbmQmZ3Q7U2VuZCZsdDsvbGVnZW5kJmd0OwogICAgICAgICAgICAgICAgICAgICZsdDtwJmd0O1RvIGZhdWNldDombHQ7L3AmZ3Q7CiAgICAgICAgICAgICAgICAgICAgJmx0O2lucHV0CiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0b1NlbmR9CiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9JnF1b3Q7bnVtYmVyJnF1b3Q7CiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uVG9TZW5kQ2hhbmdlZH0KICAgICAgICAgICAgICAgICAgICAvJmd0O3smcXVvdDsgJnF1b3Q7fQogICAgICAgICAgICAgICAgICAgIHtkZW5vbX0KICAgICAgICAgICAgICAgICAgICAmbHQ7YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25TZW5kQ2xpY2tlZH0mZ3Q7U2VuZCB0byBmYXVjZXQmbHQ7L2J1dHRvbiZndDsKICAgICAgICAgICAgICAgICZsdDsvZmllbGRzZXQmZ3Q7CiAgICAgICAgICAgICZsdDsvZGl2Jmd0OwogICAgICAgICkKICAgIH0KfQo="}})],1),g._v(" "),C("h2",{attrs:{id:"with-a-locally-running-chain"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#with-a-locally-running-chain"}},[g._v("#")]),g._v(" With a locally running chain")]),g._v(" "),C("p",[g._v("What if you wanted to experiment with your own chain while in development?")]),g._v(" "),C("p",[g._v("Keplr does not know about locally running chains by default. As you did with Cosmos Hub Testnet, you must inform Keplr about your chain: change "),C("code",[g._v("ChainInfo")]),g._v(" to match the information about your chain, and change "),C("code",[g._v("rpcUrl")]),g._v(" so that it points to your local port.")]),g._v(" "),C("h2",{attrs:{id:"conclusion"}},[C("a",{staticClass:"header-anchor",attrs:{href:"#conclusion"}},[g._v("#")]),g._v(" Conclusion")]),g._v(" "),C("p",[g._v("You have how updated your CosmJS frontend so that it integrates with Keplr.")])],1)}),[],!1,null,null,null);I.default=t.exports}}]);