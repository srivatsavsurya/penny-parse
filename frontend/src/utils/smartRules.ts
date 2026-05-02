// Legacy smart rule helpers (kept for back-compat with native module imports)
import { SmartRule, CategoryType, ParsedSMS } from '../types';
export { parseUPISMS } from './upiParser';

export const DEFAULT_SMART_RULES: SmartRule[] = [];

export const suggestCategory = (merchant: string): CategoryType => {
  return 'others';
};
