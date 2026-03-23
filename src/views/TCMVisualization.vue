<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavBar from '../component/NavBar.vue'
import PageFooter from '../component/PageFooter.vue'

const currentBgColor = ref('#E2E8DF')
const sectionRefs = ref([])
const isDropdownOpen = ref(false)
let observer = null

const tcmConditions = [
  {
    id: 'insomnia',
    name: 'Insomnia',
    time: '2–4 wks',
    medianWeeks: 3,
    maxWeeks: 4,
    tcmRate: '78% – 85%',
    tcmRateNum: 82,
    noTreatment: '~15%',
    noTreatNum: 15,
    sustained: '92% / 85% / 78%',
    acuRole: 'Best for falling asleep.',
    herbRole: 'Best for sleep depth.',
    speedUp: [
      {
        title: 'Consistent Circadian Rhythm',
        desc: 'Going to bed and waking at the same time stabilizes "Heart Shen" (spirit). Early morning sunlight exposure helps reset the biological clock.',
      },
      {
        title: 'Evening "Wind-Down" Ritual',
        desc: 'Reducing screen time 1 hour before bed prevents "Liver Fire" from rising. Warm foot soaks draw energy down from the head.',
      },
    ],
    slowDown: [
      {
        title: 'Late Night "Active" Digestion',
        desc: 'Eating heavy meals late forces the body to stay "Yang" (active) to digest. Stomach disharmony leads to disturbed sleep.',
      },
      {
        title: 'Inconsistent Treatment',
        desc: 'Missing acupuncture sessions prevents the cumulative calming of the nervous system.',
      },
    ],
  },
  {
    id: 'stress',
    name: 'Stress/Anxiety',
    time: '2–4 wks',
    medianWeeks: 3,
    maxWeeks: 4,
    tcmRate: '68% – 76%',
    tcmRateNum: 72,
    noTreatment: 'Variable',
    noTreatNum: 20,
    sustained: '88% / 80% / 72%',
    acuRole: 'Rapid "reset" of nerves.',
    herbRole: 'Emotional resilience.',
  },
  {
    id: 'eczema',
    name: 'Eczema',
    time: '4–8 wks',
    medianWeeks: 6,
    maxWeeks: 8,
    tcmRate: '65% – 75%',
    tcmRateNum: 70,
    noTreatment: '15%',
    noTreatNum: 15,
    sustained: '85% / 70% / 62%',
    acuRole: 'Stops the itch.',
    herbRole: 'Heals skin barrier & redness.',
    speedUp: [
      {
        title: 'Moisture Management',
        desc: '"No Moisture Treatment" in specific phases helps skin dry and regenerate. Using TCM herbal washes reduces Damp-Heat inflammation.',
      },
      {
        title: 'Anti-Inflammatory Diet',
        desc: 'Focusing on cooling foods like mung beans or cucumber, and avoiding trigger foods such as dairy, sugar and alcohol.',
      },
    ],
    slowDown: [
      {
        title: 'Chronic Scratching',
        desc: 'Scratching breaks the skin barrier, invites irritation, and prolongs healing.',
      },
      {
        title: 'Topical Steroid Overuse',
        desc: 'Prolonged use can thin the skin significantly and may complicate recovery.',
      },
    ],
  },
  {
    id: 'weight',
    name: 'Weight Loss',
    time: '8–12 wks',
    medianWeeks: 10,
    maxWeeks: 12,
    tcmRate: '5% – 10% BMI',
    tcmRateNum: 60,
    noTreatment: '<2% net',
    noTreatNum: 10,
    sustained: '75% / 60% / 45%',
    acuRole: 'Controls appetite.',
    herbRole: 'Boosts metabolic rate.',
  },
  {
    id: 'pms',
    name: 'PMS',
    time: '2–3 cycles',
    medianWeeks: 2.5,
    maxWeeks: 3,
    tcmRate: '75% – 88%',
    tcmRateNum: 82,
    noTreatment: '<10%',
    noTreatNum: 10,
    sustained: '94% / 88% / 80%',
    acuRole: 'Best for mood/cramps.',
    herbRole: 'Best for breast pain.',
  },
  {
    id: 'ivf',
    name: 'IVF Support',
    time: '3 months',
    medianWeeks: 12,
    maxWeeks: 12,
    tcmRate: '+15%–20%',
    tcmRateNum: 75,
    noTreatment: 'Baseline',
    noTreatNum: 40,
    sustained: 'N/A (Goal is Live Birth)',
    acuRole: 'Uterine blood flow.',
    herbRole: 'Egg & lining quality.',
  },
  {
    id: 'bloating',
    name: 'Bloating/Reflux',
    time: '1–2 wks',
    medianWeeks: 1.5,
    maxWeeks: 2,
    tcmRate: '72% – 84%',
    tcmRateNum: 78,
    noTreatment: '20%',
    noTreatNum: 20,
    sustained: '90% / 82% / 75%',
    acuRole: 'Relieves pressure.',
    herbRole: 'Repairs digestive lining.',
    speedUp: [
      {
        title: 'Mindful Eating',
        desc: 'Chewing each bite well reduces mechanical load and supports smoother digestion.',
      },
      {
        title: 'Warm, Cooked Foods',
        desc: 'Warm foods are gentler on digestion and may ease reflux and bloating symptoms.',
      },
    ],
    slowDown: [
      {
        title: 'Cold/Raw Food Intake',
        desc: 'Iced drinks and excessive raw foods may aggravate digestive discomfort.',
      },
      {
        title: 'Late Night Eating',
        desc: 'Eating too close to bedtime may worsen reflux and sluggish digestion.',
      },
    ],
  },
  {
    id: 'hayfever',
    name: 'Hay Fever',
    time: '1–2 wks',
    medianWeeks: 1.5,
    maxWeeks: 2,
    tcmRate: '70% – 88%',
    tcmRateNum: 79,
    noTreatment: 'Seasonal',
    noTreatNum: 30,
    sustained: '95% / 80% / 65%',
    acuRole: 'Clears sinuses fast.',
    herbRole: 'Prevents the next flare.',
  },
  {
    id: 'cold',
    name: 'Frequent Cold',
    time: '3 months',
    medianWeeks: 12,
    maxWeeks: 12,
    tcmRate: '~55% Fewer',
    tcmRateNum: 55,
    noTreatment: 'No change',
    noTreatNum: 5,
    sustained: '90% / 85% / 80%',
    acuRole: 'Quick recovery.',
    herbRole: 'Builds "Wei Qi" (Immunity).',
  },
  {
    id: 'fatigue',
    name: 'Chronic Fatigue',
    time: '6–8 wks',
    medianWeeks: 7,
    maxWeeks: 8,
    tcmRate: '62% – 72%',
    tcmRateNum: 67,
    noTreatment: '<8%',
    noTreatNum: 8,
    sustained: '82% / 75% / 68%',
    acuRole: 'Clears brain fog.',
    herbRole: 'Rebuilds core stamina.',
    speedUp: [
      {
        title: 'Pacing (Relative Rest)',
        desc: 'Staying within your energy envelope supports steadier recovery and fewer crashes.',
      },
      {
        title: 'Building "Wei Qi"',
        desc: 'Consistent restorative support may improve resilience over time.',
      },
    ],
    slowDown: [
      {
        title: 'Boom and Bust Cycles',
        desc: 'Over-exerting on a good day can create an energy debt that takes days to recover from.',
      },
      {
        title: 'Mental Over-Exertion',
        desc: 'High screen load and emotional stress can worsen fatigue symptoms.',
      },
    ],
  },
  {
    id: 'gout',
    name: 'Gout (Acute/Chronic)',
    time: '3–7 days',
    medianWeeks: 1,
    maxWeeks: 1,
    tcmRate: '70% – 82%',
    tcmRateNum: 76,
    noTreatment: '~15% (slow)',
    noTreatNum: 15,
    sustained: '88% / 75% / 60%',
    acuRole: 'Best for acute pain.',
    herbRole: 'Best for lowering Uric Acid.',
    speedUp: [
      {
        title: 'Hydration & Alkalization',
        desc: 'Good hydration may help reduce flare intensity and support comfort.',
      },
      {
        title: 'Anti-Inflammatory Loading',
        desc: 'Reducing joint inflammation early may support faster symptom improvement.',
      },
    ],
    slowDown: [
      {
        title: 'High-Purine Trigger Foods',
        desc: 'Alcohol, shellfish and sugary drinks may aggravate flare patterns.',
      },
      {
        title: 'Sudden Extreme Exercise',
        desc: 'Overloading an inflamed joint can worsen irritation.',
      },
    ],
  },
  {
    id: 'bells',
    name: 'Bell’s Palsy',
    time: '2–6 wks',
    medianWeeks: 4,
    maxWeeks: 6,
    tcmRate: '85% – 95%',
    tcmRateNum: 90,
    noTreatment: '70%',
    noTreatNum: 70,
    sustained: '98% / 95% / 90%',
    acuRole: 'Critical for nerve stimulation.',
    herbRole: 'Anti-inflammatory support.',
    speedUp: [
      {
        title: 'Early Intervention',
        desc: 'Earlier care often supports better nerve recovery trajectories.',
      },
      {
        title: 'Facial Warmth',
        desc: 'Gentle protection and circulation support may help maintain comfort.',
      },
    ],
    slowDown: [
      {
        title: 'Cold Exposure',
        desc: 'Cold wind or strong air-conditioning may aggravate discomfort.',
      },
      {
        title: 'High Stress Levels',
        desc: 'Stress and poor sleep can interfere with repair quality.',
      },
    ],
  },
  {
    id: 'sweating',
    name: 'Excessive Sweating',
    time: '4–6 wks',
    medianWeeks: 5,
    maxWeeks: 6,
    tcmRate: '65% – 78%',
    tcmRateNum: 71,
    noTreatment: '<10%',
    noTreatNum: 10,
    sustained: '85% / 78% / 70%',
    acuRole: 'Regulates ANS.',
    herbRole: '"Astringes" the pores.',
  },
  {
    id: 'hives',
    name: 'Hives (Chronic)',
    time: '2–4 wks',
    medianWeeks: 3,
    maxWeeks: 4,
    tcmRate: '60% – 75%',
    tcmRateNum: 67,
    noTreatment: '20%',
    noTreatNum: 20,
    sustained: '82% / 72% / 65%',
    acuRole: 'Immediate itch relief.',
    herbRole: 'Stabilizes the immune system.',
  },
  {
    id: 'acne',
    name: 'Acne',
    time: '4–8 wks',
    medianWeeks: 6,
    maxWeeks: 8,
    tcmRate: '70% – 85%',
    tcmRateNum: 77,
    noTreatment: 'Variable',
    noTreatNum: 25,
    sustained: '88% / 75% / 60%',
    acuRole: 'Reduces redness.',
    herbRole: 'Clears internal "Damp-Heat."',
  },
  {
    id: 'hairloss',
    name: 'Hair Loss (AGA)',
    time: '3–6 mo',
    medianWeeks: 4.5,
    maxWeeks: 6,
    tcmRate: '55% – 65%',
    tcmRateNum: 60,
    noTreatment: '<5%',
    noTreatNum: 5,
    sustained: '90% / 82% / 70%',
    acuRole: 'Scalp microcirculation.',
    herbRole: 'Nourishes "Kidney Essence."',
    speedUp: [
      {
        title: 'Blood Nourishment',
        desc: 'Consistent nutrition and restorative habits may support stronger follicles over time.',
      },
      {
        title: 'Scalp Stimulation',
        desc: 'Local stimulation may support circulation and scalp health.',
      },
    ],
    slowDown: [
      {
        title: 'Chronic Sleep Deprivation',
        desc: 'Poor sleep can interfere with long-term recovery and hair quality.',
      },
      {
        title: 'High-Glycemic Diet',
        desc: 'Unstable blood sugar patterns may aggravate skin and hair health.',
      },
    ],
  },
  {
    id: 'cancerpain',
    name: 'Cancer Pain',
    time: '1–2 wks',
    medianWeeks: 1.5,
    maxWeeks: 2,
    tcmRate: '~50% Reduction',
    tcmRateNum: 50,
    noTreatment: 'Baseline',
    noTreatNum: 5,
    sustained: 'Dependent on illness',
    acuRole: 'Best for neuropathic pain.',
    herbRole: 'General palliative support.',
  },
  {
    id: 'tmj',
    name: 'TMJ (Jaw Pain)',
    time: '2–4 wks',
    medianWeeks: 3,
    maxWeeks: 4,
    tcmRate: '75% – 85%',
    tcmRateNum: 80,
    noTreatment: '25%',
    noTreatNum: 25,
    sustained: '92% / 85% / 78%',
    acuRole: 'Unbeatable for muscle release.',
    herbRole: 'Best for joint inflammation.',
  },
  {
    id: 'cough',
    name: 'Chronic Cough',
    time: '1–3 wks',
    medianWeeks: 2,
    maxWeeks: 3,
    tcmRate: '72% – 84%',
    tcmRateNum: 78,
    noTreatment: '30%',
    noTreatNum: 30,
    sustained: '85% / 78% / 72%',
    acuRole: 'Stops the cough reflex.',
    herbRole: 'Moistens the lung tissue.',
  },
  {
    id: 'fertility',
    name: 'Fertility Support',
    time: '3–6 mo',
    medianWeeks: 4.5,
    maxWeeks: 6,
    tcmRate: '+15%–20% Rate',
    tcmRateNum: 75,
    noTreatment: 'Baseline',
    noTreatNum: 40,
    sustained: 'Target: Healthy Birth',
    acuRole: 'Blood flow.',
    herbRole: 'Follicle & lining quality.',
  },
  {
    id: 'headache',
    name: 'Headaches/Migraines',
    time: '2–4 weeks',
    medianWeeks: 3,
    maxWeeks: 4,
    tcmRate: '70% – 82%',
    tcmRateNum: 76,
    noTreatment: '15%',
    noTreatNum: 15,
    sustained: '90% / 85% / 78%',
    acuRole: 'Best for quick symptom relief.',
    herbRole: 'Helps prevent recurrence.',
    speedUp: [
      {
        title: 'Consistent Early Sessions',
        desc: 'Frequent early care may help lock in a calmer symptom pattern.',
      },
      {
        title: 'Stable Routine',
        desc: 'Regular sleep, meals and hydration may reduce trigger stacking.',
      },
    ],
    slowDown: [
      {
        title: 'Boom and Bust Stress',
        desc: 'Large swings in workload and stress can trigger rebound headaches.',
      },
      {
        title: 'Inconsistent Treatment',
        desc: 'Stopping too early may increase the chance of recurrence.',
      },
    ],
  },
]

