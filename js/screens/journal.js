
import { get, save, uid } from '../store.js';
import { esc, nav, backLink, dateChip, logDate, prettyDate, timeOf, toast, openSheet, closeSheet } from '../ui.js';

let draft = '';
let editingId = null;

export function mount(root) {
  draft = '';
  editingId = null;

  render(root);

  root.addEventListener('input', e => {
    if (e.target.id !== 'journalText') return;
    draft = e.target.value;

    const button = root.querySelector('[data-savejournal]');
    if (button) button.disabled = !draft.trim();
  });

  root.addEventListener('click', e => {
    const t = e.target;
    let button;

    if ((button = t.closest('[data-savejournal]'))) {
      const text = (root.querySelector('#journalText')?.value || '').trim();
      if (!text) {
        root.querySelector('#journalText')?.focus();
        return;
      }

      const st = get();
      st.journal = st.journal || [];

      st.journal.unshift({
        id: uid(),
        date: logDate(),
        ts: Date.now(),
        text
      });

      draft = '';
      save();
      render(root);
      toast('Saved in your journal.');
      return;
    }

    if ((button = t.closest('[data-editjournal]'))) {
      editEntry(root, button.dataset.editjournal);
      return;
    }

    if ((button = t.closest('[data-deletejournal]'))) {
      deleteEntry(root, button.dataset.deletejournal);
    }
  });
}

function editEntry(root, id) {
  const st = get();
  const entry = (st.journal || []).find(item => item.id === id);
  if (!entry) return;

  openSheet(
    '<h2>Edit journal entry</h2>' +
    '<label class="field-label" for="journalEditText">YOUR ENTRY</label>' +
    '<textarea id="journalEditText" rows="9">' +
      esc(entry.text) +
    '</textarea>' +
    '<button type="button" class="btn" data-journal-action="save">Save changes</button>' +
    '<button type="button" class="btn alt" data-close>Cancel</button>',
    ev => {
      const action = ev.target.closest('[data-journal-action]');
      if (!action) return;

      const text = (
        document.getElementById('journalEditText')?.value || ''
      ).trim();

      if (!text) {
        document.getElementById('journalEditText')?.focus();
        return;
      }

      const current = get();
      const found = (current.journal || []).find(
        item => item.id === id
      );

      if (!found) {
        closeSheet();
        return;
      }

      found.text = text;
      found.edited = Date.now();

      save();
      closeSheet();
      render(root);
      toast('Journal entry updated.');
    }
  );
}

function deleteEntry(root, id) {
  const st = get();
  const entry = (st.journal || []).find(item => item.id === id);
  if (!entry) return;

  openSheet(
    '<h2>Delete this entry?</h2>' +
    '<p class="muted">This entry will be permanently removed from your journal.</p>' +
    '<button type="button" class="btn danger" data-journal-action="delete">Delete entry</button>' +
    '<button type="button" class="btn alt" data-close>Keep entry</button>',
    ev => {
      if (!ev.target.closest('[data-journal-action="delete"]')) return;

      const current = get();
      current.journal = (current.journal || []).filter(
        item => item.id !== id
      );

      save();
      closeSheet();
      render(root);
      toast('Entry deleted.');
    }
  );
}

function render(root) {
  const st = get();
  const entries = (st.journal || []).slice().sort(
    (a, b) => b.ts - a.ts
  );

  root.innerHTML =
    '<div class="top">' +
      backLink('#/mind', 'Mind') +
      dateChip() +
    '</div>' +

    '<div>' +
      '<h1>My journal</h1>' +
      '<p class="sub">A little space for your thoughts, your days and everything in between. Write as much or as little as you like.</p>' +
    '</div>' +

    '<div class="card">' +
      '<label class="field-label" for="journalText">A PAGE FOR TODAY</label>' +
      '<textarea id="journalText" rows="7" placeholder="Dear journal..." aria-label="Write a journal entry">' +
        esc(draft) +
      '</textarea>' +
      '<button type="button" class="btn" data-savejournal' +
        (draft.trim() ? '' : ' disabled') +
      '>Save entry</button>' +
    '</div>' +

    (entries.length
      ? '<div class="lbl">Your entries (' + entries.length + ')</div>' +
        entries.map(entry =>
          '<details class="card journal-entry">' +
            '<summary>' +
              '<b>' + esc(prettyDate(entry.date)) + '</b>' +
              ' <span class="muted">' + esc(timeOf(entry.ts)) + '</span>' +
              '<br><span class="muted">' +
                esc(entry.text.slice(0, 90)) +
                (entry.text.length > 90 ? '…' : '') +
              '</span>' +
            '</summary>' +

            '<p style="white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0">' +
              esc(entry.text) +
            '</p>' +

            (entry.edited
              ? '<p class="muted" style="font-size:12px">Edited</p>'
              : '') +

            '<div class="paperacts">' +
              '<button type="button" class="btn alt" data-editjournal="' +
                esc(entry.id) +
              '">Edit</button>' +

              '<button type="button" class="btn danger" data-deletejournal="' +
                esc(entry.id) +
              '">Delete</button>' +
            '</div>' +
          '</details>'
        ).join('')
      : '<div class="empty">Your journal starts whenever you are ready. Your first page can be about anything.</div>'
    ) +

    '<p class="sub">Your entries are saved on this device with your other Prequel data. Back up your data in Settings to keep a copy.</p>' +

    nav('mind');
}
