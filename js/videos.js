import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhpbxjewebtulodkkfag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGJ4amV3ZWJ0dWxvZGtrZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMzNjUsImV4cCI6MjA2MjcxOTM2NX0.U-tDxEHyb1ZkViwobP7nHiZbXwVx1vtpO-r-3EESppw'; 
const supabase = createClient(supabaseUrl, supabaseKey);

let userId = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session || !session.user) {
      window.location.href = 'index.html';
      return;
    }

    const userEmail = session.user.email;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, Nome_crianca')
      .eq('email', userEmail)
      .maybeSingle();

    if (userError || !userData || !userData.Nome_crianca) {
      document.getElementById('user-name').innerText = 'Erro ao carregar';
      return;
    }

    const nomeCrianca = userData.Nome_crianca.split(',')[0].trim();
    document.getElementById('user-name').innerText = nomeCrianca;
    userId = userData.id;

  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    document.getElementById('user-name').innerText = 'Erro';
  }
});
