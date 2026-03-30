<template>
  <div class="faq-page" :style="{ background: currentBgGradient }">
    <div class="faq-page-content">
      <NavBar />

      <section
        class="faq-hero"
        :ref="setSectionRef"
        data-bggradient="linear-gradient(180deg, #dfe7dc 0%, #e7efe4 52%, #eef4ec 100%)"
      >
        <div class="container">
          <p class="eyebrow">Support & Information</p>
          <h1 class="hero-title">Frequently Asked Questions</h1>
          <p class="hero-subtitle">
            Everything you may need before your appointment, in one place.
          </p>
        </div>
      </section>

      <section
        class="faq-content"
        :ref="setSectionRef"
        data-bggradient="linear-gradient(180deg, #edf4eb 0%, #f4f8f2 40%, #f7eef1 100%)"
      >
        <div class="container">
          <div class="faq-shell">
            <div class="faq-intro-card">
              <div class="intro-icon-wrap">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" stroke="#325B49" stroke-width="1.8" />
                  <path
                    d="M9.9 9.2C9.9 7.95 10.95 7 12.3 7C13.57 7 14.5 7.86 14.5 9.02C14.5 9.9 14.04 10.45 13.2 10.98C12.42 11.47 12 11.9 12 12.8"
                    stroke="#325B49"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="16.8" r="1" fill="#325B49" />
                </svg>
              </div>
              <div>
                <h2>Got questions?</h2>
                <p>Check out our FAQs below</p>
              </div>
            </div>

            <div v-if="loading" class="faq-state-card">Loading FAQs...</div>

            <div v-else-if="errorMessage" class="faq-state-card faq-error-card">
              {{ errorMessage }}
            </div>

            <div v-else-if="faqs.length === 0" class="faq-state-card">
              FAQ content will be available soon.
            </div>

            <div v-else class="faq-list">
              <article
                v-for="(item, index) in faqs"
                :key="item.id || index"
                class="faq-item"
                :class="{ open: openIndex === index }"
              >
                <button
                  class="faq-question"
                  type="button"
                  @click="toggleItem(index)"
                  :aria-expanded="openIndex === index"
                >
                  <span class="faq-question-text">{{ item.question }}</span>
                  <span class="faq-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                <transition name="faq-expand">
                  <div v-if="openIndex === index" class="faq-answer">
                    <p v-for="(paragraph, pIndex) in parseAnswer(item.answer)" :key="pIndex">
                      {{ paragraph }}
                    </p>
                  </div>
                </transition>
              </article>
            </div>
          </div>
        </div>
      </section>

      <div
        class="faq-footer-wrap"
        :ref="setSectionRef"
        data-bggradient="linear-gradient(180deg, #f7eef1 0%, #f5dfe6 52%, #efd1db 100%)"
      >
        <PageFooter />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import NavBar from '../component/NavBar.vue'
import PageFooter from '../component/PageFooter.vue'

const openIndex = ref(-1)
const currentBgGradient = ref('linear-gradient(180deg, #dfe7dc 0%, #e7efe4 52%, #eef4ec 100%)')
const sectionRefs = ref([])
const loading = ref(true)
const errorMessage = ref('')
const faqs = ref([])

let observer = null

const toggleItem = (index) => {
  openIndex.value = openIndex.value === index ? -1 : index
}

const closeAllAnswers = () => {
  openIndex.value = -1
}

const setSectionRef = (el) => {
  if (el && !sectionRefs.value.includes(el)) {
    sectionRefs.value.push(el)
  }
}

const parseAnswer = (value) => {
  if (!value) return []
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

const fetchFaqs = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const docRef = doc(db, 'siteContent', 'faq')
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      faqs.value = []
      return
    }

    const data = docSnap.data()

    faqs.value = Array.isArray(data.items)
      ? data.items.filter((item) => item.visible !== false)
      : []
  } catch (error) {
    console.error('Failed to fetch FAQs:', error)
    errorMessage.value = 'Failed to load FAQ content.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  window.scrollTo(0, 0)
  closeAllAnswers()
  await fetchFaqs()
  await nextTick()

  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -25% 0px',
    threshold: 0.15,
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        currentBgGradient.value =
          entry.target.dataset.bggradient ||
          'linear-gradient(180deg, #dfe7dc 0%, #e7efe4 52%, #eef4ec 100%)'
      }
    })
  }, observerOptions)

  sectionRefs.value.forEach((section) => {
    if (section instanceof Element) {
      observer.observe(section)
    }
  })
})

