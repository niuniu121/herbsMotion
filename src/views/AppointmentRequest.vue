<template>
  <div class="appointment-page">
    <div class="appointment-card">
      <div class="lang-switch-wrap">
        <button
          class="lang-switch"
          type="button"
          @click="toggleLanguage"
          :aria-label="isZh ? 'Switch to English' : '切换到中文'"
        >
          <span class="lang-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M31.5 47C31.5 37.2 35.8 28.8 43.8 22.2C47.8 18.9 52.3 16.4 57 14.7C56.4 19.7 54.8 24.6 52 29C46.5 37.4 39.3 42.6 31.5 47Z"
                fill="#BEE37A"
              />
              <path
                d="M28.7 49.3C27 40.9 21.8 34.4 13.6 29.9C9.6 27.7 5.3 26.1 1 25.3C2.6 29.5 4.9 33.4 7.9 36.8C13.7 43.4 20.8 47.4 28.7 49.3Z"
                fill="#8ECF63"
              />
              <path
                d="M29.9 50.5C29.9 36.6 31.8 24.5 37.3 12.2"
                stroke="#4E7B55"
                stroke-width="3.2"
                stroke-linecap="round"
              />
              <path
                d="M20.2 36.9C23.8 36.2 27 34.4 29.8 31.7"
                stroke="#4E7B55"
                stroke-width="2.6"
                stroke-linecap="round"
              />
              <path
                d="M39.1 28.9C42.7 28.4 45.9 26.8 48.9 24.2"
                stroke="#4E7B55"
                stroke-width="2.6"
                stroke-linecap="round"
              />
              <circle cx="16.5" cy="14.5" r="3.2" fill="#F7D7E4" />
              <circle cx="20.8" cy="11.2" r="2.1" fill="#FFEAA7" />
              <circle cx="12.2" cy="18.2" r="1.9" fill="#FFF4C2" />
            </svg>
          </span>

          <span class="lang-text">
            {{ isZh ? 'Switch to English' : '切换到中文' }}
          </span>
        </button>
      </div>

      <div class="card-header">
        <p class="eyebrow">{{ t.eyebrow }}</p>
        <h1>{{ t.title }}</h1>
        <p class="subtitle">{{ t.subtitle }}</p>
      </div>

      <div v-if="!submitted" class="form-section">
        <div class="intro-box">
          <p>{{ t.intro }}</p>
          <ul>
            <li>{{ t.item1 }}</li>
            <li>{{ t.item2 }}</li>
            <li>{{ t.item3 }}</li>
            <li>{{ t.item4 }}</li>
          </ul>
        </div>

        <div class="location-box">
          <h3>{{ t.locationTitle }}</h3>
          <p>{{ t.address }}</p>
          <p>{{ t.parking }}</p>
        </div>

        <form class="appointment-form" @submit.prevent="handleSubmit">
          <div class="field-group">
            <label for="fullName">{{ t.fullName }}</label>
            <input
              id="fullName"
              v-model.trim="form.fullName"
              type="text"
              :placeholder="t.fullNamePlaceholder"
              :disabled="isSubmitting"
            />
            <span v-if="errors.fullName" class="error">{{ errors.fullName }}</span>
          </div>

          <div class="field-group">
            <label for="dob">{{ t.dob }}</label>
            <input id="dob" v-model="form.dob" type="date" :disabled="isSubmitting" />
            <span v-if="errors.dob" class="error">{{ errors.dob }}</span>
          </div>

          <div class="field-group">
            <label for="phone">{{ t.phone }}</label>
            <input
              id="phone"
              v-model.trim="form.phone"
              type="text"
              :placeholder="t.phonePlaceholder"
              :disabled="isSubmitting"
            />
            <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
          </div>

          <div class="field-group">
            <label for="email">{{ t.email }}</label>
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              :placeholder="t.emailPlaceholder"
              :disabled="isSubmitting"
            />
            <span v-if="errors.email" class="error">{{ errors.email }}</span>
          </div>

          <div class="field-group">
            <label for="notes">{{ t.notes }}</label>
            <textarea
              id="notes"
              v-model.trim="form.notes"
              rows="4"
              :placeholder="t.notesPlaceholder"
              :disabled="isSubmitting"
            ></textarea>
          </div>

          <button class="submit-btn" type="submit" :disabled="isSubmitting">
            <span v-if="!isSubmitting">{{ t.submit }}</span>
            <span v-else>{{ t.submitting }}</span>
          </button>
        </form>
      </div>

      <div v-else class="success-section">
        <div class="success-icon">✅</div>
        <h2>{{ t.successTitle }}</h2>
        <p class="success-text">{{ t.successText1 }}</p>
        <p class="success-text">{{ t.successText2 }}</p>

        <div class="success-info-box">
          <p>
            <strong>{{ t.addressLabel }}</strong> {{ t.address }}
          </p>
          <p>{{ t.parking }}</p>
        </div>

        <button class="back-btn" @click="resetForm">
          {{ t.submitAnother }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const currentLang = ref('zh')
const isSubmitting = ref(false)
const submitted = ref(false)

const isZh = computed(() => currentLang.value === 'zh')

const form = ref({
  fullName: '',
  dob: '',
  phone: '',
  email: '',
  notes: '',
})

const errors = ref({
  fullName: '',
  dob: '',
  phone: '',
  email: '',
})

const content = {
  zh: {
    eyebrow: '预约表单',
    title: '谢谢您的预约',
    subtitle: '劳烦您填写以下信息，我们会尽快与您确认预约。',
    intro: '请提供以下内容：',
    item1: '1. 英文全名',
    item2: '2. 出生年月日',
    item3: '3. 联系电话',
    item4: '4. 电子邮箱',
    locationTitle: '诊所信息',
    address: 'Elevate Medical, 305 Warrigal Rd, Burwood 3125',
    parking: '诊所背后有停车位。',
    fullName: '英文全名',
    fullNamePlaceholder: '请输入您的英文全名',
    dob: '出生年月日',
    phone: '联系电话',
    phonePlaceholder: '请输入您的联系电话',
    email: '电子邮箱',
    emailPlaceholder: '请输入您的邮箱地址',
    notes: '备注（可选）',
    notesPlaceholder: '如有症状、偏好时间或其他信息，可填写在这里',
    submit: '提交预约信息',
    submitting: '提交中...',
    successTitle: '预约信息提交成功',
    successText1: '预约成功后您的邮箱会收到确认信息✅',
    successText2: '劳烦您填写一下邮件里的表格，我们会继续为您安排后续流程。',
    addressLabel: '地址：',
    submitAnother: '重新填写一份',
    requiredName: '请填写英文全名。',
    requiredDob: '请选择出生年月日。',
    requiredPhone: '请填写有效联系电话。',
    requiredEmail: '请填写有效电子邮箱。',
    submitFailed: '提交失败，请稍后再试。',
  },
  en: {
    eyebrow: 'Appointment Form',
    title: 'Thank You for Your Booking',
    subtitle: 'Please complete the form below and we will confirm your appointment soon.',
    intro: 'Please provide the following details:',
    item1: '1. Full name in English',
    item2: '2. Date of birth',
    item3: '3. Contact phone number',
    item4: '4. Email address',
    locationTitle: 'Clinic Information',
    address: 'Elevate Medical, 305 Warrigal Rd, Burwood 3125',
    parking: 'Parking is available at the back of the clinic.',
    fullName: 'Full Name (English)',
    fullNamePlaceholder: 'Please enter your full name in English',
    dob: 'Date of Birth',
    phone: 'Phone Number',
    phonePlaceholder: 'Please enter your phone number',
    email: 'Email Address',
    emailPlaceholder: 'Please enter your email address',
    notes: 'Notes (Optional)',
    notesPlaceholder: 'You may add symptoms, preferred time, or any other details here',
    submit: 'Submit Appointment Request',
    submitting: 'Submitting...',
    successTitle: 'Your appointment request has been submitted',
    successText1: 'You will receive a confirmation email once your booking is processed ✅',
    successText2:
      'Please complete the form inside that email so we can proceed with the next step.',
    addressLabel: 'Address:',
    submitAnother: 'Submit another request',
    requiredName: 'Please enter your full name in English.',
    requiredDob: 'Please select your date of birth.',
    requiredPhone: 'Please enter a valid phone number.',
    requiredEmail: 'Please enter a valid email address.',
    submitFailed: 'Submission failed. Please try again later.',
  },
}

const t = computed(() => content[currentLang.value])

function toggleLanguage() {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
}

function validateForm() {
  const newErrors = {
    fullName: '',
    dob: '',
    phone: '',
    email: '',
  }

  if (!form.value.fullName || form.value.fullName.length < 2) {
    newErrors.fullName = t.value.requiredName
  }

  if (!form.value.dob) {
    newErrors.dob = t.value.requiredDob
  }

  if (!/^[+\d\s()-]{6,20}$/.test(form.value.phone)) {
    newErrors.phone = t.value.requiredPhone
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    newErrors.email = t.value.requiredEmail
  }

  errors.value = newErrors

  return !newErrors.fullName && !newErrors.dob && !newErrors.phone && !newErrors.email
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const response = await fetch('/api/appointment-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.value.fullName,
        dob: form.value.dob,
        phone: form.value.phone,
        email: form.value.email,
        notes: form.value.notes,
        language: currentLang.value,
      }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || t.value.submitFailed)
    }

    submitted.value = true
  } catch (error) {
    alert(error.message || t.value.submitFailed)
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  submitted.value = false
  form.value = {
    fullName: '',
    dob: '',
    phone: '',
    email: '',
    notes: '',
  }
  errors.value = {
    fullName: '',
    dob: '',
    phone: '',
    email: '',
  }
}
</script>

