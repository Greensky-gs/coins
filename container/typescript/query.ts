import { createConnection } from 'mysql';
import { db as database } from './CoinsManager';

export const query = <Req = any>(search: string) => {
  return new Promise<Req[]>((resolve, reject) => {
    database.query(search, (error?:string, request?: Req[]) => {
      if (error) reject(error)
      else resolve(request as Req[]);
    });
  });
};