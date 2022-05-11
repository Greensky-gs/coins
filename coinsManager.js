let sqlStructure = `CREATE TABLE coins (
    user_id VARCHAR(255),
    coins VARCHAR(255),
    bank VARCHAR(255)
);`;

const { Collection } = require('discord.js')
const mysql = require('mysql');

class CoinsManager {
    /**
     * @param {mysql.Connection} db
     * @param {{ base_coins: Number, base_bank: Number }} data
     */
    constructor(db, data) {
        this.db = db;
        this.coins = new Collection();
        this.base_coins = (data.base_coins || 0).toFixed(0);
        this.base_bank = (data.base_bank || 100).toFixed(0);
    }
    save(user_id) {
        this.db.query(`SELECT user_id FROM coins WHERE user_id="${user_id}"`, (err, req) => {
            if (err) return console.log(err);

            if (req.length == 0) {
                this.db.query(`INSERT INTO coins (user_id, coins, bank) VALUES ("${user_id}" ,"${this.coins.get(user_id).coins}", "${this.coins.get(user_id).bank}")`, (e) => e?console.log(e):null);
            } else {
                this.db.query(`UPDATE coins SET coins="${this.coins.get(user_id).coins}", bank="${this.coins.get(user_id).bank}" WHERE user_id="${user_id}"`, (e) => e?console.log(e):null);
            };
        });
    }
    create(user_id) {
        if (this.exist(user_id)) return 'already exist';
        
        this.coins.set(user_id, { coins: this.base_coins, bank: this.base_bank });
        this.save(user_id);

        return this.coins.get(user_id);
    }
    exist(user_id) {
        if (this.coins.has(user_id)) return true;
        return false;
    }
    createIfNotExists(user_id) {
        if (!this.exist(user_id)) {
            this.create(user_id);
            return true;
        };
        return false;
    }
    getCoins(user_id) {
        if (!this.exist(user_id)) return this.base_coins;

        return this.coins.get(user_id).coins;
    }
    getBank(user_id) {
        if (!this.exist(user_id)) return this.base_bank;

        return this.coins.get(user_id).bank;
    }
    addCoins(user_id, coins) {
        this.createIfNotExists(user_id)

        this.coins.set(user_id, { 
            coins: this.getCoins(user_id) + parseInt(coins).toFixed(0),
            bank: this.getBank(user_id)
        });

        this.save(user_id);
        return this.getCoins(user_id);
    }
    removeCoins(user_id, coins) {
        if (!this.exist(user_id)) return 'not exist';

        const coins = parseInt(coins).toFixed(0);
        if (this.getCoins(user_id) < coins) return false;

        const data = {
            bank: this.getBank(user_id),
            coins: this.getCoins(user_id) - parseInt(coins).toFixed(0)
        };

        this.coins.set(user_id, data);
        this.save(user_id);

        return this.getCoins(user_id);
    }
    /**
     * @param {Number} amount 
     * @param {"coins" | "bank"} type 
     */
    isValidAmount(amount, user_id, type) {
        if (!this.exist(user_id)) return 'not exist';
        if (isNaN(amount)) return false;

        let data = this[`get${type[0].toUpperCase()}${type.slice(1)}`](user_id);

        if (data > amount || data < amount) return false;
        return true;
    }
    deposit(user_id, amount) {
        if (!this.exist(user_id)) return 'not exist';

        const number = parseInt(amount).toFixed(0);
        if (!this.isValidAmount(number, user_id, 'coins')) return false;

        const data = {
            coins: this.removeCoins(user_id, coins),
            bank: this.coins.get(user_id).bank + number
        };

        this.coins.set(user_id, data)
        this.save(user_id);

        return this.coins.get(user_id).bank;
    }
    withdraw(user_id, amount) {
        if (!this.exist(user_id)) return 'not exist';

        const number = parseInt(amount).toFixed(0);
        if(!this.isValidAmount(number, user_id, 'bank')) return false;

        this.addCoins(user_id, amount);
        let coins = this.getCoins(user_id);

        let bank = this.getBank(user_id) - amount;
        
        this.coins.set(user_id, { coins, bank });
        this.save(user_id);

        return this.getBank(user_id);
    }
    stats(user_id) {
        if (!this.exist(user_id)) return false;

        return this.coins.get(user_id);
    }
    leaderboard() {
        return this.coins.sort((a, b) => (a.bank + a.coins) - (b.bank + b.coins)).toJSON();
    }
    /**
     * @param {{donator: String, receiver: String, amount: Number}} data
     */
    pay(data) {
        if (!this.exist(data.donator)) return 'no donator';
        if (!this.exist(data.receiver)) return 'no receiver';
        if (!this.isValidAmount(data.amount, data.donator, 'coins')) return 'invalid amount';

        this.removeCoins(data.donator, parseInt(amount).toFixed(0));
        this.addCoins(data.receiver, parseInt(data.amount).toFixed(0));

        this.save(data.donator);
        this.save(data.receiver);

        return { donator: this.getCoins(data.donator), receiver: this.getCoins(data.receiver) };
    }
    init() {
        this.db.query(`SELECT * FROM coins`, (err, req) => {
            if (err) return console.log(err);

            for (let data in req) {
                this.coins.set(data.user_id, { coins: parseInt(data.coins), bank: parseInt(data.bank) });
            };
        });
    }
};

module.exports = CoinsManager;
