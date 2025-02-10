import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const calculateTotal = (items: { price: number; quantity: number }[]) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const applyCoupon = (total: number, couponValue: number = 2) => {
  return Math.max(0, total - couponValue);
}; 