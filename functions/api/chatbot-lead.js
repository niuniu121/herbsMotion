import { Resend } from 'resend'

export async function onRequestPost(context) {
    try {
        const { request, env } = context
        const body = await request.json()

        const name = String(body.name || '').trim()
        const email = String(body.email || '').trim()
        const phone = String(body.phone || '').trim()
        const question = String(body.question || '').trim()

        if (!name || !email || !phone || !question) {
            return json(
                { success: false, message: 'Missing required fields.' },
                400
            )
        }

        // 1) 发邮件（保留你原来的功能）
        const resend = new Resend(env.RESEND_API_KEY)

        const { data, error } = await resend.emails.send({
            from: 'Herbs Motion <noreply@herbsmotion.com.au>',
            to: ['info@herbsmotion.com.au'],
            replyTo: email,
            subject: `New chatbot enquiry from ${name}`,
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="margin-bottom: 16px;">New Website Chatbot Enquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Question:</strong></p>
          <p>${escapeHtml(question).replace(/\n/g, '<br>')}</p>
        </div>
      `,
        })

        if (error) {
            return json(
                { success: false, message: error.message || 'Failed to send email.' },
                500
            )
        }

        // 2) 发 Telegram 通知（新增）
        const botToken = env.TELEGRAM_BOT_TOKEN
        const chatId = env.TELEGRAM_CHAT_ID

        if (!botToken || !chatId) {
            return json(
                {
                    success: false,
                    message: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.',
                },
                500
            )
        }

        const telegramText =
            `🌿 New HerbsBo enquiry\n\n` +
            `Name: ${escapeTelegram(name)}\n` +
            `Email: ${escapeTelegram(email)}\n` +
            `Phone: ${escapeTelegram(phone)}\n\n` +
            `Question:\n${escapeTelegram(question)}`

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: telegramText,
                }),
            }
        )

        const telegramResult = await telegramResponse.json()

        if (!telegramResponse.ok || !telegramResult.ok) {
            return json(
                {
                    success: false,
                    message:
                        telegramResult.description || 'Failed to send Telegram message.',
                },
                500
            )
        }

        return json(
            {
                success: true,
                data,
                telegram: true,
            },
            200
        )
    } catch (error) {
        return json(
            { success: false, message: error.message || 'Server error.' },
            500
        )
    }
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}

function escapeTelegram(str) {
    return String(str)
        .replaceAll('&', '&')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
}