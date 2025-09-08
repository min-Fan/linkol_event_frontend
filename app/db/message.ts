import { ReactNode } from 'react';
import Dexie, { Collection } from 'dexie';

import Database from './Database';
import { ChatType } from './chat';

export enum MessageType {
  USER,
  AGENT,
}

export enum MessageStatus {
  NONE,
  CACHE,
  GENERATING,
  COMPLETED,
  FAILED,
}

// Action状态类型
export interface ActionState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentStep: number;
  params: Record<string, any>;
  thinkingMessages: Array<{
    stepId: number;
    messages: string[];
  }>;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface IMessage {
  cid: string;
  mid: string;
  type: MessageType;
  chatType: ChatType;
  content: string;
  timestamp: number;
  result_type?: string;
  action_state?: ActionState; // 改为对象类型，直接存储ActionState对象
}

export interface IChatMessage {
  mid: string;
  type: MessageType;
  content: string | ReactNode;
  status: MessageStatus;
}

export const MESSAGE_TABLE_NAME = 'message';

export const MESSAGE_SCHEMA_DEFINITION = '[cid+mid],cid,mid,timestamp';

export default class Message {
  #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async create(data: IMessage): Promise<void> {
    try {
      await this.#openDB();

      const { cid, mid } = data;

      const existing = await this.#db.message.get({ cid, mid });

      if (existing) {
        return;
      }

      await this.#db.transaction('rw', this.#db.message, () => {
        return this.#db.message.add(data);
      });
    } catch (err) {
      console.log('create message err', err);
    }
  }

  async getAll(): Promise<IMessage[]> {
    try {
      await this.#openDB();

      const result = await this.#db.message.toArray();

      return result || [];
    } catch (err) {
      console.error('find message err', err);

      return [];
    }
  }

  async find(cid: string, mid: string): Promise<IMessage | null> {
    try {
      await this.#openDB();

      const result = await this.#db.message.get({
        cid,
        mid,
      });

      return result || null;
    } catch (err) {
      console.error('find message err', err);

      return null;
    }
  }

  async findMany(cid?: string): Promise<IMessage[]> {
    try {
      await this.#openDB();

      let result: IMessage[] = [];
      const sortName = 'timestamp';

      const tabel: Dexie.Table<IMessage, number, IMessage> = this.#db.message;
      let collection: Collection<IMessage, number, IMessage> | null = null;

      if (!!cid) {
        collection = tabel.orderBy(sortName).filter((item) => item.cid === cid);
      } else {
        collection = tabel.orderBy(sortName);
      }

      result = await collection.toArray();

      return result;
    } catch (err) {
      console.log('find many purchase err', err);

      return [];
    }
  }

  async update(cid: string, mid: string, params: Partial<IMessage>): Promise<boolean> {
    try {
      await this.#openDB();

      console.log('数据库更新操作开始:', { cid, mid, paramsKeys: Object.keys(params) });

      // 先查找要更新的消息
      const existingMessage = await this.#db.message.get({ cid, mid });
      console.log('要更新的现有消息:', existingMessage ? '存在' : '不存在');

      const result = await this.#db.transaction('rw', this.#db.message, () => {
        return this.#db.message.where({ cid, mid }).modify(params);
      });

      console.log('数据库更新操作结果:', result);

      // 验证更新后的消息
      const updatedMessage = await this.#db.message.get({ cid, mid });
      console.log('更新后的消息content长度:', updatedMessage?.content?.length || 0);

      return !!result;
    } catch (err) {
      console.error('where message err', err);

      return false;
    }
  }

  async count(): Promise<number> {
    try {
      await this.#openDB();

      const result = await this.#db.message.count();

      return result;
    } catch (err) {
      console.error('count message err', err);

      return 0;
    }
  }

  async delete(cid: string, mid: string): Promise<boolean> {
    try {
      await this.#openDB();

      const result = await this.#db.transaction('rw', this.#db.message, () => {
        return this.#db.message.where({ cid, mid }).delete();
      });

      return !!result;
    } catch (err) {
      console.error('delete message err', err);

      return false;
    }
  }

  async deleteMany(cid: string): Promise<boolean> {
    try {
      await this.#openDB();

      const result = await this.#db.transaction('rw', this.#db.message, () => {
        return this.#db.message.where({ cid }).delete();
      });

      return !!result;
    } catch (err) {
      console.error('delete many message err', err);

      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.#openDB();

      await this.#db.message.clear();
    } catch (err) {
      console.error('clear message err', err);
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
