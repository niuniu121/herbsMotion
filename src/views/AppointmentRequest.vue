<template>
  <div class="appointment-page">
    <main class="appointment-main">
      <div class="appointment-shell">
        <section class="appointment-card">
          <div class="top-bar">
            <button class="lang-switch" type="button" @click="toggleLanguage">
              <span class="btn-icon">✦</span>
              {{ isChinese ? 'Switch to English' : '切换到中文' }}
            </button>
          </div>

          <p class="eyebrow">
            {{ isChinese ? 'Appointment Request' : 'Appointment Request' }}
          </p>

          <h1>
            {{ isChinese ? '预约咨询' : 'Book Your Consultation' }}
          </h1>

          <p class="intro-text">
            {{
              isChinese
                ? '请填写以下信息，我们会尽快与您联系并确认预约安排。'
                : 'Please complete the form below and our team will contact you shortly to confirm your appointment.'
            }}
          </p>

          <div class="info-grid">
            <div class="soft-box">
              <p class="soft-box-title">
                {{ isChinese ? '需要填写' : 'What we need' }}
              </p>
              <ul>
                <li>{{ isChinese ? '英文全名' : 'Full name in English' }}</li>
                <li>{{ isChinese ? '出生年月日' : 'Date of birth' }}</li>
                <li>{{ isChinese ? '联系电话' : 'Phone number' }}</li>
                <li>{{ isChinese ? '电子邮箱' : 'Email address' }}</li>
              </ul>
            </div>

            <div class="soft-box clinic-box">
              <p class="soft-box-title">
                {{ isChinese ? '诊所信息' : 'Clinic details' }}
              </p>
              <p>
                {{ isChinese ? '地址：' : 'Address:' }} Elevate Medical, 305 Warrigal Rd, Burwood
                3125
              </p>
              <p>
                {{ isChinese ? '诊所后方提供停车位。' : 'Parking is available behind the clinic.' }}
              </p>
            </div>
          </div>

          <form class="appointment-form" @submit.prevent="handleSubmit">
            <div class="form-grid">
              <div class="form-group">
                <label for="fullName">
                  {{ isChinese ? '英文全名' : 'Full Name in English' }}
                </label>
                <input
                  id="fullName"
                  v-model.trim="form.fullName"
                  type="text"
                  :placeholder="isChinese ? '请输入英文全名' : 'Enter your full name'"
                />
              </div>

              <div class="form-group">
                <label for="dob">
                  {{ isChinese ? '出生年月日' : 'Date of Birth' }}
                </label>
                <input id="dob" v-model="form.dob" type="date" />
              </div>

              <div class="form-group">
                <label for="phone">
                  {{ isChinese ? '联系电话' : 'Phone Number' }}
                </label>
                <input
                  id="phone"
                  v-model.trim="form.phone"
                  type="tel"
                  :placeholder="isChinese ? '请输入联系电话' : 'Enter your phone number'"
                />
              </div>

              <div class="form-group">
                <label for="email">
                  {{ isChinese ? '电子邮箱' : 'Email Address' }}
                </label>
                <input
                  id="email"
                  v-model.trim="form.email"
                  type="email"
                  :placeholder="isChinese ? '请输入电子邮箱' : 'Enter your email address'"
                />
              </div>
            </div>

            <div class="form-group form-group-full">
              <label for="notes">
                {{ isChinese ? '备注（可选）' : 'Notes (Optional)' }}
              </label>
              <textarea
                id="notes"
                v-model.trim="form.notes"
                rows="5"
                :placeholder="isChinese ? '请输入备注信息' : 'Add any notes here'"
              ></textarea>
            </div>

            <p v-if="errorMessage" class="form-message error-message">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="form-message success-message">
              {{ successMessage }}
            </p>

            <div class="action-row">
              <button class="ghost-btn" type="button" @click="resetForm" :disabled="submitting">
                {{ isChinese ? '清空' : 'Clear' }}
              </button>

              <button class="submit-btn" type="submit" :disabled="submitting">
                {{
                  submitting
                    ? isChinese
                      ? '提交中...'
                      : 'Submitting...'
                    : isChinese
                      ? '提交预约'
                      : 'Submit Request'
                }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

const isChinese = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  fullName: '',
  dob: '',
  phone: '',
  email: '',
  notes: '',
})

const currentLanguage = computed(() => (isChinese.value ? 'Chinese' : 'English'))

const toggleLanguage = () => {
  isChinese.value = !isChinese.value
  errorMessage.value = ''
  successMessage.value = ''
}

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validateForm = () => {
  if (!form.fullName || !form.dob || !form.phone || !form.email) {
    errorMessage.value = isChinese.value
      ? '请完整填写姓名、出生年月日、电话和邮箱。'
      : 'Please complete your full name, date of birth, phone number, and email.'
    return false
  }

  if (!isValidEmail(form.email)) {
    errorMessage.value = isChinese.value
      ? '请输入有效的电子邮箱地址。'
      : 'Please enter a valid email address.'
    return false
  }

  return true
}

