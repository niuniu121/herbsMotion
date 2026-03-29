<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavBar from '../component/NavBar.vue'
import PageFooter from '../component/PageFooter.vue'

const currentBgColor = ref('#E2E8DF')
const sectionRefs = ref([])
const isDropdownOpen = ref(false)
const activeChartPoint = ref(null)
const showTheoryNoteTooltip = ref(false)
const isResearchOpen = ref(false)
let observer = null

const physioConditions = [
  {
    id: 'lowbackpain',
    name: 'Low Back Pain (Non-specific)',
    expectTitle: 'What to Expect When You Visit Us for Low Back Pain',
    expect:
      'When you visit us for low back pain, you will receive a thorough assessment to understand your movement patterns, posture, lifestyle, and contributing factors such as work or activity levels. We focus on identifying the source of your pain and any underlying dysfunction. Your treatment plan may include hands-on therapy, targeted exercises, and education to help you move with confidence. Our goal is to reduce pain, improve function, and support long-term recovery and prevention.',
    research: {
      summary:
        'Research strongly supports physiotherapy for non-specific low back pain. Exercise therapy, manual therapy, and education have been shown to reduce pain and improve function, especially when combined with an active, movement-based approach (Maher et al., 2017).',
      references: [
        'Maher, C., Underwood, M., & Buchbinder, R. (2017). Non-specific low back pain. The Lancet, 389(10070), 736–747.',
      ],
    },
    time: '2–12 wks',
    timeUnit: 'weeks',
    medianValue: 4,
    axisMax: 6,
    physioRate: '85% – 95%',
    physioRateNum: 90,
    noTreatment: '~12 weeks (natural course)',
    noTreatNum: 18,
    sustained: '92% / 85% / 80%',
    manualRole: 'Rapid relief of acute spasm & pain.',
    exerciseRole: 'Rebuilds core stability & prevents recurrence.',
    speedUp: [
      {
        title: 'Early, Calm Re-Activation',
        desc: '• Gentle walking and graded spinal movement reduce fear-based guarding.\n• A confident return to simple daily activity often improves progress quickly.',
      },
      {
        title: 'Pacing + Load Control',
        desc: '• Breaking activity into manageable blocks helps avoid pain spikes.\n• Smart pacing usually supports steadier week-to-week recovery.',
      },
    ],
    slowDown: [
      {
        title: 'Complete Resting or Bed Rest',
        desc: '• Doing too little often increases stiffness and reduces tolerance.\n• Avoidance can delay the return of normal movement confidence.',
      },
      {
        title: 'Repeated Heavy Bending / Twisting',
        desc: '• Repeated flare-ups from poor load choices can keep symptoms active.\n• Recovery is slower when the tissue never really settles.',
      },
    ],
  },
  {
    id: 'neckpain',
    name: 'Neck Pain (Non-specific)',
    expectTitle: 'What to Expect When You Visit Us for Neck Pain',
    expect:
      'When you visit us for neck pain, we assess your posture, movement, muscle tension, and daily activities such as desk work or phone use. Treatment may include manual therapy, mobility exercises, and strengthening to reduce stiffness and improve movement. We also provide practical advice to prevent recurrence.',
    research: {
      summary:
        'Physiotherapy, including exercise and manual therapy, is recommended for neck pain and has been shown to improve pain and function (Blanpied et al., 2017).',
      references: [
        'Blanpied, P. R., Gross, A. R., Elliott, J. M., et al. (2017). Neck pain clinical practice guidelines. Journal of Orthopaedic & Sports Physical Therapy, 47(7), A1–A83.',
      ],
    },
    time: '2–12 wks',
    timeUnit: 'weeks',
    medianValue: 3,
    axisMax: 4,
    physioRate: '80% – 90%',
    physioRateNum: 85,
    noTreatment: '~12 weeks',
    noTreatNum: 15,
    sustained: '88% / 82% / 75%',
    manualRole: 'Improves joint mobility & releases tight muscles.',
    exerciseRole: 'Strengthens deep neck flexors & posture control.',
    speedUp: [
      {
        title: 'Posture Variation',
        desc: '• Changing positions regularly reduces prolonged cervical loading.\n• Small movement breaks during desk work help reduce irritation.',
      },
      {
        title: 'Targeted Deep Neck Training',
        desc: '• Rebuilding endurance in stabilising muscles improves support.\n• Better control often reduces recurrent pain episodes.',
      },
    ],
    slowDown: [
      {
        title: 'Long Static Desk Positions',
        desc: '• Staying still too long can increase local stiffness and sensitivity.\n• Symptoms often persist when the neck never gets movement variety.',
      },
      {
        title: 'Stress-Driven Muscle Guarding',
        desc: '• Stress can increase upper-trap tension and headache patterns.\n• That tension often makes recovery feel slower than it should.',
      },
    ],
  },
  {
    id: 'rotatorcufftendinopathy',
    name: 'Rotator Cuff Tendinopathy',
    expectTitle: 'What to Expect When You Visit Us for Rotator Cuff Tendinopathy',
    expect:
      'When you visit us for shoulder pain related to rotator cuff tendinopathy, we assess your shoulder movement, strength, and contributing factors such as posture and activity. Treatment focuses on progressive strengthening, improving movement patterns, and reducing pain through targeted exercises and manual therapy.',
    research: {
      summary:
        'Exercise-based physiotherapy is considered a first-line treatment and has been shown to improve pain and shoulder function (Littlewood et al., 2013).',
      references: [
        'Littlewood, C., Ashton, J., Chance-Larsen, K., May, S., & Sturrock, B. (2013). Exercise for rotator cuff tendinopathy. British Journal of Sports Medicine, 47(2), 1–7.',
      ],
    },
    time: '1.5–6 months',
    timeUnit: 'months',
    medianValue: 3,
    axisMax: 6,
    physioRate: '75% – 88%',
    physioRateNum: 82,
    noTreatment: '<10%',
    noTreatNum: 10,
    sustained: '85% / 80% / 70%',
    manualRole: 'Relieves compensatory muscle tension.',
    exerciseRole: 'Progressive tendon loading (gold standard long-term).',
    speedUp: [
      {
        title: 'Progressive Tendon Loading',
        desc: '• Tendons respond best to steady, graded strengthening.\n• Consistency matters more than occasional hard sessions.',
      },
      {
        title: 'Scapular Control',
        desc: '• Better shoulder blade mechanics reduce overload on the cuff.\n• Cleaner movement usually improves tolerance faster.',
      },
    ],
    slowDown: [
      {
        title: 'Stop-Start Rehab',
        desc: '• Tendons dislike long breaks followed by overload.\n• Irregular loading often causes repeated setbacks.',
      },
      {
        title: 'Aggressive Overhead Irritation',
        desc: '• Heavy overhead work too early can repeatedly provoke symptoms.\n• That keeps the tendon in an irritated state.',
      },
    ],
  },
  {
    id: 'rotatorcufftear',
    name: 'Rotator Cuff Tear (Conservative)',
    expectTitle: 'What to Expect When You Visit Us for a Rotator Cuff Tear',
    expect:
      'When you visit us for a rotator cuff tear being managed conservatively, we assess your shoulder strength, movement, and function. Treatment focuses on strengthening surrounding muscles, improving joint stability, and restoring functional movement through a structured rehabilitation program.',
    research: {
      summary:
        'Research suggests that many rotator cuff tears can be successfully managed with physiotherapy, improving pain and function without surgery (Kuhn et al., 2013).',
      references: [
        'Kuhn, J. E., Dunn, W. R., Sanders, R., et al. (2013). Effectiveness of physical therapy in treating rotator cuff tears. Journal of Shoulder and Elbow Surgery, 22(10), 1371–1379.',
      ],
    },
    time: '2–6.5 months',
    timeUnit: 'months',
    medianValue: 4,
    axisMax: 6.5,
    physioRate: '60% – 80%',
    physioRateNum: 72,
    noTreatment: '<5%',
    noTreatNum: 5,
    sustained: '75% / 70% / 65%',
    manualRole: 'Pain modulation & inflammation control.',
    exerciseRole: 'Strengthens intact muscles for compensation.',
    speedUp: [
      {
        title: 'Compensatory Strengthening',
        desc: '• Building the remaining intact shoulder musculature improves function.\n• Good compensation often reduces pain during daily tasks.',
      },
      {
        title: 'Functional Range Progression',
        desc: '• Gradually reclaiming useful motion supports confidence.\n• The goal is better function, not forcing perfect movement early.',
      },
    ],
    slowDown: [
      {
        title: 'Forcing Painful Range',
        desc: '• Pushing too aggressively into painful motion can increase irritation.\n• It may slow adaptation instead of helping it.',
      },
      {
        title: 'Weak Scapular Support',
        desc: '• Poor shoulder blade control increases load on already compromised tissues.\n• That often limits progress.',
      },
    ],
  },
  {
    id: 'kneeoa',
    name: 'Knee Osteoarthritis (Acute Phase)',
    expectTitle: 'What to Expect When You Visit Us for Knee Osteoarthritis',
    expect:
      'When you visit us for knee osteoarthritis, we assess your pain, movement, strength, and functional limitations. Treatment may include gentle exercises, manual therapy, and strategies to reduce joint load and inflammation. Our goal is to improve mobility, reduce pain, and support daily function.',
    research: {
      summary:
        'Exercise therapy is strongly recommended for knee osteoarthritis and has been shown to reduce pain and improve function (Bannuru et al., 2019).',
      references: [
        'Bannuru, R. R., Osani, M. C., Vaysbrot, E. E., et al. (2019). OARSI guidelines for knee osteoarthritis. Osteoarthritis and Cartilage, 27(11), 1578–1589.',
      ],
    },
    time: '2–12 wks',
    timeUnit: 'weeks',
    medianValue: 5,
    axisMax: 6,
    physioRate: '70% – 85%',
    physioRateNum: 78,
    noTreatment: '~20%',
    noTreatNum: 20,
    sustained: '80% / 75% / 65%',
    manualRole: 'Reduces joint effusion & synovial inflammation.',
    exerciseRole: 'Strengthens quadriceps to reduce joint load.',
    speedUp: [
      {
        title: 'Quadriceps Re-Activation',
        desc: '• Stronger quads improve shock absorption and joint support.\n• Even small strength gains can change pain quite quickly.',
      },
      {
        title: 'Symptom-Calmed Movement',
        desc: '• Cycling, controlled walking and sit-to-stand progressions help.\n• Calm movement usually improves lubrication and confidence.',
      },
    ],
    slowDown: [
      {
        title: 'Boom-Bust Activity',
        desc: '• Doing too much on a good day often causes a painful rebound.\n• OA responds better to consistency than big swings.',
      },
      {
        title: 'Persistent Swelling',
        desc: '• Ongoing effusion can shut down muscle activation.\n• That makes the joint feel weaker and slower to improve.',
      },
    ],
  },
  {
    id: 'meniscus',
    name: 'Meniscus Injury',
    expectTitle: 'What to Expect When You Visit Us for a Meniscus Injury',
    expect:
      'When you visit us for a meniscus injury, we assess your knee movement, stability, and functional limitations. Treatment focuses on restoring strength, improving mobility, and supporting safe return to activity through a structured rehabilitation program.',
    research: {
      summary:
        'Research shows that physiotherapy can be as effective as surgery for many meniscus injuries, particularly in improving function and reducing pain (Katz et al., 2013).',
      references: [
        'Katz, J. N., Brophy, R. H., Chaisson, C. E., et al. (2013). Surgery versus physical therapy for meniscal tear. New England Journal of Medicine, 368(18), 1675–1684.',
      ],
    },
    time: '1–4 months',
    timeUnit: 'months',
    medianValue: 2.5,
    axisMax: 4,
    physioRate: '65% – 80%',
    physioRateNum: 74,
    noTreatment: '<10%',
    noTreatNum: 10,
    sustained: '82% / 75% / 70%',
    manualRole: 'Improves knee range of motion.',
    exerciseRole: 'Closed-chain strengthening (e.g., squats).',
    speedUp: [
      {
        title: 'Range + Confidence Recovery',
        desc: '• Restoring comfortable bend/straighten range improves normal gait.\n• Better movement confidence supports faster functional return.',
      },
      {
        title: 'Closed-Chain Strengthening',
        desc: '• Controlled weight-bearing exercises usually transfer well to daily life.\n• They help rebuild trust in the knee.',
      },
    ],
    slowDown: [
      {
        title: 'Twisting Under Load',
        desc: '• Poorly controlled twisting can keep the knee reactive.\n• Symptoms tend to linger when rotation is repeatedly provoked.',
      },
      {
        title: 'Avoiding Weight-Bearing Too Long',
        desc: '• Too much unloading reduces strength and tolerance.\n• That can make normal tasks feel harder for longer.',
      },
    ],
  },
  {
    id: 'acl',
    name: 'Rehabilitation post ACL Reconstruction',
    expectTitle: 'What to Expect When You Visit Us',
    expect:
      'When you visit us following ACL reconstruction, we guide you through a structured rehabilitation program tailored to your stage of recovery. This includes restoring strength, stability, balance, and confidence in your knee, with a focus on safe return to sport or activity.',
    research: {
      summary:
        'Physiotherapy-led rehabilitation is essential after ACL reconstruction and plays a key role in improving outcomes and reducing reinjury risk (Ardern et al., 2016).',
      references: [
        'Ardern, C. L., Taylor, N. F., Feller, J. A., & Webster, K. E. (2016). Return to sport following ACL reconstruction. British Journal of Sports Medicine, 50(10), 596–606.',
      ],
    },
    time: '6–9 mos*',
    timeUnit: 'months',
    medianValue: 7.5,
    axisMax: 9,
    physioRate: '90% – 95%',
    physioRateNum: 93,
    noTreatment: 'N/A (surgical)',
    noTreatNum: 30,
    sustained: '95% / 90% / 85%',
    manualRole: 'Early scar release & ROM recovery.',
    exerciseRole: 'Neuromuscular control & plyometric training.',
    speedUp: [
      {
        title: 'Milestone-Based Progression',
        desc: '• Strength, hop quality and control should progress in phases.\n• Following the right sequence protects long-term outcome.',
      },
      {
        title: 'Consistent Strength Work',
        desc: '• Regular lower-limb loading is essential for return to sport.\n• Small, consistent gains matter more than random big sessions.',
      },
    ],
    slowDown: [
      {
        title: 'Rushing Return to Sport',
        desc: '• Returning too early can create major setbacks or reinjury risk.\n• Function must match the demands of the sport.',
      },
      {
        title: 'Persistent Quad Inhibition',
        desc: '• When quad strength lags, gait and landing mechanics suffer.\n• That slows higher-level recovery.',
      },
    ],
  },
  {
    id: 'anklesprain',
    name: 'Lateral Ankle Sprain',
    expectTitle: 'What to Expect When You Visit Us for an Ankle Sprain',
    expect:
      'When you visit us for an ankle sprain, we assess swelling, stability, and movement. Treatment includes early mobility, strengthening, and balance training to support recovery and prevent recurrence.',
    research: {
      summary:
        'Exercise-based rehabilitation is highly effective in improving recovery and reducing the risk of future ankle sprains (Doherty et al., 2017).',
      references: [
        'Doherty, C., Delahunt, E., Caulfield, B., et al. (2017). Lateral ankle sprain management. British Journal of Sports Medicine, 51(2), 113–125.',
      ],
    },
    time: '2–12 wks',
    timeUnit: 'weeks',
    medianValue: 4,
    axisMax: 6,
    physioRate: '85% – 95%',
    physioRateNum: 90,
    noTreatment: '~25%',
    noTreatNum: 25,
    sustained: '90% / 88% / 82%',
    manualRole: 'Lymphatic drainage & early mobilization.',
    exerciseRole: 'Proprioception (balance) training to prevent recurrence.',
    speedUp: [
      {
        title: 'Early Mobility + Compression',
        desc: '• Managing swelling early often helps range return faster.\n• Better mobility supports a smoother walking pattern.',
      },
      {
        title: 'Balance Retraining',
        desc: '• Proprioception work reduces instability and recurrence risk.\n• It is often the difference between recovery and repeat sprains.',
      },
    ],
    slowDown: [
      {
        title: 'Skipping Balance Work',
        desc: '• Pain may improve before stability does.\n• Without retraining, recurrence risk stays high.',
      },
      {
        title: 'Returning to Sport Too Soon',
        desc: '• A fast pain drop can be misleading.\n• Unready ligaments and poor control often cause re-injury.',
      },
    ],
  },
  {
    id: 'achilles',
    name: 'Achilles Tendinopathy',
    expectTitle: 'What to Expect When You Visit Us for Achilles Tendinopathy',
    expect:
      'When you visit us for Achilles tendon pain, we assess your loading patterns, strength, and activity levels. Treatment focuses on progressive loading exercises to strengthen the tendon and reduce pain.',
    research: {
      summary:
        'Exercise therapy, particularly loading programs, is considered the gold standard for Achilles tendinopathy (Malliaras et al., 2013).',
      references: [
        'Malliaras, P., Barton, C. J., Reeves, N. D., & Langberg, H. (2013). Achilles tendinopathy loading programs. British Journal of Sports Medicine, 47(4), 207–214.',
      ],
    },
    time: '2–6.5 months',
    timeUnit: 'months',
    medianValue: 4,
    axisMax: 6.5,
    physioRate: '70% – 85%',
    physioRateNum: 78,
    noTreatment: '<5%',
    noTreatNum: 5,
    sustained: '85% / 78% / 72%',
    manualRole: 'Deep calf muscle release.',
    exerciseRole: 'HSR (heavy slow resistance) & eccentric loading.',
    speedUp: [
      {
        title: 'Heavy Slow Resistance',
        desc: '• The Achilles usually responds well to progressive calf strengthening.\n• Tissue capacity improves when loading is gradual and regular.',
      },
      {
        title: 'Activity Modification',
        desc: '• Adjusting hills, sprinting and jumping load helps symptoms settle.\n• Smart training edits keep progress moving.',
      },
    ],
    slowDown: [
      {
        title: 'Under-Recovery Between Sessions',
        desc: '• Repeated overload without recovery can keep the tendon reactive.\n• The result is often a stop-start rehab pattern.',
      },
      {
        title: 'Ignoring Morning Stiffness Trends',
        desc: '• Morning pain is a useful load marker.\n• If ignored, training often overshoots tolerance.',
      },
    ],
  },
  {
    id: 'plantarfasciitis',
    name: 'Plantar Fasciitis',
    expectTitle: 'What to Expect When You Visit Us for Plantar Fasciitis',
    expect:
      'When you visit us for heel pain, we assess your foot mechanics, walking patterns, and contributing factors. Treatment may include stretching, strengthening, and load management strategies.',
    research: {
      summary:
        'Exercise therapy and load management are effective in reducing pain and improving function in plantar fasciitis (Rasenberg et al., 2018).',
      references: [
        'Rasenberg, N., Bierma-Zeinstra, S. M. A., Bindels, P. J. E., et al. (2018). Treatment of plantar fasciitis. British Journal of Sports Medicine, 52(5), 323–328.',
      ],
    },
    time: '1.5–6 months',
    timeUnit: 'months',
    medianValue: 3.5,
    axisMax: 6,
    physioRate: '75% – 90%',
    physioRateNum: 84,
    noTreatment: '~15%',
    noTreatNum: 15,
    sustained: '88% / 85% / 80%',
    manualRole: 'Shockwave or plantar fascia release.',
    exerciseRole: 'Intrinsic foot strengthening & calf stretching.',
    speedUp: [
      {
        title: 'Foot Load Redistribution',
        desc: '• Footwear, taping and calf flexibility can reduce early strain.\n• That often makes walking more tolerable quite quickly.',
      },
      {
        title: 'Intrinsic Foot Strength',
        desc: '• Better local foot support improves long-term resilience.\n• It helps reduce repeated morning pain patterns.',
      },
    ],
    slowDown: [
      {
        title: 'Long Standing on Hard Floors',
        desc: '• Prolonged hard-surface loading can keep symptoms persistent.\n• The fascia often needs smarter load exposure.',
      },
      {
        title: 'No Calf Flexibility Work',
        desc: '• Tight calf mechanics can maintain higher plantar stress.\n• Ignoring this driver often slows progress.',
      },
    ],
  },
  {
    id: 'pfps',
    name: 'Patellofemoral Pain Syndrome',
    expectTitle: 'What to Expect When You Visit Us for Knee Pain (PFPS)',
    expect:
      'When you visit us for patellofemoral pain, we assess your movement patterns, strength, and biomechanics. Treatment focuses on strengthening the hip and knee, improving alignment, and reducing stress on the joint.',
    research: {
      summary:
        'Exercise therapy, particularly strengthening, is strongly recommended and effective in reducing pain and improving function (Crossley et al., 2016).',
      references: [
        'Crossley, K. M., van Middelkoop, M., Callaghan, M. J., et al. (2016). Patellofemoral pain consensus statement. British Journal of Sports Medicine, 50(14), 844–852.',
      ],
    },
    time: '1.5–5 months',
    timeUnit: 'months',
    medianValue: 3,
    axisMax: 5,
    physioRate: '80% – 90%',
    physioRateNum: 85,
    noTreatment: 'Variable',
    noTreatNum: 22,
    sustained: '90% / 85% / 75%',
    manualRole: 'Reduces patellar tracking stress.',
    exerciseRole: 'Hip & knee alignment strengthening.',
    speedUp: [
      {
        title: 'Hip-Knee Alignment Work',
        desc: '• Better glute and quadriceps control improves tracking mechanics.\n• It usually reduces stair and squat discomfort.',
      },
      {
        title: 'Gradual Reloading of Squats / Stairs',
        desc: '• Controlled exposure helps rebuild knee tolerance.\n• That is often more effective than total avoidance.',
      },
    ],
    slowDown: [
      {
        title: 'High Repetition Knee Irritation',
        desc: '• Too many stairs, jumps or deep squats too early can keep symptoms active.\n• Repeated irritation slows adaptation.',
      },
      {
        title: 'Poor Movement Strategy',
        desc: '• Dynamic valgus and poor landing control can maintain pain.\n• Mechanics matter a lot in this condition.',
      },
    ],
  },
]

