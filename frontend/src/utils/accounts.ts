import { Account } from '../types';

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_hdfc',
    name: 'HDFC Bank',
    bank: 'HDFC',
    type: 'bank',
    color: '#004C8F',
    balance: 0,
    last4: '1234',
    icon: 'card',
    senderIds: ['HDFCBK', 'HDFC'],
  },
  {
    id: 'acc_cash',
    name: 'Cash',
    type: 'cash',
    color: '#10B981',
    balance: 0,
    icon: 'cash',
    senderIds: [],
  },
];

export const BANK_COLORS: Record<string, string> = {
  HDFC: '#004C8F',
  SBI: '#1E40AF',
  ICICI: '#F58220',
  AXIS: '#97144D',
  KOTAK: '#ED232A',
  PNB: '#A1004C',
  YES: '#1F3A93',
  IDBI: '#DA251C',
  BOB: '#F15A22',
  CANARA: '#003F7F',
  UNION: '#00A8E0',
  INDUS: '#772583',
};

export function findAccountBySender(accounts: Account[], senderId?: string): Account | undefined {
  if (!senderId) return undefined;
  const upper = senderId.toUpperCase();
  return accounts.find((acc) =>
    (acc.senderIds || []).some((sid) => upper.includes(sid.toUpperCase()))
  );
}

export function getAccountIcon(type: string): string {
  switch (type) {
    case 'bank':
      return 'card';
    case 'card':
      return 'card-outline';
    case 'cash':
      return 'cash';
    case 'wallet':
      return 'wallet';
    default:
      return 'card';
  }
}
