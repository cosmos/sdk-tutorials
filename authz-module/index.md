---
parent:
  title: Understanding the Authz Module
order: 0
description: Use the Cosmos SDK authz module to grant authorizations from one account (the granter) to another account (the grantee).
---

# Authz Module

The authz ("authorization") module enables a granter to grant authorizations to a grantee that allows the grantee to execute messages on behalf of the granter.

## Use Authz to Grant Authorizations

By implementing the [authz module](https://docs.cosmos.network/v0.43/modules/authz/), Cosmos SDK application developers give users the ability to grant certain privelages to other users. For example, a user may want another user to vote on their behalf. Rather than giving the other user access to their account, the user can grant an authorization that allows the other user to execute the `MsgVote` message on their behalf.

How users decide to use the authz module is up to them. In some cases, a user may want to create a root account that acts as a secure bank and then create another account that has limited capabilities, such as voting. The authz module can also be used to distribute authorizations to different members of a DAO. The root account could be a multisig account and certain authorizations could be granted to members that would allow those members to execute messages without requiring signatures from all members of the DAO.

In this tutorial, you spin up a single node network using the simulation application in Cosmos SDK (`simapp`), grant an authorization to another account, and then execute a message on behalf of the granter as the grantee.

...