const sortedConditions = computed(() => {
  return [...physioConditions].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  )
})

const selectedId = ref(physioConditions[0].id)

const selectedData = computed(() => {
  return physioConditions.find((c) => c.id === selectedId.value) || physioConditions[0]
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

const hasExpect = computed(() => Boolean(selectedData.value?.expect))
const hasResearch = computed(() => Boolean(selectedData.value?.research))

const unitShortMap = {
  days: 'd',
  weeks: 'w',
  months: 'mo',
  cycles: 'cy',
}

const unitWordMap = {
  days: ['day', 'days'],
  weeks: ['week', 'weeks'],
  months: ['month', 'months'],
  cycles: ['cycle', 'cycles'],
}

const formatNumber = (value) => {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)))
}

const formatMedianLabel = (value, unit) => {
  const [singular, plural] = unitWordMap[unit] || ['unit', 'units']
  const label = value === 1 ? singular : plural
  return `${formatNumber(value)} ${label}`
}

const formatAxisTick = (value, unit) => {
  return `${formatNumber(value)}${unitShortMap[unit] || ''}`
}

const chartTicks = computed(() => {
  const max = selectedData.value.axisMax || 4
  return [0, max * 0.25, max * 0.5, max * 0.75, max].map((v) => Number(v.toFixed(2)))
})

