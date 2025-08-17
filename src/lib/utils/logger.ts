/* eslint-disable no-console */
export type LogDetails = unknown;

const isDev = process.env.NODE_ENV === 'development';

export function debug(message: string, details?: LogDetails): void {
  if (isDev) console.debug(message, details ?? '');
}

export function info(message: string, details?: LogDetails): void {
  if (isDev) console.info(message, details ?? '');
}

export function warn(message: string, details?: LogDetails): void {
  if (isDev) console.warn(message, details ?? '');
}

export function error(message: string, errorObj?: unknown): void {
  if (isDev) console.error(message, errorObj ?? '');
}

export const logger = { debug, info, warn, error };


