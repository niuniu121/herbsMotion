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
                <h2>Before you visit</h2>
                <p>Please read through the information below before attending your appointment.</p>
              </div>
            </div>

            <div class="faq-list">
              <article
                v-for="(item, index) in faqs"
                :key="index"
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
                    <template v-if="item.type === 'paragraphs'">
                      <p v-for="(paragraph, pIndex) in item.answer" :key="pIndex">
                        {{ paragraph }}
                      </p>
                    </template>

                    <template v-else-if="item.type === 'parking'">
                      <p>{{ item.intro }}</p>
                      <p>{{ item.noteOne }}</p>
                      <p>{{ item.noteTwo }}</p>
                      <ol class="parking-number-list">
                        <li v-for="(entry, lIndex) in item.parkingList" :key="lIndex">
                          {{ entry }}
                        </li>
                      </ol>
                    </template>
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
import NavBar from '../component/NavBar.vue'
import PageFooter from '../component/PageFooter.vue'

const openIndex = ref(-1)
const currentBgGradient = ref('linear-gradient(180deg, #dfe7dc 0%, #e7efe4 52%, #eef4ec 100%)')
const sectionRefs = ref([])
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

onMounted(async () => {
  window.scrollTo(0, 0)
  closeAllAnswers()
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

const faqs = [
  {
    question: 'Do you have parking?',
    type: 'parking',
    intro:
      'There are 3 onsite parking bays at the front of the building and 2 at the rear. Additional public parking is available on Canterbury Road and adjoining streets.',
    noteOne:
      'Paid street parking is also available directly in front of the clinic for your convenience. Please always check parking signs carefully, as clearway restrictions may apply at certain times.',
    noteTwo:
      'There are several free 2-hour parking options just a few minutes’ walk from the clinic:',
    parkingList: [
      'Camberwell Station parking',
      'Parking opposite the clinic near Mayston Street',
      'Car park at Market Place',
    ],
  },
  {
    question: 'How long are the sessions?',
    type: 'paragraphs',
    answer: [
      'Initial consultations, whether for Chinese medicine or physiotherapy, are 40 minutes. We use this time to understand your condition and map out your path to recovery.',
      'Follow-up consultations range from 20–60 minutes, depending on the complexity of your condition. Your treating practitioner will discuss the best option for your recovery.',
    ],
  },
  {
    question: 'What do I need to bring?',
    type: 'paragraphs',
    answer: [
      'If you have had scans or other investigations, please bring the results with you.',
      'If you have a care plan referral from your GP, WorkCover, TAC, or are a Home Care patient, please inform reception at the time of booking and bring any relevant documentation with you. You can also email them to info@herbsmotion.com.au',
    ],
  },
  {
    question: 'Do I need a referral?',
    type: 'paragraphs',
    answer: [
      'No, you do not need a referral to be seen. However, we welcome any referral letters or reports from your treating doctor or health professional.',
    ],
  },
  {
    question: 'Can I receive treatment while menstruating?',
    type: 'paragraphs',
    answer: [
      'Yes, our Women’s Health Physio treats patients during all stages of their menstrual cycle.',
    ],
  },
  {
    question: 'How many sessions will I need?',
    type: 'paragraphs',
    answer: [
      'The number of sessions and timeframe required for recovery will vary depending on the type and severity of your injury. During your initial appointment, your treating physio will assess your condition and provide an expected recovery timeframe.',
    ],
  },
  {
    question: 'I have a Medicare card. Does Medicare rebate any of my appointment costs?',
    type: 'paragraphs',
    answer: [
      'A Medicare rebate of $61.80 applies to clients who have a current Chronic Disease Management Plan from their GP. This program allows eligible patients to claim rebates for up to 5 sessions per calendar year.',
      'An out-of-pocket fee applies. We require a copy of your referral signed and dated by your GP, along with your Medicare details, to submit your claim. Rebates are usually processed within 48 hours on weekdays and paid into your nominated bank account.',
    ],
  },
  {
    question: 'I have private health insurance. Can I claim a rebate?',
    type: 'paragraphs',
    answer: [
      'If you have extras cover, you can claim on the spot via our HICAPS machine. The rebate amount will depend on your insurer and level of cover.',
      'We accept all major private health insurers, including Medibank, Bupa, Phoenix, HCF, and NIB. Please contact your insurer for a detailed estimate of your rebate.',
    ],
  },
  {
    question: 'What should I wear to my appointments?',
    type: 'paragraphs',
    answer: [
      'Please wear clothing that allows easy access to the area of injury. Shorts and a singlet are suitable for most conditions. In winter, many patients wear shorts under track pants.',
    ],
  },
  {
    question: 'What if I can’t make an appointment?',
    type: 'paragraphs',
    answer: [
      'We require at least 24 hours’ notice for cancellations so we can offer your appointment to another patient. A $50 fee will apply if less than 24 hours’ notice is given.',
    ],
  },
  {
    question: 'Do you accept WorkCover insurance?',
    type: 'paragraphs',
    answer: [
      'Yes, we welcome WorkCover clients. Please provide your claim number and insurance details.',
      'Once your medical excess has been met, we can invoice your insurer directly with no out-of-pocket costs. Until then, you will be charged the WorkCover rate and can seek reimbursement from your employer.',
    ],
  },
  {
    question: 'Do you accept TAC clients?',
    type: 'paragraphs',
    answer: [
      'Yes, we welcome TAC clients. We can submit invoices directly to TAC on your behalf with no out-of-pocket fees, provided you have a valid TAC claim number and have met the medical excess (if applicable).',
    ],
  },
  {
    question: 'Do you accept Home Care Package clients?',
    type: 'paragraphs',
    answer: [
      'Yes, we welcome Home Care Package clients. If you are not with one of our partner providers (such as Happy Living), payment is required upfront and we will provide an invoice for reimbursement.',
    ],
  },
  {
    question: 'Do you provide home visit services?',
    type: 'paragraphs',
    answer: [
      'Yes, although we encourage clients to attend the clinic where possible, some practitioners offer home visits. Please enquire with your treating practitioner to see if this service is suitable for you.',
    ],
  },
]
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

.parking-number-list {
  margin: 14px 0 0 28px;
  padding-left: 18px;
  list-style: decimal;
}

.parking-number-list li {
  margin-bottom: 6px;
  padding-left: 6px;
  font-size: 16px;
  line-height: 1.8;
  color: #4c5e54;
}

.parking-number-list li:last-child {
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

  .faq-answer p,
  .parking-number-list li {
    font-size: 15px;
    line-height: 1.75;
  }

  .parking-number-list {
    margin: 12px 0 0 22px;
    padding-left: 16px;
  }

  .hero-subtitle {
    font-size: 16px;
  }
}
</style>
