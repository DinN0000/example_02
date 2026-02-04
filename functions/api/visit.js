export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { pathname, referrer, userAgent } = body;

    const ip = request.headers.get('cf-connecting-ip') || 'Unknown';
    const country = request.headers.get('cf-ipcountry') || 'Unknown';
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    const message = `🔔 <b>새 방문자!</b>

📍 <b>IP:</b> ${ip}
🌍 <b>국가:</b> ${country}
📄 <b>페이지:</b> ${pathname || '/'}
🔗 <b>출처:</b> ${referrer || 'Direct'}
🕐 <b>시간:</b> ${timestamp}

📱 <b>UA:</b>
<code>${(userAgent || 'Unknown').substring(0, 80)}...</code>`;

    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
