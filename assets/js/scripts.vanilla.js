document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.gallery');
  if (!gallery) return;

  // grille responsive
  gallery.classList.add('gallery-grid');

  // items & tags
  const items = Array.from(gallery.querySelectorAll('.gallery-item'));
  const tags = Array.from(new Set(items.map(img => (img.getAttribute('data-gallery-tag') || '').trim()).filter(Boolean)));

  // barre de filtres (si data-gallery-tag présent)
  let filterBar = null;
  if (tags.length) {
    filterBar = document.createElement('div');
    filterBar.className = 'gallery-filters';
    const makeBtn = (label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gallery-filter';
      b.textContent = label;
      return b;
    };
    const allBtn = makeBtn('Tous');
    allBtn.dataset.filter = '*';
    allBtn.classList.add('active');
    allBtn.setAttribute('aria-pressed', 'true');
    filterBar.appendChild(allBtn);
    tags.forEach(t => {
      const btn = makeBtn(t);
      btn.dataset.filter = t;
      filterBar.appendChild(btn);
    });
    gallery.parentNode.insertBefore(filterBar, gallery);

    // Filter behavior (remplace écouteur existant par celui-ci)
filterBar.addEventListener('click', (e) => {
  const btn = e.target.closest('button.gallery-filter');
  if (!btn) return;

  // bascule l'état actif (visuel + a11y)
  filterBar.querySelectorAll('button.gallery-filter').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');

  const tag = btn.dataset.filter;
  items.forEach(img => {
    const itag = (img.getAttribute('data-gallery-tag') || '').trim();
    const show = tag === '*' || itag === tag;
    const cell = img.closest('.gallery-cell');
    if (cell) cell.classList.toggle('hidden', !show);
    else img.style.display = show ? '' : 'none';
  });
});
}

  // wrapper cell pour homogénéité
  const cellWrap = (el) => {
    const cell = document.createElement('div');
    cell.className = 'gallery-cell';
    el.parentNode.insertBefore(cell, el);
    cell.appendChild(el);
    return cell;
  };
  items.forEach(img => {
    if (!img.closest('.gallery-cell')) cellWrap(img);
  });

  // lightbox
  const lb = (() => {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox hidden';
    overlay.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-content" role="dialog" aria-modal="true">
        <button class="lightbox-close" aria-label="Fermer">&times;</button>
        <button class="lightbox-prev" aria-label="Précédent">&#10094;</button>
        <img class="lightbox-img" alt=""/>
        <button class="lightbox-next" aria-label="Suivant">&#10095;</button>
        <div class="lightbox-caption" aria-live="polite"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    const imgEl = overlay.querySelector('.lightbox-img');
    const capEl = overlay.querySelector('.lightbox-caption');
    let currentIndex = -1;
    const visibleItems = () => items.filter(img => {
      const cell = img.closest('.gallery-cell');
      return cell ? !cell.classList.contains('hidden') : img.style.display !== 'none';
    });

    function openAt(index) {
      const vis = visibleItems();
      if (!vis.length) return;
      currentIndex = Math.max(0, Math.min(index, vis.length - 1));
      const img = vis[currentIndex];
      imgEl.src = img.src;
      imgEl.alt = img.alt || '';
      capEl.textContent = img.alt || '';
      overlay.classList.remove('hidden');
      document.documentElement.classList.add('no-scroll');
      overlay.querySelector('.lightbox-close').focus();
    }
    function close() {
      overlay.classList.add('hidden');
      document.documentElement.classList.remove('no-scroll');
    }
    function next() { openAt(currentIndex + 1); }
    function prev() { openAt(currentIndex - 1); }

    overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('lightbox-backdrop') || e.target.classList.contains('lightbox-close')) close();
      if (e.target.classList.contains('lightbox-next')) next();
      if (e.target.classList.contains('lightbox-prev')) prev();
    });
    document.addEventListener('keydown', (e) => {
      if (overlay.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    return { openAt, close };
  })();

  // ouverture lightbox au clic
  items.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      const vis = items.filter(x => {
        const cell = x.closest('.gallery-cell');
        return cell ? !cell.classList.contains('hidden') : x.style.display !== 'none';
      });
      const index = vis.indexOf(img);
      lb.openAt(index === -1 ? i : index);
    });
  });
});
