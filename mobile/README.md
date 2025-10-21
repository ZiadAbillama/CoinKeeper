# CoinKeeper Mobile

A React Native mobile expense tracking app built with Expo and Supabase.

## Features

- User authentication with Supabase
- Add, view, and delete expenses
- Create and manage budgets by category
- Real-time budget tracking with visual progress bars
- Dashboard with overview of spending
- Clean, modern mobile UI

## Tech Stack

- React Native with Expo
- Supabase for backend (authentication & database)
- React Navigation for routing
- AsyncStorage for session persistence

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env`

3. Start the development server:
```bash
npm start
```

4. Run on your device:
- Install the Expo Go app on your phone
- Scan the QR code shown in the terminal
- Or press `a` for Android emulator or `i` for iOS simulator

## Project Structure

- `/screens` - All app screens (Login, Register, Dashboard, Expenses, Budgets)
- `/contexts` - React context providers (Auth)
- `/lib` - Supabase client configuration
- `App.js` - Main app component with navigation

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
