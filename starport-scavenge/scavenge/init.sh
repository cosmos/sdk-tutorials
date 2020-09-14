#!/bin/bash
rm -r ~/.scavengeCLI
rm -r ~/.scavengeD

scavengeD init mynode --chain-id scavenge

scavengeCLI config keyring-backend test

scavengeCLI keys add me
scavengeCLI keys add you

scavengeD add-genesis-account $(scavengeCLI keys show me -a) 1000foo,100000000stake
scavengeD add-genesis-account $(scavengeCLI keys show you -a) 1foo

scavengeCLI config chain-id scavenge
scavengeCLI config output json
scavengeCLI config indent true
scavengeCLI config trust-node true

scavengeD gentx --name me --keyring-backend test
scavengeD collect-gentxs