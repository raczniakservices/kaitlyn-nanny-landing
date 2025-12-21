export interface Env {
    DISCORD_WEBHOOK_URL: string;
    CLIENT_KEY: string;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        if (url.pathname === '/ping') {
            return new Response('ok', { status: 200 });
        }
        if (url.pathname === '/lead' && request.method === 'POST') {
            try {
                const body = await request.json<any>();
                if (!body || body.client_key !== env.CLIENT_KEY) {
                    return new Response('unauthorized', { status: 401 });
                }
                const message = `New lead:\nName: ${body.name}\nPhone: ${body.phone}\nZip: ${body.zip}\nDesc: ${body.description}`;
                if (env.DISCORD_WEBHOOK_URL) {
                    await fetch(env.DISCORD_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: message })
                    });
                }
                return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            } catch (e) {
                return new Response('bad request', { status: 400 });
            }
        }
        return new Response('not found', { status: 404 });
    }
};




