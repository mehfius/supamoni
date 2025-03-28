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
- Checks sessions every minute
- Logs session information to console
- Shows session count and details

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase project API key 