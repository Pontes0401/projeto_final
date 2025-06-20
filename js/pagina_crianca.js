import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhpbxjewebtulodkkfag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGJ4amV3ZWJ0dWxvZGtrZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMzNjUsImV4cCI6MjA2MjcxOTM2NX0.U-tDxEHyb1ZkViwobP7nHiZbXwVx1vtpO-r-3EESppw'; 
const supabase = createClient(supabaseUrl, supabaseKey);

let userId = null;
let estadoSelecionado = null;

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

    const nomeCrianca = userData.Nome_crianca.split(',')[0].trim(); // Remove espaços em branco no início e no fim do nome da criança
    document.getElementById('user-name').innerText = nomeCrianca;
    userId = userData.id;


  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    document.getElementById('user-name').innerText = 'Erro';
  }

  const emojis = document.querySelectorAll('#emoji-selector .emoji');
  emojis.forEach(emoji => {
    emoji.addEventListener('click', () => {
      emojis.forEach(e => e.classList.remove('selected'));
      emoji.classList.add('selected');
      estadoSelecionado = emoji.dataset.estado;
    });
  });

  const form = document.getElementById('registo-dia');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const positivo = document.getElementById('positivo').value.trim();
      const negativo = document.getElementById('negativo').value.trim();
      const melhorar = document.getElementById('melhorar').value.trim();

      if (!estadoSelecionado) {
        alert('Por favor, seleciona um estado emocional.');
        return;
      }

      const { error: insertError } = await supabase.from('registos_diarios').insert([{
        user_id: userId,
        estado_emocional: estadoSelecionado,
        positivo,
        negativo,
        melhorar
      }]);

      if (insertError) {
        alert('Erro ao guardar: ' + insertError.message);
      } else {
        alert('Registo guardado com sucesso!');
        form.reset();
        emojis.forEach(e => e.classList.remove('selected'));
        estadoSelecionado = null;
      }
    });
  }
});
