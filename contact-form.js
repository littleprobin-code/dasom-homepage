// Contact form: submits to mail.php, a small PHP script that runs on our own
// Cafe24 웹호스팅 (PHP mail()) and sends the form as an email — including the
// optional file attachment. Works the same on both theme pages since both
// forms share this file and post to the same mail.php sitting next to them.
// See mail.php for the one setting that must be filled in (the receiving
// email address) before this goes live.
(function () {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const status = document.querySelector('#cf-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn ? submitBtn.innerHTML : '';
  const fileInput = form.querySelector('#cf-file');
  const fileNameLabel = document.querySelector('#cf-file-name');
  const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB — mail.php 쪽 제한과 동일하게 맞춰둠

  if (fileInput && fileNameLabel) {
    fileInput.addEventListener('change', function () {
      const f = fileInput.files && fileInput.files[0];
      fileNameLabel.textContent = f ? f.name : '선택된 파일 없음';
      fileNameLabel.classList.remove('is-error');
      if (f && f.size > MAX_FILE_BYTES) {
        fileNameLabel.textContent = '파일이 너무 큽니다 (최대 5MB)';
        fileNameLabel.classList.add('is-error');
        fileInput.value = '';
      }
    });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const attached = fileInput && fileInput.files && fileInput.files[0];
    if (attached && attached.size > MAX_FILE_BYTES) {
      if (status) { status.textContent = '첨부파일 용량은 5MB 이하만 가능합니다.'; status.classList.add('is-error'); }
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '전송 중…'; }
    if (status) { status.textContent = ''; status.classList.remove('is-error'); }

    try {
      // multipart/form-data 로 전송되어 첨부파일이 다른 필드와 함께 한 번에 올라갑니다.
      const res = await fetch('mail.php', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = await res.json();

      if (result.success) {
        form.reset();
        if (fileNameLabel) { fileNameLabel.textContent = '선택된 파일 없음'; fileNameLabel.classList.remove('is-error'); }
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
