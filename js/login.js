// Importa o Supabase
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hhpbxjewebtulodkkfag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGJ4amV3ZWJ0dWxvZGtrZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMzNjUsImV4cCI6MjA2MjcxOTM2NX0.U-tDxEHyb1ZkViwobP7nHiZbXwVx1vtpO-r-3EESppw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Evento de envio do formulário
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const lembrar = document.getElementById('remember').checked;

  // 🔐 Etapa 1: Login com email e password
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError || !loginData.session) {
    alert("Email ou senha incorretos.");
    return;
  }

  // ✅ Etapa 2: Verifica se está autorizado (tem conta na tabela 'users')
  const sessionEmail = loginData.session.user.email;

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', sessionEmail)
    .maybeSingle();

  if (userError || !userData) {
    alert("Este email não está autorizado.");
    return;
  }

  // 💾 Guardar email local se checkbox estiver ativo
  if (lembrar) {
    localStorage.setItem('lembrar', 'true');
    localStorage.setItem('email', sessionEmail);
  } else {
    localStorage.removeItem('lembrar');
    localStorage.removeItem('email');
  }

  // 🔀 Redirecionamento baseado no tipo de utilizador
  if ('numero_cedula' in userData && userData.numero_cedula !== null && userData.numero_cedula !== '') {
    window.location.href = "home_ps.html"; // Página de profissional de saúde
  } else {
    window.location.href = "home.html"; // Página de encarregado de educação
  }
});

// Verificação automática ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
  const lembrar = localStorage.getItem('lembrar');
  const email = localStorage.getItem('email');

  if (lembrar === 'true' && email) {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (session && session.user) {
      const sessionEmail = session.user.email;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', sessionEmail)
        .maybeSingle();

      if (userData && !userError) {
        if ('numero_cedula' in userData && userData.numero_cedula !== null && userData.numero_cedula !== '') {
          window.location.href = "home_ps.html";
        } else {
          window.location.href = "home.html";
        }
      }
    }
  }
});
