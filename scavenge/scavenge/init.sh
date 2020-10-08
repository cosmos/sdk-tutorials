#!/bin/bash
rm -r ~/.scavengeCLI
rm -r ~/.scavengeD

scavengeD init mynode --chain-id scavenge

scavengeCLI config keyring-backend test
scavengeCLI config chain-id scavenge
scavengeCLI config output json
scavengeCLI config indent true
scavengeCLI config trust-node true

scavengeCLI keys add user1
scavengeCLI keys add user2
scavengeD add-genesis-account $(scavengeCLI keys show user1 -a) 1000token,100000000stake
scavengeD add-genesis-account $(scavengeCLI keys show user2 -a) 500token

scavengeD gentx --name user1 --keyring-backend test

scavengeD collect-gentxs 