<style scoped>
.appointment-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 35%, #f5dfe6 68%, #eed6df 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Inter, 'Helvetica Neue', Arial, sans-serif;
}

.appointment-card {
  width: min(720px, 100%);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(36, 68, 54, 0.12);
  padding: 28px;
}

.lang-switch-wrap {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 18px;
}

.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: linear-gradient(135deg, #3b6853 0%, #325b49 100%);
  color: #fff;
  border-radius: 999px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(50, 91, 73, 0.18);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.lang-switch:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 16px 28px rgba(50, 91, 73, 0.22);
}

.lang-switch:active {
  transform: translateY(0);
}

.lang-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lang-icon svg {
  width: 28px;
  height: 28px;
  display: block;
}

.lang-text {
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.card-header {
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #7a8f83;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 12px;
  color: #244436;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.1;
}

.subtitle {
  margin: 0;
  color: #617368;
  font-size: 15px;
  line-height: 1.7;
}

.intro-box,
.location-box,
.success-info-box {
  background: #f7faf8;
  border: 1px solid #e4ece7;
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 18px;
}

.intro-box p,
.location-box p,
.success-info-box p {
  margin: 0 0 8px;
  color: #325b49;
  line-height: 1.6;
}

.intro-box ul {
  margin: 10px 0 0;
  padding-left: 28px;
  color: #325b49;
  line-height: 1.8;
}

.location-box h3 {
  margin: 0 0 10px;
  color: #244436;
  font-size: 18px;
}

.appointment-form {
  display: grid;
  gap: 16px;
}

.field-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #274639;
}

