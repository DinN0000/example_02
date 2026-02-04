import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials not configured');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pathname, referrer, userAgent } = body;

    // Get visitor IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';

    // Get country from Cloudflare header
    const country = request.headers.get('cf-ipcountry') || 'Unknown';

    // Format timestamp
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    // Create notification message
    const message = `🔔 <b>새 방문자!</b>

📍 <b>IP:</b> ${ip}
🌍 <b>국가:</b> ${country}
📄 <b>페이지:</b> ${pathname || '/'}
🔗 <b>출처:</b> ${referrer || 'Direct'}
🕐 <b>시간:</b> ${timestamp}

📱 <b>브라우저:</b>
<code>${userAgent?.substring(0, 100) || 'Unknown'}...</code>`;

    await sendTelegramMessage(message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Visit tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