const medianLabelText = computed(() => {
  return formatMedianLabel(selectedData.value.medianValue, selectedData.value.timeUnit)
})

const getCurveControlPoints = (condition) => {
  const unit = condition.timeUnit
  const max = condition.axisMax || 4
  const median = condition.medianValue || max * 0.75

  let cp1x = 35
  let cp1y = 50
  let cp2x = 65
  let cp2y = 5

  if (unit === 'days') {
    cp1x = 18
    cp1y = 48
    cp2x = 48
    cp2y = 8
  } else if (unit === 'months') {
    cp1x = 38
    cp1y = 50
    cp2x = 72
    cp2y = 8
  } else if (unit === 'cycles') {
    cp1x = 32
    cp1y = 50
    cp2x = 70
    cp2y = 7
  }

  const medianRatio = Math.min(Math.max(median / max, 0.15), 0.95)
  cp2x = Math.max(42, Math.min(78, medianRatio * 88))

  return {
    p0: { x: 0, y: 50 },
    p1: { x: cp1x, y: cp1y },
    p2: { x: cp2x, y: cp2y },
    p3: { x: 100, y: 5 },
  }
}

const cubicBezierPoint = (t, p0, p1, p2, p3) => {
  const mt = 1 - t
  const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x
  const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y

  return { x, y }
}

