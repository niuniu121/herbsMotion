<template>
  <div class="herbsie-container">
    <button v-if="!isOpen" class="floating-ball" @click="openChat">
      <span class="icon"><img src="../assets/logo_opacity.svg" alt="Herbsie" /></span>
    </button>

    <div v-else class="chat-window">
      <div class="chat-header">
        <div class="bot-info">
          <div class="avatar-elegant">H</div>
          <div class="header-text">
            <div class="name">Herbsie</div>
            <div class="status">Clinic Assistant</div>
          </div>
        </div>
        <button class="close-btn" @click="closeChat">×</button>
      </div>

      <div class="chat-content" ref="scrollBox">
        <div v-for="(msg, index) in messages" :key="index" :class="['msg-row', msg.role]">
          <div class="bubble" v-html="msg.text"></div>
        </div>
      </div>

      <div class="options-area">
        <div class="tags-header">
          <span>Quick FAQ</span>
        </div>

        <div class="tags-scroll">
          <button
            v-for="(item, index) in faqDatabase"
            :key="index"
            @click="handleSelect(item)"
            class="tag-btn"
            type="button"
            :disabled="isSubmitting"
          >
            {{ item.q }}
          </button>
        </div>
      </div>

      <div class="input-area">
        <input
          v-model="userInput"
          @keyup.enter="handleSend"
          placeholder="Type your question..."
          :disabled="isSubmitting"
        />
        <button @click="handleSend" class="send-btn" :disabled="isSubmitting">
          <span v-if="!isSubmitting">➤</span>
          <span v-else>...</span>
        </button>
      </div>
    </div>

    <!-- Lead Popup -->
    <div v-if="showLeadModal" class="lead-modal-overlay" @click.self="handleLeadBack">
      <div class="lead-modal">
        <div class="lead-modal-header">
          <div>
            <p class="lead-kicker">Contact our team</p>
            <h3>Leave your details</h3>
          </div>
          <button class="lead-close-btn" @click="handleLeadBack">×</button>
        </div>

        <p class="lead-desc">
          We could not find a close FAQ match for your question. Please leave your details below and
          our team will get back to you.
        </p>

        <div class="lead-question-box">
          <span class="lead-question-label">Your question</span>
          <p>{{ pendingQuestion }}</p>
        </div>

        <form class="lead-form" @submit.prevent="submitLead">
          <div class="lead-field">
            <label for="lead-name">Name</label>
            <input
              id="lead-name"
              v-model.trim="leadForm.name"
              type="text"
              placeholder="Your full name"
              :disabled="isSubmitting"
            />
            <span v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span>
          </div>

          <div class="lead-field">
            <label for="lead-email">Email</label>
            <input
              id="lead-email"
              v-model.trim="leadForm.email"
              type="email"
              placeholder="your@email.com"
              :disabled="isSubmitting"
            />
            <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
          </div>

          <div class="lead-field">
            <label for="lead-phone">Phone</label>
            <input
              id="lead-phone"
              v-model.trim="leadForm.phone"
              type="text"
              placeholder="Your phone number"
              :disabled="isSubmitting"
            />
            <span v-if="fieldErrors.phone" class="field-error">{{ fieldErrors.phone }}</span>
          </div>

          <div class="lead-actions">
            <button type="button" class="back-btn" @click="handleLeadBack" :disabled="isSubmitting">
              Back
            </button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="!isSubmitting">Submit</span>
              <span v-else>Sending...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const isOpen = ref(false)
const userInput = ref('')
const scrollBox = ref(null)
const isSubmitting = ref(false)

const messages = ref([
  {
    role: 'bot',
    text: "Hi! I'm Herbsie. Please select a question below, or type your own.",
  },
])

