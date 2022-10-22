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
    public getUserData(user_id: string): coinsData | undefined {
        return this.cache.get(user_id);
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
    private save(user_id: string, exists: boolean) {
        const data = this.cache.get(user_id);
        const sql = exists ? `UPDATE coins SET coins='${data?.coins}', bank='${data?.bank}' WHERE user_id='${user_id}'` : `INSERT INTO coins (user_id, coins, bank) VALUES ('${user_id}', '${data?.coins}', '${data?.bank}')`;

        query(sql);
    }
    private async fillCache() {
        const coins = await query<coinsData>(`SELECT * FROM coins`);
        this.cache.clear();

        for (const coin of coins) {
            this.cache.set(coin.user_id, coin);
        };
    }
}