onBeforeRouteLeave(() => {
  closeAllAnswers()
})

onUnmounted(() => {
  closeAllAnswers()

  if (observer) {
    observer.disconnect()
    observer = null
  }

  sectionRefs.value = []
})
</script>

<style scoped>
.faq-page {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
  transition: background 1.05s ease-in-out;
}

.faq-page::before,
.faq-page::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.faq-page::before {
  background:
    radial-gradient(circle at 10% 12%, rgba(94, 139, 115, 0.2) 0%, transparent 30%),
    radial-gradient(circle at 86% 18%, rgba(214, 139, 162, 0.12) 0%, transparent 28%),
    radial-gradient(circle at 72% 82%, rgba(94, 139, 115, 0.1) 0%, transparent 24%);
  opacity: 0.95;
}

.faq-page::after {
  backdrop-filter: blur(1px);
  opacity: 0.5;
}

.faq-page-content {
  position: relative;
  z-index: 1;
}

.faq-hero {
  padding: 72px 0 32px;
  background: transparent;
}

.container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.eyebrow {
  margin: 0 0 10px;
  color: #5e8b73;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-title {
  margin: 0;
  font-size: clamp(34px, 5vw, 60px);
  line-height: 1.05;
  font-weight: 800;
  color: #1f3328;
}

.hero-subtitle {
  margin: 16px 0 0;
  max-width: 640px;
  font-size: 18px;
  line-height: 1.65;
  color: #5f6f65;
}

.faq-content {
  padding: 22px 0 80px;
}

.faq-shell {
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 32px;
  box-shadow:
    0 20px 50px rgba(31, 51, 40, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 26px;
}

.faq-intro-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
  background: linear-gradient(180deg, #f8faf7 0%, #f2f6f1 100%);
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 24px;
  margin-bottom: 18px;
}

.intro-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(94, 139, 115, 0.12);
  flex-shrink: 0;
}

.faq-intro-card h2 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #1f3328;
}

.faq-intro-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #64756a;
}

.faq-state-card {
  padding: 22px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(50, 91, 73, 0.08);
  color: #5e7065;
  font-size: 16px;
  line-height: 1.7;
}

.faq-error-card {
  color: #a14f67;
}

.faq-list {
  display: grid;
  gap: 14px;
}

.faq-item {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 22px;
  overflow: hidden;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease,
    background-color 0.24s ease;
}

.faq-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(31, 51, 40, 0.08);
  border-color: rgba(50, 91, 73, 0.18);
}

.faq-item.open {
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(31, 51, 40, 0.1);
  border-color: rgba(50, 91, 73, 0.2);
}

.faq-question {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 22px 22px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
}

.faq-question-text {
  font-size: 20px;
  line-height: 1.45;
  font-weight: 700;
  color: #24392d;
}

.faq-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(94, 139, 115, 0.1);
  color: #325b49;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    transform 0.22s ease,
    background-color 0.22s ease;
}

.faq-item.open .faq-icon {
  transform: rotate(180deg);
  background: rgba(94, 139, 115, 0.16);
}

.faq-answer {
  padding: 0 22px 22px;
  color: #4c5e54;
}

.faq-answer p {
  margin: 0 0 14px;
  font-size: 16px;
  line-height: 1.85;
}

.faq-answer p:last-of-type {
  margin-bottom: 0;
}

.faq-footer-wrap {
  position: relative;
}

.faq-expand-enter-active,
.faq-expand-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.faq-expand-enter-from,
.faq-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .faq-hero {
    padding: 56px 0 24px;
  }

  .container {
    width: min(100% - 24px, 1180px);
  }

  .faq-shell {
    padding: 16px;
    border-radius: 22px;
  }

  .faq-intro-card {
    align-items: flex-start;
    padding: 18px;
    border-radius: 18px;
  }

  .intro-icon-wrap {
    width: 48px;
    height: 48px;
  }

  .faq-question {
    padding: 18px 16px;
    gap: 12px;
  }

  .faq-question-text {
    font-size: 17px;
  }

  .faq-answer {
    padding: 0 16px 18px;
  }

  .faq-answer p {
    font-size: 15px;
    line-height: 1.75;
  }

  .hero-subtitle {
    font-size: 16px;
  }
}
</style>
