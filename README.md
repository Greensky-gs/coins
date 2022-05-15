# coins
This is a coins manager for SQL databases on discord.

## Version
The version of discord can be any, but I recomand the latest.

### Note
This code is only for a SQL database. Use this command to create the table
```
CREATE TABLE coins (
    user_id VARCHAR(255),
    coins VARCHAR(255),
    bank VARCHAR(255)
);
```

## Init
In your file, you need to do this :
```js
// Require coins manager
const Manager = require('./coinsManager.js');

// Put the manager on our client
client.CoinsManager = new Manager(client, {
  base_coins: 100,
   base_bank: 50
});

// This part is important, it tells manager to set data in cache.
client.CoinsManager.init();
```

## Note on initialisation
Paramaters between `{}` are optionnal ; a default value is provided.


### Use manager
# Add coins
```js
client.CoinsManager.addCoins('user id', 100);
// returns new amount of coins of user
```

Number can be any, but not decimal.

# Remove coins
```js
client.CoinsManager.removeCoins('user id', 50);
```

Returns `not exist` if user isn't in database.
Returns `false` if number is invalid ( too small, too big or not a number )

# Deposit
```js
client.CoinsManager.deposit('user id', 100);
```

Put coins in bank account.
Returns `not exist` if user isn't in database.
Returns `false` if number is invalid ( too small, too big or not a number )
Returns new bank amount

# Withdraw
```js
client.CoinsManager.withdraw('user id', 50);
```

get coins from bank
Returns `not exist` if user isn't in database.
Returns `false` if number is invalid ( too small, too big or not a number )
Returns new bank amount

# Stats
```js
client.CoinsManager.stats('user id');
```

Returns `not exist` if user isn't in database.
Returns `{ coins: Number(), bank: Number()}`, wich are data of user.

# Leaderboard
```js
client.CoinsManager.leaderboard();
```

Returns an array with data of all users sorted by total.

# Pay
```js
client.CoinsManager.pay({
    donator: 'Donator ID',
    receiver: "Receiver ID",
    amount: "amount (as a number)"
});
```

Returns `no donator` if donator isn't in database.
Returns `no receiver` if receiver isn't in database.
Returns `invalid amount` if number is invalid ( too small, too big or not a number )


## Error
If you encounter any error, please contact me on [this discord server](https://discord.gg/fHyN5w84g6)

## Ended
You can now use the Greensky's CoinsManager !
