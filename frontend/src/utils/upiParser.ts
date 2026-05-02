// Comprehensive UPI SMS Parser for Indian Banks
import { CategoryType, ParsedSMS } from '../types';

const BANK_SENDERS = [
  'HDFCBK', 'SBIINB', 'ICICIB', 'AXISBK', 'KOTAKB', 'PNBSMS', 'BOBSMS',
  'UNIONB', 'CANBNK', 'YESBNK', 'SCBANK', 'INDUSB', 'FEDBNK', 'IABORB',
  'IDBI', 'BOIIND', 'CENTBK', 'MAHABK', 'PNBINB', 'SBIPSG',
  'RBLBNK', 'DCBBNK', 'KARBNK', 'KVBANK', 'TMBANK', 'JKBANK',
  'CITIBK', 'HSBC', 'STANCH', 'DBSBNK',
  'GPAY', 'PHONPE', 'PAYTM', 'AMAZONPAY', 'BHIM', 'MOBIKWIK', 'FREECHARGE',
];

const DEBIT_PATTERNS = [
  /(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has been |is |)(?:debited|deducted|paid|sent|transferred).*?(?:to|for|@)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  /(?:debited|deducted)\s*(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?).*?(?:to|for)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  /(?:sent|paid|transferred)\s*(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:to|for)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  /(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:sent|paid|debited|transferred)\s*(?:to|for)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  /paid\s*(?:Rs\.?|INR|\u20B9)?\s*([\d,]+(?:\.\d{1,2})?)\s*to\s*([\w\s@.\-]+?)(?:\s+on|\s+via|\.|$)/i,
  /UPI.*?(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?).*?(?:to|paid)\s*([\w\s@.\-]+?)(?:\s+Ref|\s+UPI|\.|$)/i,
  /(?:IMPS|NEFT).*?(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?).*?(?:to|transferred)\s*([\w\s@.\-]+?)(?:\s+Ref|\.|$)/i,
  /A\/c\s*(?:XX|\*+)?\d+.*?(?:debited|deducted).*?(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?).*?(?:to|for|Info:)\s*([\w\s@.\-]+?)(?:\s+Ref|\.|$)/i,
];

const CREDIT_PATTERNS = [
  /(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has been |is |)(?:credited|received|deposited).*?(?:from|by)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  /(?:credited|received|deposited)\s*(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?).*?(?:from|by)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  /(?:received|got)\s*(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:from|by)\s*([\w\s@.\-]+?)(?:\s+on|\s+Ref|\s+UPI|\.|$)/i,
  /A\/c\s*(?:XX|\*+)?\d+.*?(?:credited).*?(?:Rs\.?|INR|\u20B9)\s*([\d,]+(?:\.\d{1,2})?).*?(?:from|by|Info:)\s*([\w\s@.\-]+?)(?:\s+Ref|\.|$)/i,
];

export function parseUPIMessage(message: string, senderId?: string): ParsedSMS | null {
  if (!message) return null;
  const msg = message.trim();

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

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
          bankAccount: extractAccount(msg),
          bank: extractBank(msg),
          time,
          rawMessage: msg,
          senderId,
        };
      }
    }
  }

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
          bankAccount: extractAccount(msg),
          bank: extractBank(msg),
          time,
          rawMessage: msg,
          senderId,
        };
      }
    }
  }
  return null;
}

// Back-compat alias used elsewhere
export const parseUPISMS = parseUPIMessage;

