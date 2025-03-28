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

console.log('Starting Supabase session monitoring service...');
send_startup_message();

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(`Chat ID recebido: ${chatId}`);
  bot.sendMessage(chatId, `Seu Chat ID é: ${chatId}`); // Confirmação
});

console.log('Bot aguardando mensagens para capturar o Chat ID...');