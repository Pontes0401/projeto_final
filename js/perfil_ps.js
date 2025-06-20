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
    document.getElementById('user-nome').innerText = userData.Nome_Completo;
    document.getElementById('nome').innerText = userData.Nome_Completo;
    document.getElementById('numero_cedula').innerText = userData.numero_cedula
    document.getElementById('email').innerText = userData.email;
    document.getElementById('telemovel').innerText = userData.telemovel;
    document.getElementById('nasc').innerText = new Date(userData.data_nascimento).toLocaleDateString('pt-PT');
    document.getElementById('edit-nome').value = userData.Nome_Completo;
    document.getElementById('edit-cedula').value = userData.numero_cedula;
    document.getElementById('edit-email').value = userData.email;
    document.getElementById('edit-telemovel').value = userData.telemovel;
    document.getElementById('edit-nasc').value = userData.data_nascimento?.split('T')[0];
  }
});

document.getElementById('editar-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const updates = {
    Nome_Completo: document.getElementById('edit-nome').value,
    numero_cedula: document.getElementById('edit-cedula').value,
    email: document.getElementById('edit-email').value,
    telemovel: document.getElementById('edit-telemovel').value,
    data_nascimento: document.getElementById('edit-nasc').value,
  };

  const { error } = await supabase.from('users').update(updates).eq('id', userId);

  if (error) {
    alert('Erro ao atualizar dados do filho: ' + error.message);
  } else {
    alert('Dados atualizados com sucesso!');
    location.reload();
  }
});
