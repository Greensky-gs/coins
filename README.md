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
```

## Note on initialisation
Paramaters between `{}` are optionnal ; a default value is provided.


### Use manager
