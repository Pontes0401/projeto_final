document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('lembrar');
  window.location.href = "index.html";
});