const chartPath = computed(() => {
  const { p1, p2 } = getCurveControlPoints(selectedData.value)
  return `M 0,50 C ${p1.x},${p1.y} ${p2.x},${p2.y} 100,5`
})

const chartInteractivePoints = computed(() => {
  const condition = selectedData.value
  const { p0, p1, p2, p3 } = getCurveControlPoints(condition)
  const max = condition.axisMax || 4
  const pointCount = 25
  const points = []

  for (let i = 0; i <= pointCount; i++) {
    const t = i / pointCount
    const point = cubicBezierPoint(t, p0, p1, p2, p3)
    const rawXValue = max * t
    const percent = Math.max(0, Math.min(100, ((50 - point.y) / 45) * 100))

    points.push({
      id: `${condition.id}-${i}`,
      xLabel: formatAxisTick(rawXValue, condition.timeUnit),
      yLabel: `${Math.round(percent)}%`,
      xPercent: point.x,
      yPercent: (point.y / 50) * 100,
    })
  }

  return points
})

const showChartPoint = (point) => {
  activeChartPoint.value = point
}

const toggleChartPoint = (point) => {
  if (activeChartPoint.value?.id === point.id) {
    activeChartPoint.value = null
  } else {
    activeChartPoint.value = point
  }
}

const clearChartPoint = () => {
  activeChartPoint.value = null
}

