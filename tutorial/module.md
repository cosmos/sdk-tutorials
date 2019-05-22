### ModuleBasicsManager

Here is where we could explain the rationale behind the module basics manager show the code needed in app.go
They can integrate the moduleBasicsManager without having completed the nameservice module. We should have them wire up a ModuleBasicManager using the auth and bank modules only

THen, We could instruct them to scaffold out the genesis functionality to satisfy the AppModule interface and have a seperate "chapter" for genesis state functionality
Once the interface is implemented, we could go back to app.go and show how to add the module to the Manager

Here are the code changes required for a bare app (without the nameservice module) to work with the new sdk. This set of changes should mostly just require edits to the existing tutorial with perhaps from explanatory text.
https://github.com/hschoenburg/cosmos-sdk-example/commit/7d1df78647a65bc75fd2023701a434bd7014294e

Here are the code changes required for the nameservice module to work with the new sdk. This requires adding substantive tutotial content around the AppModule interface.
https://github.com/hschoenburg/cosmos-sdk-example/commit/aaf935b50eec1904b62cd9e6b8634db7cf201640


