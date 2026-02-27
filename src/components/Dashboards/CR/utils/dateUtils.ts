import { format, formatDistance, parseISO, isPast, differenceInDays } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr);
};

export const formatDateTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(parsedDate, new Date(), { addSuffix: true });
};

export const isOverdue = (dueDate: string | Date): boolean => {
  const parsedDate = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isPast(parsedDate);
};

export const getDaysUntil = (date: string | Date): number => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(parsedDate, new Date());
};

export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
};