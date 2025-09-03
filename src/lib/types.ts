export type Transaction = {
  id: string;
  _id?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  tags: string[];
  date: Date;
};

export type Tag = {
  id: string;
  _id?: string;
  name: string;
  icon: string;
}