const faqDatabase = [
  {
    q: 'Do you have parking?',
    keywords: ['parking', 'park', 'car', 'drive'],
    a: 'There are 3 onsite parking bays at the front of the building and 2 at the rear. Additional public parking is available on Canterbury Road and adjoining streets. There are several free 2-hour parking options just a few minutes’ walk from the clinic: Camberwell Station, near Mayston Street, and Market Place.',
  },
  {
    q: 'How long are the sessions?',
    keywords: ['long', 'duration', 'time', 'sessions', 'minutes'],
    a: 'Initial consultations are 40 minutes. Follow-up consultations range from 20–60 minutes, depending on the complexity of your condition.',
  },
  {
    q: 'What do I need to bring?',
    keywords: ['bring', 'scans', 'results', 'documents'],
    a: 'If you have had scans or other investigations, please bring the results. If you have a care plan referral, WorkCover, TAC, or Home Care docs, bring them or email them to info@herbsmotion.com.au.',
  },
  {
    q: 'Do I need a referral?',
    keywords: ['referral', 'doctor', 'gp letter'],
    a: 'No, you do not need a referral to be seen. However, we welcome any referral letters or reports from your treating doctor.',
  },
  {
    q: 'Treatment while menstruating?',
    keywords: ['menstruating', 'menstrual', 'period', 'women'],
    a: 'Yes, our Women’s Health Physio treats patients during all stages of their menstrual cycle.',
  },
  {
    q: 'How many sessions will I need?',
    keywords: ['how many', 'number of sessions'],
    a: 'The number of sessions will vary depending on the type and severity of your injury. Your physio will provide an expected timeframe during your initial appointment.',
  },
  {
    q: 'Does Medicare rebate costs?',
    keywords: ['medicare', 'rebate', 'cdmp'],
    a: 'A Medicare rebate of $61.80 applies to clients who have a current Chronic Disease Management Plan from their GP. This allows rebates for up to 5 sessions per calendar year.',
  },
  {
    q: 'Private health insurance claims?',
    keywords: [
      'private health',
      'insurance',
      'hicaps',
      'medibank',
      'bupa',
      'phoenix',
      'hcf',
      'nib',
    ],
    a: 'If you have extras cover, you can claim on the spot via our HICAPS machine. We accept all major insurers, including Medibank, Bupa, Phoenix, HCF, and NIB.',
  },
  {
    q: 'What should I wear?',
    keywords: ['wear', 'clothing', 'clothes', 'shorts'],
    a: 'Please wear clothing that allows easy access to the area of injury. Shorts and a singlet are suitable for most conditions.',
  },
  {
    q: 'What if I can’t make an appointment?',
    keywords: ['cancel', 'miss', 'reschedule', 'notice'],
    a: 'We require at least 24 hours’ notice for cancellations. A $50 fee will apply if less than 24 hours’ notice is given.',
  },
  {
    q: 'Do you accept WorkCover?',
    keywords: ['workcover', 'work cover'],
    a: 'Yes, we welcome WorkCover clients. Once your medical excess has been met, we can invoice your insurer directly with no out-of-pocket costs.',
  },
  {
    q: 'Do you accept TAC clients?',
    keywords: ['tac'],
    a: 'Yes, we welcome TAC clients. We can submit invoices directly to TAC on your behalf with no out-of-pocket fees, provided you have met the excess.',
  },
  {
    q: 'Do you accept Home Care Packages?',
    keywords: ['home care', 'package', 'happy living'],
    a: 'Yes, we welcome Home Care Package clients. If you are not with one of our partner providers (such as Happy Living), payment is required upfront and we will provide an invoice for reimbursement.',
  },
  {
    q: 'Do you provide home visit services?',
    keywords: ['home visit', 'visit my home'],
    a: 'Yes, although we encourage clients to attend the clinic, some practitioners offer home visits. Please enquire with your treating practitioner.',
  },
]

const showLeadModal = ref(false)
const pendingQuestion = ref('')

const leadForm = ref({
  name: '',
  email: '',
  phone: '',
})

const fieldErrors = ref({
  name: '',
  email: '',
  phone: '',
})

function openChat() {
  isOpen.value = true
  scrollToBottom()
}

