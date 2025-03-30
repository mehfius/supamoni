# Supamoni

A Node.js service for monitoring Supabase sessions.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up your environment variables:
   - SUPABASE_URL
   - SUPABASE_KEY
   - TELEGRAM_TOKEN
4. Start the service:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Features

- Monitors active sessions in Supabase
- Health check every 5 minutes for Supabase and Telegram connections
- Sends notifications via Telegram bot
- Logs session information and connection status to console
- Shows session count and details

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase project API key
- `TELEGRAM_TOKEN`: Your Telegram bot token 