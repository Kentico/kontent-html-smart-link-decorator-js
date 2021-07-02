import { Logger } from '../lib/Logger';

export function reload(): void {
  try {
    window.location.reload();
  } catch (e) {
    Logger.error(e);
  }
}
