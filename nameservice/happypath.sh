#!/bin/bash

nscli query account $(nscli keys show jack -a) | jq ".value.coins[0]"
nscli query account $(nscli keys show alice -a) | jq ".value.coins[0]"

# Buy your first name using your coins from the genesis file
nscli tx nameservice buy-name jack.id 5nametoken --from jack -y | jq ".txhash" |  xargs $(sleep 6) nscli q tx

# Set the value for the name you just bought
nscli tx nameservice set-name jack.id 8.8.8.8 --from jack -y | jq ".txhash" |  xargs $(sleep 6) nscli q tx

# Try out a resolve query against the name you registered
nscli query nameservice resolve jack.id | jq ".value"
# > 8.8.8.8

# Try out a whois query against the name you just registered
nscli query nameservice whois jack.id
# > {"value":"8.8.8.8","owner":"cosmos1l7k5tdt2qam0zecxrx78yuw447ga54dsmtpk2s","price":[{"denom":"nametoken","amount":"5"}]}

# Alice buys name from jack
nscli tx nameservice buy-name jack.id 10nametoken --from alice -y | jq ".txhash" |  xargs $(sleep 6) nscli q tx

# Alice decides to delete the name she just bought from jack
nscli tx nameservice delete-name jack.id --from alice -y | jq ".txhash" |  xargs $(sleep 6) nscli q tx

# Try out a whois query against the name you just deleted
nscli query nameservice whois jack.id
# > {"value":"","owner":"","price":[{"denom":"nametoken","amount":"1"}]}