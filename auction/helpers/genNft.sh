#!/usr/bin/env bash

aucli tx nft mint crypto-kitties d04b98f48e8f8bcc15c6ae5ac050801cd6dcfd428fb5f9e65c4e16e7807340fa \
$(aucli keys show test1 -a) --from test1 --chain-id testchain

# aucli tx nftauction create-auction crypto-kitties d04b98f48e8f8bcc15c6ae5ac050801cd6dcfd428fb5f9e65c4e16e7807340fa 1m --from test1 --chain-id testchain