const tooltipStyle = computed(() => {
  if (!activeChartPoint.value) return {}

  const left = Math.min(Math.max(activeChartPoint.value.xPercent, 8), 92)
  const top = Math.min(Math.max(activeChartPoint.value.yPercent, 10), 90)

  return {
    left: `${left}%`,
    top: `${top}%`,
  }
})

const tooltipPlacementClass = computed(() => {
  if (!activeChartPoint.value) return ''

  const x = activeChartPoint.value.xPercent
  const y = activeChartPoint.value.yPercent

  if (x > 78) return 'tooltip-left'
  if (x < 22) return 'tooltip-right'
  if (y < 20) return 'tooltip-bottom'
  return 'tooltip-top'
})

const activeGuideStyle = computed(() => {
  if (!activeChartPoint.value) return {}
  return { left: `${activeChartPoint.value.xPercent}%` }
})

const activeDotStyle = computed(() => {
  if (!activeChartPoint.value) return {}
  return {
    left: `${activeChartPoint.value.xPercent}%`,
    top: `${activeChartPoint.value.yPercent}%`,
  }
})

const theoryNoteTooltipText =
  'These explanations are simplified physiotherapy-informed summaries for education and visualisation only. They are not a diagnosis or a substitute for individual clinical assessment.'

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const toggleResearch = () => {
  isResearchOpen.value = !isResearchOpen.value
}

const selectCondition = (id) => {
  selectedId.value = id
  isDropdownOpen.value = false
  activeChartPoint.value = null
  showTheoryNoteTooltip.value = false
  isResearchOpen.value = false
}

const closeDropdown = (e) => {
  if (!e.target.closest('.select-filter-container')) {
    isDropdownOpen.value = false
  }
}

const handleWindowClick = (e) => {
  closeDropdown(e)

  if (!e.target.closest('.chart-svg-container')) {
    activeChartPoint.value = null
  }

  if (!e.target.closest('.theory-note-wrap')) {
    showTheoryNoteTooltip.value = false
  }
}

const setSectionRef = (el) => {
  if (el && !sectionRefs.value.includes(el)) {
    sectionRefs.value.push(el)
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
  document.addEventListener('click', handleWindowClick)

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
  document.removeEventListener('click', handleWindowClick)
  if (observer) observer.disconnect()
  observer = null
  sectionRefs.value = []
})
</script>

