---
title: "IBC Tooling"
order: 8
description: Overview of some helpful tools
tags: 
  - concepts
  - ibc
---

# IBC Tooling

<HighlightBox type="learning">

In this section, you will discover the following tools:

* MapOfZones
* Mintscan
* IOBScan

</HighlightBox>

In this section, you will take a look at three very helpful visualization tools for the IBC network. They include information on the chains in the network (hub and zones), connections, channels, and transactions.

While going through the overview, it is recommended to try out all there is to discover: just click around and see what happens.

These types of tools help maintain an overview of the overall IBC network, but can also assist with things like relayer selection, as they provide an overview of essential metrics when it comes to relaying.

## MapOfZones - explore the Cosmos network

[MapOfZones](https://mapofzones.com/) is a Cosmos network explorer.

By default, the explorer shows you a visual overview of the IBC network for the last seven days:

![MapOfZones](/academy/3-ibc/images/mapofzones1.png)

You can also change the time being visualized by the MapOfZones in the lower right-hand corner of the display. You can chose between:

* 24 hours
* Seven days
* 30 days

The overview is dynamic and gives you a good feeling of the current activity in the overall network and between specific chains. You can also include testnet chains in the overview - you just have to enable it by activating `Show testnet` in the upper right-hand corner of the overview. The MapOfZones also lets you:

* See the overview in full-screen mode
* Zoom in and out
* See the overview in 2D and 3D
* Filter the zones you see by:
    * Activity: you can select all, most active, or least active chains.
    * Trendline: you can chose between uptrend and downtrend.

All of which can be found on the right-hand side of the overview display.

The individual chains are visualized by circle icons, sometimes including the chain's logo. Additionally, you can see connecting lines between the different chains. These lines represent transactions between chains.

<HighlightBox type="note">

In the overview display of the Cosmos network, the lines are colored to signal the main direction of the transactions. The coloring goes from red to green. The "redder" a line, the more transactions are mainly sends. The "greener" it becomes, the more transactions are mainly receives.

</HighlightBox>

When you hover over a specific chain with your mouse cursor, a small overview of data for that chain is displayed.

![MapOfZones - hovering over a zone](/academy/3-ibc/images/mapofzones2.png)

The information displayed includes:

* The number of peers
* The number of IBC transfers (for the selected time period)
* The IBC volume (in USD)
* The success rate (in %)
* The IBC volume out (in USD)
* The IBC volume in (in USD)
* A button for more `Details`

If you click on the `Details`, you are directed to an overview with more in-depth information about the chain selected:

![Detailed list for the Cosmos Hub](/academy/3-ibc/images/detailscosmoszone.png)

In the overview, you can find a list of all the chains the selected chain is connected to. When you click on a specific chain, you can see the channels between the selected chain and another chain:

![Channels between the Cosmos Hub and Osmosis](/academy/3-ibc/images/cosmososmasischannels.png)

Now you have an overview for each channel, including: how much IBC volume is transferred between the chains through the individual channels; the number of transfers successfully transferred to and received from a particular zone; the balancing figure between inbound and outbound IBC transfers; the number of IBC transfers failed attributed to a particular pair of channels between zones; and the ratio of successfully completed transfers to all transfers with final status.

<HighlightBox type="note">

There are canonical channels for ICS-20. All other channels will have been created accidentally by (inexperienced) relayers and hence have practically no transactions.

</HighlightBox>

When you go back to the overview, below the visual overview of the entire network you can find a list of the most active zones by IBC volume in USD:

![Most active zones](/academy/3-ibc/images/mostactivezones.png)

The list includes very useful information, such as:

* `IBC volume, $`: USD value of tokens successfully relayed via IBC transfer with pertinent volume in progress.
* `IBC transfer`: number of successfully relayed IBC transfers with pertinent quantity in progress.
* `IBC volume out, $`: USD value of tokens successfully transferred to other zones with pertinent volume in progress.
* `IBC volume in, $`: USD value of tokens successfully received from other zones with pertinent volume in progress.
* `IBC WAU`: number of zone's unique addresses initiated outward IBC transfer(s).
* `IBC volume activity`: graph visualizing the activity.

For the first five categories, you can also sort the list in either ascending or descending order.

## Mintscan

[Mintscan](https://hub.mintscan.io) is another Cosmos network explorer.

It gives an overview of IBC networks, including a visualization (left side) and a list (right side). For the former, the default is set to give you a visualization based on IBC transactions within a 30-day period:

![Mintscan - IBC network overview](/academy/3-ibc/images/mintscanoverview.png)

To select a specific chain, just click on it in the visualization. You will get a display of more detailed information for that chain:

![Mintscan - Osmosis chain overview 1](/academy/3-ibc/images/mintscanosmosis1.png)

Here you can see:

* The total of send transactions measured in transactions and USD - Total Send Txs.
* The total of receive transactions measured in transactions and USD - Total Receive Txs.
* The send connection, with the number of chains and relayers.
* The receive connection, with the number of chains and relayers.

You can also click on `Show all Sends` and `Show all Receives` to get a complete list for both.

Scroll down:

![Mintscan - Osmosis chain overview 2](/academy/3-ibc/images/mintscanosmosis2.png)

Here you can see graphs for:

* The **transaction history**, with information on the total transactions, amount of send transactions, and amount of receive transactions.
* The **volume history**, with information on the total transaction volume, send volume, and receive volume.

You can also use the list on the right-hand side to select a specific blockchain and get a detailed information overview for that chain:

![Cosmos connections](/academy/3-ibc/images/cosmosconnections.png)

In the detailed overview you can select a specific connection, and Mintscan will show you the corresponding channels:

![Mintscan - Cosmos Hub to Osmosis channels](/academy/3-ibc/images/cosmoschannels.png)

If you click one of the connections you can see the connections, send and receive transactions, the relayer transaction history, and the relayer volume history:

![Mintscan - channel overview](/academy/3-ibc/images/mintscanchanneloevrview.png)

If you select a channel, you will be forwarded to a page with more in-depth information regarding that IBC relayer:

![In-depth channel information - overview](/academy/3-ibc/images/onchannel1.png)

Among other things you can find out:

* If a relayer is well known
* The total transfer value for the relayer
* The last time an update was done
* The operating period for that IBC relayer

Below that you will find an overview of the weekly transferred values of receive and send transactions:

![In-depth channel information - TX volumes](/academy/3-ibc/images/onchannel2.png)

You can also look into the relayer operators - operator address, IBC received transactions, and the date and time of the last update are displayed:

![In-depth channel information - relayer](/academy/3-ibc/images/onchannel3.png)

At the end of the page, you can find a list of all transactions:

![In-depth channel information - transactions](/academy/3-ibc/images/onchannel4.png)

The list of transactions includes information on:

* The transaction's hash
* The type of transaction
* The result - was it successful?
* The amount transferred
* The fee of the transaction
* The transaction's height
* How long ago a transaction was conducted

When you click on a specific transaction in the list, you are forwarded to a page with the transaction details.

For example, click on a transaction marked as an **IBC transfer** (in the type column of the transaction list):

![Transfer Tx details](/academy/3-ibc/images/ftstx1.png)

This gives you an overview of the transaction, which includes:

* Chain ID
* Transaction hash
* Status of the transaction
* Height of the transaction
* Time of the transaction
* Fee for the transaction
* Gas used and wanted
* Memo

Further below, you can also look into information on the messages involved. Next to a lot of information on the message, you can also look into the IBC progress of IBC acknowledgements:

![Transfer Tx messages](/academy/3-ibc/images/ftstx2.png)

## IOBScan

Now, turn your focus to another blockchain explorer, [IOBScan](https://ibc.iobscan.io/home).

From the IOBScan homepage you can get a quick overview of networks, channels, IBC token transfers, and IBC tokens:

![IOBScan - homepage](/academy/3-ibc/images/iobscan1.png)

You can use the tab navigation for a closer look at:

* Transfers
* Tokens
* The network
* Channels
* Relayers

A search functionality by transaction hash is possible too.

In the upper-right-hand corner, you can select the network. For example, you can switch between the mainnet of Iris Hub, the mainnet of the Cosmos Hub, the Stargate testnet, and the Nyancat testnet.

On the right-hand side (next to the visualization) you can find a list of all networks, sorted by either connections or chains.

<HighlightBox type="tip">

If you want a visualization of the network, just click on the network icon in the upper-right-hand corner. This redirects you to the [IOBSCAN Network State Visualizer](https://www.iobscan.io/#/):

![IOBScan Network State Visualizer](/academy/3-ibc/images/iobscan2.png)

The connections displayed in the visualizer have either a regular or a dotted line, depending on whether a connection is opened or unopened.

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* **MapOfZones**, a network explorer for the Cosmos Ecosystem, which provides a variety of dynamic visualizations of network activity over time, allowing easy comprehension of transactions occurring between specific individual chains, access to detailed traffic data and in-depth information about chains, and useful information regarding the most active zones by IBC volume in USD.
* **Mintscan**, another Cosmos network explorer, which provides an overview of IBC network activity over time, and can focus in on specific chains to show their total transactions (measured in transactions and USD) and connections (with the number of chains and relayers), also providing graphs for transaction and volume history, and can provide highly detailed breakdowns of data at various levels of network detail.
* **IOBScan**, another blockchain explorer, which provides a quick overview of networks, channels, IBC token transfers, and IBC tokens from its homepage; it allows for searching by transaction hash, and also offers the IOBSCAN Network State Visualizer for an alternative high level presentation of connection data between chains.

</HighlightBox>

<!--## Next up

The next chapters are all about CosmJS, a TypeScript library that helps developers integrate frontend user interfaces and backend servers with Cosmos blockchains. You can go ahead and start with the [next chapter](/tutorials/7-cosmjs/index.md).-->
