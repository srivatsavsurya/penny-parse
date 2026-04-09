import { SmartRule, CategoryType, ParsedSMS } from '../types';

export const DEFAULT_SMART_RULES: SmartRule[] = [
  {
    id: '1',
    keywords: ['zomato', 'swiggy', 'dominos', 'starbucks', 'mcdonald', 'kfc', 'subway', 'pizza', 'burger', 'cafe', 'restaurant', 'food', 'biryani', 'chai'],
    category: 'food',
    enabled: true,
  },
  {
    id: '2',
    keywords: ['uber', 'ola', 'rapido', 'irctc', 'makemytrip', 'goibibo', 'indigo', 'spicejet', 'metro', 'petrol', 'diesel', 'fuel', 'parking', 'toll'],
    category: 'travel',
    enabled: true,
  },
  {
    id: '3',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal', 'ikea', 'decathlon', 'croma'],
    category: 'shopping',
    enabled: true,
  },
  {
    id: '4',
    keywords: ['bescom', 'bwssb', 'electricity', 'water', 'gas', 'airtel', 'jio', 'vodafone', 'vi', 'broadband', 'wifi', 'rent', 'emi', 'loan', 'insurance'],
    category: 'bills',
    enabled: true,
  },
  {
    id: '5',
    keywords: ['netflix', 'prime', 'hotstar', 'spotify', 'bookmyshow', 'pvr', 'inox', 'gaming', 'steam', 'playstation', 'movie'],
    category: 'entertainment',
    enabled: true,
  },
  {
    id: '6',
    keywords: ['bigbasket', 'blinkit', 'zepto', 'instamart', 'dmart', 'reliance', 'more', 'nature', 'spencers', 'grocery', 'supermarket'],
    category: 'groceries',
    enabled: true,
  },
];

export const suggestCategory = (merchant: string, rules: SmartRule[]): CategoryType => {
  const merchantLower = merchant.toLowerCase();
  
  for (const rule of rules) {
    if (!rule.enabled) continue;
    for (const keyword of rule.keywords) {
      if (merchantLower.includes(keyword.toLowerCase())) {
        return rule.category;
      }
    }
  }
  
  return 'others';
};

// Parse UPI SMS messages from Indian banks
export const parseUPISMS = (message: string): ParsedSMS | null => {
  const patterns = [
    // Pattern 1: Rs.XXX debited from A/c XX1234 to MERCHANT@upi
    /Rs\.?\s*([\d,]+\.?\d*)\s*(?:debited|deducted).*(?:to|for)\s+([\w@.\-]+)/i,
    // Pattern 2: Debited Rs XXX from XX1234 to MERCHANT
    /(?:debited|deducted)\s*Rs\.?\s*([\d,]+\.?\d*).*(?:to|for)\s+([\w@.\-]+)/i,
    // Pattern 3: Sent Rs.XXX to MERCHANT
    /Sent\s*Rs\.?\s*([\d,]+\.?\d*)\s*to\s+([\w@.\-]+)/i,
    // Pattern 4: Payment of Rs XXX to MERCHANT
    /Payment\s*(?:of)?\s*Rs\.?\s*([\d,]+\.?\d*)\s*(?:to|for)\s+([\w@.\-]+)/i,
    // Pattern 5: INR XXX debited to MERCHANT
    /INR\s*([\d,]+\.?\d*)\s*(?:debited|paid).*(?:to|for)\s+([\w@.\-]+)/i,
    // Pattern 6: UPI transaction Rs XXX to MERCHANT (generic)
    /(?:UPI|IMPS|NEFT).*Rs\.?\s*([\d,]+\.?\d*).*(?:to|for)\s+([\w@.\-\s]+?)(?:\s+Ref|\s+UPI|$)/i,
  ];

  // Check for credit (received money)
  const creditPatterns = [
    /Rs\.?\s*([\d,]+\.?\d*)\s*(?:credited|received)/i,
    /(?:credited|received)\s*Rs\.?\s*([\d,]+\.?\d*)/i,
  ];

  // Try credit patterns first
  for (const pattern of creditPatterns) {
    const match = message.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const merchantMatch = message.match(/from\s+([\w@.\-\s]+?)(?:\s+Ref|\s+UPI|$)/i);
      return {
        amount,
        merchant: merchantMatch ? merchantMatch[1].trim() : 'Unknown',
        isDebit: false,
        rawMessage: message,
      };
    }
  }

  // Try debit patterns
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      let merchant = match[2].trim();
      
      // Clean up merchant name
      merchant = merchant.replace(/@.*$/, ''); // Remove UPI handle
      merchant = merchant.replace(/\s+/g, ' '); // Normalize spaces
      
      // Extract UPI reference if present
      const refMatch = message.match(/(?:Ref|UPI\s*Ref)[:\s]*([A-Z0-9]+)/i);
      const upiRef = refMatch ? refMatch[1] : undefined;

      // Extract account number if present
      const accMatch = message.match(/(?:A\/c|Acct|Account)[:\s]*(?:XX|\*+)?(\d{4})/i);
      const bankAccount = accMatch ? `XX${accMatch[1]}` : undefined;

      return {
        amount,
        merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1),
        isDebit: true,
        upiRef,
        bankAccount,
        rawMessage: message,
      };
    }
  }

  return null;
};
