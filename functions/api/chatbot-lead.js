import { Resend } from 'resend'

export async function onRequestPost(context) {
    try {
        const { request, env } = context
        const body = await request.json()

        const type = String(body.type || 'chatbot').trim()

        const name = String(body.name || body.fullName || '').trim()
        const fullName = String(body.fullName || body.name || '').trim()
        const dob = String(body.dob || '').trim()
        const email = String(body.email || '').trim()
        const phone = String(body.phone || '').trim()
        const question = String(body.question || '').trim()
        const notes = String(body.notes || '').trim()
        const language = String(body.language || '').trim()

        const isAppointment = type === 'appointment'

        if (isAppointment) {
            if (!fullName || !dob || !email || !phone) {
                return json(
                    {
                        success: false,
                        message: 'Missing required appointment fields.',
                    },
                    400
                )
            }
        } else {
            if (!name || !email || !phone || !question) {
                return json(
                    {
                        success: false,
                        message: 'Missing required chatbot fields.',
                    },
                    400
                )
            }
        }

        const resendApiKey = String(env.RESEND_API_KEY || '').trim()
        if (!resendApiKey) {
            return json(
                {
                    success: false,
                    message: 'Missing RESEND_API_KEY.',
                },
                500
            )
        }

        const resend = new Resend(resendApiKey)

        const emailSubject = isAppointment
            ? `New appointment request from ${fullName}`
            : `New chatbot enquiry from ${name}`

        const emailHtml = isAppointment
            ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="margin-bottom: 16px;">New Appointment Request</h2>
          <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
          <p><strong>Date of Birth:</strong> ${escapeHtml(dob)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Language:</strong> ${escapeHtml(language || '-')}</p>
          <p><strong>Notes:</strong></p>
          <p>${escapeHtml(notes || '-').replace(/\n/g, '<br>')}</p>
        </div>
      `
            : `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="margin-bottom: 16px;">New Website Chatbot Enquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Question:</strong></p>
          <p>${escapeHtml(question).replace(/\n/g, '<br>')}</p>
        </div>
      `

        const { data, error } = await resend.emails.send({
            from: 'Herbs Motion <noreply@herbsmotion.com.au>',
            to: ['info@herbsmotion.com.au'],
            replyTo: email,
            subject: emailSubject,
            html: emailHtml,
        })

        if (error) {
            return json(
                {
                    success: false,
                    message: error.message || 'Failed to send email.',
                },
                500
            )
        }

        const botToken = String(env.TELEGRAM_BOT_TOKEN || '').trim()
        const chatId = String(env.TELEGRAM_CHAT_ID || '').trim()

        if (!botToken || !chatId) {
            return json(
                {
                    success: false,
                    message: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.',
                    debug: {
                        hasBotToken: !!botToken,
                        hasChatId: !!chatId,
                    },
                },
                500
            )
        }

        const telegramText = isAppointment
            ? [
                '🌿 New Herbs & Motion appointment request',
                '',
                `Full Name: ${fullName}`,
                `Date of Birth: ${dob}`,
                `Email: ${email}`,
                `Phone: ${phone}`,
                `Language: ${language || '-'}`,
                '',
                'Notes:',
                notes || '-',
            ].join('\n')
            : [
                '🌿 New HerbsBo enquiry',
                '',
                `Name: ${name}`,
                `Email: ${email}`,
                `Phone: ${phone}`,
                '',
                'Question:',
                question,
            ].join('\n')

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