const selectedId = ref(tcmConditions[0].id)

const selectedData = computed(() => {
  return tcmConditions.find((c) => c.id === selectedId.value) || tcmConditions[0]
})

const sustainedData = computed(() => {
  const raw = selectedData.value?.sustained || ''
  const nums = raw.match(/\d+/g)?.map(Number) || []

  if (nums.length >= 3) {
    return {
      mode: 'bars',
      items: [
        { label: '3 months', value: nums[0] },
        { label: '6 months', value: nums[1] },
        { label: '12 months', value: nums[2] },
      ],
    }
  }

  return {
    mode: 'note',
    note: raw,
  }
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectCondition = (id) => {
  selectedId.value = id
  isDropdownOpen.value = false
}

const closeDropdown = (e) => {
  if (!e.target.closest('.select-filter-container')) {
    isDropdownOpen.value = false
  }
}

const setSectionRef = (el) => {
  if (el && !sectionRefs.value.includes(el)) {
    sectionRefs.value.push(el)
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
  document.addEventListener('click', closeDropdown)

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentBgColor.value = entry.target.dataset.bgcolor || '#E2E8DF'
        }
      })
    },
    { threshold: 0.2 },
  )

  sectionRefs.value.forEach((section) => {
    if (section instanceof Element) {
      observer.observe(section)
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  if (observer) observer.disconnect()
  observer = null
  sectionRefs.value = []
})
</script>

<template>
  <div class="app-container">
    <main class="main-content tcm-page-main" :style="{ backgroundColor: currentBgColor }">
      <NavBar />

      <section class="vis-hero" :ref="setSectionRef" data-bgcolor="#E2E8DF">
        <div class="container text-center">
          <p class="text-uppercase text-teal tracking-wide">TCM Clinical Outcomes</p>
          <h1 class="hero-headline">Visualise Your Healing Trajectory</h1>

          <div class="select-filter-container">
            <span class="filter-label">CHOOSE A CONDITION</span>
            <div class="custom-select" @click.stop="toggleDropdown">
              <span class="selected-text">{{ selectedData.name }}</span>
              <svg
                :class="{ rotate: isDropdownOpen }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <Transition name="dropdown">
              <ul v-if="isDropdownOpen" class="select-options">
                <li
                  v-for="cond in tcmConditions"
                  :key="cond.id"
                  :class="{ active: cond.id === selectedId }"
                  @click.stop="selectCondition(cond.id)"
                >
                  {{ cond.name }}
                </li>
              </ul>
            </Transition>
          </div>
        </div>
      </section>

      <section class="vis-dashboard" :ref="setSectionRef" data-bgcolor="#FAF7F2">
        <div class="container">
          <h2 class="dashboard-title">{{ selectedData.name }}</h2>

          <Transition name="fade" mode="out-in">
            <div :key="selectedId" class="dashboard-grid">
              <!-- Recovery Timeline -->
              <div class="dash-card shimmer-effect sweep-card">
                <div class="card-header">
                  <div class="icon-circle teal">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 12C4 7.5 7.5 4 12 4C15 4 17.5 5.5 19 8"
                        stroke="#325B49"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <path
                        d="M12 10C12 7.5 14 6 16.5 6C16.5 8.5 15 10.5 12.5 11"
                        stroke="#325B49"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <line
                        x1="12.5"
                        y1="11"
                        x2="15.5"
                        y2="7"
                        stroke="#325B49"
                        stroke-width="1.2"
                        stroke-linecap="round"
                      />
                      <circle cx="4" cy="12" r="1.2" fill="#D68BA2" />
                      <circle cx="12" cy="12" r="1.5" fill="#325B49" />
                    </svg>
                  </div>
                  <div>
                    <h3>Recovery Timeline</h3>
                    <p class="sub-text">{{ selectedData.time }} typical</p>
                  </div>
                </div>

                <div class="timeline-chart-wrapper">
                  <div class="chart-labels">
                    <span>Start</span>
                    <span class="median-label">Median: {{ selectedData.medianWeeks }}w</span>
                    <span>Full recovery</span>
                  </div>

                  <div class="chart-body">
                    <div class="y-axis">
                      <span>100%</span>
                      <span>75%</span>
                      <span>50%</span>
                      <span>25%</span>
                      <span>0%</span>
                    </div>

                    <div class="chart-content">
                      <div class="chart-svg-container line-sheen">
                        <svg viewBox="0 0 100 50" preserveAspectRatio="none" class="growth-curve">
                          <line
                            x1="0"
                            y1="5"
                            x2="100"
                            y2="5"
                            stroke="#eee"
                            stroke-width="0.5"
                            stroke-dasharray="2,2"
                          />
                          <line
                            x1="0"
                            y1="16.25"
                            x2="100"
                            y2="16.25"
                            stroke="#eee"
                            stroke-width="0.5"
                            stroke-dasharray="2,2"
                          />
                          <line
                            x1="0"
                            y1="27.5"
                            x2="100"
                            y2="27.5"
                            stroke="#eee"
                            stroke-width="0.5"
                            stroke-dasharray="2,2"
                          />
                          <line
                            x1="0"
                            y1="38.75"
                            x2="100"
                            y2="38.75"
                            stroke="#eee"
                            stroke-width="0.5"
                            stroke-dasharray="2,2"
                          />
                          <line x1="0" y1="50" x2="100" y2="50" stroke="#eee" stroke-width="0.5" />

                          <path
                            d="M 0,50 C 35,50 65,5 100,5"
                            fill="none"
                            stroke="var(--primary-teal)"
                            stroke-width="2"
                            class="animate-curve"
                          />
                          <path
                            d="M 0,50 C 35,50 65,5 100,5"
                            fill="none"
                            stroke="rgba(255,255,255,0.55)"
                            stroke-width="0.9"
                            class="curve-glow"
                          />
                          <path
                            d="M 0,50 C 35,50 65,5 100,5 L 100,50 L 0,50 Z"
                            fill="rgba(50, 91, 73, 0.08)"
                            class="animate-fill"
                          />
                        </svg>
                      </div>

                      <div class="chart-x-axis">
                        <span>0w</span>
                        <span>{{ Math.max(1, Math.round(selectedData.maxWeeks / 4)) }}w</span>
                        <span>{{ Math.max(1, Math.round(selectedData.maxWeeks / 2)) }}w</span>
                        <span>{{ Math.max(1, Math.round(selectedData.maxWeeks * 0.75)) }}w</span>
                        <span>{{ selectedData.maxWeeks || 4 }}w</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Outcome Comparison -->
              <div class="dash-card shimmer-effect sweep-card sweep-card-strong">
                <div class="card-header">
                  <div class="icon-circle pink">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="4" y="12" width="3.2" height="6" rx="1.6" fill="#D8C2A8" />
                      <rect x="10.2" y="8.5" width="3.2" height="9.5" rx="1.6" fill="#325B49" />
                      <rect x="16.4" y="6" width="3.2" height="12" rx="1.6" fill="#5E8B73" />
                      <path
                        d="M15.8 5.8C15.8 3.9 17.3 2.8 19.2 2.8C19.2 4.7 18.1 6.2 16.2 6.5"
                        stroke="#325B49"
                        stroke-width="1.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M16.2 6.4L18.4 3.9"
                        stroke="#325B49"
                        stroke-width="1.1"
                        stroke-linecap="round"
                      />
                      <line
                        x1="3"
                        y1="19.5"
                        x2="21"
                        y2="19.5"
                        stroke="#D9DDD7"
                        stroke-width="1.2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3>Outcome Comparison</h3>
                    <p class="sub-text">Recovery Rate (%)</p>
                  </div>
                </div>

                <div class="comparison-bars">
                  <div class="bar-group">
                    <div class="bar-info">
                      <span class="bar-title">With TCM</span>
                      <span class="bar-value teal-text">{{ selectedData.tcmRate }}</span>
                    </div>
                    <div class="bar-track">
                      <div
                        class="bar-fill teal-fill animate-grow"
                        :style="{ '--target-width': selectedData.tcmRateNum + '%' }"
                      ></div>
                    </div>
                  </div>

                  <div class="bar-group mt-20">
                    <div class="bar-info">
                      <span class="bar-title">No Treatment (Spontaneous)</span>
                      <span class="bar-value brown-text">{{ selectedData.noTreatment }}</span>
                    </div>
                    <div class="bar-track">
                      <div
                        class="bar-fill brown-fill animate-grow"
                        :style="{ '--target-width': selectedData.noTreatNum + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="treatment-split mt-30">
                  <div class="split-box">
                    <span class="split-label">
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line
                          x1="12"
                          y1="4"
                          x2="12"
                          y2="18"
                          stroke="#325B49"
                          stroke-width="1.6"
                          stroke-linecap="round"
                        />
                        <circle cx="12" cy="4" r="1.6" fill="#325B49" />
                        <path
                          d="M6 12C7.5 10.5 9 10.5 10.5 12C12 13.5 13.5 13.5 15 12C16.5 10.5 18 10.5 19 12"
                          stroke="#5E8B73"
                          stroke-width="1.4"
                          stroke-linecap="round"
                        />
                        <path
                          d="M13.5 17C13.5 15.8 14.6 15 15.8 15C15.8 16.2 15 17.3 13.8 17.5"
                          stroke="#325B49"
                          stroke-width="1.2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <line
                          x1="13.8"
                          y1="17.4"
                          x2="15"
                          y2="15.8"
                          stroke="#325B49"
                          stroke-width="1"
                          stroke-linecap="round"
                        />
                      </svg>
                      Acupuncture
                    </span>
                    <span class="split-text">{{ selectedData.acuRole }}</span>
                  </div>

                  <div class="split-box mt-10">
                    <span class="split-label">
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 14C5 17 7.5 19 12 19C16.5 19 19 17 19 14"
                          stroke="#325B49"
                          stroke-width="1.6"
                          stroke-linecap="round"
                        />
                        <line
                          x1="4"
                          y1="14"
                          x2="20"
                          y2="14"
                          stroke="#D8C2A8"
                          stroke-width="1.4"
                          stroke-linecap="round"
                        />
                        <path
                          d="M10 11C10 9.5 11.2 8.5 12.7 8.5C12.7 10 11.8 11.2 10.3 11.5"
                          stroke="#325B49"
                          stroke-width="1.4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M14 11C14 9.5 15.2 8.5 16.7 8.5C16.7 10 15.8 11.2 14.3 11.5"
                          stroke="#325B49"
                          stroke-width="1.4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M11 6C11 5 12 5 12 4"
                          stroke="#5E8B73"
                          stroke-width="1.2"
                          stroke-linecap="round"
                        />
                        <path
                          d="M13 6C13 5 14 5 14 4"
                          stroke="#5E8B73"
                          stroke-width="1.2"
                          stroke-linecap="round"
                        />
                      </svg>
                      Herbal Medicine
                    </span>
                    <span class="split-text">{{ selectedData.herbRole }}</span>
                  </div>
                </div>

                <!-- Long-term Stability -->
                <div class="sustain-block mt-30">
                  <div class="sustain-header">
                    <h4>Long-term Stability</h4>
                    <span class="sub-text">Sustained Relief (3 / 6 / 12 months)</span>
                  </div>

                  <template v-if="sustainedData.mode === 'bars'">
                    <div class="sustain-bars">
                      <div
                        v-for="item in sustainedData.items"
                        :key="item.label"
                        class="sustain-item"
                      >
                        <div class="sustain-row-top">
                          <span class="sustain-label">{{ item.label }}</span>
                          <span class="sustain-value">{{ item.value }}%</span>
                        </div>
                        <div class="bar-track sustain-track">
                          <div
                            class="bar-fill teal-fill animate-grow"
                            :style="{ '--target-width': item.value + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="sustain-note">
                      {{ selectedData.sustained }}
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </Transition>

          <Transition name="fade" mode="out-in">
            <div
              v-if="selectedData.speedUp && selectedData.speedUp.length > 0"
              :key="'factors-' + selectedId"
              class="factors-dashboard shimmer-effect"
            >
              <h3 class="factors-title">Factors Influencing Recovery Speed</h3>

              <div class="factors-grid">
                <div class="factor-col">
                  <h4 class="factor-heading teal-text">
                    <span class="arrow-up">↑</span> What speeds up recovery
                  </h4>

                  <div
                    class="factor-card"
                    v-for="(item, i) in selectedData.speedUp"
                    :key="`up-${i}`"
                    :style="{ '--factor-index': i }"
                  >
                    <h5>{{ item.title }}</h5>
                    <p>{{ item.desc }}</p>
                  </div>
                </div>

                <div class="factor-col">
                  <h4 class="factor-heading pink-text">
                    <span class="arrow-down">↓</span> What slows down recovery
                  </h4>

                  <div
                    class="factor-card pink-card"
                    v-for="(item, i) in selectedData.slowDown"
                    :key="`down-${i}`"
                    :style="{ '--factor-index': i }"
                  >
                    <h5>{{ item.title }}</h5>
                    <p>{{ item.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </section>

      <section class="disclaimer-section" :ref="setSectionRef" data-bgcolor="#CFDAC8">
        <div class="container">
          <div class="disclaimer-grid">
            <div class="disclaimer-box">
              <div class="disclaimer-head">
                <span class="disclaimer-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <!-- soft alert circle -->
                    <circle cx="12" cy="12" r="8" stroke="#D68BA2" stroke-width="1.5" />

                    <!-- exclamation -->
                    <line
                      x1="12"
                      y1="8"
                      x2="12"
                      y2="12.2"
                      stroke="#325B49"
                      stroke-width="1.7"
                      stroke-linecap="round"
                    />
                    <circle cx="12" cy="15.2" r="1.1" fill="#325B49" />

                    <!-- tiny leaf accent -->
                    <path
                      d="M15.4 8.4C15.4 7.3 16.3 6.5 17.4 6.5C17.4 7.6 16.7 8.5 15.6 8.6"
                      stroke="#325B49"
                      stroke-width="1.1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <h4>How we estimate outcomes</h4>
              </div>
              <p>
                We combine published clinical guidance, typical treatment timelines and conservative
                modelling assumptions to visualise common trajectories. The ranges shown represent
                typical experiences only.
              </p>
            </div>

            <div class="disclaimer-box warning">
              <div class="disclaimer-head">
                <span class="disclaimer-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <!-- soft alert circle -->
                    <circle cx="12" cy="12" r="8" stroke="#D68BA2" stroke-width="1.5" />

                    <!-- exclamation -->
                    <line
                      x1="12"
                      y1="8"
                      x2="12"
                      y2="12.2"
                      stroke="#325B49"
                      stroke-width="1.7"
                      stroke-linecap="round"
                    />
                    <circle cx="12" cy="15.2" r="1.1" fill="#325B49" />

                    <!-- tiny leaf accent -->
                    <path
                      d="M15.4 8.4C15.4 7.3 16.3 6.5 17.4 6.5C17.4 7.6 16.7 8.5 15.6 8.6"
                      stroke="#325B49"
                      stroke-width="1.1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <h4>Important disclaimer</h4>
              </div>
              <p>
                This tool provides general educational information only. It is not a diagnosis and
                cannot replace a professional assessment. Individual outcomes may vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div :ref="setSectionRef" data-bgcolor="#EED6DF">
        <PageFooter />
      </div>
    </main>
  </div>
</template>

<style scoped>
.main-content {
  transition: background-color 0.8s ease-in-out;
  min-height: 100vh;
  padding-bottom: 0;
}

.tcm-page-main {
  opacity: 1 !important;
  animation: pageFadeIn 0.8s ease-out forwards;
}

@keyframes pageFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.text-uppercase {
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.text-teal {
  color: var(--primary-teal);
}

.teal-text {
  color: var(--primary-teal);
  font-weight: 700;
}

.pink-text {
  color: var(--accent-pink);
  font-weight: 700;
}

.brown-text {
  color: #967c60;
  font-weight: 700;
}

.mt-10 {
  margin-top: 10px;
}
.mt-20 {
  margin-top: 20px;
}
.mt-30 {
  margin-top: 30px;
}

.vis-hero {
  padding: 60px 0 20px;
}

.hero-headline {
  font-size: 42px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 10px 0 30px;
}

.select-filter-container {
  background: white;
  border-radius: 20px;
  padding: 25px 40px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.04);
  position: relative;
  text-align: left;
  z-index: 100;
}

.filter-label {
  font-size: 12px;
  color: #888;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 10px;
}

.custom-select {
  background: #f4f7f4;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.custom-select:hover {
  border-color: rgba(50, 91, 73, 0.2);
}

.selected-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
}

.custom-select svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.custom-select svg.rotate {
  transform: rotate(180deg);
}

.select-options {
  position: absolute;
  top: 105%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 16px;
  list-style: none;
  padding: 10px 0;
  margin: 0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-height: 350px;
  overflow-y: auto;
}

.select-options li {
  padding: 14px 40px;
  font-size: 16px;
  color: var(--text-dark);
  cursor: pointer;
  transition: background 0.2s;
}

.select-options li:hover,
.select-options li.active {
  background: #f4f7f4;
  color: var(--primary-teal);
  font-weight: 700;
}

.vis-dashboard {
  padding: 20px 0 60px;
}

.dashboard-title {
  text-align: center;
  font-size: 28px;
  color: var(--primary-teal);
  margin-bottom: 30px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.dash-card,
.factors-dashboard {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.icon-circle.teal {
  background: rgba(50, 91, 73, 0.1);
}

.icon-circle.pink {
  background: rgba(214, 139, 162, 0.15);
}

.card-header h3 {
  margin: 0;
  font-size: 22px;
  color: var(--text-primary);
}

.sub-text {
  margin: 5px 0 0;
  font-size: 14px;
  color: #888;
}

.timeline-chart-wrapper {
  position: relative;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-teal);
  margin-bottom: 15px;
}

.median-label {
  background: var(--primary-teal);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.chart-body {
  display: flex;
  gap: 15px;
  height: 240px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 11px;
  color: #aaa;
  text-align: right;
  padding-bottom: 22px;
  font-weight: 600;
}

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-svg-container {
  flex: 1;
  border-left: 2px solid #f0f0f0;
  position: relative;
  overflow: visible;
}

.growth-curve {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.animate-curve {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawCurve 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.1s;
}

@keyframes drawCurve {
  to {
    stroke-dashoffset: 0;
  }
}

.animate-fill {
  opacity: 0;
  animation: fadeInFill 0.8s ease-out 1.2s forwards;
}

@keyframes fadeInFill {
  to {
    opacity: 1;
  }
}

.chart-x-axis {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #aaa;
  margin-top: 10px;
  font-weight: 600;
}

.bar-info {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 15px;
  align-items: center;
}

.bar-title {
  font-weight: 700;
  color: var(--text-primary);
}

.bar-track {
  height: 12px;
  background: #f0f0f0;
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  width: 0;
}

.teal-fill {
  background: var(--primary-teal);
}

.brown-fill {
  background: #967c60;
}

.animate-grow {
  animation: growBar 1s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.2s;
}

@keyframes growBar {
  to {
    width: var(--target-width);
  }
}

.split-box {
  background: #f9fbf9;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.split-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-teal);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.split-text {
  font-size: 15px;
  color: var(--text-dark);
  line-height: 1.4;
}

/* Long-term Stability */
.sustain-block {
  background: #f9fbf9;
  border-radius: 14px;
  padding: 16px;
}

.sustain-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 14px;
}

.sustain-header h4 {
  margin: 0;
  font-size: 15px;
  color: var(--primary-teal);
  font-weight: 700;
}

.sustain-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sustain-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sustain-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sustain-label {
  font-size: 12px;
  font-weight: 700;
  color: #666;
}

.sustain-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary-teal);
}

.sustain-track {
  height: 10px;
}

.sustain-note {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-dark);
  background: rgba(50, 91, 73, 0.05);
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 12px;
  padding: 14px;
}

.factors-title {
  text-align: center;
  font-size: 24px;
  margin: 0 0 30px;
  color: var(--text-primary);
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 15px;
}

.factors-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.factor-heading {
  font-size: 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.arrow-up,
.arrow-down {
  display: inline-block;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  text-align: center;
  line-height: 24px;
  font-size: 14px;
}

.arrow-up {
  background: var(--primary-teal);
}

.arrow-down {
  background: var(--accent-pink);
}

.factor-card {
  background: #f4f7f4;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 4px solid var(--primary-teal);
  text-align: left;
  opacity: 0;
  animation: factorSlideUp 0.6s ease-out forwards calc(var(--factor-index) * 0.15s + 0.2s);
}

.pink-card {
  background: rgba(214, 139, 162, 0.05);
  border-left-color: var(--accent-pink);
}

.factor-card h5 {
  margin: 0 0 10px;
  font-size: 16px;
  color: var(--text-dark);
  font-weight: 700;
}

.factor-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

@keyframes factorSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.disclaimer-section {
  padding: 60px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.disclaimer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.disclaimer-box h4 {
  font-size: 16px;
  color: var(--text-dark);
  margin: 0 0 10px;
}

.disclaimer-box p {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.disclaimer-box.warning h4 {
  color: var(--accent-pink);
}

.curve-glow {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation:
    drawCurve 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.1s,
    glowPulse 4.8s ease-in-out infinite 1.4s;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.15;
  }
  20% {
    opacity: 0.6;
  }
  35% {
    opacity: 0.2;
  }
}

.shimmer-effect {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.shimmer-effect::after {
  content: '';
  position: absolute;
  top: -25%;
  left: -160%;
  width: 46%;
  height: 150%;
  transform: skewX(-22deg);
  pointer-events: none;
  z-index: 3;
  opacity: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 18%,
    rgba(255, 255, 255, 0.55) 42%,
    rgba(255, 255, 255, 0.82) 50%,
    rgba(255, 255, 255, 0.55) 58%,
    rgba(255, 255, 255, 0.1) 82%,
    rgba(255, 255, 255, 0) 100%
  );
  filter: blur(2px);
}

.sweep-card::after {
  animation: cardSweep 5.8s ease-in-out infinite;
}

.sweep-card-strong::after {
  width: 52%;
  height: 165%;
  top: -32%;
  left: -170%;
  opacity: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.14) 16%,
    rgba(255, 255, 255, 0.62) 38%,
    rgba(255, 255, 255, 0.96) 50%,
    rgba(255, 255, 255, 0.62) 62%,
    rgba(255, 255, 255, 0.14) 84%,
    rgba(255, 255, 255, 0) 100%
  );
  filter: blur(3px);
  animation: cardSweepStrong 4.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.line-sheen {
  position: relative;
  overflow: hidden;
}

.line-sheen::after {
  content: '';
  position: absolute;
  top: -10%;
  left: -120%;
  width: 30%;
  height: 120%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.45) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-18deg);
  pointer-events: none;
  z-index: 4;
  opacity: 0;
  animation: lineSweep 4.8s ease-in-out infinite;
  animation-delay: 1.2s;
}

