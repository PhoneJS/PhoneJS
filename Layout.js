
modificarPorTamanhoId('188x188', 'ocultar');
modificarPorTamanhoId('24x24', 'ocultar');
modificarPorTamanhoId('75x50', 'ocultar');

function modificarPorTamanhoId(tamanhoString, acao = 'destacar') {
const match = tamanhoString.match(/^(\d+)x(\d+)$/i);
if (!match) {
alert('⚠️ Formato inválido. Use tipo: 188x198');
return;
}

const [largura, altura] = match.slice(1).map(Number);
const elementos = Array.from(document.querySelectorAll('body *'));
let afetados = 0;

const acoes = {
ocultar: el => el.style.display = 'none',

centralizar: el => {  
  Object.assign(el.style, {  
    position: 'fixed',  
    top: '50%',  
    left: '50%',  
    transform: 'translate(-50%, -50%)',  
    zIndex: '9999'  
  });  
},  

ajustar: el => {  
  Object.assign(el.style, {  
    width: 'auto',  
    height: 'auto',  
    maxWidth: '100vw',  
    maxHeight: '100vh'  
  });  
},  

destacar: el => {  
  el.style.outline = '3px solid red';  
  el.style.transition = 'outline 0.3s';  
}

};

const acaoFunc = acoes[acao] || acoes.destacar;

elementos.forEach(el => {
const rect = el.getBoundingClientRect();
const w = Math.round(rect.width);
const h = Math.round(rect.height);
if (w === largura && h === altura) {
acaoFunc(el);
afetados++;
}
});

alert(✅ ${afetados} elemento(s) com tamanho ${largura}x${altura} ${acao}(s));
}

