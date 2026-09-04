// Contact form: sends directly via Web3Forms (https://web3forms.com), a free
// form-to-email API — no backend of our own needed. Works the same on both
// theme pages. Requires a real access_key (see the hidden input in the form)
// obtained by signing up at web3forms.com with the receiving email address.
(function () {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const status = document.querySelector('#cf-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn ? submitBtn.innerHTML : '';

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const accessKey = form.access_key.value.trim();
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      if (status) status.textContent = '아직 이메일 전송 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.';
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '전송 중…'; }
    if (status) { status.textContent = ''; status.classList.remove('is-error'); }

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await res.json();

      if (result.success) {
        form.reset();
        if (status) status.textContent = '문의가 정상적으로 전송되었습니다. 빠르게 확인 후 답변드리겠습니다.';
      } else {
        throw new Error(result.message || '전송에 실패했습니다.');
      }
    } catch (err) {
      if (status) {
        status.textContent = '전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        status.classList.add('is-error');
      }
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = submitLabel; }
    }
  });
})();
