const dataPath = 'assets/data/library.json';
let albums = [];
let currentList = [];

const albumsRow = document.getElementById('albumsRow');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const playSpotifyBtn = document.getElementById('playSpotifyBtn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

const albumModalEl = document.getElementById('exampleModal');
const albumModal = new bootstrap.Modal(albumModalEl);

function parseTrackLength(t) {
  const parts = t.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatSeconds(s) {
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  return `${mins}:${String(secs).padStart(2,'0')}`;
}

function renderAlbums(list) {
  albumsRow.innerHTML = '';
  list.forEach(album => {
    const col = document.createElement('div');
    col.className = 'col-xl-2 col-md-3 col-sm-6 col-12 mb-4 d-flex';

    const card = document.createElement('div');
    card.className = 'card h-100 w-100';

    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.src = `assets/img/${album.thumbnail}`;
    img.alt = `${album.artist} - ${album.album}`;

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = album.artist;

    const text = document.createElement('p');
    text.className = 'card-text mb-3';
    text.textContent = album.album;

    const footer = document.createElement('div');
    footer.className = 'card-footer bg-transparent border-0 mt-auto';

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary tracklist-btn';
    btn.textContent = 'View Tracklist';
    btn.dataset.id = album.id;

    body.appendChild(title);
    body.appendChild(text);
    footer.appendChild(btn);

    card.appendChild(img);
    card.appendChild(body);
    card.appendChild(footer);

    col.appendChild(card);
    albumsRow.appendChild(col);
  });
}

function showModalForAlbum(id) {
  const a = albums.find(x => String(x.id) === String(id));
  if (!a) return;
  modalTitle.textContent = `${a.artist} - ${a.album}`;

  // Stats
  const lengths = a.tracklist.map(t => ({...t, seconds: parseTrackLength(t.trackLength)}));
  const total = lengths.reduce((s,t) => s + t.seconds, 0);
  const avg = Math.round(total / lengths.length) || 0;
  const sortedByLength = [...lengths].sort((x,y)=>x.seconds-y.seconds);

  const statsHtml = `
    <div class="mb-3">
      <strong>Total tracks:</strong> ${lengths.length} &nbsp;|&nbsp;
      <strong>Total duration:</strong> ${formatSeconds(total)} &nbsp;|&nbsp;
      <strong>Average:</strong> ${formatSeconds(avg)}
      <div><strong>Shortest:</strong> ${sortedByLength[0].title} (${sortedByLength[0].trackLength}) &nbsp;|&nbsp; <strong>Longest:</strong> ${sortedByLength[sortedByLength.length-1].title} (${sortedByLength[sortedByLength.length-1].trackLength})</div>
    </div>
  `;

  const listItems = lengths.map(t => `
    <li class="mb-2 d-flex justify-content-between align-items-center">
      <a href="${t.url}" target="_blank" rel="noopener" class="link-primary">${t.number}. ${t.title}</a>
      <small class="text-muted">${t.trackLength}</small>
    </li>
  `).join('');

  modalBody.innerHTML = statsHtml + `<ol class="list-unstyled">${listItems}</ol>`;

  playSpotifyBtn.href = a.tracklist && a.tracklist[0] ? a.tracklist[0].url : '#';
  albumModal.show();
}

albumsRow.addEventListener('click', (e) => {
  const btn = e.target.closest('.tracklist-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  showModalForAlbum(id);
});

searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  currentList = albums.filter(a => (`${a.artist} ${a.album}`).toLowerCase().includes(q));
  applySortAndRender();
});

sortSelect.addEventListener('change', () => {
  applySortAndRender();
});

function applySortAndRender() {
  const mode = sortSelect.value;
  let list = [...currentList];
  if (mode === 'artist') list.sort((a,b)=>a.artist.localeCompare(b.artist));
  if (mode === 'album') list.sort((a,b)=>a.album.localeCompare(b.album));
  if (mode === 'tracks-asc') list.sort((a,b)=>a.tracklist.length - b.tracklist.length);
  if (mode === 'tracks-desc') list.sort((a,b)=>b.tracklist.length - a.tracklist.length);
  renderAlbums(list);
}

fetch(dataPath)
  .then(res => res.json())
  .then(data => {
    albums = data;
    currentList = [...albums];
    applySortAndRender();
  })
  .catch(err => {
    albumsRow.innerHTML = '<div class="col-12">Failed to load album data.</div>';
    console.error(err);
  });
