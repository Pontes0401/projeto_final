// Importa a biblioteca do Supabase JS para se conectar ao backend
import { createClient } from '@supabase/supabase-js';

// Define a URL do seu projeto Supabase e a chave de acesso pública (anon key)
const supabaseUrl = 'https://hhpbxjewebtulodkkfag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGJ4amV3ZWJ0dWxvZGtrZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMzNjUsImV4cCI6MjA2MjcxOTM2NX0.U-tDxEHyb1ZkViwobP7nHiZbXwVx1vtpO-r-3EESppw'; 
const supabase = createClient(supabaseUrl, supabaseKey); // Cria o cliente Supabase para fazer chamadas

let userId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session || !session.user) {
    window.location.href = 'index.html';
    return;
  }

  const userEmail = session.user.email;
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('email', userEmail)
    .single();

  if (userData) {
    userId = userData.id;

    document.getElementById('user-nome').innerText = userData.Nome_Completo;
    document.getElementById('mae-nome').innerText = userData.Nome_Completo;
    document.getElementById('mae-email').innerText = userData.email;
    document.getElementById('mae-tel').innerText = userData.telemovel;
    document.getElementById('mae-nasc').innerText = new Date(userData.data_nascimento).toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    document.getElementById('filho-nome').innerText = userData.Nome_crianca;
    document.getElementById('filho-nasc').innerText = new Date(userData.data_nascimento_crianca).toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    // Pré-preencher os inputs do modal
    document.getElementById('edit-mae-nome').value = userData.Nome_Completo;
    document.getElementById('edit-mae-email').value = userData.email;
    document.getElementById('edit-mae-tel').value = userData.telemovel;
    document.getElementById('edit-mae-nasc').value = userData.data_nascimento?.split('T')[0] || '';
    document.getElementById('edit-filho-nome').value = userData.Nome_crianca;
    document.getElementById('edit-filho-nasc').value = userData.data_nascimento_crianca?.split('T')[0] || '';
  }
});

// Submeter formulário de edição
document.getElementById('editar-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const updates = {
    Nome_Completo: document.getElementById('edit-mae-nome').value,
    email: document.getElementById('edit-mae-email').value,
    telemovel: document.getElementById('edit-mae-tel').value,
    data_nascimento: document.getElementById('edit-mae-nasc').value,
    Nome_crianca: document.getElementById('edit-filho-nome').value,
  };

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    alert('Erro ao atualizar perfil: ' + error.message);
  } else {
    alert('Perfil atualizado com sucesso!');
    location.reload();
  }
});
