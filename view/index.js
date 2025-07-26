const oldMenu = document.getElementById('debug-menu');
if (oldMenu) oldMenu.remove();
const oldToggle = document.getElementById('menu-toggle');
if (oldToggle) oldToggle.remove();

const seen = new Set();
let count = 1;

function renderElements(menu) {
  seen.clear();
  count = 1;

  // Remove todos os elementos listados, exceto botões fixos
  Array.from(menu.querySelectorAll('.element-item')).forEach(e => e.remove());

  const elems = Array.from(document.body.getElementsByTagName('*'));
  elems.forEach(el => {
    const rect = el.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area < 100) return;
    const id = el.id ? el.id : '__no_id__';
    const key = el.tagName + '::' + id + '::' + Math.round(rect.width) + 'x' + Math.round(rect.height);
    if (seen.has(key)) return;
    seen.add(key);

    const tag = el.tagName;
    const idLabel = el.id ? ('#' + el.id) : '(sem id)';

    const item = document.createElement('div');
    item.className = 'element-item';
    item.style.marginBottom = '8px';
    item.style.borderBottom = '1px solid #ccc';
    item.innerHTML = `<b>#${count++}</b> - Tag: ${tag} ${idLabel} [${Math.round(rect.width)}×${Math.round(rect.height)}] <br>`;

    item.onmousedown = item.ontouchstart = () => {
      el.style.outline = '3px solid rgba(255,255,0,0.4)';
      el.style.transition = 'outline 0.3s';
    };
    item.onmouseup = item.ontouchend = () => {
      el.style.outline = '';
    };

    const btn1 = document.createElement('button');
    btn1.innerText = '🕶️ Ocultar';
    btn1.onclick = () => { el.style.display = 'none'; };

    const btn2 = document.createElement('button');
    btn2.innerText = '🎯 Centralizar';
    btn2.onclick = () => {
      el.style.position = 'fixed';
      el.style.top = '50%';
      el.style.left = '50%';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.zIndex = '9999';
    };

    const btn3 = document.createElement('button');
    btn3.innerText = '🧙 Ajustar';
    btn3.onclick = () => {
      el.style.maxWidth = '100vw';
      el.style.maxHeight = '100vh';
      el.style.width = 'auto';
      el.style.height = 'auto';
    };

    [btn1, btn2, btn3].forEach(b => {
      b.style.margin = '2px';
      b.style.fontSize = '10px';
    });

    item.appendChild(btn1);
    item.appendChild(btn2);
    item.appendChild(btn3);
    menu.appendChild(item);
  });
}

const menu = document.createElement('div');
menu.id = 'debug-menu';
menu.style.position = 'fixed';
menu.style.top = '10px';
menu.style.right = '10px';
menu.style.width = '90vw';
menu.style.maxWidth = '300px';
menu.style.background = 'rgba(255,255,255,0.95)';
menu.style.color = 'black';
menu.style.zIndex = '99999';
menu.style.padding = '10px';
menu.style.maxHeight = '80vh';
menu.style.overflowY = 'auto';
menu.style.fontSize = '12px';
menu.style.borderRadius = '8px';
menu.style.boxShadow = '0 0 10px gray';
menu.style.backdropFilter = 'blur(4px)';
menu.innerHTML = '<b>🧠 Elementos Detectados</b><br><br>';

const closeBtn = document.createElement('button');
closeBtn.innerText = '✖';
closeBtn.style.position = 'absolute';
closeBtn.style.top = '5px';
closeBtn.style.right = '5px';
closeBtn.style.background = 'red';
closeBtn.style.color = 'white';
closeBtn.style.border = 'none';
closeBtn.style.borderRadius = '4px';
closeBtn.style.padding = '2px 5px';
closeBtn.style.cursor = 'pointer';
closeBtn.onclick = () => {
  menu.remove();
  toggleBtn.style.display = 'flex';
};
menu.appendChild(closeBtn);

const refreshBtn = document.createElement('button');
refreshBtn.innerText = '🔄 ?';
refreshBtn.style.background = '#007BFF';
refreshBtn.style.color = 'white';
refreshBtn.style.border = 'none';
refreshBtn.style.borderRadius = '4px';
refreshBtn.style.padding = '4px 8px';
refreshBtn.style.marginBottom = '10px';
refreshBtn.style.cursor = 'pointer';
refreshBtn.onclick = () => {
  renderElements(menu);
};
menu.appendChild(refreshBtn);

renderElements(menu);

const toggleBtn = document.createElement('div');
toggleBtn.id = 'menu-toggle';
toggleBtn.innerText = '📋';
toggleBtn.style.position = 'fixed';
toggleBtn.style.bottom = '20px';
toggleBtn.style.left = '20px';
toggleBtn.style.width = '40px';
toggleBtn.style.height = '40px';
toggleBtn.style.background = 'black';
toggleBtn.style.color = 'white';
toggleBtn.style.borderRadius = '8px';
toggleBtn.style.display = 'flex';
toggleBtn.style.alignItems = 'center';
toggleBtn.style.justifyContent = 'center';
toggleBtn.style.zIndex = '99998';
toggleBtn.style.cursor = 'move';

let isDragging = false, offsetX, offsetY;
toggleBtn.onmousedown = e => {
  isDragging = true;
  offsetX = e.clientX - toggleBtn.getBoundingClientRect().left;
  offsetY = e.clientY - toggleBtn.getBoundingClientRect().top;
};
document.onmousemove = e => {
  if (!isDragging) return;
  toggleBtn.style.left = (e.clientX - offsetX) + 'px';
  toggleBtn.style.top = (e.clientY - offsetY) + 'px';
};
document.onmouseup = () => { isDragging = false; };

toggleBtn.onclick = () => {
  document.body.appendChild(menu);
  toggleBtn.style.display = 'none';
};

document.body.appendChild(menu);
document.body.appendChild(toggleBtn);