(function () {
  if (window.__debugMenuRunning__) return;
  window.__debugMenuRunning__ = true;

  // Remove anteriores
  ['debug-menu', 'menu-toggle', 'edit-dialog'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  const seen = new Set();
  const menu = document.createElement('div');
  menu.id = 'debug-menu';
  Object.assign(menu.style, {
    position: 'fixed', top: '10px', right: '10px', width: '90vw', maxWidth: '300px',
    background: 'rgba(255,255,255,0.95)', color: 'black', zIndex: 99999, padding: '10px',
    maxHeight: '80vh', overflowY: 'auto', fontSize: '12px', borderRadius: '8px',
    boxShadow: '0 0 10px gray', backdropFilter: 'blur(4px)'
  });
  menu.innerHTML = '<b>🧠 Elementos Detectados</b><br><br>';

  const closeBtn = document.createElement('button');
  closeBtn.innerText = '✖';
  Object.assign(closeBtn.style, {
    position: 'absolute', top: '5px', right: '5px',
    background: 'red', color: 'white', border: 'none',
    borderRadius: '4px', padding: '2px 5px', cursor: 'pointer'
  });
  closeBtn.onclick = () => {
    menu.remove();
    toggleBtn.style.display = 'flex';
  };
  menu.appendChild(closeBtn);
  document.body.appendChild(menu);

  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'menu-toggle';
  toggleBtn.innerText = '📋';
  Object.assign(toggleBtn.style, {
    position: 'fixed', bottom: '20px', left: '20px', width: '40px', height: '40px',
    background: 'black', color: 'white', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 99998, cursor: 'move'
  });

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
  document.body.appendChild(toggleBtn);

  let count = 1;
  function renderElements() {
    const elems = Array.from(document.body.getElementsByTagName('*'));
    elems.forEach(el => {
      const rect = el.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area < 100) return;

      const id = el.id || '__no_id__';
      const key = el.tagName + '::' + id + '::' + Math.round(rect.width) + 'x' + Math.round(rect.height);
      if (seen.has(key)) return;
      seen.add(key);

      const tag = el.tagName;
      const idLabel = el.id ? ('#' + el.id) : '(sem id)';

      const item = document.createElement('div');
      item.style.marginBottom = '8px';
      item.style.borderBottom = '1px solid #ccc';
      item.innerHTML = `<b>#${count++}</b> - Tag: ${tag} ${idLabel} [${Math.round(rect.width)}×${Math.round(rect.height)}] <br>`;

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

  renderElements();
  setInterval(renderElements, 2000); // Atualiza automaticamente

  // ========== Diálogo flutuante ==========
  const dialog = document.createElement('div');
  dialog.id = 'edit-dialog';
  Object.assign(dialog.style, {
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#fff', padding: '20px', border: '1px solid #000',
    zIndex: '100000', display: 'none',
    boxShadow: '0 0 20px rgba(0,0,0,0.4)', borderRadius: '10px',
    width: '90vw', maxWidth: '400px'
  });

  const dialogTitle = document.createElement('h3');
  dialogTitle.innerText = 'Editar Elemento';
  dialog.appendChild(dialogTitle);

  const infoText = document.createElement('div');
  infoText.style.fontSize = '12px';
  infoText.style.whiteSpace = 'pre-wrap';
  infoText.style.marginBottom = '10px';
  infoText.style.maxHeight = '150px';
  infoText.style.overflowY = 'auto';
  infoText.style.border = '1px solid #ccc';
  infoText.style.padding = '8px';
  infoText.style.background = '#f9f9f9';
  dialog.appendChild(infoText);

  const chkOcultar = document.createElement('input');
  chkOcultar.type = 'checkbox';
  const lbl1 = document.createElement('label');
  lbl1.innerText = ' Ocultar';
  dialog.appendChild(chkOcultar); dialog.appendChild(lbl1); dialog.appendChild(document.createElement('br'));

  const chkCentralizar = document.createElement('input');
  chkCentralizar.type = 'checkbox';
  const lbl2 = document.createElement('label');
  lbl2.innerText = ' Centralizar';
  dialog.appendChild(chkCentralizar); dialog.appendChild(lbl2); dialog.appendChild(document.createElement('br'));

  const chkAjustar = document.createElement('input');
  chkAjustar.type = 'checkbox';
  const lbl3 = document.createElement('label');
  lbl3.innerText = ' Ajustar';
  dialog.appendChild(chkAjustar); dialog.appendChild(lbl3); dialog.appendChild(document.createElement('br'));

  const btnAplicar = document.createElement('button');
  btnAplicar.innerText = 'Atualizar Modificação';
  btnAplicar.style.marginTop = '10px';
  dialog.appendChild(btnAplicar);

  const btnFechar = document.createElement('button');
  btnFechar.innerText = 'Fechar';
  btnFechar.style.marginLeft = '10px';
  btnFechar.onclick = () => dialog.style.display = 'none';
  dialog.appendChild(btnFechar);

  document.body.appendChild(dialog);

  let elementoSelecionado = null;

  document.addEventListener('click', (e) => {
    if (
      e.target.closest('#debug-menu') ||
      e.target.closest('#edit-dialog') ||
      e.target === toggleBtn
    ) return;

    e.preventDefault();
    e.stopPropagation();

    if (elementoSelecionado) elementoSelecionado.style.background = '';

    elementoSelecionado = e.target;
    elementoSelecionado.style.background = 'rgba(255, 255, 0, 0.3)';

    // Exibir dados no TextView
    const rect = elementoSelecionado.getBoundingClientRect();
    infoText.innerText =
      `📌 Tag: ${elementoSelecionado.tagName}\n` +
      `🆔 ID: ${elementoSelecionado.id || '(sem id)'}\n` +
      `🎯 Classes: ${elementoSelecionado.className || '(nenhuma)'}\n` +
      `📐 Tamanho: ${Math.round(rect.width)}x${Math.round(rect.height)}\n` +
      `📝 Texto: ${elementoSelecionado.innerText?.trim().slice(0, 300) || '(vazio)'}`;

    chkOcultar.checked = false;
    chkCentralizar.checked = false;
    chkAjustar.checked = false;
    dialog.style.display = 'block';
  }, true);

  btnAplicar.onclick = () => {
    if (!elementoSelecionado) return;

    if (chkOcultar.checked) elementoSelecionado.style.display = 'none';
    if (chkCentralizar.checked) {
      Object.assign(elementoSelecionado.style, {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', zIndex: '9999'
      });
    }
    if (chkAjustar.checked) {
      Object.assign(elementoSelecionado.style, {
        maxWidth: '100vw', maxHeight: '100vh', width: 'auto', height: 'auto'
      });
    }

    dialog.style.display = 'none';
  };
})();