<template>
  <div class="app-container">
    <main class="main-content physio-page-main" :style="{ backgroundColor: currentBgColor }">
      <NavBar />

      <section class="vis-hero" :ref="setSectionRef" data-bgcolor="#E2E8DF">
        <div class="container text-center">
          <p class="text-uppercase text-teal tracking-wide">PHYSIO CLINICAL OUTCOMES</p>
          <h1 class="hero-headline">Visualise Your Recovery Trajectory</h1>

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
                  v-for="cond in sortedConditions"
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
            <section
              v-if="hasExpect"
              :key="'expect-' + selectedId"
              class="info-panel expect-panel shimmer-effect top-expect-panel"
            >
              <div class="info-panel-header">
                <div class="info-icon teal-soft">✦</div>
                <h3>{{ selectedData.expectTitle }}</h3>
              </div>
              <p class="info-panel-text">
                {{ selectedData.expect }}
              </p>
            </section>
          </Transition>

          <Transition name="fade" mode="out-in">
            <div :key="selectedId" class="dashboard-grid">
              <div class="dash-card shimmer-effect sweep-card hover-card">
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
                      <circle cx="4" cy="12" r="1.2" fill="#D8C2A8" />
                      <circle cx="12" cy="12" r="1.5" fill="#325B49" />
                    </svg>
                  </div>

                  <div>
                    <h3>Time to favourable outcome</h3>
                    <p class="sub-text">{{ selectedData.time }} typical</p>
                  </div>
                </div>

                <div class="timeline-chart-wrapper">
                  <div class="chart-labels">
                    <span>Start</span>
                    <span class="median-label">Median: {{ medianLabelText }}</span>
                    <span>Favourable outcome</span>
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
                      <div
                        class="chart-svg-container line-sheen hover-chart"
                        @mouseleave="clearChartPoint"
                      >
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
                            :d="chartPath"
                            fill="none"
                            stroke="var(--primary-teal)"
                            stroke-width="2"
                            class="animate-curve"
                          />
                          <path
                            :d="chartPath"
                            fill="none"
                            stroke="rgba(255,255,255,0.55)"
                            stroke-width="0.9"
                            class="curve-glow"
                          />
                          <path
                            :d="`${chartPath} L 100,50 L 0,50 Z`"
                            fill="rgba(50, 91, 73, 0.08)"
                            class="animate-fill"
                          />
                        </svg>

                        <div
                          v-if="activeChartPoint"
                          class="chart-guide-line"
                          :style="activeGuideStyle"
                        ></div>

                        <div
                          v-if="activeChartPoint"
                          class="chart-active-dot"
                          :style="activeDotStyle"
                        ></div>

                        <button
                          v-for="point in chartInteractivePoints"
                          :key="point.id"
                          class="chart-hotspot"
                          :style="{ left: `${point.xPercent}%`, top: `${point.yPercent}%` }"
                          @mouseenter="showChartPoint(point)"
                          @focus="showChartPoint(point)"
                          @click.stop="toggleChartPoint(point)"
                          :aria-label="`${point.xLabel}, ${point.yLabel}`"
                          type="button"
                        >
                          <span class="sr-only">{{ point.xLabel }} {{ point.yLabel }}</span>
                        </button>

                        <Transition name="tooltip-fade">
                          <div
                            v-if="activeChartPoint"
                            class="chart-tooltip"
                            :class="tooltipPlacementClass"
                            :style="tooltipStyle"
                          >
                            <div class="tooltip-title">{{ activeChartPoint.xLabel }}</div>
                            <div class="tooltip-value">{{ activeChartPoint.yLabel }}</div>
                          </div>
                        </Transition>
                      </div>

                      <div class="chart-x-axis">
                        <span v-for="tick in chartTicks" :key="tick">
                          {{ formatAxisTick(tick, selectedData.timeUnit) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="dash-card shimmer-effect sweep-card sweep-card-strong hover-card">
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
                    <h3>Results Comparison</h3>
                    <p class="sub-text">Physio Recovery Rate</p>
                  </div>
                </div>

                <div class="comparison-bars">
                  <div class="bar-group hover-info-block">
                    <div class="bar-info">
                      <span class="bar-title">With Physio</span>
                      <span class="bar-value teal-text">{{ selectedData.physioRate }}</span>
                    </div>
                    <div class="bar-track">
                      <div
                        class="bar-fill teal-fill animate-grow"
                        :style="{ '--target-width': selectedData.physioRateNum + '%' }"
                      ></div>
                    </div>
                  </div>

                  <div class="bar-group mt-20 hover-info-block">
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
                  <div class="treatment-heading-block">
                    <span class="treatment-heading-main">How Does the Treatment Work?</span>

                    <div
                      class="theory-note-wrap"
                      @mouseenter="showTheoryNoteTooltip = true"
                      @mouseleave="showTheoryNoteTooltip = false"
                    >
                      <button
                        type="button"
                        class="Notion theory-note-btn"
                        @click.stop="showTheoryNoteTooltip = !showTheoryNoteTooltip"
                        @focus="showTheoryNoteTooltip = true"
                        aria-label="Show physio note"
                      >
                        (Please note, these explanations are simplified clinical summaries.)
                      </button>

                      <Transition name="note-fade">
                        <div v-if="showTheoryNoteTooltip" class="theory-note-tooltip">
                          {{ theoryNoteTooltipText }}
                        </div>
                      </Transition>
                    </div>
                  </div>

                  <div class="split-box hover-info-block">
                    <span class="split-label split-label-with-icon">Manual Therapy</span>
                    <span class="split-text">{{ selectedData.manualRole }}</span>
                  </div>

                  <div class="split-box mt-10 hover-info-block">
                    <span class="split-label split-label-with-icon">Exercise Rehab</span>
                    <span class="split-text">{{ selectedData.exerciseRole }}</span>
                  </div>
                </div>

                <div class="sustain-block mt-30 hover-info-block">
                  <div class="sustain-header">
                    <h4>Sustained Relief (%)</h4>
                    <span class="sub-text">3 / 6 / 12 months</span>
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
                    <div class="sustain-note">{{ selectedData.sustained }}</div>
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
                    class="factor-card hover-factor-card"
                    v-for="(item, i) in selectedData.speedUp"
                    :key="`up-${i}`"
                    :style="{ '--factor-index': i }"
                  >
                    <h5>{{ item.title }}</h5>
                    <p class="factor-desc">{{ item.desc }}</p>
                  </div>
                </div>

                <div class="factor-col">
                  <h4 class="factor-heading pink-text">
                    <span class="arrow-down">↓</span> What slows down recovery
                  </h4>

                  <div
                    class="factor-card pink-card hover-factor-card"
                    v-for="(item, i) in selectedData.slowDown"
                    :key="`down-${i}`"
                    :style="{ '--factor-index': i }"
                  >
                    <h5>{{ item.title }}</h5>
                    <p class="factor-desc">{{ item.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

          <Transition name="fade" mode="out-in">
            <section
              v-if="hasResearch"
              :key="'research-' + selectedId"
              class="info-panel research-panel shimmer-effect"
            >
              <button type="button" class="research-toggle" @click="toggleResearch">
                <div class="research-title-wrap">
                  <h3>What does the Evidence say?</h3>
                </div>

                <span class="research-chevron" :class="{ open: isResearchOpen }">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 14L12 8L18 14"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <Transition name="fade">
                <div v-if="isResearchOpen" class="research-content">
                  <p class="info-panel-text research-summary">
                    {{ selectedData.research.summary }}
                  </p>

                  <div
                    v-if="
                      selectedData.research.references && selectedData.research.references.length
                    "
                    class="references-box"
                  >
                    <h4>References</h4>
                    <ul>
                      <li
                        v-for="(reference, index) in selectedData.research.references"
                        :key="`${selectedId}-ref-${index}`"
                      >
                        {{ reference }}
                      </li>
                    </ul>
                  </div>
                </div>
              </Transition>
            </section>
          </Transition>
        </div>
      </section>

      <section class="disclaimer-section" :ref="setSectionRef" data-bgcolor="#CFDAC8">
        <div class="container">
          <div class="disclaimer-grid">
            <div class="disclaimer-box">
              <div class="disclaimer-head">
                <span class="disclaimer-icon">ⓘ</span>
                <h4>How do we estimate outcomes?</h4>
              </div>
              <p>
                We combine published physiotherapy guidance, conservative rehabilitation timelines
                and practical modelling assumptions to visualise common recovery trajectories. The
                ranges shown represent broad patterns only.
              </p>
            </div>

            <div class="disclaimer-box warning">
              <div class="disclaimer-head">
                <span class="disclaimer-icon">!</span>
                <h4>Important Disclaimer</h4>
              </div>
              <p>
                This tool provides general educational information only. It is not a diagnosis and
                cannot replace an assessment by a qualified physiotherapist, GP or specialist.
                Individual outcomes vary depending on diagnosis, severity, training load, imaging
                findings, surgical history and adherence to rehab.
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

.physio-page-main {
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
  max-width: 640px;
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
  max-height: 360px;
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
.factors-dashboard,
.info-panel {
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
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease;
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
  overflow: visible;
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
  border-radius: 999px;
  font-size: 12px;
}

.chart-body {
  display: flex;
  gap: 15px;
  height: 240px;
  overflow: visible;
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
  transition: color 0.25s ease;
}

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.chart-svg-container {
  flex: 1;
  border-left: 2px solid #f0f0f0;
  position: relative;
  overflow: visible;
  isolation: isolate;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease,
    background-color 0.28s ease;
  border-radius: 16px;
}

.growth-curve {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
  transition: transform 0.28s ease;
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
  color: #8e9a92;
  margin-top: 10px;
  font-weight: 600;
  transition: color 0.25s ease;
}

.chart-guide-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1.5px;
  background: rgba(84, 95, 96, 0.26);
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 5;
}

.chart-active-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #325b49;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 6px 16px rgba(47, 181, 168, 0.28);
  pointer-events: none;
  z-index: 7;
}

.chart-hotspot {
  position: absolute;
  width: 22px;
  height: 22px;
  transform: translate(-50%, -50%);
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  z-index: 8;
  padding: 0;
}

.chart-hotspot::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: rgba(47, 181, 168, 0);
  transition:
    background 0.22s ease,
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.chart-hotspot:hover::before,
.chart-hotspot:focus-visible::before {
  background: rgba(47, 181, 168, 0.18);
  transform: scale(1.18);
  box-shadow: 0 0 0 6px rgba(47, 181, 168, 0.08);
}

.chart-tooltip {
  position: absolute;
  min-width: 136px;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(122, 133, 179, 0.16);
  border-radius: 22px;
  box-shadow: 0 18px 36px rgba(70, 84, 150, 0.14);
  text-align: center;
  pointer-events: none;
  z-index: 30;
  backdrop-filter: blur(8px);
}

.chart-tooltip::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  background: rgba(255, 255, 255, 0.97);
  transform: rotate(45deg);
}

.chart-tooltip.tooltip-top {
  transform: translate(-50%, -115%);
}

.chart-tooltip.tooltip-top::after {
  left: 50%;
  bottom: -7px;
  transform: translateX(-50%) rotate(45deg);
  border-right: 1px solid rgba(122, 133, 179, 0.14);
  border-bottom: 1px solid rgba(122, 133, 179, 0.14);
}

.chart-tooltip.tooltip-left {
  transform: translate(-105%, -50%);
}

.chart-tooltip.tooltip-left::after {
  right: -7px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-top: 1px solid rgba(122, 133, 179, 0.14);
  border-right: 1px solid rgba(122, 133, 179, 0.14);
}

.chart-tooltip.tooltip-right {
  transform: translate(8%, -50%);
}

.chart-tooltip.tooltip-right::after {
  left: -7px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-left: 1px solid rgba(122, 133, 179, 0.14);
  border-bottom: 1px solid rgba(122, 133, 179, 0.14);
}

.chart-tooltip.tooltip-bottom {
  transform: translate(-50%, 16px);
}

.chart-tooltip.tooltip-bottom::after {
  left: 50%;
  top: -7px;
  transform: translateX(-50%) rotate(45deg);
  border-left: 1px solid rgba(122, 133, 179, 0.14);
  border-top: 1px solid rgba(122, 133, 179, 0.14);
}

.tooltip-title {
  font-size: 18px;
  font-weight: 700;
  color: #325b49;
  line-height: 1.2;
}

.tooltip-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 800;
  color: #325b49;
  line-height: 1.2;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.18s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
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
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    background-color 0.28s ease;
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

.treatment-heading-block {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 8px;
}

.treatment-heading-main {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.35;
}

.Notion {
  color: #9a9a9a;
  font-size: 11px;
  line-height: 1.45;
}

.theory-note-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.theory-note-btn {
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  text-align: left;
  cursor: help;
}

.theory-note-btn:hover {
  color: #7f7f7f;
}

.theory-note-tooltip {
  position: absolute;
  left: 0;
  top: calc(100% + 10px);
  width: 260px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(50, 91, 73, 0.1);
  border-radius: 14px;
  box-shadow: 0 16px 30px rgba(50, 91, 73, 0.12);
  color: #666;
  font-size: 13px;
  line-height: 1.65;
  z-index: 40;
  backdrop-filter: blur(6px);
}

.theory-note-tooltip::before {
  content: '';
  position: absolute;
  left: 18px;
  top: -7px;
  width: 14px;
  height: 14px;
  background: rgba(255, 255, 255, 0.98);
  border-left: 1px solid rgba(50, 91, 73, 0.08);
  border-top: 1px solid rgba(50, 91, 73, 0.08);
  transform: rotate(45deg);
}

.note-fade-enter-active,
.note-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.note-fade-enter-from,
.note-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.split-box {
  background: #f9fbf9;
  border-radius: 12px;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    background-color 0.28s ease,
    border-color 0.28s ease;
  border: 1px solid transparent;
}

.split-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-teal);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.split-label-with-icon svg {
  flex-shrink: 0;
}

.split-text {
  font-size: 15px;
  color: var(--text-dark);
  line-height: 1.5;
}

.sustain-block {
  background: #f9fbf9;
  border-radius: 14px;
  padding: 16px;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    background-color 0.28s ease,
    border-color 0.28s ease;
  border: 1px solid transparent;
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

.factors-dashboard {
  margin-bottom: 30px;
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
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    background-color 0.28s ease,
    border-left-color 0.28s ease;
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
  transition: color 0.25s ease;
}

.factor-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  white-space: pre-line;
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

.info-panel {
  margin-bottom: 30px;
}

.info-panel-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.info-panel-header h3 {
  margin: 0;
  font-size: 24px;
  color: var(--text-primary);
}

.info-panel-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.85;
  color: #555;
}

.info-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  flex-shrink: 0;
}

