// Importa o Supabase
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hhpbxjewebtulodkkfag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGJ4amV3ZWJ0dWxvZGtrZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMzNjUsImV4cCI6MjA2MjcxOTM2NX0.U-tDxEHyb1ZkViwobP7nHiZbXwVx1vtpO-r-3EESppw';
const supabase = createClient(supabaseUrl, supabaseKey);

let userId = null;

// Quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 🔐 Verificar sessão de utilizador
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = 'index.html';
      return;
    }

    const userEmail = session.user.email;

    // 🔎 Buscar dados do utilizador autenticado
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, Nome_Completo')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error('Utilizador não encontrado:', userError);
      document.getElementById('user-name').innerText = userEmail;
      return;
    }

    const nome = userData.Nome_Completo;
    userId = userData.id;
    document.getElementById('user-name').innerText = nome;

    // 📅 Notificação da próxima consulta futura
    const { data: consultas } = await supabase
      .from('consultas')
      .select('nome_crianca, data_consulta, profissional')
      .eq('user_id', userId)
      .gte('data_consulta', new Date().toISOString())
      .order('data_consulta', { ascending: true })
      .limit(1);

    const notificacao = document.getElementById('notificacao-texto');

    if (!consultas || consultas.length === 0) {
      notificacao.innerHTML = `
        Olá, ${nome}!<br>
        Não há consultas agendadas no momento.
      `;
    } else {
      const consulta = consultas[0];
      const dataObj = new Date(consulta.data_consulta);
      const dataFormatada = dataObj.toLocaleDateString('pt-PT', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      const horaFormatada = dataObj.toLocaleTimeString('pt-PT', {
        hour: '2-digit', minute: '2-digit'
      });

      notificacao.innerHTML = `
        Olá, ${nome}!<br>
        Lembramos que a consulta de ${consulta.nome_crianca} está agendada<br>
        para o dia ${dataFormatada}, às ${horaFormatada}, com ${consulta.profissional}.
      `;
    }

    // 📆 Atualiza o cartão com a data de hoje
const hoje = new Date();
const hojeDataISO = hoje.toISOString().split('T')[0];
const diasSemana = [
  'DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA',
  'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'
];
document.getElementById('dia-semana').innerHTML = `<strong>${diasSemana[hoje.getDay()]}</strong>`;
document.getElementById('dia-numero').innerText = hoje.getDate();

// 📋 Verificar se existe consulta marcada para HOJE
const consultaInfo = document.getElementById('consulta-info');
const { data: consultasHoje } = await supabase
  .from('consultas')
  .select('data_consulta, profissional')
  .eq('user_id', userId)
  .gte('data_consulta', hojeDataISO + 'T00:00:00')
  .lte('data_consulta', hojeDataISO + 'T23:59:59')
  .order('data_consulta', { ascending: true }); // 🔁 garante que vem a primeira do dia

if (consultasHoje && consultasHoje.length > 0) {
  const agora = new Date();

  // 🔍 Verifica se ainda há consultas futuras no mesmo dia
  const proximaConsulta = consultasHoje.find(consulta => new Date(consulta.data_consulta) > agora);

  if (proximaConsulta) {
    const hora = new Date(proximaConsulta.data_consulta).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
    consultaInfo.innerHTML = `Consulta às ${hora} com ${proximaConsulta.profissional}`;
  } else {
    consultaInfo.innerText = 'Nenhuma consulta hoje';
  }
} else {
  consultaInfo.innerText = 'Nenhuma consulta hoje';
}

    // 👶 Preencher dropdown com nomes das crianças
    const { data: userCriancaData } = await supabase
      .from('users')
      .select('Nome_crianca')
      .eq('id', userId)
      .single();

    const criancaSelect = document.getElementById('nomeCrianca');
    criancaSelect.innerHTML = '<option value="" disabled selected>Selecione uma criança</option>';

    if (userCriancaData?.Nome_crianca) {
      const nomes = userCriancaData.Nome_crianca.split(',').map(n => n.trim());
      nomes.forEach(nomeCrianca => {
        const opt = document.createElement('option');
        opt.value = nomeCrianca;
        opt.textContent = nomeCrianca;
        criancaSelect.appendChild(opt);
      });
    }

    // 🩺 Preencher dropdown com profissionais que têm número de cédula
    const { data: profissionais } = await supabase
      .from('users')
      .select('Nome_Completo')
      .not('numero_cedula', 'is', null);

    const profSelect = document.getElementById('profissional');
    profSelect.innerHTML = '<option value="" disabled selected>Selecione um profissional</option>';

    profissionais?.forEach(prof => {
      const opt = document.createElement('option');
      opt.value = prof.Nome_Completo;
      opt.textContent = prof.Nome_Completo;
      profSelect.appendChild(opt);
    });

  } catch (err) {
    console.error('Erro inesperado:', err);
    document.getElementById('user-name').innerText = 'Erro';
  }
});

// ➕ Abre o modal ao clicar no botão de adicionar consulta
const modal = new bootstrap.Modal(document.getElementById('modalConsulta'));
const btnAdd = document.getElementById('btn-add-consulta');
if (btnAdd) {
  btnAdd.addEventListener('click', () => modal.show());
}

// ✅ Lida com o envio do formulário de nova consulta
const form = document.getElementById('form-consulta');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nomeCrianca = document.getElementById('nomeCrianca').value;
  const dataConsulta = document.getElementById('dataConsulta').value;
  const profissional = document.getElementById('profissional').value;

  const { error: insertError } = await supabase.from('consultas').insert([{
    user_id: userId,
    nome_crianca: nomeCrianca,
    data_consulta: dataConsulta,
    profissional
  }]);

  if (insertError) {
    alert('Erro ao adicionar consulta: ' + insertError.message);
  } else {
    alert('Consulta adicionada com sucesso!');
    modal.hide();
    form.reset();
    location.reload();
  }
});
