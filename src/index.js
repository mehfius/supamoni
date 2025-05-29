require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function send_startup_message() {
  try {
    const response = await fetch('http://hugely-sincere-piranha.ngrok-free.app/send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'startup@example.com',
        message: 'Supamoni service started successfully!'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send startup message via fetch: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending startup message via fetch:', error.message);
  }
}

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
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('label, areas, id, email')
          .eq('id', payload.new.users)
          .single();

        if (userError) throw userError;

        const message = `[${userData.areas}] [${userData.id}] ${userData.label}`;

        const response = await fetch('http://hugely-sincere-piranha.ngrok-free.app/send_message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: userData.email,
            message: message
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to send message via fetch: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error sending payload via fetch:', error.message);
      }
    }
  )
  .subscribe();

send_startup_message();
