# 运行 REST 路由

现在不已经测试了CLI的查询操作和交易操作，是时候在REST服务器中进行相同测试了。保留先前运行的`nsd`，然后先收集地址：

```bash
$ nscli keys show jack --address
$ nscli keys show alice --address
```

在另一个终端窗口运行`rest-server`：

```bash
$ nscli rest-server --chain-id namechain --trust-node
```

然后，你可以构造并运行以下查询：

> 注意：请务必将你的密码和 buyer/owner 地址替换为下面列出的地址！

```bash
# Get the sequence and account numbers for jack to construct the below requests
$ curl -s http://localhost:1317/auth/accounts/$(nscli keys show jack -a)
# > {"type":"auth/Account","value":{"address":"cosmos127qa40nmq56hu27ae263zvfk3ey0tkapwk0gq6","coins":[{"denom":"jackCoin","amount":"1000"},{"denom":"nametoken","amount":"1010"}],"public_key":{"type":"tendermint/PubKeySecp256k1","value":"A9YxyEbSWzLr+IdK/PuMUYmYToKYQ3P/pM8SI1Bxx3wu"},"account_number":"0","sequence":"1"}}

# Get the sequence and account numbers for alice to construct the below requests
$ curl -s http://localhost:1317/auth/accounts/$(nscli keys show alice -a)
# > {"type":"auth/Account","value":{"address":"cosmos1h7ztnf2zkf4558hdxv5kpemdrg3tf94hnpvgsl","coins":[{"denom":"aliceCoin","amount":"1000"},{"denom":"nametoken","amount":"980"}],"public_key":{"type":"tendermint/PubKeySecp256k1","value":"Avc7qwecLHz5qb1EKDuSTLJfVOjBQezk0KSPDNybLONJ"},"account_number":"1","sequence":"1"}}

# Buy another name for jack
# NOTE: Be sure to specialize this request for your specific environment, also the "buyer" and "from" should be the same address
$ curl -XPOST -s http://localhost:1317/nameservice/names --data-binary '{"base_req":{"from":"jack","password":"foobarbaz","chain_id":"namechain","sequence":"2","account_number":"0"},"name":"jack1.id","amount":"5nametoken","buyer":"cosmos127qa40nmq56hu27ae263zvfk3ey0tkapwk0gq6"}'
# > {"check_tx":{"gasWanted":"200000","gasUsed":"1242"},"deliver_tx":{"log":"Msg 0: ","gasWanted":"200000","gasUsed":"2986","tags":[{"key":"YWN0aW9u","value":"YnV5X25hbWU="}]},"hash":"098996CD7ED4323561AC9011DEA24C70C8FAED2A4A10BC8DE2CE35C1977C3B7A","height":"23"}

# Set the data for that name that jack just bought
# NOTE: Be sure to specialize this request for your specific environment, also the "owner" and "from" should be the same address
$ curl -XPUT -s http://localhost:1317/nameservice/names --data-binary '{"base_req":{"from":"jack","password":"foobarbaz","chain_id":"namechain","sequence":"3","account_number":"0"},"name":"jack1.id","value":"8.8.4.4","owner":"cosmos127qa40nmq56hu27ae263zvfk3ey0tkapwk0gq6"}'
# > {"check_tx":{"gasWanted":"200000","gasUsed":"1242"},"deliver_tx":{"log":"Msg 0: ","gasWanted":"200000","gasUsed":"1352","tags":[{"key":"YWN0aW9u","value":"c2V0X25hbWU="}]},"hash":"B4DF0105D57380D60524664A2E818428321A0DCA1B6B2F091FB3BEC54D68FAD7","height":"26"}

# Query the value for the name jack just set
$ curl -s http://localhost:1317/nameservice/names/jack1.id
# 8.8.4.4

# Query whois for the name jack just bought
$ curl -s http://localhost:1317/nameservice/names/jack1.id/whois
# > {"value":"8.8.8.8","owner":"cosmos127qa40nmq56hu27ae263zvfk3ey0tkapwk0gq6","price":[{"denom":"STAKE","amount":"10"}]}

# Alice buys name from jack
$ curl -XPOST -s http://localhost:1317/nameservice/names --data-binary '{"base_req":{"from":"alice","password":"foobarbaz","chain_id":"namechain","sequence":"1","account_number":"1"},"name":"jack1.id","amount":"10nametoken","buyer":"cosmos1h7ztnf2zkf4558hdxv5kpemdrg3tf94hnpvgsl"}'
# > {"check_tx":{"gasWanted":"200000","gasUsed":"1264"},"deliver_tx":{"log":"Msg 0: ","gasWanted":"200000","gasUsed":"4509","tags":[{"key":"YWN0aW9u","value":"YnV5X25hbWU="}]},"hash":"81A371392B52F703266257D524538085F8C749EE3CBC1C579873632EFBAFA40C","height":"70"}
```

### 请求概要：

`POST /nameservice/names` BuyName请求体：

```json
{
  "base_req": {
    "name": "string",
    "password": "string",
    "chain_id": "string",
    "sequence": "number",
    "account_number": "number",
    "gas": "string,not_req",
    "gas_adjustment": "string,not_req",
  },
  "name": "string",
  "amount": "string",
  "buyer": "string"
}
```

`PUT /nameservice/names` SetName请求体：

```json
{
  "base_req": {
    "name": "string",
    "password": "string",
    "chain_id": "string",
    "sequence": "number",
    "account_number": "number",
    "gas": "string,not_req",
    "gas_adjustment": "strin,not_reqg"
  },
  "name": "string",
  "value": "string",
  "owner": "string"
}
```

### [回到教程起开头](./README.md)