function closeChat() {
  isOpen.value = false
  showLeadModal.value = false
}

function normalize(text) {
  return text.trim().toLowerCase()
}

function findFaqMatch(rawText) {
  const text = normalize(rawText)

  for (const item of faqDatabase) {
    const keywordHit = item.keywords.some((k) => text.includes(k.toLowerCase()))
    const questionHit = text.includes(item.q.toLowerCase())
    if (keywordHit || questionHit) return item
  }

  return null
}

function pushUserMessage(text) {
  messages.value.push({ role: 'user', text })
}

function pushBotMessage(text) {
  messages.value.push({ role: 'bot', text })
}

const handleSelect = (item) => {
  if (isSubmitting.value) return

  pushUserMessage(item.q)

  setTimeout(() => {
    pushBotMessage(item.a)
    scrollToBottom()
  }, 250)
}

const handleSend = async () => {
  const raw = userInput.value.trim()
  if (!raw || isSubmitting.value) return

  pushUserMessage(raw)
  userInput.value = ''

  const matchedItem = findFaqMatch(raw)

  setTimeout(async () => {
    if (matchedItem) {
      pushBotMessage(matchedItem.a)
    } else {
      pendingQuestion.value = raw
      resetLeadForm()
      pushBotMessage(
        `I couldn't find a close FAQ match for that question.<br><br>
         Please leave your details in the form and our team will contact you directly.`,
      )
      showLeadModal.value = true
    }

    await scrollToBottom()
  }, 250)
}

function handleLeadBack() {
  showLeadModal.value = false
  resetLeadForm()
}

function resetLeadForm() {
  leadForm.value = {
    name: '',
    email: '',
    phone: '',
  }

  fieldErrors.value = {
    name: '',
    email: '',
    phone: '',
  }
}