.teal-soft {
  background: rgba(50, 91, 73, 0.1);
  color: var(--primary-teal);
}

.pink-soft {
  background: rgba(214, 139, 162, 0.15);
  color: var(--accent-pink);
}

.expect-panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(249, 252, 249, 1) 100%);
}

.research-panel {
  margin-top: 28px;
  padding: 28px 28px 24px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(50, 91, 73, 0.05);
}

.research-toggle {
  width: 100%;
  border: none;
  background: #eef0ec;
  border-radius: 20px;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background-color 0.25s ease;
}

.research-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(50, 91, 73, 0.05);
}

.research-title-wrap h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
  color: #3e6a58;
}

.research-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3e6a58;
  flex-shrink: 0;
  transition: transform 0.26s ease;
}

.research-chevron.open {
  transform: rotate(180deg);
}

.research-content {
  margin-top: 20px;
  background: #f1f3ef;
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 20px;
  padding: 26px 26px 24px;
}

.research-summary {
  margin: 0 0 16px 0;
  font-size: 15px;
  line-height: 1.8;
  color: #4b6959;
}

.references-box {
  margin-top: 4px;
  padding: 0;
  background: transparent;
  border: none;
}

.references-box h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: #3e6a58;
}

.references-box ul {
  margin: 0;
  padding-left: 22px;
}

