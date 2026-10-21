(() => {
  const form = document.querySelector('.enquiry-form');
  const button = form.querySelector('[type="submit"]');
  const status = document.createElement('p');
  status.className = 'send-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  button.after(status);
  const fallback = document.createElement('p');
  fallback.className = 'form-provider';
  fallback.hidden = true;
  const directLink = document.createElement('a');
  directLink.textContent = 'Napisz bezpośrednio: michala85@gmail.com';
  fallback.append(directLink);
  status.after(fallback);
  let state = 'idle';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (state !== 'idle' || !form.reportValidity()) return;
    const payload = Object.fromEntries(new FormData(form));
    directLink.href = 'mailto:michala85@gmail.com?subject=' + encodeURIComponent('Zapytanie o wycenę — Mysza Tech') + '&body=' + encodeURIComponent('Usługa: ' + payload.usluga + '\n\n' + payload.message + '\n\nAdres do odpowiedzi: ' + payload.email);
    fallback.hidden = true;
    state = 'sending';
    button.disabled = true;
    button.textContent = 'Wysyłanie…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Trwa wysyłanie zapytania. Nie musisz klikać ponownie.';
    const controller = new AbortController();
    const slow = setTimeout(() => {
      status.textContent = 'Wysyłka trwa dłużej niż zwykle. Czekamy na odpowiedź usługi — nie wysyłaj ponownie.';
    }, 8000);
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) {
        state = 'idle';
        button.disabled = false;
        button.textContent = 'Spróbuj ponownie';
        status.textContent = 'Usługa nie potwierdziła przyjęcia zapytania. Treść została zachowana. Spróbuj później.';
        fallback.hidden = false;
        return;
      }
      state = 'sent';
      form.querySelectorAll('input, select, textarea').forEach(field => field.disabled = true);
      button.textContent = 'Zapytanie przyjęte ✓';
      status.textContent = 'Usługa przyjęła zapytanie do obsługi. Dziękuję! Możesz zamknąć to okno.';
      status.classList.add('send-success');
    } catch (error) {
      state = 'unknown';
      button.textContent = 'Brak potwierdzenia wysyłki';
      status.textContent = (error.name === 'AbortError' ? 'Usługa nie odpowiedziała w ciągu 30 sekund. ' : 'Połączenie z usługą wysyłki nie powiodło się lub odpowiedź była nieprawidłowa. ') + 'Nie wiemy, czy zapytanie zostało przyjęte. Nie ponawiaj go od razu. Treść pozostaje w formularzu; możesz skorzystać z kontaktu e-mail poniżej.';
      fallback.hidden = false;
    } finally {
      clearTimeout(slow);
      clearTimeout(timeout);
      form.setAttribute('aria-busy', 'false');
    }
  });
})();
