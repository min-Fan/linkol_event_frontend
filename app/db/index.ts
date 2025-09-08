import Database from './Database';
import Chat, { IChat, ChatType } from './chat';
import Message, {
  IMessage,
  IChatMessage,
  MessageType,
  MessageStatus,
  ActionState,
} from './message';

const DB_VERSION = 1;
const DB_NAME = 'linkol-db';

const LinkolDB = new Database(DB_NAME, DB_VERSION);

const chat = new Chat(LinkolDB);
const message = new Message(LinkolDB);

export type { IChat, IMessage, IChatMessage, ActionState };

export { chat, message, LinkolDB, ChatType, MessageType, MessageStatus };
