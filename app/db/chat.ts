import Database from './Database';

export interface IChat {
  cid: string;
  title: string;
  type: ChatType;
  createdAt: number;
  updatedAt: number;
}

export enum ChatType {
  CHAT,
}

export const CHAT_TABLE_NAME = 'chat';

export const CHAT_SCHEMA_DEFINITION = 'cid,cid,createdAt,updatedAt';

export default class Account {
  #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async create(data: IChat): Promise<void> {
    try {
      await this.#openDB();

      const { cid } = data;

      const existing = await this.#db.chat.get({ cid });

      if (existing) {
        return;
      }

      await this.#db.transaction('rw', this.#db.chat, () => {
        return this.#db.chat.add(data);
      });
    } catch (err) {
      console.log('create account err', err);
    }
  }

  async getAll(): Promise<IChat[]> {
    try {
      await this.#openDB();

      const sortName = 'createdAt';
      const result = await this.#db.chat.orderBy(sortName).reverse().toArray();

      return result || [];
    } catch (err) {
      console.error('find chat err', err);

      return [];
    }
  }

  async find(cid: string): Promise<IChat | null> {
    try {
      await this.#openDB();

      const result = await this.#db.chat.get({
        cid,
      });

      return result || null;
    } catch (err) {
      console.error('find account err', err);

      return null;
    }
  }

  async update(cid: string, params: Partial<IChat>): Promise<boolean> {
    try {
      await this.#openDB();

      const result = await this.#db.transaction('rw', this.#db.chat, () => {
        return this.#db.chat.where({ cid }).modify(params);
      });

      return !!result;
    } catch (err) {
      console.error('where chat err', err);

      return false;
    }
  }

  async count(): Promise<number> {
    try {
      await this.#openDB();

      const result = await this.#db.chat.count();

      return result;
    } catch (err) {
      console.error('count chat err', err);

      return 0;
    }
  }

  async delete(cid: string): Promise<boolean> {
    try {
      await this.#openDB();

      const result = await this.#db.transaction('rw', this.#db.chat, () => {
        return this.#db.chat.where({ cid }).delete();
      });

      return !!result;
    } catch (err) {
      console.error('delete chat err', err);

      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.#openDB();

      await this.#db.chat.clear();
    } catch (err) {
      console.error('clear chat err', err);
    }
  }

  async #openDB() {
    const isOpen = this.#db.isOpen();

    if (isOpen) {
      return;
    }

    try {
      await this.#db.open();
    } catch (err) {
      console.error('db failed to open', err);

      throw err;
    }
  }
}
