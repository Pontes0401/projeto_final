// Importa a biblioteca do Supabase
import { createClient } from '@supabase/supabase-js';

// Define a URL e a chave pública (anon) do projeto Supabase
const supabaseUrl = 'https://hhpbxjewebtulodkkfag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGJ4amV3ZWJ0dWxvZGtrZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMzNjUsImV4cCI6MjA2MjcxOTM2NX0.U-tDxEHyb1ZkViwobP7nHiZbXwVx1vtpO-r-3EESppw';
const supabase = createClient(supabaseUrl, supabaseKey); // Cria a instância de conexão com o Supabase

// Objeto para guardar temporariamente os dados do formulário da 1ª etapa
let formDataStep1 = {};

// Função para validar se o email inserido tem um formato válido
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

// Alterna entre modo normal e modo "profissional de saúde"
window.toggleHealthMode = function () {
  const isHealth = document.getElementById("health-professional").checked; // Verifica se o checkbox está ativo
  const cedulaField = document.getElementById("cedula-field"); // Campo do número de cédula
  const btnDynamic = document.getElementById("btn-dynamic"); // Botão do formulário

  if (isHealth) {
    // Se for profissional de saúde, mostra o campo de cédula e altera o texto do botão
    cedulaField.classList.remove("d-none");
    btnDynamic.innerText = "Concluído";
  } else {
    // Se não for, esconde o campo e define o botão como "Seguinte"
    cedulaField.classList.add("d-none");
    btnDynamic.innerText = "Seguinte";
  }
}

// Função executada quando o botão de ação (seguinte ou concluído) é clicado
window.handleAction = async function () {
  const isHealth = document.getElementById("health-professional").checked;
  await validarStep1(isHealth); // Valida a primeira etapa
}

// Volta para a primeira etapa do formulário (útil para corrigir dados)
window.goToStep1 = function () {
  document.getElementById("form-step-2").classList.add("d-none");
  document.getElementById("form-step-1").classList.remove("d-none");
}

// Valida e envia os dados da 2ª etapa (filhos) para o Supabase
window.validarStep2 = function () {
  const numeroFilhos = document.getElementById("numeroFilhos").value.trim();
  const nomeCrianca = document.getElementById("nomeCrianca").value.trim();
  const dataNascimentoCrianca = document.getElementById("dataNascimentoCrianca").value.trim();

  // Guarda todos os dados junto com os da primeira etapa
  guardarRegistoFinal({
    numeroFilhos,
    nomeCrianca,
    data_nascimento_crianca: dataNascimentoCrianca
  });
}

// Função que valida os campos da primeira etapa e prepara os dados
async function validarStep1(isHealth) {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const telemovel = document.getElementById("telemovel").value.trim();
  const dataNascimento = document.getElementById("dataNascimento").value.trim();
  const password = document.getElementById("password").value.trim();
  const numeroCedula = document.getElementById("numeroCedula").value.trim();

  // Verifica se todos os campos obrigatórios foram preenchidos
  if (!nome || !email || !telemovel || !dataNascimento || !password) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  // Valida o formato do email
  if (!validateEmail(email)) {
    alert("Por favor, insira um email válido.");
    return;
  }

  // Se for profissional de saúde, exige a cédula
  if (isHealth && !numeroCedula) {
    alert("Preencha o número de cédula.");
    return;
  }

  // Armazena os dados da primeira etapa em memória
  formDataStep1 = {
    Nome_Completo: nome,
    email,
    telemovel,
    data_nascimento: dataNascimento,
    password,
    numero_cedula: isHealth ? numeroCedula : null
  };

  // Se for profissional de saúde, finaliza já o registo
  if (isHealth) {
    await guardarRegistoFinal({});
  } else {
    // Caso contrário, vai para o próximo passo do formulário
    document.getElementById("form-step-1").classList.add("d-none");
    document.getElementById("form-step-2").classList.remove("d-none");
  }
}

// Função que junta todos os dados e salva na base de dados + cria o utilizador na Auth
async function guardarRegistoFinal(step2Data) {
  const { email, password } = formDataStep1;

  // Junta os dados da 1ª e 2ª etapas
  const dadosCompletos = {
    ...formDataStep1,
    numero_filhos: step2Data.numeroFilhos || null,
    Nome_crianca: step2Data.nomeCrianca || null,
    data_nascimento_crianca: step2Data.data_nascimento_crianca || null
  };

  // Insere os dados na tabela 'users' do Supabase
  const { error: dbError } = await supabase.from("users").insert([dadosCompletos]);

  if (dbError) {
    alert("Erro ao guardar dados: " + dbError.message);
    return;
  }

  // Regista o utilizador na autenticação do Supabase
  const { error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError) {
    alert("Erro ao registar utilizador: " + authError.message);
    return;
  }

  // Se tudo correr bem, informa e redireciona para a página inicial
  alert("Registo efetuado com sucesso!");
  window.location.href = "index.html";
}
