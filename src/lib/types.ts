import { ObjectId } from 'mongodb';

export type Transaction = {
  id: string;
  _id?: ObjectId;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  tag: string; // Changed from tags: string[]
  date: Date;
};

export type Tag = {
  id: string;
  _id?: ObjectId;
  name: string;
  icon: string;
  order: number;
  color: string;
}

export type Income = {
  id: string;
  _id?: ObjectId;
  amount: number;
  description: string;
};

export type RecurringExpense = {
  id: string;
  _id?: ObjectId;
  amount: number;
  description: string;
}
