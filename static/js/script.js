document.addEventListener('DOMContentLoaded', function () {
    const copyBtn = document.getElementById('copy-btn');
    const bibtexContent = document.getElementById('bibtex-content');

    if (copyBtn && bibtexContent) {
        copyBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const text = bibtexContent.textContent;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    showNotification();
                }).catch(function (err) {
                    fallbackCopy(text);
                });
            } else {
                fallbackCopy(text);
            }
        });
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            showNotification();
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }
        document.body.removeChild(textarea);
    }

    let copyTimeout;

    function showNotification() {
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';

        if (copyTimeout) clearTimeout(copyTimeout);

        copyTimeout = setTimeout(function () {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
        }, 2000);
    }
});
