// Comprehensive UPI SMS Parser for Indian Banks
// Supports all major banks and UPI apps

import { CategoryType } from '../types';

export interface ParsedTransaction {
  amount: number;
  merchant: string;
  isDebit: boolean;
  upiRef?: string;
  account?: string;
  bank?: string;
  time: string;
  rawMessage: string;
}

// Bank sender IDs
const BANK_SENDERS = [
  'HDFCBK', 'SBIINB', 'ICICIB', 'AXISBK', 'KOTAKB', 'PNBSMS', 'BOBSMS',
  'UNIONB', 'CANBNK', 'YESBNK', 'SCBANK', 'INDUSB', 'FEDBNK', 'IABORB',
  'IDBI', 'BOIIND', 'CENTBK', 'MAHABK', 'PNBINB', 'SBIPSG', 'HABORB',
  'RBLBNK', 'IABORB', 'DCBBNK', 'KARBNK', 'KVBANK', 'TMBANK', 'JKBANK',
  'CITIBK', 'HSBC', 'STANCH', 'DBSBNK', 'BABORB',
  // UPI Apps
  'GPAY', 'PHONPE', 'PAYTM', 'AMAZONPAY', 'BHIM', 'MOBIKWIK', 'FREECHARGE',
];

// Debit patterns (money sent/paid)
const DEBIT_PATTERNS = [
  // Standard bank SMS formats
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has been |is |)(?:debited|deducted|paid|sent|transferred).*?(?:to|for|@)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  
  // "Debited Rs XXX" format
  /(?:debited|deducted)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?(?:to|for)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  
  // "Sent Rs XXX to" format
  /(?:sent|paid|transferred)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:to|for)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  
  // "Rs XXX sent to" format  
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:sent|paid|debited|transferred)\s*(?:to|for)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  
  // PhonePe/GPay style: "Paid Rs.XXX to Merchant"
  /paid\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)\s*to\s*([\w\s@.\-]+?)(?:\s+on|\s+via|\.|$)/i,
  
  // UPI transaction format
  /UPI.*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?(?:to|paid)\s*([\w\s@.\-]+?)(?:\s+Ref|\s+UPI|\.|$)/i,
  
  // IMPS/NEFT format
  /(?:IMPS|NEFT).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?(?:to|transferred)\s*([\w\s@.\-]+?)(?:\s+Ref|\.|$)/i,
  
  // A/c debited format
  /A\/c\s*(?:XX|\*+)?\d+.*?(?:debited|deducted).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?(?:to|for|Info:)\s*([\w\s@.\-]+?)(?:\s+Ref|\.|$)/i,
];

// Credit patterns (money received)
const CREDIT_PATTERNS = [
  // Standard credit format
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has been |is |)(?:credited|received|deposited).*?(?:from|by)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  
  // "Credited Rs XXX" format
  /(?:credited|received|deposited)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?(?:from|by)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  
  // "Received Rs XXX from" format
  /(?:received|got)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:from|by)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  
  // A/c credited format
  /A\/c\s*(?:XX|\*+)?\d+.*?(?:credited).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?(?:from|by|Info:)\s*([\w\s@.\-]+?)(?:\s+Ref|\.|$)/i,
];

export function parseUPIMessage(message: string): ParsedTransaction | null {
  if (!message) return null;
  
  const msg = message.trim();
  
  // Try debit patterns first
  for (const pattern of DEBIT_PATTERNS) {
    const match = msg.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0) {
        return {
          amount,
          merchant: cleanMerchantName(match[2]),
          isDebit: true,
          upiRef: extractUPIRef(msg),
          account: extractAccount(msg),
          bank: extractBank(msg),
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          rawMessage: msg,
        };
      }
    }
  }
  
  // Try credit patterns
  for (const pattern of CREDIT_PATTERNS) {
    const match = msg.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0) {
        return {
          amount,
          merchant: cleanMerchantName(match[2]),
          isDebit: false,
          upiRef: extractUPIRef(msg),
          account: extractAccount(msg),
          bank: extractBank(msg),
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          rawMessage: msg,
        };
      }
    }
  }
  
  return null;
}

function cleanMerchantName(name: string): string {
  if (!name) return 'Unknown';
  
  let cleaned = name.trim();
  
  // Remove UPI handle suffix
  cleaned = cleaned.replace(/@[\w.]+$/i, '');
  
  // Remove common suffixes
  cleaned = cleaned.replace(/\s*(pvt|ltd|llp|private|limited|india|pay|upi)\s*/gi, ' ');
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter of each word
  cleaned = cleaned.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  return cleaned || 'Unknown';
}

