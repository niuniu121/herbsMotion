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

        // 发邮件
        const resend = new Resend(String(env.RESEND_API_KEY || '').trim())

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

        // 发 Telegram
        const botToken = String(env.TELEGRAM_BOT_TOKEN || '').trim()
        const chatId = String(env.TELEGRAM_CHAT_ID || '').trim()

        if (!botToken || !chatId) {
            return json(
                {
                    success: false,
                    message: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.',
                    debug: { hasBotToken: !!botToken, hasChatId: !!chatId },
                },
                500
            )
        }

        const telegramText =
            `🌿 New HerbsBo enquiry\n\n` +
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Phone: ${phone}\n\n` +
            `Question:\n${question}`

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                    message: telegramResult.description || 'Failed to send Telegram message.',
                    telegramResult,
                },
                500
            )
        }

        return json(
            {
                success: true,
                email: true,
                telegram: true,
                telegramResult,
                data,
            },
            200
        )
    } catch (error) {
        return json(
            {
                success: false,
                message: error.message || 'Server error.',
            },
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