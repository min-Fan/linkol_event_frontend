import Dexie from 'dexie';

import { CHAT_SCHEMA_DEFINITION, CHAT_TABLE_NAME, IChat } from './chat';

import { MESSAGE_SCHEMA_DEFINITION, MESSAGE_TABLE_NAME, IMessage } from './message';

export default class Database extends Dexie {
  chat: Dexie.Table<IChat, number>;
  message: Dexie.Table<IMessage, number>;

  constructor(databaseName: string, databaseVersion: number) {
    super(databaseName);

    this.version(databaseVersion).stores({
      chat: CHAT_SCHEMA_DEFINITION,
      message: MESSAGE_SCHEMA_DEFINITION,
    });

    this.chat = this.table(CHAT_TABLE_NAME);
    this.message = this.table(MESSAGE_TABLE_NAME);
  }

  reset() {
    this.chat.clear();
    this.message.clear();
  }
}