.field-group input,
.field-group textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d9e3dd;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 14px;
  outline: none;
  background: #fff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.field-group input:focus,
.field-group textarea:focus {
  border-color: #325b49;
  box-shadow: 0 0 0 4px rgba(50, 91, 73, 0.08);
  transform: translateY(-1px);
}

.field-group textarea {
  resize: vertical;
  min-height: 110px;
}

.error {
  display: inline-block;
  margin-top: 6px;
  color: #c05252;
  font-size: 12px;
}

.submit-btn,
.back-btn {
  width: 100%;
  min-height: 52px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #325b49 0%, #274639 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(50, 91, 73, 0.18);
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.2s ease;
}

.submit-btn:hover,
.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(50, 91, 73, 0.22);
}

.submit-btn:disabled,
.back-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.success-section {
  text-align: center;
  padding: 16px 0 8px;
}

.success-icon {
  font-size: 44px;
  margin-bottom: 10px;
}

.success-section h2 {
  margin: 0 0 14px;
  color: #244436;
  font-size: 28px;
}

.success-text {
  margin: 0 0 10px;
  color: #617368;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .appointment-page {
    padding: 20px 14px;
  }

  .appointment-card {
    padding: 20px;
    border-radius: 22px;
  }

  .lang-switch-wrap {
    justify-content: center;
  }

  .lang-switch {
    width: 100%;
    justify-content: center;
  }

  h1 {
    font-size: 30px;
  }
}
</style>
