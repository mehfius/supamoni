const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function send_startup_message() {
  try {
    await bot.sendMessage(1089100690, 'Supamoni service started successfully!');
    console.log('Startup message sent to Telegram');
  } catch (error) {
    console.error('Error sending Telegram message:', error.message);
  }
}

const subscription = supabase
  .channel('sessions_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'sessions'
    },
    async (payload) => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('label, areas, id')
          .eq('id', payload.new.users)
          .single()

        if (userError) throw userError

        const message = `[${userData.areas}] [${userData.id}] ${userData.label}`
        await bot.sendMessage(1089100690, message)
        console.log('Payload enviado para o Telegram')
      } catch (error) {
        console.error('Erro ao enviar payload para o Telegram:', error.message)
      }
    }
  )
  .subscribe()

function check_environment_variables() {
  const required_vars = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY
  }

  let missing_vars = Object.entries(required_vars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing_vars.length > 0) {
    console.error('\x1b[41m\x1b[37m%s\x1b[0m', '🚨 ERRO: Variáveis de ambiente ausentes 🚨')
    console.error('\x1b[31m%s\x1b[0m', 'As seguintes variáveis de ambiente são necessárias:')
    missing_vars.forEach((var_name, index) => {
      console.error(`\x1b[33m${index + 1}. ${var_name}\x1b[0m`)
    })
    console.error('\x1b[36m%s\x1b[0m', 'Por favor, configure o arquivo .env ou exporte as variáveis no terminal.')
    process.exit(1)
  }

  console.log('\x1b[42m\x1b[30m%s\x1b[0m', '✅ Todas as variáveis de ambiente estão configuradas corretamente!')
}

console.log('Starting Supabase session monitoring service...')
check_environment_variables()
send_startup_message()

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(`Chat ID recebido: ${chatId}`);
  bot.sendMessage(chatId, `Seu Chat ID é: ${chatId}`); // Confirmação
});

console.log('Bot aguardando mensagens para capturar o Chat ID...');