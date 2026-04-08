import { SmartRule, CategoryType } from '../types';

export const DEFAULT_SMART_RULES: SmartRule[] = [
  {
    id: '1',
    keywords: ['zomato', 'swiggy', 'dominos', 'starbucks', 'blue tokai', 'mcdonalds', 'kfc', 'subway', 'pizza hut', 'burger king', 'cafe coffee day', 'dunkin', 'fatty bao', 'barbeque nation'],
    category: 'food',
    enabled: true,
  },
  {
    id: '2',
    keywords: ['uber', 'ola', 'rapido', 'irctc', 'makemytrip', 'goibibo', 'indigo', 'spicejet', 'air india', 'metro', 'fuel', 'petrol', 'diesel', 'parking'],
    category: 'travel',
    enabled: true,
  },
  {
    id: '3',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'tata cliq', 'snapdeal', 'ikea', 'decathlon'],
    category: 'shopping',
    enabled: true,
  },
  {
    id: '4',
    keywords: ['bescom', 'bwssb', 'electricity', 'water bill', 'gas', 'airtel', 'jio', 'vodafone', 'vi', 'broadband', 'wifi', 'rent', 'emi'],
    category: 'bills',
    enabled: true,
  },
  {
    id: '5',
    keywords: ['netflix', 'prime', 'hotstar', 'spotify', 'bookmyshow', 'pvr', 'inox', 'cinepolis', 'gaming', 'steam', 'playstation'],
    category: 'entertainment',
    enabled: true,
  },
  {
    id: '6',
    keywords: ['bigbasket', 'blinkit', 'zepto', 'instamart', 'dmart', 'reliance fresh', 'more', 'nature basket', 'spencers', 'grocery'],
    category: 'groceries',
    enabled: true,
  },
];

export const suggestCategory = (merchant: string, rules: SmartRule[]): CategoryType | null => {
  const merchantLower = merchant.toLowerCase();
  
  for (const rule of rules) {
    if (!rule.enabled) continue;
    
    for (const keyword of rule.keywords) {
      if (merchantLower.includes(keyword.toLowerCase())) {
        return rule.category;
      }
    }
  }
  
  return null;
};
