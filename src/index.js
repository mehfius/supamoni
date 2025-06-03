require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// URL do webhook
const WEBHOOK_URL = 'http://hugely-sincere-piranha.ngrok-free.app/send_message';

// Função com retry para fetch
async function retryFetch(url, options, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      console.warn(`Tentativa ${i + 1} falhou. Retentando...`);
      await new Promise((r) => setTimeout(r, delay));
    } catch (err) {
      console.warn(`Erro na tentativa ${i + 1}:`, err.message);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Todas as tentativas de fetch falharam");
}

// Mensagem de inicialização
async function sendStartupMessage() {
  try {
    await retryFetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'startup@example.com',
        message: 'Supamoni service started successfully! Version 2.0'
      })
    });

    console.log('Mensagem de startup enviada com sucesso');
  } catch (error) {
    console.error('Falha ao enviar mensagem de startup:', error.message);
  }
}

// Função principal de conexão com Supabase
function connectSupabase() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
        console.log('Evento recebido:', payload);

        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('label, areas, id, email')
            .eq('id', payload.new.users)
            .single();

          if (userError) throw userError;

          const message = `[${userData.areas}] [${userData.id}] ${userData.label}`;

          await retryFetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userData.email,
              message: message
            })
          });

          console.log('Mensagem enviada com sucesso para:', userData.email);
        } catch (error) {
          console.error('Erro no processamento do evento:', error.message);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Conectado ao canal do Supabase');
      } else {
        console.warn('Estado da assinatura:', status);
      }
    });

  // Evento de atualização em tempo real (para logs ou reconexão)
  supabase
    .channel('sessions_changes')
    .on('REALTIME_SUBSCRIPTION_UPDATE', (update) => {
      console.log('Atualização de subscrição:', update);
    });
}

// Healthcheck básico
setInterval(() => {
  console.log('[Healthcheck] Serviço ativo há mais de 5 minutos.');
}, 5 * 60 * 1000);

// Inicializar tudo
sendStartupMessage();
connectSupabase();