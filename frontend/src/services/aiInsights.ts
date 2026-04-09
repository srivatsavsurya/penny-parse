// OpenRouter AI Integration for spending insights
import { Transaction, CategoryType } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface AIInsight {
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'info';
}

export async function generateInsights(
  transactions: Transaction[],
  apiKey: string
): Promise<AIInsight[]> {
  if (!apiKey) {
    return getBasicInsights(transactions);
  }

  try {
    // Prepare spending summary for AI
    const summary = prepareSpendingSummary(transactions);
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://privateledger.app',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful financial advisor. Analyze the spending data and provide 2-3 brief, actionable insights. Keep each insight under 50 words. Format as JSON array with objects containing "title", "description", and "type" (tip/warning/info).'
          },
          {
            role: 'user',
            content: `Here is my spending summary for this month:\n${summary}\n\nProvide insights.`
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      try {
        const insights = JSON.parse(content);
        return Array.isArray(insights) ? insights : getBasicInsights(transactions);
      } catch {
        return getBasicInsights(transactions);
      }
    }
    
    return getBasicInsights(transactions);
  } catch (error) {
    console.warn('AI insights failed:', error);
    return getBasicInsights(transactions);
  }
}

function prepareSpendingSummary(transactions: Transaction[]): string {
  const spending: Record<CategoryType, number> = {} as any;
  let totalSpent = 0;
  let totalReceived = 0;

  transactions.forEach(t => {
    if (t.isCredit) {
      totalReceived += t.amount;
    } else {
      totalSpent += t.amount;
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    }
  });

  const lines = [
    `Total Spent: ${formatCurrency(totalSpent)}`,
    `Total Received: ${formatCurrency(totalReceived)}`,
    '',
    'By Category:',
  ];

  Object.entries(spending)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, amount]) => {
      const info = getCategoryInfo(cat as CategoryType);
      lines.push(`- ${info.name}: ${formatCurrency(amount)}`);
    });

  return lines.join('\n');
}

// Basic insights without AI
export function getBasicInsights(transactions: Transaction[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const spending: Record<string, number> = {};
  let totalSpent = 0;

  transactions.filter(t => !t.isCredit).forEach(t => {
    totalSpent += t.amount;
    spending[t.category] = (spending[t.category] || 0) + t.amount;
  });

  if (totalSpent === 0) return [];

  // Find top category
  const sorted = Object.entries(spending).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const [topCat, topAmount] = sorted[0];
    const percentage = Math.round((topAmount / totalSpent) * 100);
    const info = getCategoryInfo(topCat as CategoryType);
    
    insights.push({
      title: `${info.name} is your top expense`,
      description: `${percentage}% of spending (${formatCurrency(topAmount)})`,
      type: percentage > 40 ? 'warning' : 'info',
    });
  }

  // Transaction count
  const txCount = transactions.filter(t => !t.isCredit).length;
  if (txCount > 0) {
    insights.push({
      title: `${txCount} transactions this month`,
      description: `Average: ${formatCurrency(Math.round(totalSpent / txCount))} per transaction`,
      type: 'info',
    });
  }

  return insights;
}
