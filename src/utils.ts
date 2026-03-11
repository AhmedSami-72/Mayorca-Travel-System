import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseFlightText = (text: string) => {
  // Example: SM 477 Y 11FEB 4 CAIJED DK1 1040 1345 11FEB
  const parts = text.split(/\s+/);
  if (parts.length < 8) return null;

  const airline = parts[0];
  const flightNumber = parts[1];
  const date = parts[3];
  const route = parts[5]; // CAIJED
  const depTime = parts[7];
  const arrTime = parts[8];

  const from = route.substring(0, 3);
  const to = route.substring(3, 6);

  const formatTime = (t: string) => {
    if (!t || t.length !== 4) return t;
    const h = parseInt(t.substring(0, 2));
    const m = t.substring(2, 4);
    const period = h >= 12 ? 'مساءً' : 'صباحاً';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${period}`;
  };

  const description = `الإقلاع من ${from === 'CAI' ? 'القاهرة' : from} الساعة ${formatTime(depTime)} - الوصول إلى ${to === 'JED' ? 'جدة' : (to === 'MED' ? 'المدينة' : to)} الساعة ${formatTime(arrTime)}`;

  return {
    airline,
    flightNumber,
    route,
    date,
    depTime,
    arrTime,
    description
  };
};
