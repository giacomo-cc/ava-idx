# ava-idx

Avalanche C-Chain indexer proof of concept

# How to run it

1. Clone this repo
2. Execute `docker-compose up` in the repository root, docker will pull the required images and exeute the services.

## Docker Services

Running `docker-compose up` the following services will start:

1. **api** this is the REST backend server exposing on port 3000 the endpoints listed below in order to read data from the db
2. **indexer** this is the indexer engine, listening for avalanche chain changes and running an ETL in order to store ready-to-read transactions on the db
3. **mongo** the monogodb database
4. **mongo-express** exposing on port 5000 the frontend to interact with the database

# API endpoints

Exposed by the API there's the following endpoints:

- `GET /topWallet`: retrieve top 100 wallets by balance
- `GET /txsByValue`: retrieve transactions list order by $AVAX value moved, limited to 100 entries
- `GET /walletTxCount?w=<wallet>`: retrieve <wallet> number of txs sent or received
- `GET /walletTxs?w=<wallet>`: retrieve <wallet> transaction list order by `blockNumber` and `transactionIndex`

In the repo root there's the postman collection json `ava-idx.postman_collection.json` with the endpoint already configured

# Possible improvements

## Wallet balance refetch

Currently in the ETL the wallets balance is refetched from the chain every time for all the wallets found on new transactions, this can guarantee that is always fresh but can be expensive in terms of rpc provider. A better solution could be to fetch the balance from the chain the first time and just altering that with the balance moved with the tx:

- `tx.to` wallet balance increased by the `tx.value`
- `tx.from` wallet balance decreased by the `tx.value` and the gas used by the tx

## ETL

Currently we're using a temp table on db for raw transactions, the ETL periodically load the txs and once transformed saves them in the final collection. This is sub optimal and can be improved with a different architecture, for example a messase queue on SQS with all the raw transactions and a serverless process for the ETL consuming it.

## Documentation and dev tools

Documentation can be improved and a swagger open api can be published in order to make dev life easier.

# Used libraries

- `mongodb`: db client
- `pino`: lightweight logger (winston alternative)
- `express`: http server framework
- `viem`: ethers.js alternative to access the chain rpc provider
- `toad`-scheduler: simple task scheduler
- `lodash`: utilities
