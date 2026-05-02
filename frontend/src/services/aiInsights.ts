// OpenRouter AI Integration for spending insights
import { Transaction, CategoryType } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface AIInsight {
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'info' | 'success';
  icon?: string;
}

export async function generateInsights(
  transactions: Transaction[],
  apiKey: string,
  model = 'google/gemini-2.0-flash-exp:free'
): Promise<AIInsight[]> {
  if (!apiKey) return getBasicInsights(transactions);
  try {
    const summary = prepareSpendingSummary(transactions);
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://privateledger.app',
        'X-Title': 'The Private Ledger',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a concise Indian personal-finance advisor. Given a spending summary, return 3-4 actionable insights as a JSON array ONLY (no prose). Each item must be an object: { "title": string (short, <8 words), "description": string (<30 words, actionable), "type": "tip"|"warning"|"info"|"success" }. Use rupees ₹.',
          },
          { role: 'user', content: `Spending summary this month:\n${summary}` },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });
    if (!response.ok) throw new Error(`OpenRouter error ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) return parsed.slice(0, 5);
    }
    return getBasicInsights(transactions);
  } catch (e) {
    console.warn('AI insights failed:', e);
    return getBasicInsights(transactions);
  }
}

function prepareSpendingSummary(transactions: Transaction[]): string {
  const spending: Partial<Record<CategoryType, number>> = {};
  let totalSpent = 0;
  let totalReceived = 0;
  transactions.forEach((t) => {
    if (t.isCredit) totalReceived += t.amount;
    else {
      totalSpent += t.amount;
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    }
  });
  const lines = [
    `Total Spent: ${formatCurrency(totalSpent)}`,
    `Total Received: ${formatCurrency(totalReceived)}`,
    `Net: ${formatCurrency(totalReceived - totalSpent)}`,
    `Transactions: ${transactions.length}`,
    '',
    'By Category:',
  ];
  Object.entries(spending)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .forEach(([cat, amount]) => {
      const info = getCategoryInfo(cat as CategoryType);
      lines.push(`- ${info.name}: ${formatCurrency(amount || 0)}`);
    });
  return lines.join('\n');
}

export function getBasicInsights(transactions: Transaction[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const spending: Record<string, number> = {};
  let totalSpent = 0;
  let totalReceived = 0;
  transactions.forEach((t) => {
    if (t.isCredit) totalReceived += t.amount;
    else {
      totalSpent += t.amount;
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    }
  });

  if (totalSpent === 0 && totalReceived === 0) return insights;

  const sorted = Object.entries(spending).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const [topCat, topAmount] = sorted[0];
    const pct = Math.round((topAmount / totalSpent) * 100);
    const info = getCategoryInfo(topCat as CategoryType);
    insights.push({
      title: `${info.name} is your top expense`,
      description: `${pct}% of your spending (${formatCurrency(topAmount)}). ${pct > 40 ? 'Consider setting a budget.' : 'Well balanced.'}`,
      type: pct > 40 ? 'warning' : 'info',
    });
  }

  const txCount = transactions.filter((t) => !t.isCredit).length;
  if (txCount > 0) {
    const avg = Math.round(totalSpent / txCount);
    insights.push({
      title: `${txCount} transactions this month`,
      description: `Averaging ${formatCurrency(avg)} per transaction. Small frequent spends add up fast.`,
      type: 'info',
    });
  }

  if (totalReceived > 0) {
    const savingsRate = Math.round(((totalReceived - totalSpent) / totalReceived) * 100);
    if (savingsRate > 0) {
      insights.push({
        title: `You're saving ${savingsRate}%`,
        description: `Net positive of ${formatCurrency(totalReceived - totalSpent)} this month. Keep it up!`,
        type: 'success',
      });
    } else {
      insights.push({
        title: `Spending exceeds income`,
        description: `Down ${formatCurrency(totalSpent - totalReceived)} this month. Review non-essentials.`,
        type: 'warning',
      });
    }
  }

  return insights;
}
