(window.webpackJsonp=window.webpackJsonp||[]).push([[100],{718:function(e,t,o){"use strict";o.r(t);var a=o(1),s=Object(a.a)({},(function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[o("h1",{attrs:{id:"multistore-and-keepers"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#multistore-and-keepers"}},[e._v("#")]),e._v(" Multistore and Keepers")]),e._v(" "),o("HighlightBox",{attrs:{type:"prerequisite"}},[o("p",[e._v("Look at the following sections before you begin:")]),e._v(" "),o("ul",[o("li",[o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/3-transactions.html"}},[e._v("Transactions")])],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/4-messages.html"}},[e._v("Messages")])],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/5-modules.html"}},[e._v("Modules")])],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/6-protobuf.html"}},[e._v("Protobuf")])],1)])]),e._v(" "),o("HighlightBox",{attrs:{type:"learning"}},[o("p",[e._v("Keepers are responsible for managing access to states defined by modules. Because states are accessed through keepers, they are an ideal place to ensure that invariants are enforced and security principles are always applied.\n"),o("br"),o("br"),e._v("\nYou can find a code example for your checkers blockchain at the end of the section that explores dealing with storage elements, message handling, and gas costs.")])]),e._v(" "),o("p",[e._v("A Cosmos SDK application on an application-specific blockchain usually consists of several modules attending to separate concerns. Each module has a state that is a subset of the entire application state.")]),e._v(" "),o("p",[e._v("The Cosmos SDK adopts an object-capabilities-based approach to help developers better protect their application from unwanted inter-module interactions. Keepers are at the core of this approach.")]),e._v(" "),o("HighlightBox",{attrs:{type:"info"}},[o("p",[e._v("A keeper is a Cosmos SDK abstraction that manages access to the subset of the state defined by a module. All access to the module's data must go through the module's keeper.")])]),e._v(" "),o("p",[e._v("A keeper can be thought of as the literal gatekeeper of a module's stores. Each store defined within a module (typically an IAVL store) comes with a "),o("code",[e._v("storeKey")]),e._v(" which grants unlimited access. The module's keeper holds this "),o("code",[e._v("storeKey")]),e._v(", which should otherwise remain unexposed, and defines methods for reading and writing to any store.")]),e._v(" "),o("p",[e._v("When a module needs to interact with the state defined in another module, it does so by interacting with the methods of the other module’s keeper. Developers control the interactions their module can have with other modules by defining methods and controlling access.")]),e._v(" "),o("p",[o("tm-image",{attrs:{src:"/academy/2-cosmos-concepts/images/keeper.png"}})],1),e._v(" "),o("h2",{attrs:{id:"format"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#format"}},[e._v("#")]),e._v(" Format")]),e._v(" "),o("p",[e._v("Keepers are generally defined in a "),o("code",[e._v("/keeper/keeper.go")]),e._v(" file located in the module’s folder. The type keeper of a module is named simply "),o("code",[e._v("keeper.go")]),e._v(" by convention. It usually follows the following structure:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"dHlwZSBLZWVwZXIgc3RydWN0IHsKICAgIC8vIEV4cGVjdGVkIGV4dGVybmFsIGtlZXBlcnMsIGlmIGFueQoKICAgIC8vIFN0b3JlIGtleShzKQoKICAgIC8vIGNvZGVjCn0K"}}),e._v(" "),o("h3",{attrs:{id:"parameters"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#parameters"}},[e._v("#")]),e._v(" Parameters")]),e._v(" "),o("p",[e._v("The following parameters are of importance concerning the type definitions of keepers in modules:")]),e._v(" "),o("ul",[o("li",[e._v("An expected "),o("code",[e._v("keeper")]),e._v(" is a keeper external to a module that is required by the internal keeper of said module. External keepers are listed in the internal keeper's type definition as interfaces. These interfaces are themselves defined in an "),o("code",[e._v("expected_keepers.go")]),e._v(" file in the root of the module's folder. Interfaces are used to reduce the number of dependencies and to facilitate the maintenance of the module in this context.")]),e._v(" "),o("li",[o("code",[e._v("storeKeys")]),e._v(" grant access to any stores of the multistore managed by the module. They should always remain unexposed to external modules.")]),e._v(" "),o("li",[o("code",[e._v("cdc")]),e._v(" is the codec used to marshal and unmarshal structs to and from []byte. The "),o("code",[e._v("cdc")]),e._v(" can be "),o("code",[e._v("codec.BinaryCodec")]),e._v(", "),o("code",[e._v("codec.JSONCodec")]),e._v(", or "),o("code",[e._v("codec.Codec")]),e._v(" based on your requirements. Note that "),o("code",[e._v("code.Codec")]),e._v(" includes the other interfaces. It can be either a proto or amino codec, as long as they implement these interfaces.")])]),e._v(" "),o("p",[e._v("Each keeper has its own constructor function, which is called from the application's constructor function. This is where keepers are instantiated and where developers make sure to pass correct instances of the module's keepers to other modules that require them.")]),e._v(" "),o("h3",{attrs:{id:"scope-and-best-practices"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#scope-and-best-practices"}},[e._v("#")]),e._v(" Scope and best practices")]),e._v(" "),o("p",[e._v("Keepers primarily expose getter and setter methods for stores managed by their module. Methods should remain simple and strictly limited to getting or setting the requested value. Validity checks should already have been done with the "),o("code",[e._v("ValidateBasic()")]),e._v(" method of the message and the "),o("code",[e._v("Msg")]),e._v(" server before the keeper's methods are called.")]),e._v(" "),o("p",[e._v("The getter method will typically have the following signature:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyAoayBLZWVwZXIpIEdldChjdHggc2RrLkNvbnRleHQsIGtleSBzdHJpbmcpICh2YWx1ZSByZXR1cm5UeXBlLCBmb3VuZCBib29sKQo="}}),e._v(" "),o("p",[e._v("The setter method will typically have the following signature:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyAoayBLZWVwZXIpIFNldChjdHggc2RrLkNvbnRleHQsIGtleSBzdHJpbmcsIHZhbHVlIHZhbHVlVHlwZSkK"}}),e._v(" "),o("p",[e._v("Keepers also should implement an iterator method with the following signature when appropriate:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyAoayBLZWVwZXIpIEdldEFsbChjdHggc2RrLkNvbnRleHQpIChsaXN0IFtdcmV0dXJuVHlwZSkK"}}),e._v(" "),o("h2",{attrs:{id:"store-types"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#store-types"}},[e._v("#")]),e._v(" Store types")]),e._v(" "),o("p",[e._v("The Cosmos SDK offers different store types to work with. It is important to gain a good overview of the different store types available for development.")]),e._v(" "),o("h3",{attrs:{id:"kvstore-and-multistore-in-the-interchain"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#kvstore-and-multistore-in-the-interchain"}},[e._v("#")]),e._v(" "),o("code",[e._v("KVStore")]),e._v(" and "),o("code",[e._v("Multistore")]),e._v(" in the Interchain")]),e._v(" "),o("p",[e._v("Each Cosmos SDK application contains a state at its root, the "),o("code",[e._v("Multistore")]),e._v(". It is subdivided into separate compartments managed by each module in the application. The "),o("code",[e._v("Multistore")]),e._v(" is a store of "),o("code",[e._v("KVStore")]),e._v("s that follows the "),o("a",{attrs:{href:"https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/types/store.go#L104-L133",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v("Multistore interface")]),o("OutboundLink")],1),e._v(".")]),e._v(" "),o("p",[e._v("The base "),o("code",[e._v("KVStore")]),e._v(" and "),o("code",[e._v("Multistore")]),e._v(" implementations are wrapped in extensions that offer specialized behavior. A "),o("a",{attrs:{href:"https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/types/store.go#L141-L184",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v("CommitMultistore")]),o("OutboundLink")],1),e._v(" is a "),o("code",[e._v("Multistore")]),e._v(" with a committer. This is the main type of multistore used in the Cosmos SDK. The underlying "),o("code",[e._v("KVStore")]),e._v(" is used primarily to restrict access to the committer.")]),e._v(" "),o("p",[e._v("The "),o("a",{attrs:{href:"https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/rootmulti/store.go#L43-L61",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v("rootMulti.Store")]),o("OutboundLink")],1),e._v(" is the go-to implementation of the "),o("code",[e._v("CommitMultiStore")]),e._v(" interface. It is a base-layer multistore built around a database on top of which multiple "),o("code",[e._v("KVStore")]),e._v("s can be mounted. It is the default multistore store used in "),o("code",[e._v("BaseApp")]),e._v(".")]),e._v(" "),o("h3",{attrs:{id:"cachemultistore"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#cachemultistore"}},[e._v("#")]),e._v(" "),o("code",[e._v("CacheMultistore")])]),e._v(" "),o("p",[e._v("A "),o("a",{attrs:{href:"https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/cachemulti/store.go#L17-L28",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v("cachemulti.Store")]),o("OutboundLink")],1),e._v(" is used whenever the "),o("code",[e._v("rootMulti.Store")]),e._v(" needs to be branched. "),o("code",[e._v("cachemulti.Store")]),e._v(" branches all substores, creates a virtual store for each substore in its constructor, and holds them in "),o("code",[e._v("Store.stores")]),e._v(". This is used primarily to create an isolated store, typically when it is necessary to mutate the state but it might be reverted later.")]),e._v(" "),o("p",[o("code",[e._v("CacheMultistore")]),e._v(" caches all read queries. "),o("code",[e._v("Store.GetKVStore()")]),e._v(" returns the store from "),o("code",[e._v("Store.stores")]),e._v(", and "),o("code",[e._v("Store.Write()")]),e._v(" recursively calls "),o("code",[e._v("CacheWrap.Write()")]),e._v(" on all substores.")]),e._v(" "),o("h3",{attrs:{id:"transient-store"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#transient-store"}},[e._v("#")]),e._v(" Transient store")]),e._v(" "),o("p",[e._v("As the name suggests, "),o("code",[e._v("Transient.Store")]),e._v(" is a "),o("code",[e._v("KVStore")]),e._v(" that is discarded automatically at the end of each block. "),o("code",[e._v("Transient.Store")]),e._v(" is a "),o("code",[e._v("dbadapter.Store")]),e._v(" with a "),o("code",[e._v("dbm.NewMemDB()")]),e._v(". All "),o("code",[e._v("KVStore")]),e._v(" methods are reused. A new "),o("code",[e._v("dbadapter.Store")]),e._v(" is assigned when "),o("code",[e._v("Store.Commit()")]),e._v(" is called, discarding the previous reference. Garbage collection is attended to automatically.")]),e._v(" "),o("HighlightBox",{attrs:{type:"docs"}},[o("p",[e._v("Take a closer look at the "),o("a",{attrs:{href:"https://github.com/cosmos/iavl/blob/v0.15.0-rc5/docs/overview.md",target:"_blank",rel:"noopener noreferrer"}},[e._v("IAVL spec"),o("OutboundLink")],1),e._v(" for when working with the IAVL store.")])]),e._v(" "),o("HighlightBox",{attrs:{type:"info"}},[o("p",[e._v("The default implementation of "),o("code",[e._v("KVStore")]),e._v(" and "),o("code",[e._v("CommitKVStore")]),e._v(" is the "),o("code",[e._v("IAVL.Store")]),e._v(". The "),o("code",[e._v("IAVL.Store")]),e._v(" is a self-balancing binary search tree that ensures get and set operations are "),o("code",[e._v("O(log n)")]),e._v(", where "),o("code",[e._v("n")]),e._v(" is the number of elements in the tree.")])]),e._v(" "),o("h2",{attrs:{id:"additional-kvstore-wrappers"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#additional-kvstore-wrappers"}},[e._v("#")]),e._v(" Additional KVStore wrappers")]),e._v(" "),o("p",[e._v("In addition to the previous store types, there are a few others with more specific usage.")]),e._v(" "),o("h3",{attrs:{id:"gaskv-store"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#gaskv-store"}},[e._v("#")]),e._v(" GasKv store")]),e._v(" "),o("p",[e._v("Cosmos SDK applications use gas to track resource usage and prevent spam. The "),o("code",[e._v("GasKv.Store")]),e._v(" is a "),o("code",[e._v("KVStore")]),e._v(" wrapper that enables automatic gas consumption each time a read or write to the store is made. It is the solution of choice to track storage usage in Cosmos SDK applications.")]),e._v(" "),o("p",[o("code",[e._v("GasKv.Store")]),e._v(" automatically consumes the appropriate amount of gas depending on the "),o("code",[e._v("Store.gasConfig")]),e._v(" when methods of the parent "),o("code",[e._v("KVStore")]),e._v(" are called. All "),o("code",[e._v("KVStores")]),e._v(" are wrapped in "),o("code",[e._v("GasKv.Stores")]),e._v(" by default when retrieved. This is done in the "),o("code",[e._v("KVStore()")]),e._v(" method of the context. The default gas configuration is used in this case.")]),e._v(" "),o("h3",{attrs:{id:"tracekv-store"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#tracekv-store"}},[e._v("#")]),e._v(" TraceKv store")]),e._v(" "),o("p",[o("code",[e._v("tracekv.Store")]),e._v(" is a "),o("code",[e._v("KVStore")]),e._v(" wrapper which provides operation tracing functionalities over the underlying "),o("code",[e._v("KVStore")]),e._v(". It is applied automatically by the Cosmos SDK on all "),o("code",[e._v("KVStore")]),e._v("s if tracing is enabled on the parent "),o("code",[e._v("MultiStore")]),e._v(".\nWhen each of the "),o("code",[e._v("KVStore")]),e._v(" methods are called, "),o("code",[e._v("tracekv.Store")]),e._v(" automatically logs "),o("code",[e._v("traceOperation")]),e._v(" to the "),o("code",[e._v("Store.writer")]),e._v(". "),o("code",[e._v("traceOperation.Metadata")]),e._v(" is filled with "),o("code",[e._v("Store.context")]),e._v(" when it is not nil. "),o("code",[e._v("TraceContext")]),e._v(" is a "),o("code",[e._v("map[string]interface{}")]),e._v(".")]),e._v(" "),o("h3",{attrs:{id:"prefix-store"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#prefix-store"}},[e._v("#")]),e._v(" Prefix store")]),e._v(" "),o("p",[o("code",[e._v("prefix.Store")]),e._v(" is a "),o("code",[e._v("KVStore")]),e._v(" wrapper which provides automatic key-prefixing functionalities over the underlying "),o("code",[e._v("KVStore")]),e._v(":")]),e._v(" "),o("ul",[o("li",[e._v("When "),o("code",[e._v("Store.{Get, Set}()")]),e._v(" is called, the store forwards the call to its parent with the key prefixed with the "),o("code",[e._v("Store.prefix")]),e._v(".")]),e._v(" "),o("li",[e._v("When "),o("code",[e._v("Store.Iterator()")]),e._v(" is called, it does not simply prefix the "),o("code",[e._v("Store.prefix")]),e._v(" since it does not work as intended. Some of the elements are traversed even when they are not starting with the prefix in this case.")])]),e._v(" "),o("h2",{attrs:{id:"antehandler"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#antehandler"}},[e._v("#")]),e._v(" "),o("code",[e._v("AnteHandler")])]),e._v(" "),o("p",[e._v("The "),o("code",[e._v("AnteHandler")]),e._v(" is a special handler that implements the "),o("code",[e._v("AnteHandler")]),e._v(" interface. It is used to authenticate a transaction before the transaction's internal messages are processed.")]),e._v(" "),o("p",[e._v("The "),o("code",[e._v("AnteHandler")]),e._v(" is theoretically optional but still a very important component of public blockchain networks. It serves three primary purposes:")]),e._v(" "),o("ul",[o("li",[e._v("It is a first line of defense against spam, and the second line of defense (after the mempool) against transaction replay with fees deduction and sequence checking.")]),e._v(" "),o("li",[e._v("It performs preliminary stateful validity checks, like ensuring signatures are valid, or that a sender has enough funds to pay for fees.")]),e._v(" "),o("li",[e._v("It plays a role in the incentivization of stakeholders via the collection of transaction fees.")])]),e._v(" "),o("p",[o("code",[e._v("BaseApp")]),e._v(" holds an "),o("code",[e._v("AnteHandler")]),e._v(" as a parameter that is initialized in the application's constructor. The most widely used "),o("code",[e._v("AnteHandler")]),e._v(" is the auth module.")]),e._v(" "),o("HighlightBox",{attrs:{type:"docs"}},[o("p",[e._v("For more information on the subject, see the following resources:")]),e._v(" "),o("ul",[o("li",[o("a",{attrs:{href:"https://github.com/cosmos/cosmos-sdk/blob/master/docs/docs/basics/04-gas-fees.md",target:"_blank",rel:"noopener noreferrer"}},[e._v("Cosmos SDK documentation: Gas and Fees"),o("OutboundLink")],1)]),e._v(" "),o("li",[o("a",{attrs:{href:"https://github.com/cosmos/cosmos-sdk/blob/master/docs/docs/basics/04-gas-fees.md#antehandler",target:"_blank",rel:"noopener noreferrer"}},[e._v("Cosmos SDK documentation: AnteHandler"),o("OutboundLink")],1)])])]),e._v(" "),o("h2",{attrs:{id:"code-example"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#code-example"}},[e._v("#")]),e._v(" Code example")]),e._v(" "),o("ExpansionPanel",{attrs:{title:"Show me some code for my checkers blockchain"}},[o("p",[e._v("In the "),o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/2-accounts.html"}},[e._v("Accounts section")]),e._v(", you were shown the elements of the stored game but not where this game is stored. This will now be explained.\n"),o("br"),o("br"),e._v(" "),o("strong",[e._v("Game object in storage")])],1),e._v(" "),o("p",[e._v("You need to decide under what structure you want to store a game in the storage. The Cosmos SDK partitions the global storage per module, with "),o("code",[e._v("checkers")]),e._v(" being its own module. You need to take care of how to store games in the checkers module's corner of the key/value pair storage.\n"),o("br"),o("br"),e._v("\nThe first idea is to attribute a unique ID to a game, and to store the game value at that ID. For the sake of clarity, and to differentiate between other stored elements in the future, you add a prefix to each ID. The storage structure looks like this:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Ly8gUHNldWRvLWNvZGUKdmFyIGdsb2JhbFN0b3JlIHNkay5LVlN0b3JlCmNoZWNrZXJzU3RvcmUgOj0gZ2xvYmFsU3RvcmUuZ2V0QXRQcmVmaXgoJnF1b3Q7Y2hlY2tlcnMtJnF1b3Q7KQpnYW1lc1N0b3JlIDo9IGNoZWNrZXJzU3RvcmUuZ2V0QXRQcmVmaXgoJnF1b3Q7Z2FtZXMtJnF1b3Q7KQpzdG9yZWRHYW1lIDo9IGdhbWVzU3RvcmUuZ2V0QXRQcmVmaXgoZ2FtZUlkKQovLyBPciBhZ2FpbiBpbiBhIGRpZmZlcmVudCB3YXkKc3RvcmVkR2FtZSA6PSBnbG9iYWxTdG9yZS5nZXRBdFByZWZpeCgmcXVvdDtjaGVja2Vycy1nYW1lcy0mcXVvdDsgKyBnYW1lSWQpCg=="}}),e._v(" "),o("p",[e._v("This is pseudo-code because:")]),e._v(" "),o("ul",[o("li",[e._v("Prefixes have to be "),o("code",[e._v("byte[]")]),e._v(" instead of "),o("code",[e._v("string")]),e._v(". This is easily handled with a cast such as "),o("code",[e._v('[]byte("games-")')]),e._v(".")]),e._v(" "),o("li",[e._v("The Cosmos SDK prevents you from directly accessing any random module's store, such that "),o("code",[e._v('globalStore.getAtPrefix("checkers-")')]),e._v(" is not allowed and instead has to be accessed via a secret key.")])]),e._v(" "),o("p",[e._v("Define the ID of the "),o("code",[e._v("StoredGame")]),e._v(". To return a single object, include "),o("code",[e._v("Index")]),e._v(" in the object's value:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"dHlwZSBTdG9yZWRHYW1lIHN0cnVjdCB7CiAgICAuLi4KICAgIEluZGV4IHN0cmluZwp9Cg=="}}),e._v(" "),o("p",[e._v("The Cosmos SDK provides much support; you only need to define the required prefixes in your corner of the storage:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"cGFja2FnZSB0eXBlcwoKY29uc3QgKAogICAgU3RvcmVkR2FtZUtleVByZWZpeCA9ICZxdW90O1N0b3JlZEdhbWUvdmFsdWUvJnF1b3Q7CikK"}}),e._v(" "),o("p",[e._v("This assists you with accessing a game:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"cGFja2FnZSBrZWVwZXIKCmltcG9ydCAoCiAgICAmcXVvdDtnaXRodWIuY29tL2Nvc21vcy9jb3Ntb3Mtc2RrL3N0b3JlL3ByZWZpeCZxdW90OwogICAgc2RrICZxdW90O2dpdGh1Yi5jb20vY29zbW9zL2Nvc21vcy1zZGsvc3RvcmUvdHlwZXMmcXVvdDsKICAgICZxdW90O2dpdGh1Yi5jb20vYWxpY2UvY2hlY2tlcnMveC9jaGVja2Vycy90eXBlcyZxdW90OwopCgpmdW5jIChrIEtlZXBlcikgR2V0U3RvcmVkR2FtZShjdHggc2RrLkNvbnRleHQsIGdhbWVJZCBzdHJpbmcpIChzdG9yZWRHYW1lIHR5cGVzLlN0b3JlZEdhbWUsIGZvdW5kIGJvb2wpIHsKICAgIGNoZWNrZXJzU3RvcmUgOj0gY3R4LktWU3RvcmUoay5zdG9yZUtleSkKICAgIGdhbWVzU3RvcmUgOj0gcHJlZml4Lk5ld1N0b3JlKGNoZWNrZXJzU3RvcmUsIFtdYnl0ZSh0eXBlcy5TdG9yZWRHYW1lS2V5UHJlZml4KSkKICAgIGdhbWVCeXRlcyA6PSBnYW1lc1N0b3JlLkdldChbXWJ5dGUoZ2FtZUlkKSkKICAgIGlmIGdhbWVCeXRlcyA9PSBuaWwgewogICAgICAgIHJldHVybiBzdG9yZWRHYW1lLCBmYWxzZQogICAgfQogICAgay5jZGMuTXVzdFVubWFyc2hhbEJpbmFyeUJhcmUoZ2FtZUJ5dGVzLCAmYW1wO3N0b3JlZEdhbWUpCiAgICByZXR1cm4gc3RvcmVkR2FtZSwgdHJ1ZQp9Cg=="}}),e._v(" "),o("p",[e._v("If you want to save a game:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyAoayBLZWVwZXIpIFNldFN0b3JlZEdhbWUoY3R4IHNkay5Db250ZXh0LCBzdG9yZWRHYW1lIHR5cGVzLlN0b3JlZEdhbWUpIHsKICAgIGNoZWNrZXJzU3RvcmUgOj0gY3R4LktWU3RvcmUoay5zdG9yZUtleSkKICAgIGdhbWVzU3RvcmUgOj0gcHJlZml4Lk5ld1N0b3JlKGNoZWNrZXJzU3RvcmUsIFtdYnl0ZSh0eXBlcy5TdG9yZWRHYW1lS2V5UHJlZml4KSkKICAgIGdhbWVCeXRlcyA6PSBrLmNkYy5NdXN0TWFyc2hhbEJpbmFyeUJhcmUoJmFtcDtzdG9yZWRHYW1lKQogICAgZ2FtZXNTdG9yZS5TZXQoYnl0ZVtdKHN0b3JlZEdhbWUuSW5kZXgpLCBnYW1lQnl0ZXMpCn0K"}}),e._v(" "),o("p",[e._v("If you want to delete a stored game, you call "),o("code",[e._v("gamesStore.Delete(byte[](storedGame.Index))")]),e._v(".\n"),o("br"),o("br"),e._v("\nThe "),o("code",[e._v("KVStore")]),e._v(" also allows you to obtain an iterator on a given prefix. You can list all stored games because they share the same prefix, which you do with:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyAoayBLZWVwZXIpIEdldEFsbFN0b3JlZEdhbWUoY3R4IHNkay5Db250ZXh0KSAobGlzdCBbXXR5cGVzLlN0b3JlZEdhbWUpIHsKICAgIGNoZWNrZXJzU3RvcmUgOj0gY3R4LktWU3RvcmUoay5zdG9yZUtleSkKICAgIGdhbWVzU3RvcmUgOj0gcHJlZml4Lk5ld1N0b3JlKGNoZWNrZXJzU3RvcmUsIFtdYnl0ZSh0eXBlcy5TdG9yZWRHYW1lS2V5UHJlZml4KSkKICAgIGl0ZXJhdG9yIDo9IHNkay5LVlN0b3JlUHJlZml4SXRlcmF0b3IoZ2FtZXNTdG9yZSwgW11ieXRle30pIC8vIFtdYnl0ZXt9IGlzIGFuIGVtcHR5IGFycmF5CgogICAgZGVmZXIgaXRlcmF0b3IuQ2xvc2UoKSAvLyBUaGluayBvZiBpdCBhczogdHJ5IHsgZXZlcnl0aGluZyBiZWxvdyB9IGZpbmFsbHkgeyBpdGVyYXRvci5DbG9zZSgpIH0KCiAgICBmb3IgOyBpdGVyYXRvci5WYWxpZCgpOyBpdGVyYXRvci5OZXh0KCkgewogICAgICAgIHZhciBzdG9yZWRHYW1lIHR5cGVzLlN0b3JlZEdhbWUKICAgICAgICBrLmNkYy5NdXN0VW5tYXJzaGFsQmluYXJ5QmFyZShpdGVyYXRvci5WYWx1ZSgpLCAmYW1wO3N0b3JlZEdhbWUpCiAgICAgICAgbGlzdCA9IGFwcGVuZChsaXN0LCBzdG9yZWRHYW1lKQogICAgfQoKICAgIHJldHVybgp9Cg=="}}),e._v(" "),o("p",[e._v("Note the "),o("code",[e._v("MustMarshalBinaryBare")]),e._v(" and "),o("code",[e._v("MustUnmarshalBinaryBare")]),e._v(" functions in the previous "),o("code",[e._v("codec")]),e._v(". They need to be instructed on how to proceed with the marshaling. Protobuf handled this for you.")]),e._v(" "),o("HighlightBox",{attrs:{type:"tip"}},[o("p",[e._v("See the "),o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/6-protobuf.html"}},[e._v("previous section on Protobuf")]),e._v(" to explore how Protobuf deals with the marshaling.")],1)]),e._v(" "),o("p",[o("strong",[e._v("Boilerplate, boilerplate everywhere!")])]),e._v(" "),o("p",[e._v("Note how the "),o("code",[e._v("Set")]),e._v(", "),o("code",[e._v("Get")]),e._v(", "),o("code",[e._v("Remove")]),e._v(", and "),o("code",[e._v("GetAll")]),e._v(" functions shown previously look like boilerplate too. Do you have to redo these functions for every type? "),o("em",[e._v("No")]),e._v(" - it was all created with this Ignite CLI command:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"sh",base64:"JCBpZ25pdGUgc2NhZmZvbGQgbWFwIHN0b3JlZEdhbWUgXAogICAgICAgIGJvYXJkIHR1cm4gYmxhY2sgcmVkIHdhZ2VyOnVpbnQgXAogICAgICAgIC0tbW9kdWxlIGNoZWNrZXJzIFwKICAgICAgICAtLW5vLW1lc3NhZ2UK"}}),e._v(" "),o("p",[o("code",[e._v("map")]),e._v(" is the command that tells Ignite CLI to add an "),o("code",[e._v("Index")]),e._v(" and store all elements under a map-like structure.")]),e._v(" "),o("p",[o("strong",[e._v("Other storage elements")])]),e._v(" "),o("p",[e._v("How do you pick a value for the "),o("code",[e._v("Index")]),e._v(" in "),o("code",[e._v("storedGame")]),e._v("? A viable idea is to keep a counter in storage for the next game. Unlike "),o("code",[e._v("StoredGame")]),e._v(", which is saved as a map, this "),o("code",[e._v("SystemInfo")]),e._v(" object has to be at a unique location in the storage.\n"),o("br"),o("br"),e._v("\nFirst define the object:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"cGFja2FnZSB0eXBlcwoKdHlwZSBTeXN0ZW1JbmZvIHN0cnVjdCB7CiAgICBOZXh0SWQgdWludDY0Cn0K"}}),e._v(" "),o("p",[e._v("Then define the key where it resides:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Y29uc3QgKAogICAgU3lzdGVtSW5mb0tleSA9ICZxdW90O1N5c3RlbUluZm8tdmFsdWUtJnF1b3Q7CikK"}}),e._v(" "),o("p",[e._v("Then define the functions to get and set:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyAoayBLZWVwZXIpIFNldFN5c3RlbUluZm8oY3R4IHNkay5Db250ZXh0LCBzeXN0ZW1JbmZvIHR5cGVzLlN5c3RlbUluZm8pIHsKICAgIHN5c3RlbUluZm9TdG9yZSA6PSBwcmVmaXguTmV3U3RvcmUoY3R4LktWU3RvcmUoay5zdG9yZUtleSksIFtdYnl0ZSh0eXBlcy5TeXN0ZW1JbmZvS2V5KSkKICAgIG5leHRCeXRlcyA6PSBrLmNkYy5NdXN0TWFyc2hhbEJpbmFyeUJhcmUoJmFtcDtzeXN0ZW1JbmZvKQogICAgc3lzdGVtSW5mb1N0b3JlLlNldChbXWJ5dGV7MH0sIG5leHRCeXRlcykKfQo="}}),e._v(" "),o("p",[e._v("Remember that "),o("code",[e._v("SystemInfo")]),e._v(" needs an initial value, which is the role of the genesis block definition:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"dHlwZSBHZW5lc2lzU3RhdGUgc3RydWN0IHsKICAgIFN5c3RlbUluZm8gU3lzdGVtSW5mbwogICAgU3RvcmVkR2FtZUxpc3QgW11TdG9yZWRHYW1lCn0K"}}),e._v(" "),o("p",[e._v("Now initialize:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyBEZWZhdWx0R2VuZXNpcygpICpHZW5lc2lzU3RhdGUgewogICAgcmV0dXJuICZhbXA7R2VuZXNpc1N0YXRlewogICAgICAgIFN5c3RlbUluZm86IFN5c3RlbUluZm97CiAgICAgICAgICAgIE5leHRJZDogIHVpbnQ2NCgxKSwgLy8gU3RhcnRzIGF0IDEKICAgICAgICB9LAogICAgICAgIFN0b3JlZEdhbWVMaXN0OiBbXVN0b3JlZEdhbWV7fSwgLy8gU3RhcnRzIGVtcHR5CiAgICB9Cn0K"}}),e._v(" "),o("p",[o("strong",[e._v("What about message handling")])]),e._v(" "),o("p",[e._v("You go from the message to the game in storage with "),o("code",[e._v("MsgCreateGame")]),e._v(", which was defined in an earlier "),o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/4-messages.html"}},[e._v("section on messages")]),e._v(". That is also the role of the keeper.\n"),o("br"),o("br"),e._v("\nDefine a handling function such as:")],1),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZnVuYyAoayBLZWVwZXIpIENyZWF0ZUdhbWUoZ29DdHggY29udGV4dC5Db250ZXh0LCBtc2cgKnR5cGVzLk1zZ0NyZWF0ZUdhbWUpICgqdHlwZXMuTXNnQ3JlYXRlR2FtZVJlc3BvbnNlLCBlcnJvcikgewogICAgY3R4IDo9IHNkay5VbndyYXBTREtDb250ZXh0KGdvQ3R4KQoKICAgIC8vIFRPRE86IEhhbmRsZSB0aGUgbWVzc2FnZQoKICAgIHJldHVybiAmYW1wO3R5cGVzLk1zZ0NyZWF0ZUdhbWVSZXNwb25zZXt9LCBuaWwKfQo="}}),e._v(" "),o("p",[e._v("You now have all the pieces necessary to replace the "),o("code",[e._v("TODO")]),e._v(".")]),e._v(" "),o("p",[e._v("Get the next game ID:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ICAgIHN5c3RlbUluZm8sIGZvdW5kIDo9IGsuR2V0U3lzdGVtSW5mbyhjdHgpCiAgICBpZiAhZm91bmQgewogICAgICAgIC8vIFBhbmljIGJlY2F1c2UgdGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuLgogICAgICAgIHBhbmljKCZxdW90O1N5c3RlbUluZm8gbm90IGZvdW5kJnF1b3Q7KQogICAgfQogICAgbmV3SW5kZXggOj0gc3RyY29udi5Gb3JtYXRVaW50KHN5c3RlbUluZm8uTmV4dElkLCAxMCkK"}}),e._v(" "),o("p",[e._v("Extract and sanitize the message elements:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ICAgIGNyZWF0b3IsIGVyciA6PSBzZGsuQWNjQWRkcmVzc0Zyb21CZWNoMzIobXNnLkNyZWF0b3IpCiAgICBpZiBlcnIgIT0gbmlsIHsKICAgICAgICByZXR1cm4gbmlsLCBlcnJvcnMuTmV3KCZxdW90O2NyZWF0b3IgYWRkcmVzcyBpbnZhbGlkJnF1b3Q7KQogICAgfQogICAgYmxhY2ssIGVyciA6PSBzZGsuQWNjQWRkcmVzc0Zyb21CZWNoMzIobXNnLkJsYWNrKQogICAgaWYgZXJyICE9IG5pbCB7CiAgICAgICAgLy8gU3RhbmRhcmQgZXJyb3IgYmVjYXVzZSB1c2VycyBjYW4gbWFrZSBtaXN0YWtlcy4KICAgICAgICByZXR1cm4gbmlsLCBlcnJvcnMuTmV3KCZxdW90O2JsYWNrIGFkZHJlc3MgaW52YWxpZCZxdW90OykKICAgIH0KICAgIHJlZCwgZXJyIDo9IHNkay5BY2NBZGRyZXNzRnJvbUJlY2gzMihtc2cuUmVkKQogICAgaWYgZXJyICE9IG5pbCB7CiAgICAgICAgcmV0dXJuIG5pbCwgZXJyb3JzLk5ldygmcXVvdDtyZWQgYWRkcmVzcyBpbnZhbGlkJnF1b3Q7KQogICAgfQo="}}),e._v(" "),o("p",[e._v("Create the stored game object:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ICAgIHN0b3JlZEdhbWUgOj0gdHlwZXMuU3RvcmVkR2FtZXsKICAgICAgICBDcmVhdG9yOiBtc2cuQ3JlYXRvciwKICAgICAgICBJbmRleDogICBuZXdJbmRleCwKICAgICAgICBCb2FyZDogICBydWxlcy5OZXcoKS5TdHJpbmcoKSwKICAgICAgICBUdXJuOiAgICAmcXVvdDtiJnF1b3Q7LAogICAgICAgIEJsYWNrOiAgIG1zZy5CbGFjaywKICAgICAgICBSZWQ6ICAgICBtc2cuUmVkLAogICAgICAgIFdhZ2VyOiAgIG1zZy5XYWdlciwKICAgIH0K"}}),e._v(" "),o("p",[e._v("Save the stored game object in storage:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ICAgIGsuU2V0U3RvcmVkR2FtZShjdHgsIHN0b3JlZEdhbWUpCg=="}}),e._v(" "),o("p",[e._v("Prepare for the next created game:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ICAgIHN5c3RlbUluZm8uTmV4dElkKysKICAgIGsuU2V0U3lzdGVtSW5mbyhjdHgsIHN5c3RlbUluZm8pCg=="}}),e._v(" "),o("p",[e._v("Return the game ID for reference:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ICAgIHJldHVybiAmYW1wO3R5cGVzLk1zZ0NyZWF0ZUdhbWVSZXNwb25zZXsKICAgICAgICBHYW1lSW5kZXg6IG5ld0luZGV4LAogICAgfSwgbmlsCg=="}}),e._v(" "),o("p",[e._v("You would also do the same for "),o("code",[e._v("MsgPlayMoveResponse")]),e._v(" and "),o("code",[e._v("MsgRejectGame")]),e._v(". Why not try it out as an exercise? See the bottom of the page for relevant links.\n"),o("br"),o("br"),e._v(" "),o("strong",[e._v("More on game theory")])]),e._v(" "),o("p",[e._v("Some players may drop out from games, especially if they know they are about to lose. As the blockchain designer, you need to protect your blockchain, and in particular to avoid bloat, or locked tokens.")]),e._v(" "),o("p",[e._v("A good first point is to introduce a game deadline. This demonstrates how you would add a small feature to your existing blockchain:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Y29uc3QgKAogICAgTWF4VHVybkR1cmF0aW9uID0gdGltZS5EdXJhdGlvbigyNCAqIDNfNjAwICogMTAwMF8wMDBfMDAwKSAvLyAxIGRheQogICAgRGVhZGxpbmVMYXlvdXQgID0gJnF1b3Q7MjAwNi0wMS0wMiAxNTowNDowNS45OTk5OTk5OTkgKzAwMDAgVVRDJnF1b3Q7CikKdHlwZSBTdG9yZWRHYW1lIHN0cnVjdCB7CiAgICAuLi4KICAgIERlYWRsaW5lIHN0cmluZwp9Cg=="}}),e._v(" "),o("p",[e._v("Set its initial value on creation:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"c3RvcmVkR2FtZSA6PSB0eXBlcy5TdG9yZWRHYW1lewogICAgLi4uCiAgICBEZWFkbGluZTogY3R4LkJsb2NrVGltZSgpLkFkZCh0eXBlcy5NYXhUdXJuRHVyYXRpb24pLlVUQygpLkZvcm1hdCh0eXBlcy5EZWFkbGluZUxheW91dCksCn0K"}}),e._v(" "),o("p",[e._v("Update its value after a move:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"c3RvcmVkR2FtZS5EZWFkbGluZSA9IGN0eC5CbG9ja1RpbWUoKS5BZGQodHlwZXMuTWF4VHVybkR1cmF0aW9uKS5VVEMoKS5Gb3JtYXQodHlwZXMuRGVhZGxpbmVMYXlvdXQpCg=="}}),e._v(" "),o("p",[e._v("Extract and verify its value when necessary:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"ZGVhZGxpbmUsIGVyciA9IHRpbWUuUGFyc2UoRGVhZGxpbmVMYXlvdXQsIHN0b3JlZEdhbWUuRGVhZGxpbmUpCmlmIGVyciAhPSBuaWwgewogICAgcGFuaWMoZXJyKQp9CmlmIGRlYWRsaW5lLkJlZm9yZShjdHguQmxvY2tUaW1lKCkpIHsKICAgIC8vIFRPRE8KfQo="}}),e._v(" "),o("p",[o("strong",[e._v("How to expire games")])]),e._v(" "),o("p",[e._v("How can you know what games should be removed? Should you load "),o("em",[e._v("all")]),e._v(" games and filter for those that have expired? That would be extremely expensive, O(n) of the number of games in fact. This means the more successful your blockchain becomes, the slower it would run.")]),e._v(" "),o("p",[e._v("Better is to use a First-In-First-Out (FIFO) strategy, where fresh games are pushed back to the tail so that the head contains the next games to expire.\n"),o("br"),o("br"),e._v("\nIn the context of the Cosmos SDK, you need to keep track of where the FIFO starts and stops by saving the corresponding game IDs:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"Y29uc3QgKAogICAgTm9GaWZvSW5kZXggPSAmcXVvdDstMSZxdW90OwopCnR5cGUgU3lzdGVtSW5mbyBzdHJ1Y3QgewogICAgLi4uCiAgICBGaWZvSGVhZEluZGV4IHN0cmluZwogICAgRmlmb1RhaWxJbmRleCBzdHJpbmcKfQo="}}),e._v(" "),o("p",[e._v("Each game must know its relative position and the number of moves done, to assist the refunding logic on games with zero, one, or more than two moves:")]),e._v(" "),o("tm-code-block",{staticClass:"codeblock",attrs:{language:"go",base64:"dHlwZSBTdG9yZWRHYW1lIHN0cnVjdCB7CiAgICAuLi4KICAgIE1vdmVDb3VudCAgIHVpbnQ2NAogICAgQmVmb3JlSW5kZXggc3RyaW5nCiAgICBBZnRlckluZGV4ICBzdHJpbmcKfQo="}}),e._v(" "),o("p",[e._v("Next, you need to code a regular FIFO, whereby:")]),e._v(" "),o("ul",[o("li",[e._v("Games are sent to the back when created or played on.")]),e._v(" "),o("li",[e._v("Games are removed from the FIFO when they are finished or time out.")])]),e._v(" "),o("p",[o("strong",[e._v("When to expire games")])]),e._v(" "),o("p",[e._v("See the next section about the "),o("RouterLink",{attrs:{to:"/academy/2-cosmos-concepts/8-base-app.html"}},[e._v("BaseApp")]),e._v(" for a possible solution.")],1)],1),e._v(" "),o("HighlightBox",{attrs:{type:"tip"}},[o("p",[e._v("If you want to go beyond out-of-context code samples like the above and see in more detail how to define these features, go to "),o("RouterLink",{attrs:{to:"/hands-on-exercise/1-ignite-cli/"}},[e._v("Run Your Own Cosmos Chain")]),e._v(".\n"),o("br"),o("br"),e._v("\nMore precisely, you can jump to:")],1),e._v(" "),o("ul",[o("li",[o("RouterLink",{attrs:{to:"/hands-on-exercise/1-ignite-cli/3-stored-game.html"}},[e._v("Store Object - Make a Checkers Blockchain")]),e._v(" for general detail of how you handle your game in storage.")],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/hands-on-exercise/1-ignite-cli/5-create-handling.html"}},[e._v("Create and Save a Game Properly")]),e._v(" for how you would handle the game when it is being created.")],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/hands-on-exercise/2-ignite-cli-adv/1-game-deadline.html"}},[e._v("Keep an Up-To-Date Game Deadline")]),e._v(", where you add a small feature to your chain.")],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/hands-on-exercise/2-ignite-cli-adv/3-game-fifo.html"}},[e._v("Put Your Games in Order")]),e._v(" to see the implementation of the FIFO within the constraints of the store.")],1),e._v(" "),o("li",[o("RouterLink",{attrs:{to:"/hands-on-exercise/4-run-in-prod/3-add-leaderboard.html"}},[e._v("Store leaderboard candidates")]),e._v(" in the context's transient store.")],1)])]),e._v(" "),o("HighlightBox",{attrs:{type:"synopsis"}},[o("p",[e._v("To summarize, this section has explored:")]),e._v(" "),o("ul",[o("li",[e._v("How each keeper manages access to the subset of the blockchain state that is a given module's state, which is at the core of the Cosmos SDK's object-capabilities-based approach to protecting applications from unwanted inter-module interactions.")]),e._v(" "),o("li",[e._v("How each keeper holds a "),o("code",[e._v("storeKey")]),e._v(" granting unlimited access to its module's data and defines how to read and write to any store, so when one module needs to interact with another it must follow the methods of the other module's keeper.")]),e._v(" "),o("li",[e._v("How all Cosmos SDK applications contain a "),o("code",[e._v("Multistore")]),e._v(" root state that is subdivided into compartments managed by each module and which stores all the "),o("code",[e._v("KVStore")]),e._v("s of the application's modules.")]),e._v(" "),o("li",[e._v("How inclusion of the "),o("code",[e._v("AnteHandler")]),e._v(" component is recommended to authenticate transactions before their internal messages are processed. It defends against spam and other wasteful transaction events, performs preliminary stateful validity checks, and is involved in collecting transaction fees.")])])])],1)}),[],!1,null,null,null);t.default=s.exports}}]);