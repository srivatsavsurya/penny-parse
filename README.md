# The Private Ledger (penny-parse)

An Android app that turns bank and UPI SMS and payment notifications into a categorized personal ledger. Transactions are parsed on the device and stored locally. Optional AI insights use your own [OpenRouter](https://openrouter.ai) API key, entered in Settings.

## Features

- **Automatic capture.** Reads incoming bank and UPI SMS (`src/native/smsReceiver.ts`) and payment notifications (`src/native/notificationListener.ts`), then parses amount, account, merchant and UPI reference.
- **Ledger.** View, edit and categorize transactions (`TransactionEditor`, `app/categories.tsx`).
- **Analytics.** Balance, cash-flow and category breakdown charts (`BalanceHero`, `CashFlowCard`, `CategoryDonut`).
- **Insights.** Basic spending insights offline, with richer ones from an LLM via OpenRouter if you add a key (`src/services/aiInsights.ts`).

## Stack

Expo and React Native with TypeScript, `expo-router`, `react-native-gifted-charts`, AsyncStorage and `expo-notifications`.

## Project layout

```
frontend/
  app/            screens (expo-router): (tabs)/index, transactions, analytics, settings; onboarding; categories
  src/components  UI cards and transaction components
  src/native      SMS receiver and notification listener (Android)
  src/services    AI insights
  src/context     app state
  plugins/        Expo config plugins for the native Android pieces
```

## Run

```bash
cd frontend
yarn install
npx expo run:android   # development build; SMS and notification access need native code, so Expo Go won't work
```

Lint with `yarn lint`.