function cleanMerchantName(name: string): string {
  if (!name) return 'Unknown';
  let cleaned = name.trim();
  cleaned = cleaned.replace(/@[\w.]+$/i, '');
  cleaned = cleaned.replace(/\s*(pvt|ltd|llp|private|limited|india|pay|upi)\s*/gi, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return cleaned || 'Unknown';
}

function extractUPIRef(msg: string): string | undefined {
  const m = msg.match(/(?:Ref\.?\s*(?:No\.?)?|UPI\s*Ref|UTR)[:\s]*([A-Z0-9]{12,})/i);
  return m ? m[1] : undefined;
}

function extractAccount(msg: string): string | undefined {
  const m = msg.match(/(?:A\/c|Acct?|Account)[:\s]*(?:XX|\*+)?(\d{4,})/i);
  return m ? `XX${m[1].slice(-4)}` : undefined;
}

function extractBank(msg: string): string | undefined {
  const banks: Record<string, string> = {
    HDFC: 'HDFC', SBI: 'SBI', ICICI: 'ICICI', AXIS: 'Axis',
    KOTAK: 'Kotak', PNB: 'PNB', BOB: 'BOB', UNION: 'Union',
    CANARA: 'Canara', YES: 'Yes', IDBI: 'IDBI', INDUS: 'IndusInd',
  };
  for (const [k, v] of Object.entries(banks)) {
    if (msg.toUpperCase().includes(k)) return v;
  }
  return undefined;
}

// Smart category suggestion
const CATEGORY_KEYWORDS: Record<CategoryType, string[]> = {
  food: ['zomato', 'swiggy', 'domino', 'mcdonald', 'kfc', 'pizza', 'starbucks', 'cafe', 'restaurant', 'food', 'burger', 'biryani', 'kitchen', 'dhaba', 'barbeque', 'chaayos', 'haldiram', 'dunkin', 'chai'],
  travel: ['uber', 'ola', 'rapido', 'irctc', 'makemytrip', 'goibibo', 'indigo', 'spicejet', 'metro', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'redbus', 'cleartrip', 'iocl', 'bpcl', 'hpcl'],
  shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal', 'tatacliq', 'croma', 'reliance digital', 'vijay sales', 'ikea', 'decathlon'],
  bills: ['bescom', 'electricity', 'water', 'gas', 'airtel', 'jio', 'vodafone', 'vi ', 'broadband', 'wifi', 'emi', 'loan', 'insurance', 'rent', 'bsnl', 'postpaid', 'prepaid', 'recharge', 'tatapower', 'adani'],
  entertainment: ['netflix', 'prime', 'hotstar', 'spotify', 'bookmyshow', 'pvr', 'inox', 'gaming', 'steam', 'playstation', 'disney', 'zee5', 'sonyliv', 'youtube', 'applemusic'],
  groceries: ['bigbasket', 'blinkit', 'zepto', 'instamart', 'dmart', 'more ', 'spencers', 'grocery', 'supermarket', 'vegetables', 'fruits', 'jiomart', 'natures basket'],
  health: ['apollo', 'pharmacy', 'medplus', 'netmeds', 'pharmeasy', '1mg', 'hospital', 'clinic', 'doctor', 'diagnostic', 'lab', 'cult.fit', 'cultfit'],
  education: ['unacademy', 'byjus', 'vedantu', 'udemy', 'coursera', 'school', 'college', 'tuition', 'upgrad'],
  transfer: ['upi', 'imps', 'neft', 'rtgs', 'transfer'],
  income: ['salary', 'stipend', 'payroll', 'bonus', 'refund', 'cashback'],
  others: [],
};

export function suggestCategory(merchant: string, isCredit = false): CategoryType {
  const m = merchant.toLowerCase();
  if (isCredit) {
    for (const kw of CATEGORY_KEYWORDS.income) {
      if (m.includes(kw)) return 'income';
    }
    return 'income';
  }
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'others' || category === 'income') continue;
    for (const kw of keywords) {
      if (m.includes(kw)) return category as CategoryType;
    }
  }
  return 'others';
}

export function isBankSender(sender: string): boolean {
  if (!sender) return false;
  const u = sender.toUpperCase();
  return BANK_SENDERS.some((b) => u.includes(b));
}

export const TEST_MESSAGES = [
  'Rs.458.00 debited from A/c XX1234 to zomato@paytm on 09-04-25. UPI Ref 412345678901',
  'INR 1,250.50 has been debited from your A/c XX5678 for UPI payment to Amazon Pay. Ref: 512345678902',
  'Sent Rs 320 to rahul@okicici via UPI. Ref No 612345678903',
  'Rs.85000 credited to A/c XX1234 from SALARY ACME CORP. Ref 712345678904',
  'HDFC Bank: Rs. 2,140.00 debited from a/c **1234 on 09-APR-25 to BESCOM. UPI Ref: 812345678905',
  'PhonePe: Paid Rs.740 to Starbucks Coffee. UPI: 912345678906',
  'GPay: You paid \u20B9320.50 to Uber India',
  'SBI: Your A/c X1234 credited Rs.15000.00 by NEFT from ABC Company. Ref: 012345678907',
];
