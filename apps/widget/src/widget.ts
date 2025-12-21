(() => {
    const CLIENT_KEY = (document.currentScript as HTMLScriptElement)?.dataset?.key || '';

    // Create floating button
    const button = document.createElement('button');
    button.textContent = 'Get instant quote';
    Object.assign(button.style, {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        padding: '12px 16px',
        background: '#111827',
        color: '#fff',
        border: 'none',
        borderRadius: '9999px',
        cursor: 'pointer',
        zIndex: '2147483647'
    } as CSSStyleDeclaration);

    // Create overlay panel
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.4)',
        display: 'none',
        zIndex: '2147483646'
    } as CSSStyleDeclaration);

    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'fixed',
        top: '0', right: '0', height: '100%', width: '360px',
        maxWidth: '100%',
        background: '#fff',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.2)',
        transform: 'translateX(100%)',
        transition: 'transform 0.25s ease',
        display: 'flex', flexDirection: 'column'
    } as CSSStyleDeclaration);

    const header = document.createElement('div');
    header.textContent = 'Instant Quote';
    Object.assign(header.style, { padding: '16px', fontWeight: 'bold', borderBottom: '1px solid #eee' } as CSSStyleDeclaration);

    const form = document.createElement('form');
    Object.assign(form.style, { padding: '16px', overflowY: 'auto' } as CSSStyleDeclaration);

    const fields: { label: string; name: string; type?: string; attrs?: Record<string, string> }[] = [
        { label: 'Name', name: 'name' },
        { label: 'Phone', name: 'phone', attrs: { inputmode: 'tel' } },
        { label: 'Zip', name: 'zip', attrs: { inputmode: 'numeric', maxLength: '10' } },
        { label: 'Short Description', name: 'description' },
        { label: 'Photo (optional)', name: 'photo', type: 'file' }
    ];

    fields.forEach(f => {
        const wrap = document.createElement('div');
        Object.assign(wrap.style, { marginBottom: '12px' } as CSSStyleDeclaration);
        const label = document.createElement('label');
        label.textContent = f.label;
        Object.assign(label.style, { display: 'block', marginBottom: '4px', fontSize: '14px' } as CSSStyleDeclaration);
        const input = document.createElement(f.type === 'file' ? 'input' : f.name === 'description' ? 'textarea' : 'input') as HTMLInputElement | HTMLTextAreaElement;
        if (f.type) (input as HTMLInputElement).type = f.type;
        Object.assign(input.style, { width: '100%', fontSize: '16px', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' } as CSSStyleDeclaration);
        if (f.attrs) { Object.entries(f.attrs).forEach(([k, v]) => input.setAttribute(k, v)); }
        input.setAttribute('name', f.name);
        wrap.appendChild(label);
        wrap.appendChild(input);
        form.appendChild(wrap);
    });

    const submit = document.createElement('button');
    submit.textContent = 'Submit';
    Object.assign(submit.style, { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer' } as CSSStyleDeclaration);
    form.appendChild(submit);

    const footer = document.createElement('div');
    Object.assign(footer.style, { padding: '12px 16px', fontSize: '12px', color: '#6b7280' } as CSSStyleDeclaration);
    footer.textContent = 'We will text/email you shortly after you submit.';

    panel.appendChild(header);
    panel.appendChild(form);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.body.appendChild(button);

    function openPanel() {
        overlay.style.display = 'block';
        requestAnimationFrame(() => {
            panel.style.transform = 'translateX(0)';
        });
    }
    function closePanel() {
        panel.style.transform = 'translateX(100%)';
        setTimeout(() => { overlay.style.display = 'none'; }, 250);
    }

    button.addEventListener('click', openPanel);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload: Record<string, any> = {
            client_key: CLIENT_KEY,
            name: fd.get('name') || '',
            phone: fd.get('phone') || '',
            zip: fd.get('zip') || '',
            description: fd.get('description') || ''
        };
        try {
            await fetch('http://localhost:8787/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            form.innerHTML = '<p style="padding:16px">Thanks! We\'ll text/email you shortly.</p>';
        } catch {
            form.innerHTML = '<p style="padding:16px;color:#dc2626">Something went wrong. Please try again later.</p>';
        }
    });
})();