@keyframes cardSweep {
  0% {
    left: -160%;
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  24% {
    left: 140%;
    opacity: 1;
  }
  30% {
    left: 140%;
    opacity: 0;
  }
  100% {
    left: 140%;
    opacity: 0;
  }
}

@keyframes cardSweepStrong {
  0% {
    left: -170%;
    opacity: 0;
  }
  6% {
    opacity: 1;
  }
  18% {
    opacity: 1;
  }
  30% {
    left: 145%;
    opacity: 1;
  }
  36% {
    left: 145%;
    opacity: 0;
  }
  100% {
    left: 145%;
    opacity: 0;
  }
}

@keyframes lineSweep {
  0% {
    left: -120%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  30% {
    left: 125%;
    opacity: 1;
  }
  36% {
    left: 125%;
    opacity: 0;
  }
  100% {
    left: 125%;
    opacity: 0;
  }
}

.dash-card {
  position: relative;
}

.dash-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.34) 0%,
    rgba(255, 255, 255, 0.1) 22%,
    rgba(255, 255, 255, 0.03) 100%
  );
  z-index: 1;
}

.dash-card > * {
  position: relative;
  z-index: 2;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

@media (max-width: 768px) {
  .hero-headline {
    font-size: 32px;
  }

  .select-filter-container {
    padding: 20px;
    border-radius: 16px;
  }

  .custom-select {
    padding: 12px 15px;
  }

  .selected-text {
    font-size: 16px;
  }

  .dashboard-grid,
  .factors-grid,
  .disclaimer-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .dash-card,
  .factors-dashboard {
    padding: 25px;
  }

  .chart-body {
    height: 200px;
  }

  .bar-info,
  .sustain-row-top {
    gap: 8px;
  }

  .sustain-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.disclaimer-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.disclaimer-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.disclaimer-box h4 {
  margin: 0;
}
</style>