function extractUPIRef(msg: string): string | undefined {
  const refMatch = msg.match(/(?:Ref\.?\s*(?:No\.?)?|UPI\s*Ref|UTR)[:\s]*([A-Z0-9]{12,})/i);
  return refMatch ? refMatch[1] : undefined;
}

function extractAccount(msg: string): string | undefined {
  const accMatch = msg.match(/(?:A\/c|Acct?|Account)[:\s]*(?:XX|\*+)?(\d{4,})/i);
  return accMatch ? `XX${accMatch[1].slice(-4)}` : undefined;
}

function extractBank(msg: string): string | undefined {
  const banks: Record<string, string> = {
    'HDFC': 'HDFC Bank', 'SBI': 'SBI', 'ICICI': 'ICICI Bank',
    'AXIS': 'Axis Bank', 'KOTAK': 'Kotak', 'PNB': 'PNB',
    'BOB': 'Bank of Baroda', 'UNION': 'Union Bank', 'CANARA': 'Canara Bank',
    'YES': 'Yes Bank', 'IDBI': 'IDBI Bank', 'INDUS': 'IndusInd Bank',
  };
  
  for (const [key, value] of Object.entries(banks)) {
    if (msg.toUpperCase().includes(key)) return value;
  }
  return undefined;
}

// Smart category suggestion
const CATEGORY_KEYWORDS: Record<CategoryType, string[]> = {
  food: ['zomato', 'swiggy', 'domino', 'mcdonald', 'kfc', 'pizza', 'starbucks', 'cafe', 'restaurant', 'food', 'burger', 'biryani', 'kitchen', 'dhaba', 'barbeque', 'chaayos', 'haldiram'],
  travel: ['uber', 'ola', 'rapido', 'irctc', 'makemytrip', 'goibibo', 'indigo', 'spicejet', 'metro', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'redbus', 'cleartrip'],
  shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal', 'tatacliq', 'reliance', 'croma', 'vijay'],
  bills: ['bescom', 'electricity', 'water', 'gas', 'airtel', 'jio', 'vodafone', 'vi', 'broadband', 'wifi', 'emi', 'loan', 'insurance', 'rent', 'bsnl', 'postpaid', 'prepaid'],
  entertainment: ['netflix', 'prime', 'hotstar', 'spotify', 'bookmyshow', 'pvr', 'inox', 'gaming', 'steam', 'playstation', 'disney', 'zee5', 'sonyliv'],
  groceries: ['bigbasket', 'blinkit', 'zepto', 'instamart', 'dmart', 'more', 'spencers', 'grocery', 'supermarket', 'vegetables', 'fruits', 'jiomart'],
  transfer: ['upi', 'imps', 'neft', 'rtgs', 'transfer'],
  others: [],
};

export function suggestCategory(merchant: string): CategoryType {
  const merchantLower = merchant.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'others') continue;
    for (const keyword of keywords) {
      if (merchantLower.includes(keyword)) {
        return category as CategoryType;
      }
    }
  }
  
  return 'others';
}

export function isBankSender(sender: string): boolean {
  if (!sender) return false;
  const upperSender = sender.toUpperCase();
  return BANK_SENDERS.some(bank => upperSender.includes(bank));
}

// Test messages for validation
export const TEST_MESSAGES = [
  'Rs.458.00 debited from A/c XX1234 to zomato@paytm on 09-04-25. UPI Ref 412345678901',
  'INR 1,250.50 has been debited from your A/c XX5678 for UPI payment to Amazon Pay. Ref: 512345678902',
  'Sent Rs 320 to rahul@okicici via UPI. Ref No 612345678903',
  'Rs.85000 credited to A/c XX1234 from SALARY ACME CORP. Ref 712345678904',
  'HDFC Bank: Rs. 2,140.00 debited from a/c **1234 on 09-APR-25 to BESCOM. UPI Ref: 812345678905',
  'PhonePe: Paid Rs.740 to Starbucks Coffee. UPI: 912345678906',
  'GPay: You paid ₹320.50 to Uber India',
  'SBI: Your A/c X1234 credited Rs.15000.00 by NEFT from ABC Company. Ref: 012345678907',
];
