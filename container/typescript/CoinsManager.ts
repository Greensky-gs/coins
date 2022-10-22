import { createConnection } from "mysql";
import { config } from "dotenv";
import { coinsData } from './typing';
import { query } from './query';

config();

export const db = createConnection({
    host: process.env.DATABASE_H,
    password: process.env.DATABASE_P,
    user: process.env.DATABASES_U,
    database: process.env.DATABASE_D
});
db.connect((error) => {
    if (error) throw error;
});

export class CoinsManager {
    private configs: { def_c: number; def_b: number } = { def_c: 100, def_b: 50 };
    private cache: Map<string, coinsData> = new Map();

    constructor(options?: {
        default_coins?: number;
        default_bank?: number;
    }) {
        this.configs.def_b = options?.default_bank ?? this.configs.def_b;
        this.configs.def_c = options?.default_coins ?? this.configs.def_c;
    }
    public start() {
        this.fillCache();
    }
    public addCoins(user_id: string, coins: number) {
        let ex = this.exists(user_id);
        const data = this.getUserData(user_id) || (Object.assign(this.config, { user_id }));

        data.coins+= Math.abs(coins);
        this.cache.set(user_id, data);
        this.save(user_id, ex);

        return data;
    }
    public removeCoins(user_id: string, coins: number) {
        const data = this.getUserData(user_id);
        if (!data) return 'not exists';

        if (Math.abs(coins) > data.coins) return false;
        data.coins -= Math.abs(coins);

        this.cache.set(user_id, data);
        this.save(user_id, true);
        return true;
    }
    public deposit(user_id: string, coins: number) {
        const data = this.getUserData(user_id);
        if (!data) return 'not exists';

        if (Math.abs(coins) > data.coins) return false;
        data.coins -= Math.abs(coins);
        data.bank+= Math.abs(coins);
        this.cache.set(user_id, data);
        this.save(user_id, true);

        return true;
    }
    public withdraw(user_id: string, coins: number) {
        const data = this.getUserData(user_id);
        if (!data) return 'not exists';

        if (Math.abs(coins) > data.bank) return false;
        data.coins+=Math.abs(coins);
        data.bank -= Math.abs(coins);
        this.cache.set(user_id, data);

        this.save(user_id, true);
        return true;
    }
    private getUserData(user_id: string): coinsData | undefined {
        return this.cache.get(user_id);
    }
    public stats = this.getUserData
    public get leaderboard() {
        const array: coinsData[] = [];
        this.cache.forEach((v) => {
            array.push(v);
            array.sort((a, b) => (a.coins + a.bank) - (b.coins + b.coins));
        });

        return array;
    }
    public pay(options: { donator: string, receiver: string, amount: number }): Promise<'not exists' | boolean> {
        return new Promise<'not exists' | boolean>(async(resolve) => {
            const ex = this.exists(options.receiver);

            const donator = this.stats(options.donator);
            const receiver = this.stats(options.receiver) ?? Object.assign(this.config, { user_id: options.receiver });
    
            if (!donator) return resolve('not exists');
            if (Math.abs(options.amount) > donator.coins) return resolve(false);
            
            receiver.coins += Math.abs(options.amount);            
            this.cache.set(options.receiver, receiver);
            await this.save(options.receiver, ex);

            donator.coins -= Math.abs(options.amount);
            this.cache.set(options.donator, donator);
            await this.save(options.donator, true);

            return resolve(true);
        });
    }
    private get config() {
        return {
            coins: this.configs.def_c,
            bank: this.configs.def_b
        };
    }
    private exists(user_id: string): boolean {
        return this.cache.has(user_id);
    }
    private async save(user_id: string, exists: boolean) {
        const data = this.cache.get(user_id);
        const sql = exists ? `UPDATE coins SET coins='${data?.coins}', bank='${data?.bank}' WHERE user_id='${user_id}'` : `INSERT INTO coins (user_id, coins, bank) VALUES ('${user_id}', '${data?.coins}', '${data?.bank}')`;

        await query(sql);
    }
    private async fillCache() {
        const coins = await query<coinsData>(`SELECT * FROM coins`);
        this.cache.clear();

        for (const coin of coins) {
            this.cache.set(coin.user_id, coin);
        };
    }
}