.references-box li {
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.75;
  color: #6a6a6a;
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

.disclaimer-box {
  background: rgba(255, 255, 255, 0.45);
  border-radius: 18px;
  padding: 22px;
}

.disclaimer-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.disclaimer-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(50, 91, 73, 0.08);
  color: var(--primary-teal);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.disclaimer-box h4 {
  font-size: 16px;
  color: var(--text-dark);
  margin: 0;
}

.disclaimer-box p {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  margin: 0;
}

.disclaimer-box.warning .disclaimer-icon {
  background: rgba(214, 139, 162, 0.12);
  color: var(--accent-pink);
}

.disclaimer-box.warning h4 {
  color: var(--accent-pink);
}

.curve-glow {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation:
    drawCurve 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.1s,
    glowPulse 5.8s ease-in-out infinite 1.4s;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.12;
  }
  20% {
    opacity: 0.42;
  }
  35% {
    opacity: 0.18;
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
    rgba(255, 255, 255, 0.08) 18%,
    rgba(255, 255, 255, 0.35) 42%,
    rgba(255, 255, 255, 0.56) 50%,
    rgba(255, 255, 255, 0.35) 58%,
    rgba(255, 255, 255, 0.08) 82%,
    rgba(255, 255, 255, 0) 100%
  );
  filter: blur(2px);
}

.sweep-card::after {
  animation: cardSweep 7.5s ease-out infinite;
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
    rgba(255, 255, 255, 0.1) 16%,
    rgba(255, 255, 255, 0.42) 38%,
    rgba(255, 255, 255, 0.72) 50%,
    rgba(255, 255, 255, 0.42) 62%,
    rgba(255, 255, 255, 0.1) 84%,
    rgba(255, 255, 255, 0) 100%
  );
  filter: blur(3px);
  animation: cardSweepStrong 9s ease-out infinite;
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
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.28) 50%,
    rgba(255, 255, 255, 0.08) 75%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-18deg);
  pointer-events: none;
  z-index: 4;
  opacity: 0;
  animation: lineSweep 8.5s ease-out infinite;
  animation-delay: 1.8s;
}

@keyframes cardSweep {
  0% {
    left: -160%;
    opacity: 0;
  }
  5% {
    opacity: 0;
  }
  8% {
    opacity: 0.95;
  }
  14% {
    left: 120%;
    opacity: 0.95;
  }
  16% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

@keyframes cardSweepStrong {
  0% {
    left: -170%;
    opacity: 0;
  }
  6% {
    opacity: 0;
  }
  9% {
    opacity: 0.95;
  }
  14% {
    left: 130%;
    opacity: 0.95;
  }
  16% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

@keyframes lineSweep {
  0% {
    left: -120%;
    opacity: 0;
  }
  10% {
    opacity: 0;
  }
  13% {
    opacity: 0.8;
  }
  19% {
    left: 125%;
    opacity: 0.8;
  }
  21% {
    opacity: 0;
  }
  100% {
    left: 125%;
    opacity: 0;
  }
}

.dash-card,
.info-panel {
  position: relative;
  transition:
    transform 0.32s ease,
    box-shadow 0.32s ease,
    border-color 0.32s ease,
    background-color 0.32s ease;
  border: 1px solid transparent;
}

.dash-card::before,
.info-panel::before {
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

.dash-card > *,
.info-panel > * {
  position: relative;
  z-index: 2;
}

.hover-card:hover,
.info-panel:hover {
  transform: translateY(-8px);
  box-shadow: 0 22px 44px rgba(50, 91, 73, 0.12);
  border-color: rgba(50, 91, 73, 0.08);
}

.hover-card:hover .icon-circle {
  transform: scale(1.05);
}

.hover-chart:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(50, 91, 73, 0.08);
  background: rgba(50, 91, 73, 0.02);
  border-left-color: rgba(50, 91, 73, 0.22);
}

.hover-card:hover .growth-curve {
  transform: scale(1.01);
}

.hover-card:hover .chart-x-axis,
.hover-card:hover .y-axis {
  color: #8d9a92;
}

.hover-info-block {
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    background-color 0.28s ease,
    border-color 0.28s ease;
  border-radius: 14px;
}

.hover-info-block:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(50, 91, 73, 0.08);
}

.hover-info-block:hover.split-box,
.hover-info-block:hover.sustain-block {
  background: #fbfdfb;
  border-color: rgba(50, 91, 73, 0.1);
}

.hover-info-block:hover .bar-track {
  transform: scaleY(1.04);
  box-shadow: inset 0 0 0 1px rgba(50, 91, 73, 0.04);
}

.hover-factor-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 30px rgba(50, 91, 73, 0.1);
  background: #f7fbf7;
  border-left-color: #4f7b67;
}

.hover-factor-card:hover h5 {
  color: var(--primary-teal);
}

.pink-card.hover-factor-card:hover {
  background: rgba(214, 139, 162, 0.1);
  border-left-color: #d68ba2;
  box-shadow: 0 16px 30px rgba(214, 139, 162, 0.12);
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
  .factors-dashboard,
  .info-panel {
    padding: 25px;
  }

  .chart-body {
    height: 200px;
  }

  .chart-tooltip {
    min-width: 92px;
    padding: 12px 14px;
    border-radius: 16px;
  }

  .tooltip-title {
    font-size: 16px;
  }

  .tooltip-value {
    font-size: 21px;
  }

  .chart-hotspot {
    width: 26px;
    height: 26px;
  }

  .theory-note-tooltip {
    width: min(260px, 78vw);
  }

  .bar-info,
  .sustain-row-top {
    gap: 8px;
  }

  .sustain-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-panel-header {
    align-items: flex-start;
  }

  .info-panel-header h3,
  .research-title-wrap h3 {
    font-size: 18px;
  }

  .research-panel {
    padding: 18px 16px 16px;
    border-radius: 22px;
  }

  .research-toggle {
    padding: 16px 18px;
    border-radius: 16px;
  }

  .research-content {
    margin-top: 16px;
    padding: 18px 18px 16px;
    border-radius: 16px;
  }

  .research-summary {
    font-size: 14px;
    line-height: 1.75;
  }

  .references-box h4 {
    font-size: 13px;
  }

  .references-box li {
    font-size: 13px;
    line-height: 1.7;
  }
}

.top-expect-panel {
  margin-bottom: 28px;
  padding: 34px 40px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(50, 91, 73, 0.05);
}

.top-expect-panel .info-panel-header h3 {
  font-size: 26px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--text-primary);
}

.top-expect-panel .info-panel-text {
  font-size: 15px;
  line-height: 1.85;
  color: #555;
}

.top-expect-panel .info-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  font-size: 18px;
}
</style>