function validateLeadForm() {
  const errors = {
    name: '',
    email: '',
    phone: '',
  }

  if (!leadForm.value.name || leadForm.value.name.length < 2) {
    errors.name = 'Please enter your full name.'
  }

  if (!isValidEmail(leadForm.value.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!isValidPhone(leadForm.value.phone)) {
    errors.phone = 'Please enter a valid phone number.'
  }

  fieldErrors.value = errors

  return !errors.name && !errors.email && !errors.phone
}

async function submitLead() {
  if (!validateLeadForm()) return

  try {
    isSubmitting.value = true

    const response = await fetch('/api/chatbot-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: leadForm.value.name,
        email: leadForm.value.email,
        phone: leadForm.value.phone,
        question: pendingQuestion.value,
      }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to send enquiry.')
    }

    showLeadModal.value = false

    pushBotMessage(
      `Thank you — your enquiry has been sent successfully.<br><br>
       Our team will contact you soon via email or phone.`,
    )

    pendingQuestion.value = ''
    resetLeadForm()
    await scrollToBottom()
  } catch (error) {
    pushBotMessage(
      `Sorry, something went wrong while sending your enquiry.<br><br>
       Please try again, or contact us directly at <strong>info@herbsmotion.com.au</strong>.`,
    )
    await scrollToBottom()
  } finally {
    isSubmitting.value = false
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPhone(value) {
  return /^[+\d\s()-]{6,20}$/.test(value)
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollBox.value) {
    scrollBox.value.scrollTop = scrollBox.value.scrollHeight
  }
}
</script>

<style scoped>
.herbsie-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.floating-ball {
  width: 60px;
  height: 60px;
  background: #325b49;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.floating-ball:hover {
  transform: scale(1.05);
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-ball img {
  width: 35px;
  height: 35px;
  object-fit: contain;
}

.chat-window {
  width: 360px;
  height: 550px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.chat-header {
  background: #325b49;
  color: white;
  padding: 15px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bot-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-elegant {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #478067, #1e382d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Georgia', serif;
  font-size: 20px;
  font-style: italic;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.status {
  font-size: 12px;
  color: #aebdb6;
}

.close-btn {
  background: none;
  border: none;
  color: #aebdb6;
  font-size: 28px;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

.chat-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f7f9f8;
}

.msg-row {
  margin-bottom: 12px;
  display: flex;
}

.msg-row.bot {
  justify-content: flex-start;
}

.msg-row.user {
  justify-content: flex-end;
}

.bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.bot .bubble {
  background: white;
  color: #325b49;
  border-bottom-left-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.user .bubble {
  background: #325b49;
  color: white;
  border-bottom-right-radius: 2px;
}

.options-area {
  padding: 10px 15px;
  border-top: 1px solid #eee;
  background: white;
}

.tags-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #72856e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tags-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 130px;
  overflow-y: auto;
  padding-right: 5px;
}

.tags-scroll::-webkit-scrollbar {
  width: 4px;
}

.tags-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tags-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.tags-scroll::-webkit-scrollbar-thumb:hover {
  background: #325b49;
}

.tag-btn {
  background: white;
  border: 1px solid #325b49;
  color: #325b49;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.tag-btn:hover {
  background: #325b49;
  color: white;
}

.tag-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.input-area {
  padding: 12px 15px;
  border-top: 1px solid #eee;
  display: flex;
  background: white;
}

.input-area input {
  flex: 1;
  border: 1px solid #e0e5e4;
  border-radius: 20px;
  padding: 8px 15px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input-area input:focus {
  border-color: #325b49;
}

.input-area input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  background: #325b49;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Modal */
.lead-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(19, 31, 25, 0.34);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}

.lead-modal {
  width: min(420px, 100%);
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(20, 39, 31, 0.22);
  overflow: hidden;
  border: 1px solid rgba(50, 91, 73, 0.08);
}

.lead-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 22px 22px 12px;
}

.lead-kicker {
  margin: 0 0 6px;
  color: #7a8f83;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.lead-modal-header h3 {
  margin: 0;
  color: #244436;
  font-size: 26px;
  line-height: 1.1;
}

.lead-close-btn {
  border: none;
  background: #f3f6f4;
  color: #325b49;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}

.lead-desc {
  margin: 0;
  padding: 0 22px 16px;
  color: #617368;
  font-size: 14px;
  line-height: 1.6;
}

.lead-question-box {
  margin: 0 22px 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f7faf8;
  border: 1px solid #e4ece7;
}

.lead-question-label {
  display: inline-block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #7a8f83;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.lead-question-box p {
  margin: 0;
  color: #325b49;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.lead-form {
  padding: 0 22px 22px;
}

.lead-field {
  margin-bottom: 14px;
}

.lead-field label {
  display: block;
  margin-bottom: 6px;
  color: #274639;
  font-size: 13px;
  font-weight: 700;
}

.lead-field input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d9e3dd;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.lead-field input:focus {
  border-color: #325b49;
  box-shadow: 0 0 0 4px rgba(50, 91, 73, 0.08);
}

.field-error {
  display: inline-block;
  margin-top: 6px;
  color: #c05252;
  font-size: 12px;
}

.lead-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
}

.back-btn,
.submit-btn {
  flex: 1;
  height: 46px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s,
    opacity 0.2s,
    background 0.2s,
    color 0.2s;
}

.back-btn {
  border: 1px solid #d6e0da;
  background: #fff;
  color: #325b49;
}

.submit-btn {
  border: none;
  background: #325b49;
  color: #fff;
}

.back-btn:hover,
.submit-btn:hover {
  transform: translateY(-1px);
}

.back-btn:disabled,
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 480px) {
  .herbsie-container {
    bottom: 16px;
    right: 16px;
  }

  .chat-window {
    width: calc(100vw - 24px);
    height: min(550px, calc(100vh - 32px));
  }

  .lead-modal {
    border-radius: 20px;
  }

  .lead-modal-header h3 {
    font-size: 22px;
  }

  .lead-actions {
    flex-direction: column;
  }
}
</style>
