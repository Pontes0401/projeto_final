document.getElementById("logout").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Erro ao fazer logout:", error.message);
    return;
  }

  localStorage.removeItem('lembrar');
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('supabase.auth.token');

  window.location.href = "index.html";
});
