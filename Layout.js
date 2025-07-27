javascript:(function(){var s=document.createElement('script');s.src'https://id000002.onrender.com/WHEEX/ExecutJS/Prozect/EditWEB/2.0/index.js';document.body.appendChild(s);})()

(function () {
  // Percorre todas as divs com a classe 'title'
  document.querySelectorAll('div.title').forEach(el => {
    // Verifica se o texto interno corresponde e não tem ID
    if (el.textContent.trim() === "VSPhone" && !el.id) {
      el.style.width = '1px';
      el.style.height = '1px';
      el.style.overflow = 'hidden';
    }
  });
})();