import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTransactionDate(date: Date): string {
  if (isToday(date)) {
    return `Hoy, ${format(date, 'd MMM', { locale: es })}`;
  }
  if (isYesterday(date)) {
    return `Ayer, ${format(date, 'd MMM', { locale: es })}`;
  }
  const formattedDate = format(date, 'EEEE, d MMM', { locale: es });
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}