const resetForm = () => {
  form.fullName = ''
  form.dob = ''
  form.phone = ''
  form.email = ''
  form.notes = ''
  errorMessage.value = ''
  successMessage.value = ''
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) return

  submitting.value = true

  try {
    const response = await fetch('/api/chatbot-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'appointment',
        name: form.fullName,
        fullName: form.fullName,
        dob: form.dob,
        phone: form.phone,
        email: form.email,
        notes: form.notes,
        language: currentLanguage.value,
        question: 'Appointment request form submission',
      }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to submit the form.')
    }

    successMessage.value = isChinese.value
      ? '预约信息已成功提交，我们会尽快与您联系。'
      : 'Your appointment request has been submitted successfully. We will contact you soon.'

    resetForm()
    successMessage.value = isChinese.value
      ? '预约信息已成功提交，我们会尽快与您联系。'
      : 'Your appointment request has been submitted successfully. We will contact you soon.'
  } catch (error) {
    errorMessage.value = isChinese.value
      ? `提交失败：${error.message || '请稍后重试。'}`
      : `Submission failed: ${error.message || 'Please try again later.'}`
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.appointment-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.65), transparent 36%),
    linear-gradient(180deg, #cfdac8 0%, #faf7f2 38%, #f5dfe6 72%, #eed6df 100%);
}

.appointment-main {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.appointment-shell {
  width: 100%;
  max-width: 860px;
}

.appointment-card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 34px;
  box-shadow:
    0 20px 50px rgba(86, 92, 87, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  padding: 34px;
}

.appointment-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(214, 139, 162, 0.1), transparent 28%),
    radial-gradient(circle at bottom left, rgba(207, 218, 200, 0.35), transparent 30%);
  pointer-events: none;
}

.top-bar,
.eyebrow,
h1,
.intro-text,
.info-grid,
.appointment-form {
  position: relative;
  z-index: 1;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(47, 91, 67, 0.1);
  background: rgba(255, 255, 255, 0.78);
  color: #355844;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(47, 91, 67, 0.06);
  transition: all 0.2s ease;
}

.lang-switch:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(47, 91, 67, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.btn-icon {
  font-size: 0.9rem;
  color: #d68ba2;
}

.eyebrow {
  margin: 0 0 10px;
  color: #8a927f;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.appointment-card h1 {
  margin: 0 0 14px;
  color: #2f5b43;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.intro-text {
  margin: 0 0 28px;
  color: #617768;
  font-size: 1rem;
  line-height: 1.8;
  max-width: 650px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.soft-box {
  padding: 22px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(47, 91, 67, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.soft-box-title {
  margin: 0 0 12px;
  color: #2f5b43;
  font-size: 1rem;
  font-weight: 800;
}

.soft-box ul {
  margin: 0;
  padding-left: 18px;
  color: #60776b;
  line-height: 1.9;
}

.clinic-box p {
  margin: 0 0 10px;
  color: #60776b;
  line-height: 1.7;
}

.clinic-box p:last-child {
  margin-bottom: 0;
}

.appointment-form {
  margin-top: 6px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group-full {
  margin-top: 18px;
}

.form-group label {
  color: #2f5b43;
  font-size: 0.95rem;
  font-weight: 700;
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(92, 118, 102, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  padding: 14px 16px;
  color: #335846;
  font-size: 0.98rem;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #d68ba2;
  box-shadow: 0 0 0 4px rgba(214, 139, 162, 0.12);
  background: #fff;
}

.form-group textarea {
  resize: vertical;
  min-height: 130px;
  line-height: 1.7;
}

.form-message {
  margin: 16px 0 0;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 0.94rem;
  font-weight: 600;
  line-height: 1.6;
}

.error-message {
  background: #fff1f4;
  color: #b55067;
  border: 1px solid #f3c9d3;
}

.success-message {
  background: #edf8f1;
  color: #2f7a47;
  border: 1px solid #cae8d3;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
}

.ghost-btn,
.submit-btn {
  min-height: 50px;
  padding: 0 22px;
  border-radius: 999px;
  font-size: 0.96rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease,
    background 0.18s ease;
}

.ghost-btn {
  border: 1px solid rgba(47, 91, 67, 0.12);
  background: rgba(255, 255, 255, 0.7);
  color: #456553;
}

.ghost-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.95);
}

.submit-btn {
  border: none;
  background: linear-gradient(135deg, #2f6a45 0%, #3d7a55 100%);
  color: #fff;
  box-shadow: 0 12px 24px rgba(47, 106, 69, 0.16);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(47, 106, 69, 0.22);
}

.ghost-btn:disabled,
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .appointment-main {
    padding: 20px 14px;
  }

  .appointment-card {
    padding: 22px 18px;
    border-radius: 24px;
  }

  .info-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .action-row {
    flex-direction: column;
  }

  .ghost-btn,
  .submit-btn,
  .lang-switch {
    width: 100%;
  }

  .top-bar {
    justify-content: stretch;
  }

  .appointment-card h1 {
    font-size: 2rem;
  }
}
</style>
