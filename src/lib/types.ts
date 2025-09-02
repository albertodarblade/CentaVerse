export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  tags: string[];
  date: Date;
};
