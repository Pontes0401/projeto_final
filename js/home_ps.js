import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhpbxjewebtulodkkfag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGJ4amV3ZWJ0dWxvZGtrZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMzNjUsImV4cCI6MjA2MjcxOTM2NX0.U-tDxEHyb1ZkViwobP7nHiZbXwVx1vtpO-r-3EESppw'; // ⚠️ MANTÉM ISTO SEGURO!
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = 'index.html';
      return;
    }

    const email = session.user.email;

    // 🔍 Buscar dados do profissional
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('Nome_Completo')
      .eq('email', email)
      .single();

    const nomeProfissional = userData?.Nome_Completo || email;
    document.getElementById('user-name').innerText = nomeProfissional;

    // 📅 Data atual
    const hoje = new Date();
    const hojeISO = hoje.toISOString().split('T')[0];
    const agora = new Date();
    const diasSemana = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];

    document.getElementById('dia-semana').innerHTML = `<strong>${diasSemana[hoje.getDay()]}</strong>`;
    document.getElementById('dia-numero').innerText = hoje.getDate();

    // 🔴 Consultas de hoje
    const agoraISO = agora.toISOString();
    const { data: consultasHoje } = await supabase
      .from('consultas')
      .select('nome_crianca, data_consulta')
      .eq('profissional', nomeProfissional)
      .gte('data_consulta', agoraISO) 
      .lte('data_consulta', `${hojeISO}T23:59:59`)
      .order('data_consulta', { ascending: true });


    const consultaInfo = document.getElementById('consulta-info');
    if (consultasHoje?.length > 0) {
      const texto = consultasHoje.map(c => {
        const hora = new Date(c.data_consulta).toLocaleTimeString('pt-PT', {
          hour: '2-digit', minute: '2-digit'
        });
        return `Consulta com ${c.nome_crianca} às ${hora}`;
      }).join('<br>');
      consultaInfo.innerHTML = texto;
    } else {
      consultaInfo.innerText = 'Nenhuma consulta hoje';
    }

    // 🔔 Notificações futuras
    const { data: futurasConsultas } = await supabase
      .from('consultas')
      .select('nome_crianca, data_consulta')
      .eq('profissional', nomeProfissional)
      .gt('data_consulta', agora.toISOString())
      .order('data_consulta', { ascending: true });

    const notificacao = document.getElementById('notificacao-texto');
    if (futurasConsultas?.length > 0) {
      const texto = futurasConsultas.map(c => {
        const data = new Date(c.data_consulta);
        const dataFormatada = data.toLocaleDateString('pt-PT');
        const hora = data.toLocaleTimeString('pt-PT', {
          hour: '2-digit', minute: '2-digit'
        });
        return `Consulta com <strong>${c.nome_crianca}</strong> no dia ${dataFormatada} às ${hora}.`;
      }).join('<br>');

      notificacao.innerHTML = `Olá, ${nomeProfissional}!<br>${texto}`;
    } else {
      notificacao.innerHTML = `Olá, ${nomeProfissional}!<br>Não há consultas agendadas no momento.`;
    }

  } catch (err) {
    console.error('Erro:', err);
    document.getElementById('user-name').innerText = 'Erro ao carregar nome';
  }
});
