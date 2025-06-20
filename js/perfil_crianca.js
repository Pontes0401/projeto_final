import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhpbxjewebtulodkkfag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGJ4amV3ZWJ0dWxvZGtrZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMzNjUsImV4cCI6MjA2MjcxOTM2NX0.U-tDxEHyb1ZkViwobP7nHiZbXwVx1vtpO-r-3EESppw'; 
const supabase = createClient(supabaseUrl, supabaseKey);

let userId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return window.location.href = 'index.html';

  const userEmail = session.user.email;

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('email', userEmail)
    .single();

  if (userData) {
    userId = userData.id;
    document.getElementById('filho-nome-topo').innerText = userData.Nome_crianca;
    document.getElementById('filho-nome').innerText = userData.Nome_crianca;
    document.getElementById('filho-nasc').innerText = new Date(userData.data_nascimento_crianca).toLocaleDateString('pt-PT');
    document.getElementById('mae-nome').innerText = userData.Nome_Completo;
    document.getElementById('mae-email').innerText = userData.email;
    document.getElementById('edit-filho-nome').value = userData.Nome_crianca;
    document.getElementById('edit-filho-nasc').value = userData.data_nascimento_crianca?.split('T')[0];
  }
});

document.getElementById('editar-filho-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const updates = {
    Nome_crianca: document.getElementById('edit-filho-nome').value,
    data_nascimento_crianca: document.getElementById('edit-filho-nasc').value,
  };

  const { error } = await supabase.from('users').update(updates).eq('id', userId);

  if (error) {
    alert('Erro ao atualizar dados do filho: ' + error.message);
  } else {
    alert('Dados do filho atualizados com sucesso!');
    location.reload();
  }
});
