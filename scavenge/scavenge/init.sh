#!/bin/bash
rm -r ~/.scavengecli
rm -r ~/.scavenged

scavenged init mynode --chain-id scavenge

scavengecli config keyring-backend test
scavengecli config chain-id scavenge
scavengecli config output json
scavengecli config indent true
scavengecli config trust-node true

scavengecli keys add user1
scavengecli keys add user2
scavenged add-genesis-account $(scavengecli keys show user1 -a) 1000token,100000000stake
scavenged add-genesis-account $(scavengecli keys show user2 -a) 500token

scavenged gentx --name user1 --keyring-backend test

scavenged collect-gentxs 
