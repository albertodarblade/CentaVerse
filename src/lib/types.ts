export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  tags: string[];
  date: Date;
};

export type Tag = {
  id: string;
  name: string;
  icon: React.ReactNode;
}
