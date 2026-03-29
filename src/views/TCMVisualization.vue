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

const tcmConditions = [
  {
    id: 'acne',
    name: 'Acne',
    expectTitle: 'What to Expect When You Visit Us for Acne',
    expect:
      'When you visit us for acne, we assess your skin alongside factors such as digestion, hormones, stress, and lifestyle. Using a holistic approach, we create a personalised treatment plan that may include acupuncture, herbal medicine, and dietary guidance to support clearer skin and reduce breakouts.',
    time: '4–8 wks',
    timeUnit: 'weeks',
    medianValue: 6,
    axisMax: 8,
    tcmRate: '70% – 85%',
    tcmRateNum: 77,
    noTreatment: 'Variable',
    noTreatNum: 25,
    sustained: '88% / 75% / 60%',
    acuRole: 'Reduces redness.',
    herbRole: 'Clears internal "Damp-Heat."',
    research: {
      summary:
        'Emerging studies suggest acupuncture and herbal medicine may help reduce acne severity by addressing inflammation and hormonal balance, though more research is needed.',
      references: [
        'Cao, H., Yang, G., Wang, Y., Liu, J., & Smith, C. A. (2015). Complementary therapies for acne vulgaris. Cochrane Database of Systematic Reviews, (1).',
      ],
    },
  },
  {
    id: 'acidreflux',
    name: 'Acid Reflux / GERD',
    expectTitle: 'What to Expect When You Visit Us for Acid Reflux / GERD',
    expect:
      'When you visit us for reflux or upper digestive discomfort, we assess your digestion, eating habits, stress levels, and symptom patterns to understand what may be aggravating the problem. Your treatment plan may include acupuncture, herbal medicine, and gentle dietary guidance aimed at reducing irritation, settling reflux, and improving digestive comfort over time.',
    time: '2–4 wks',
    timeUnit: 'weeks',
    medianValue: 3,
    axisMax: 4,
    tcmRate: '66% – 78%',
    tcmRateNum: 72,
    noTreatment: '~12% (Drug dependent)',
    noTreatNum: 12,
    sustained: '85% / 78% / 70%',
    acuRole: 'Helps settle upper digestive discomfort.',
    herbRole: 'Supports smoother stomach function.',
    speedUp: [
      {
        title: 'Smaller, Regular Meals',
        desc: '• Eating lighter meals reduces pressure on the stomach.\n• More regular eating patterns often reduce reflux episodes.',
      },
      {
        title: 'Early Evening Meals',
        desc: '• Finishing dinner earlier gives digestion more time before lying down.\n• This often reduces night-time reflux and throat irritation.',
      },
    ],
    slowDown: [
      {
        title: 'Late Heavy Eating',
        desc: '• Heavy meals late at night increase reflux risk.\n• Symptoms often persist when digestion is repeatedly overloaded before sleep.',
      },
      {
        title: 'Trigger Foods and Drinks',
        desc: '• Alcohol, greasy food, strong coffee, and spicy meals may aggravate symptoms.\n• Frequent triggering slows progress and increases flare-ups.',
      },
    ],
    research: {
      summary:
        'Research suggests acupuncture may help regulate digestive function and reduce symptoms such as bloating and reflux.',
      references: [
        'Zhou, W., Benharash, P., & Vaziri, N. D. (2016). Acupuncture for chronic pain and related disorders. Current Opinion in Anaesthesiology, 29(5), 583–589.',
      ],
    },
  },
  {
    id: 'bells',
    name: 'Bell’s Palsy',
    expectTitle: 'What to Expect When You Visit Us for Bell’s Palsy',
    expect:
      'When you visit us for Bell’s palsy, we focus on supporting nerve recovery and improving facial muscle function. We assess your condition using traditional diagnostic methods and develop a personalised treatment plan that may include acupuncture to stimulate circulation and nerve healing. Our goal is to support recovery and improve facial movement.',
    time: '2–6 wks',
    timeUnit: 'weeks',
    medianValue: 4,
    axisMax: 6,
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
        desc: '• Starting acupuncture within 3 days may help prevent further nerve weakness.\n• Early care often supports better recovery of facial movement.',
      },
      {
        title: 'Facial Warmth',
        desc: '• Keeping the face warm may help maintain circulation.\n• Gentle massage can support comfort and muscle tone.',
      },
    ],
    slowDown: [
      {
        title: 'Cold Exposure',
        desc: '• Wind and cold can aggravate local stiffness and discomfort.\n• Repeated exposure may slow visible recovery.',
      },
      {
        title: 'High Stress Levels',
        desc: '• Poor sleep and persistent stress can reduce overall recovery capacity.\n• Recovery often feels slower when the nervous system stays overloaded.',
      },
    ],
    research: {
      summary:
        'Research suggests acupuncture may help improve recovery rates and facial nerve function in Bell’s palsy, particularly when treatment is started early.',
      references: [
        'Kim, J. I., Lee, M. S., Choi, T. Y., Lee, H., & Ernst, E. (2012). Acupuncture for Bell’s palsy. Cochrane Database of Systematic Reviews, (4).',
      ],
    },
  },
  {
    id: 'bloating',
    name: 'Bloating/Reflux',
    expectTitle: 'What to Expect When You Visit Us for Bloating or Reflux',
    expect:
      'When you visit us for bloating or reflux, we assess your digestion, eating habits, and stress levels to understand the root causes of your symptoms. Using a holistic approach, we create a personalised plan that may include acupuncture, herbal medicine, and dietary guidance. Our goal is to improve digestive function, reduce discomfort, and restore balance.',
    time: '1–2 wks',
    timeUnit: 'weeks',
    medianValue: 1.5,
    axisMax: 2,
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
        desc: '• Chewing slowly often reduces digestive load.\n• More mindful eating can improve bloating and post-meal discomfort.',
      },
      {
        title: 'Warm, Cooked Foods',
        desc: '• Warm meals are often easier to tolerate.\n• Simpler cooked foods may reduce irritation and heaviness.',
      },
    ],
    slowDown: [
      {
        title: 'Cold/Raw Food Intake',
        desc: '• Cold drinks and large raw meals may worsen digestive discomfort.\n• Repeated irritation can prolong bloating and reflux patterns.',
      },
      {
        title: 'Late Night Eating',
        desc: '• Eating too close to bedtime often worsens reflux.\n• Overnight digestion may feel heavier and slower.',
      },
    ],
    research: {
      summary:
        'Research suggests acupuncture may help regulate digestive function and reduce symptoms such as bloating and reflux.',
      references: [
        'Zhou, W., Benharash, P., & Vaziri, N. D. (2016). Acupuncture for chronic pain and related disorders. Current Opinion in Anaesthesiology, 29(5), 583–589.',
      ],
    },
  },
  {
    id: 'bloatinggas',
    name: 'Bloating & Gas',
    expectTitle: 'What to Expect When You Visit Us for Bloating & Gas',
    expect:
      'When you visit us for bloating and gas, we take the time to understand your digestion, meal timing, food triggers, and stress patterns. We use a holistic assessment to build a personalised treatment plan that may include acupuncture, herbal medicine, and simple dietary guidance. Our focus is to reduce pressure, improve digestive rhythm, and help you feel more comfortable day to day.',
    time: '1–2 wks',
    timeUnit: 'weeks',
    medianValue: 1.5,
    axisMax: 2,
    tcmRate: '72% – 84%',
    tcmRateNum: 78,
    noTreatment: '~20% (Wax & wane)',
    noTreatNum: 20,
    sustained: '90% / 82% / 75%',
    acuRole: 'Helps ease pressure and abdominal fullness.',
    herbRole: 'Supports smoother digestion and gut balance.',
    speedUp: [
      {
        title: 'Consistency in Meal Timing',
        desc: '• Eating at regular times helps regulate digestion.\n• A steadier rhythm often reduces bloating and irregular gut symptoms.',
      },
      {
        title: 'Warm, Easy-to-Digest Meals',
        desc: '• Simple cooked meals are often better tolerated than heavy mixed meals.\n• Warm soups and stews may feel easier on the gut.',
      },
    ],
    slowDown: [
      {
        title: 'Raw/Cold Food Overload',
        desc: '• Large salads, iced drinks, and cold foods may aggravate digestive discomfort.\n• This often increases bloating, heaviness, and gas.',
      },
      {
        title: 'Stress Eating',
        desc: '• Eating while rushed, stressed, or upset often worsens digestive symptoms.\n• Symptoms may flare more easily when the gut stays tense.',
      },
    ],
  },
  {
    id: 'cancerpain',
    name: 'Cancer Pain',
    expectTitle: 'What to Expect When You Visit Us for Cancer Pain',
    expect:
      'When you visit us for cancer-related pain, we provide supportive care alongside your medical treatment. We focus on reducing pain, promoting relaxation, and improving overall quality of life using gentle acupuncture techniques tailored to your condition.',
    time: '1–2 wks',
    timeUnit: 'weeks',
    medianValue: 1.5,
    axisMax: 2,
    tcmRate: '~50% Reduction',
    tcmRateNum: 50,
    noTreatment: 'Baseline',
    noTreatNum: 5,
    sustained: 'Dependent on illness',
    acuRole: 'Best for neuropathic pain.',
    herbRole: 'General palliative support.',
    research: {
      summary:
        'Research suggests acupuncture may help reduce cancer-related pain and improve quality of life when used as a complementary therapy.',
      references: [
        'Zhou, W., Benharash, P., & Vaziri, N. D. (2016). Acupuncture for chronic pain and related disorders. Current Opinion in Anaesthesiology, 29(5), 583–589.',
      ],
    },
  },
  {
    id: 'chronicconstipation',
    name: 'Chronic Constipation',
    expectTitle: 'What to Expect When You Visit Us for Chronic Constipation',
    expect:
      'When you visit us for chronic constipation, we look beyond the bowel symptoms alone and assess digestion, hydration, meal rhythm, stress, and general health. Your personalised treatment plan may include acupuncture, herbal medicine, and practical dietary guidance aimed at improving bowel regularity, reducing discomfort, and restoring more comfortable day-to-day digestion.',
    time: '1–2 wks',
    timeUnit: 'weeks',
    medianValue: 1.5,
    axisMax: 2,
    tcmRate: '72% – 84%',
    tcmRateNum: 78,
    noTreatment: '~20%',
    noTreatNum: 20,
    sustained: '88% / 80% / 75%',
    acuRole: 'Helps stimulate bowel movement rhythm.',
    herbRole: 'Supports stool softness and gut flow.',
    speedUp: [
      {
        title: 'Consistency in Meal Timing',
        desc: '• Regular meal timing can support more consistent bowel movement patterns.\n• Daily rhythm often matters as much as food choice.',
      },
      {
        title: 'Gentle Hydration + Warm Foods',
        desc: '• Adequate fluids and warm, soft meals can reduce strain.\n• Gentle digestive support often improves comfort more quickly.',
      },
    ],
    slowDown: [
      {
        title: 'Raw/Cold Food Overload',
        desc: '• Too much cold, dry, or difficult-to-digest food may slow bowel movement patterns.\n• Symptoms often persist when digestion feels sluggish.',
      },
      {
        title: 'Emotional Stress',
        desc: '• Stress can disrupt normal bowel rhythm.\n• Irregular routines often make constipation more stubborn.',
      },
    ],
  },
  {
    id: 'chroniccough',
    name: 'Chronic Cough',
    expectTitle: 'What to Expect When You Visit Us for Chronic Cough',
    expect:
      'When you visit us for chronic cough, we assess your respiratory health, immune function, and contributing factors such as allergies or digestion. Using a holistic approach, we create a personalised treatment plan that may include acupuncture and herbal medicine to support lung function and reduce irritation.',
    time: '1–3 wks',
    timeUnit: 'weeks',
    medianValue: 2,
    axisMax: 3,
    tcmRate: '72% – 84%',
    tcmRateNum: 78,
    noTreatment: '~30%',
    noTreatNum: 30,
    sustained: '85% / 78% / 72%',
    acuRole: 'Stops the cough reflex.',
    herbRole: 'Moistens the lung tissue.',
    research: {
      summary:
        'Some evidence suggests acupuncture may help improve chronic cough symptoms by supporting respiratory regulation, although more research is needed.',
      references: [
        'Lee, M. S., & Ernst, E. (2011). Acupuncture for cough: A systematic review. Respiratory Medicine, 105(3), 331–337.',
      ],
    },
  },
  {
    id: 'chronicdiarrhea',
    name: 'Chronic Diarrhea',
    expectTitle: 'What to Expect When You Visit Us for Chronic Diarrhea',
    expect:
      'When you visit us for chronic diarrhoea, we assess your digestion, food triggers, stress patterns, and general health to understand the wider picture of your symptoms. Your treatment plan may include acupuncture, herbal medicine, and gentle lifestyle guidance designed to calm urgency, support digestive stability, and help restore more predictable bowel habits.',
    time: '1–2 wks',
    timeUnit: 'weeks',
    medianValue: 1.5,
    axisMax: 2,
    tcmRate: '70% – 80%',
    tcmRateNum: 75,
    noTreatment: '~15%',
    noTreatNum: 15,
    sustained: '85% / 78% / 72%',
    acuRole: 'Helps calm urgency and gut reactivity.',
    herbRole: 'Supports stool regulation and digestive stability.',
    speedUp: [
      {
        title: 'Consistency in Meal Timing',
        desc: '• Eating at more regular times can support steadier digestion.\n• Predictable eating routines may reduce urgency and gut irritability.',
      },
      {
        title: 'Simple, Warm Foods',
        desc: '• Gentle cooked foods are often easier to tolerate during recovery.\n• A simpler diet can help the gut settle more quickly.',
      },
    ],
    slowDown: [
      {
        title: 'Raw/Cold Food Overload',
        desc: '• Cold drinks, greasy meals, and hard-to-digest foods may worsen loose stools.\n• Repeated irritation can prolong flare-ups.',
      },
      {
        title: 'Emotional Eating',
        desc: '• Stress and rushed meals may aggravate bowel urgency.\n• Symptoms often improve more slowly when the gut stays reactive.',
      },
    ],
  },
  {
    id: 'chronicfatigue',
    name: 'Chronic Fatigue',
    expectTitle: 'What to Expect When You Visit Us for Chronic Fatigue',
    expect:
      'When you visit us for chronic fatigue, we take a holistic approach to understand your energy levels, sleep quality, stress, and overall health. Using traditional diagnostic methods, we identify underlying imbalances contributing to fatigue. Your treatment may include acupuncture, herbal medicine, and supportive lifestyle guidance aimed at restoring energy, improving sleep, and supporting long-term recovery.',
    time: '6–8 wks',
    timeUnit: 'weeks',
    medianValue: 7,
    axisMax: 8,
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
        desc: '• Staying within a manageable energy range can reduce crashes.\n• Gradual recovery often works better than forcing activity too early.',
      },
      {
        title: 'Consistent Recovery Routine',
        desc: '• Sleep, food, and treatment consistency often matter more than intensity.\n• A stable rhythm usually supports steadier progress.',
      },
    ],
    slowDown: [
      {
        title: 'Boom and Bust Cycles',
        desc: '• Overdoing it on a good day can lead to a bigger setback afterward.\n• Recovery often stalls when energy use is too uneven.',
      },
      {
        title: 'Mental Over-Exertion',
        desc: '• Long periods of stress, screen time, or emotional overload can worsen fatigue.\n• Cognitive strain can feel as draining as physical effort.',
      },
    ],
    research: {
      summary:
        'Research suggests acupuncture may help improve fatigue and energy levels by supporting nervous system regulation and overall balance, although more high-quality studies are needed.',
      references: [
        'Zhou, W., Benharash, P., & Vaziri, N. D. (2016). Acupuncture for chronic pain and related disorders. Current Opinion in Anaesthesiology, 29(5), 583–589.',
      ],
    },
  },
  {
    id: 'chronichives',
    name: 'Hives (Chronic)',
    expectTitle: 'What to Expect When You Visit Us for Chronic Hives',
    expect:
      'When you visit us for chronic hives, we take a holistic approach to understand underlying triggers such as immune imbalance, stress, and environmental factors. Using traditional diagnostic methods, we develop a personalised treatment plan that may include acupuncture and herbal medicine to help reduce inflammation and support long-term skin health.',
    time: '2–4 wks',
    timeUnit: 'weeks',
    medianValue: 3,
    axisMax: 4,
    tcmRate: '60% – 75%',
    tcmRateNum: 67,
    noTreatment: '~20%',
    noTreatNum: 20,
    sustained: '82% / 72% / 65%',
    acuRole: 'Immediate itch relief.',
    herbRole: 'Stabilizes the immune system.',
    research: {
      summary:
        'Some evidence suggests that TCM approaches may help reduce the frequency and severity of chronic hives, although further research is needed.',
      references: [
        'Gu, S., Yang, A. W., Xue, C. C., Li, C. G., & Da Costa, C. (2015). Chinese herbal medicine for chronic urticaria. Cochrane Database of Systematic Reviews, (5).',
      ],
    },
  },
  {
    id: 'eczema',
    name: 'Eczema',
    expectTitle: 'What to Expect When You Visit Us for Eczema',
    expect:
      'When you visit us for eczema, we take a holistic approach to understand not only your skin symptoms but also your digestion, stress levels, and immune health. Using traditional diagnostic methods, we identify underlying patterns contributing to inflammation and irritation. Treatment may include acupuncture, herbal medicine, and lifestyle advice to help soothe the skin and reduce flare-ups. Our focus is to support long-term skin health by addressing the root causes of imbalance.',
    time: '4–8 wks',
    timeUnit: 'weeks',
    medianValue: 6,
    axisMax: 8,
    tcmRate: '65% – 75%',
    tcmRateNum: 70,
    noTreatment: '~15%',
    noTreatNum: 15,
    sustained: '85% / 70% / 62%',
    acuRole: 'Stops the itch.',
    herbRole: 'Heals skin barrier & redness.',
    speedUp: [
      {
        title: 'Moisture Management',
        desc: '• Skin barrier care and irritation control may reduce flare intensity.\n• Consistent skin support often improves comfort over time.',
      },
      {
        title: 'Anti-Inflammatory Diet',
        desc: '• A calmer, less reactive diet may support recovery.\n• Avoiding known triggers often reduces repeated flare-ups.',
      },
    ],
    slowDown: [
      {
        title: 'Chronic Scratching',
        desc: '• Scratching can damage the skin barrier further.\n• Repeated irritation often extends recovery time.',
      },
      {
        title: 'Topical Steroid Overuse',
        desc: '• Prolonged dependence can complicate skin recovery in some cases.\n• The overall picture may become harder to stabilise.',
      },
    ],
    research: {
      summary:
        'Emerging research suggests that TCM treatments, including acupuncture and herbal medicine, may help reduce the severity and frequency of eczema symptoms.',
      references: [
        'Zhang, C. S., Yu, J. J., Parker, S., Zhang, A. L., May, B., Lu, C., & Xue, C. C. (2015). Oral Chinese herbal medicine combined with pharmacotherapy for eczema. Cochrane Database of Systematic Reviews, (4).',
      ],
    },
  },
  {
    id: 'excessivesweating',
    name: 'Excessive Sweating',
    expectTitle: 'What to Expect When You Visit Us for Excessive Sweating',
    expect:
      'When you visit us for excessive sweating, we assess patterns such as triggers, stress levels, and overall body balance. Using a holistic approach, we create a personalised treatment plan that may include acupuncture and herbal medicine to help regulate the body’s temperature and nervous system.',
    time: '4–6 wks',
    timeUnit: 'weeks',
    medianValue: 5,
    axisMax: 6,
    tcmRate: '65% – 78%',
    tcmRateNum: 71,
    noTreatment: '<10%',
    noTreatNum: 10,
    sustained: '85% / 78% / 70%',
    acuRole: 'Regulates ANS.',
    herbRole: '"Astringes" the pores.',
    research: {
      summary:
        'Limited research suggests acupuncture may help regulate sweating by influencing the autonomic nervous system, though more studies are needed.',
      references: [
        'Kim, K. H., Kim, T. H., Kang, J. W., & Lee, M. S. (2011). Acupuncture for hyperhidrosis: A systematic review. Autonomic Neuroscience, 164(1–2), 1–5.',
      ],
    },
  },
  {
    id: 'fertility',
    name: 'Fertility Support',
    expectTitle: 'What to Expect When You Visit Us for Fertility Support',
    expect:
      'When you visit us for fertility support, we take a holistic approach to optimise your overall health, hormonal balance, and menstrual cycle. We assess factors such as stress, lifestyle, and reproductive health to develop a personalised treatment plan that may include acupuncture, herbal medicine, and supportive guidance. Our goal is to support natural fertility or complement assisted reproductive treatments.',
    time: '3–6 mo',
    timeUnit: 'months',
    medianValue: 4.5,
    axisMax: 6,
    tcmRate: '+15%–20% Rate',
    tcmRateNum: 75,
    noTreatment: 'Baseline',
    noTreatNum: 40,
    sustained: 'Target: Healthy Birth',
    acuRole: 'Blood flow.',
    herbRole: 'Follicle & lining quality.',
    research: {
      summary:
        'Research suggests acupuncture may support fertility by improving blood flow, regulating hormones, and reducing stress, particularly when used alongside conventional care.',
      references: [
        'Smith, C. A., Armour, M., Shewamene, Z., Tan, H. Y., Norman, R. J., & Johnson, N. P. (2018). Acupuncture for infertility. Cochrane Database of Systematic Reviews, (4).',
      ],
    },
  },
  {
    id: 'frequentcold',
    name: 'Frequent Cold',
    expectTitle: 'What to Expect When You Visit Us for Frequent Colds',
    expect:
      'When you visit us for frequent colds, we focus on strengthening your immune system and identifying underlying patterns that may make you more susceptible to illness. We take the time to understand your energy levels, recovery time, stress, and overall health, using traditional diagnostic methods such as pulse and tongue assessment. Your treatment plan may include acupuncture, herbal medicine, and lifestyle guidance to support resilience and reduce the frequency of infections.',
    time: '3 months*',
    timeUnit: 'months',
    medianValue: 3,
    axisMax: 3,
    tcmRate: '~55% Fewer',
    tcmRateNum: 55,
    noTreatment: 'No change',
    noTreatNum: 5,
    sustained: '90% / 85% / 80%',
    acuRole: 'Quick recovery.',
    herbRole: 'Builds "Wei Qi" (Immunity).',
    research: {
      summary:
        'Some research suggests that acupuncture may support immune function and help reduce the frequency of respiratory infections by regulating the body’s natural defence systems.',
      references: [
        'Zhou, W., Benharash, P., & Vaziri, N. D. (2016). Acupuncture for chronic pain and related disorders. Current Opinion in Anaesthesiology, 29(5), 583–589.',
      ],
    },
  },
  {
    id: 'gout',
    name: 'Gout (Acute/Chronic)',
    expectTitle: 'What to Expect When You Visit Us for Gout',
    expect:
      'When you visit us for gout, we assess your symptoms, diet, and overall health to understand contributing factors such as inflammation and metabolic balance. Using a holistic approach, we develop a personalised treatment plan that may include acupuncture and herbal medicine to help reduce pain, manage flare-ups, and support long-term joint health.',
    time: '3–7 days',
    timeUnit: 'days',
    medianValue: 5,
    axisMax: 7,
    tcmRate: '70% – 82%',
    tcmRateNum: 76,
    noTreatment: '~15% (slow)',
    noTreatNum: 15,
    sustained: '88% / 75% / 60%',
    acuRole: 'Best for acute pain.',
    herbRole: 'Best for lowering Uric Acid.',
    speedUp: [
      {
        title: 'Hydration',
        desc: '• Adequate fluids may support better uric acid clearance.\n• Good hydration often helps joints feel less reactive during flares.',
      },
      {
        title: 'Anti-Inflammatory Recovery',
        desc: '• Calmer eating patterns and joint protection often support faster settling.\n• Short-term flare management matters a lot.',
      },
    ],
    slowDown: [
      {
        title: 'High-Purine Trigger Foods',
        desc: '• Alcohol, shellfish, and high-sugar drinks may worsen flare-ups.\n• Repeated triggers often prolong pain and swelling.',
      },
      {
        title: 'Sudden Extreme Exercise',
        desc: '• Overloading an inflamed joint can aggravate symptoms.\n• Recovery is often smoother with relative rest first.',
      },
    ],
    research: {
      summary:
        'Some studies suggest acupuncture may help reduce pain and inflammation associated with gout, although more high-quality research is needed to confirm these effects.',
      references: [
        'Lee, M. S., Pittler, M. H., & Ernst, E. (2008). Acupuncture for gouty arthritis: A systematic review. Rheumatology, 47(11), 1747–1752.',
      ],
    },
  },
  {
    id: 'hairloss',
    name: 'Hair Loss (AGA)',
    expectTitle: 'What to Expect When You Visit Us for Hair Loss',
    expect:
      'When you visit us for hair loss, we assess factors such as stress, hormonal balance, circulation, and overall health. Treatment focuses on improving blood flow to the scalp and supporting internal balance through acupuncture and herbal medicine.',
    time: '3–6 mo',
    timeUnit: 'months',
    medianValue: 4.5,
    axisMax: 6,
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
        desc: '• Better overall nutrition and sleep may support healthier scalp conditions.\n• Consistency usually matters more than intensity.',
      },
      {
        title: 'Scalp Stimulation',
        desc: '• Gentle local stimulation may support circulation.\n• Routine scalp care is usually more helpful than sporadic effort.',
      },
    ],
    slowDown: [
      {
        title: 'Chronic Sleep Deprivation',
        desc: '• Poor sleep can worsen overall recovery and stress load.\n• Hair shedding often feels more noticeable when rest is poor.',
      },
      {
        title: 'High-Glycemic Diet',
        desc: '• Frequent sugar spikes may worsen inflammation and oil imbalance.\n• Long-term scalp health can become harder to stabilise.',
      },
    ],
    research: {
      summary:
        'Some research suggests acupuncture may support hair regrowth and reduce hair loss, though stronger evidence is still needed.',
      references: [
        'Kim, T. H., Lee, M. S., Kim, K. H., Kang, J. W., & Choi, T. Y. (2013). Acupuncture for alopecia. Journal of Dermatological Treatment, 24(3), 229–233.',
      ],
    },
  },
  {
    id: 'hayfever',
    name: 'Hay Fever',
    expectTitle: 'What to Expect When You Visit Us for Hay Fever',
    expect:
      'When you visit us for hay fever, we focus on supporting your immune system and reducing sensitivity to allergens. We assess your overall health and patterns of symptoms to create a personalised treatment plan, which may include acupuncture and herbal medicine. Our aim is to reduce the severity and frequency of your symptoms.',
    time: '1–2 wks',
    timeUnit: 'weeks',
    medianValue: 1.5,
    axisMax: 2,
    tcmRate: '70% – 88%',
    tcmRateNum: 79,
    noTreatment: 'Seasonal',
    noTreatNum: 30,
    sustained: '95% / 80% / 65%',
    acuRole: 'Clears sinuses fast.',
    herbRole: 'Prevents the next flare.',
    research: {
      summary:
        'Clinical studies suggest that acupuncture may help relieve symptoms of allergic rhinitis, including sneezing and congestion.',
      references: [
        'Xue, C. C., English, R., Zhang, J. J., Da Costa, C., Li, C. G., & Story, D. F. (2007). Effect of acupuncture in the treatment of allergic rhinitis. Annals of Allergy, Asthma & Immunology, 99(3), 237–243.',
      ],
    },
  },
  {
    id: 'ibs',
    name: 'IBS (Cramps/Pain)',
    expectTitle: 'What to Expect When You Visit Us for IBS',
    expect:
      'When you visit us for support with IBS, you will receive a personalised, holistic consultation that looks beyond just your digestive symptoms. We take the time to understand your digestion, stress levels, diet, and overall health, using traditional diagnostic methods such as pulse and tongue assessment. From there, we create a tailored treatment plan that may include acupuncture, herbal medicine, and gentle guidance around diet and lifestyle. Our focus is to regulate your digestion, reduce discomfort such as bloating or pain, and address the underlying causes so you can experience lasting improvements in your gut health and wellbeing.',
    time: '2–4 wks',
    timeUnit: 'weeks',
    medianValue: 3,
    axisMax: 4,
    tcmRate: '75% – 85%',
    tcmRateNum: 80,
    noTreatment: '<10% (Chronic cycles)',
    noTreatNum: 10,
    sustained: '94% / 85% / 78%',
    acuRole: 'Best for cramping and gut tension.',
    herbRole: 'Supports digestive regulation.',
    speedUp: [
      {
        title: 'Consistency in Meal Timing',
        desc: '• Eating at regular times may support steadier digestive rhythm.\n• Predictability often helps reduce bowel sensitivity and cramping.',
      },
      {
        title: 'Probiotic-Rich Herbal Support',
        desc: '• Gentle digestive support may help gut balance feel more stable.\n• Warm digestive teas before meals may improve comfort for some people.',
      },
    ],
    slowDown: [
      {
        title: 'Raw/Cold Food Overload',
        desc: '• Too much cold, raw, or difficult-to-digest food may aggravate IBS patterns.\n• This often increases bloating, cramping, or alternation in bowel habit.',
      },
      {
        title: 'Emotional Eating',
        desc: '• Stress eating can worsen bowel reactivity.\n• Symptoms often flare faster when digestion and stress patterns overlap.',
      },
    ],
    research: {
      summary:
        'Research suggests that Traditional Chinese Medicine (TCM) may help improve symptoms of IBS, including abdominal pain, bloating, and irregular bowel movements. Studies have found that acupuncture can help regulate gut function and reduce sensitivity, while herbal medicine may support digestive balance.',
      references: [
        'Manheimer, E., Cheng, K., Wieland, L. S., Min, L. S., Shen, X., Berman, B. M., & Lao, L. (2012). Acupuncture for irritable bowel syndrome. American Journal of Gastroenterology, 107(6), 835–847.',
      ],
    },
  },
  {
    id: 'insomnia',
    name: 'Insomnia',
    expectTitle: 'What to Expect When You Visit Us for Insomnia',
    expect:
      'When you visit us for support with insomnia, you will receive a personalised, holistic consultation that looks beyond just your sleep concerns. We take the time to understand your sleep patterns, stress levels, lifestyle, and overall health, using traditional diagnostic methods such as pulse and tongue assessment. From there, we create a tailored treatment plan that may include acupuncture, herbal medicine, and gentle guidance around diet and relaxation. Our focus is to help you sleep more deeply while addressing the root causes of your insomnia, so you can experience lasting improvements in your wellbeing.',
    time: '2–4 wks',
    timeUnit: 'weeks',
    medianValue: 3,
    axisMax: 4,
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
        desc: '• Going to bed and waking up at consistent times often improves sleep rhythm.\n• Early daylight exposure may help reset the body clock.',
      },
      {
        title: 'Evening Wind-Down Ritual',
        desc: '• Reduced screen time before bed can support deeper rest.\n• A calmer pre-sleep routine often helps the nervous system settle.',
      },
    ],
    slowDown: [
      {
        title: 'Late Night Heavy Eating',
        desc: '• Heavy late meals may worsen restlessness and overnight waking.\n• Digestion can compete with the body’s natural sleep drive.',
      },
      {
        title: 'Inconsistent Treatment',
        desc: '• Sleep often improves best with continuity.\n• Stop-start treatment may reduce cumulative benefit.',
      },
    ],
    research: {
      summary:
        'Research suggests that Traditional Chinese Medicine (TCM) may help improve sleep quality and reduce symptoms of insomnia, especially when treatments like acupuncture and herbal medicine are used consistently. Studies have found that acupuncture can help regulate the body’s sleep–wake cycle and calm the nervous system, while certain herbal formulas may support relaxation and reduce nighttime waking.',
      references: [
        'Cao, H., Pan, X., Li, H., & Liu, J. (2009). Acupuncture for treatment of insomnia: A systematic review of randomized controlled trials. Journal of Alternative and Complementary Medicine, 15(11), 1171–1186.',
        'Cheuk, D. K. L., Yeung, W. F., Chung, K. F., & Wong, V. (2012). Acupuncture for insomnia. Cochrane Database of Systematic Reviews, (9), CD005472.',
      ],
    },
  },
  {
    id: 'ivf',
    name: 'IVF Support',
    expectTitle: 'What to Expect When You Visit Us for IVF Support',
    expect:
      'When you visit us for IVF support, we work alongside your medical treatment to support your body and wellbeing throughout the process. We take a holistic view of your health, including stress levels, cycle health, and overall vitality. Treatment may include acupuncture and lifestyle support to help optimise your body’s environment. Our focus is to support you physically and emotionally during your fertility journey.',
    time: '3 months*',
    timeUnit: 'months',
    medianValue: 3,
    axisMax: 3,
    tcmRate: '+15%–20%',
    tcmRateNum: 75,
    noTreatment: 'Baseline',
    noTreatNum: 40,
    sustained: 'N/A (Goal is Live Birth)',
    acuRole: 'Uterine blood flow.',
    herbRole: 'Egg & lining quality.',
    research: {
      summary:
        'Some studies suggest acupuncture may improve IVF outcomes and reduce stress during treatment.',
      references: [
        'Smith, C. A., Armour, M., Shewamene, Z., Tan, H. Y., Norman, R. J., & Johnson, N. P. (2018). Acupuncture for infertility. Cochrane Database of Systematic Reviews, (4).',
      ],
    },
  },
  {
    id: 'pms',
    name: 'PMS',
    expectTitle: 'What to Expect When You Visit Us for PMS',
    expect:
      'When you visit us for PMS, we take the time to understand your menstrual cycle, hormonal patterns, and associated symptoms such as pain, mood changes, and bloating. Using a holistic assessment, we develop a personalised treatment plan that may include acupuncture, herbal medicine, and lifestyle guidance. Our aim is to regulate your cycle, reduce symptoms, and support overall hormonal balance.',
    time: '2–3 cycles',
    timeUnit: 'cycles',
    medianValue: 2.5,
    axisMax: 3,
    tcmRate: '75% – 88%',
    tcmRateNum: 82,
    noTreatment: '<10%',
    noTreatNum: 10,
    sustained: '94% / 88% / 80%',
    acuRole: 'Best for mood/cramps.',
    herbRole: 'Best for breast pain.',
    research: {
      summary:
        'Research suggests that acupuncture may help reduce PMS symptoms, including pain and emotional changes.',
      references: [
        'Armour, M., Ee, C. C., Hao, J., Wilson, T. M., Yao, S. S., Smith, C. A., & Song, J. (2018). Acupuncture and women’s health. Journal of Alternative and Complementary Medicine, 24(10), 965–976.',
      ],
    },
  },
  {
    id: 'stress',
    name: 'Stress/Anxiety',
    expectTitle: 'What to Expect When You Visit Us for Stress and Anxiety',
    expect:
      'When you visit us for support with stress or anxiety, you will receive a personalised, holistic consultation that considers both your emotional wellbeing and physical health. We explore factors such as sleep, digestion, lifestyle, and stress patterns, using traditional diagnostic methods to understand your body’s balance. Your treatment plan may include acupuncture, herbal medicine, and practical guidance to support relaxation and resilience. Our goal is to calm the nervous system, improve emotional balance, and support long-term wellbeing.',
    time: '2–4 wks',
    timeUnit: 'weeks',
    medianValue: 3,
    axisMax: 4,
    tcmRate: '68% – 76%',
    tcmRateNum: 72,
    noTreatment: 'Variable',
    noTreatNum: 20,
    sustained: '88% / 80% / 72%',
    acuRole: 'Rapid "reset" of nerves.',
    herbRole: 'Emotional resilience.',
    research: {
      summary:
        'Research suggests that acupuncture may help reduce symptoms of stress and anxiety by regulating the nervous system and lowering stress hormone levels.',
      references: [
        'Zhou, W., Benharash, P., & Vaziri, N. D. (2016). Acupuncture for chronic pain and related disorders. Current Opinion in Anaesthesiology, 29(5), 583–589.',
      ],
    },
  },
  {
    id: 'tmj',
    name: 'TMJ (Jaw Pain)',
    expectTitle: 'What to Expect When You Visit Us for TMJ',
    expect:
      'When you visit us for TMJ or jaw pain, we assess muscle tension, stress, and alignment contributing to your symptoms. Treatment may include acupuncture to relieve tension, reduce pain, and improve jaw function, along with guidance on managing contributing factors.',
    time: '2–4 wks',
    timeUnit: 'weeks',
    medianValue: 3,
    axisMax: 4,
    tcmRate: '75% – 85%',
    tcmRateNum: 80,
    noTreatment: '~25%',
    noTreatNum: 25,
    sustained: '92% / 85% / 78%',
    acuRole: 'Unbeatable for muscle release.',
    herbRole: 'Best for joint inflammation.',
    research: {
      summary:
        'Studies suggest acupuncture may help reduce TMJ pain and improve function, though further research is needed.',
      references: [
        'La Touche, R., Angulo-Díaz-Parreño, S., De-La-Hoz, J. L., Fernández-Carnero, J., & Ge, H. Y. (2010). Acupuncture in temporomandibular disorders. Journal of Oral Rehabilitation, 37(8), 553–561.',
      ],
    },
  },
  {
    id: 'weight',
    name: 'Weight Loss',
    expectTitle: 'What to Expect When You Visit Us for Weight Loss',
    expect:
      'When you visit us for weight management, we take a personalised and holistic approach that considers your metabolism, digestion, lifestyle, and overall health. We aim to understand factors such as appetite, energy levels, and stress, using traditional diagnostic methods. Your treatment plan may include acupuncture, herbal medicine, and practical guidance around diet and lifestyle. Our goal is to support healthy, sustainable weight loss while improving your overall wellbeing.',
    time: '8–12 wks',
    timeUnit: 'weeks',
    medianValue: 10,
    axisMax: 12,
    tcmRate: '5% – 10% BMI',
    tcmRateNum: 60,
    noTreatment: '<2% net',
    noTreatNum: 10,
    sustained: '75% / 60% / 45%',
    acuRole: 'Controls appetite.',
    herbRole: 'Boosts metabolic rate.',
    research: {
      summary:
        'Some research suggests that acupuncture may support weight loss by helping regulate appetite, metabolism, and energy balance.',
      references: [
        'Cho, S. H., Lee, J. S., Thabane, L., & Lee, J. (2009). Acupuncture for obesity. International Journal of Obesity, 33(2), 183–196.',
      ],
    },
  },
]

const sortedConditions = computed(() => {
  return [...tcmConditions].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  )
})

const selectedId = ref('insomnia')

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
  'These explanations are simplified traditional Chinese medicine-informed summaries for education and visualisation only. They are not a diagnosis and should not replace individual medical advice.'

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
                      <circle cx="4" cy="12" r="1.2" fill="#D68BA2" />
                      <circle cx="12" cy="12" r="1.5" fill="#325B49" />
                    </svg>
                  </div>
                  <div>
                    <h3>Time to Initial Symptom Relief</h3>
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
                    <h3>Results Comparison</h3>
                    <p class="sub-text">Recovery Rate (TCM)</p>
                  </div>
                </div>

                <div class="comparison-bars">
                  <div class="bar-group hover-info-block">
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
                        aria-label="Show theory note"
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
                          stroke="#000000"
                          stroke-width="1.6"
                          stroke-linecap="round"
                        />
                        <circle cx="12" cy="4" r="1.6" fill="#000000" />
                        <path
                          d="M6 12C7.5 10.5 9 10.5 10.5 12C12 13.5 13.5 13.5 15 12C16.5 10.5 18 10.5 19 12"
                          stroke="#000000"
                          stroke-width="1.4"
                          stroke-linecap="round"
                        />
                      </svg>
                      Acupuncture
                    </span>
                    <span class="split-text">{{ selectedData.acuRole }}</span>
                  </div>

                  <div class="split-box mt-10 hover-info-block">
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
                          stroke="#325B49"
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
                    <span class="arrow-up">↑</span> What can speed recovery
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
                    <span class="arrow-down">↓</span> What can slow down recovery
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
            <div
              v-if="hasResearch"
              :key="'research-' + selectedId"
              class="research-section shimmer-effect"
            >
              <button class="research-toggle" type="button" @click="toggleResearch">
                <span>What does the Evidence say?</span>
                <svg
                  :class="{ rotate: isResearchOpen }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#325B49"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              <Transition name="dropdown">
                <div v-if="isResearchOpen" class="research-panel">
                  <p class="research-copy">{{ selectedData.research.intro }}</p>
                  <p class="research-copy">{{ selectedData.research.summary }}</p>

                  <div
                    v-if="
                      selectedData.research.references && selectedData.research.references.length
                    "
                    class="research-refs"
                  >
                    <h4>References</h4>
                    <ul>
                      <li v-for="(refItem, index) in selectedData.research.references" :key="index">
                        {{ refItem }}
                      </li>
                    </ul>
                  </div>
                </div>
              </Transition>
            </div>
          </Transition>
        </div>
      </section>

      <section class="disclaimer-section" :ref="setSectionRef" data-bgcolor="#CFDAC8">
        <div class="container">
          <div class="disclaimer-grid">
            <div class="disclaimer-box info-box">
              <div class="disclaimer-head">
                <span class="disclaimer-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="8" stroke="#D68BA2" stroke-width="1.5" />
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
                    <path
                      d="M15.4 8.4C15.4 7.3 16.3 6.5 17.4 6.5C17.4 7.6 16.7 8.5 15.6 8.6"
                      stroke="#325B49"
                      stroke-width="1.1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <h4>How do we estimate outcomes?</h4>
              </div>
              <p>
                We combine insights from published research, our own experience and that of our
                peers, along with typical treatment timelines and conservative modelling
                assumptions, to map out common trajectories. The ranges presented reflect our
                experience only.
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
                    <circle cx="12" cy="12" r="8" stroke="#D68BA2" stroke-width="1.5" />
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
                    <path
                      d="M15.4 8.4C15.4 7.3 16.3 6.5 17.4 6.5C17.4 7.6 16.7 8.5 15.6 8.6"
                      stroke="#325B49"
                      stroke-width="1.1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <h4>Important Disclaimer</h4>
              </div>
              <p>
                This tool is intended for visualisation and general educational purposes only, to
                help clients gain a broad understanding of some common conditions managed by our
                practitioners. It is based on practitioner experience and selected published
                research. <br />It does not account for individual circumstances, including your
                specific condition, medical history, medications, or other personal factors. Health
                conditions are complex, and outcomes can vary significantly between individuals.<br />
                Our treatments are not a substitute for medical care provided by your healthcare
                professional. You should always follow the advice and treatment plan recommended by
                your medical practitioner, and consult them directly for guidance specific to your
                situation.
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
  max-width: 620px;
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

.expect-section {
  background: white;
  border-radius: 24px;
  padding: 34px 38px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  margin-bottom: 30px;
}

.expect-title {
  font-size: 28px;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0 0 18px;
}

.expect-copy {
  font-size: 17px;
  line-height: 1.75;
  color: #444;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.dash-card,
.factors-dashboard,
.research-section {
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
}

.chart-tooltip.tooltip-left {
  transform: translate(-105%, -50%);
}

.chart-tooltip.tooltip-left::after {
  right: -7px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.chart-tooltip.tooltip-right {
  transform: translate(8%, -50%);
}

.chart-tooltip.tooltip-right::after {
  left: -7px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.chart-tooltip.tooltip-bottom {
  transform: translate(-50%, 16px);
}

.chart-tooltip.tooltip-bottom::after {
  left: 50%;
  top: -7px;
  transform: translateX(-50%) rotate(45deg);
}

.tooltip-title {
  font-size: 18px;
  font-weight: 700;
  color: #325b49;
}

.tooltip-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 800;
  color: #325b49;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active,
.fade-enter-active,
.fade-leave-active,
.dropdown-enter-active,
.dropdown-leave-active,
.note-fade-enter-active,
.note-fade-leave-active {
  transition: all 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to,
.fade-enter-from,
.fade-leave-to,
.dropdown-enter-from,
.dropdown-leave-to,
.note-fade-enter-from,
.note-fade-leave-to {
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

.theory-note-tooltip {
  position: absolute;
  left: 0;
  top: calc(100% + 10px);
  width: 280px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(50, 91, 73, 0.1);
  border-radius: 14px;
  box-shadow: 0 16px 30px rgba(50, 91, 73, 0.12);
  color: #666;
  font-size: 13px;
  line-height: 1.65;
  z-index: 40;
}

.split-box {
  background: #f9fbf9;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  line-height: 1.5;
}

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

.factor-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  white-space: pre-line;
}

.research-section {
  margin-top: 32px;
}

.research-toggle {
  width: 100%;
  border: none;
  background: #f4f7f4;
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-teal);
  cursor: pointer;
}

.research-toggle svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.research-toggle svg.rotate {
  transform: rotate(180deg);
}

.research-panel {
  margin-top: 18px;
  background: #f9fbf9;
  border-radius: 16px;
  padding: 22px;
  border: 1px solid rgba(50, 91, 73, 0.08);
}

.research-copy {
  font-size: 15px;
  color: var(--text-dark);
  line-height: 1.7;
  margin: 0 0 14px;
}

.research-copy:last-child {
  margin-bottom: 0;
}

.research-refs h4 {
  margin: 8px 0 10px;
  font-size: 14px;
  color: var(--primary-teal);
}

.research-refs ul {
  margin: 0;
  padding-left: 18px;
}

.research-refs li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.65;
  color: #555;
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
  gap: 14px;
  margin-bottom: 10px;
}

.disclaimer-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon {
  background: rgba(50, 91, 73, 0.08);
}

.warning-icon {
  background: rgba(214, 139, 162, 0.12);
}

.disclaimer-box h4 {
  font-size: 16px;
  color: var(--text-dark);
  margin: 0;
}

.disclaimer-box.info-box h4 {
  color: var(--primary-teal);
}

.disclaimer-box.warning h4 {
  color: var(--accent-pink);
}

.disclaimer-box p {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  margin: 0;
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
  animation: cardSweepStrong 9s ease-out infinite;
}

@keyframes cardSweep {
  0% {
    left: -160%;
    opacity: 0;
  }
  8% {
    opacity: 0.95;
  }
  14% {
    left: 120%;
    opacity: 0.95;
  }
  16%,
  100% {
    opacity: 0;
  }
}

@keyframes cardSweepStrong {
  0% {
    left: -170%;
    opacity: 0;
  }
  9% {
    opacity: 0.95;
  }
  14% {
    left: 130%;
    opacity: 0.95;
  }
  16%,
  100% {
    opacity: 0;
  }
}

@media (max-width: 1024px) {
  .dashboard-grid,
  .factors-grid,
  .disclaimer-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .vis-hero {
    padding: 40px 0 18px;
  }

  .hero-headline {
    font-size: 30px;
  }

  .select-filter-container,
  .dash-card,
  .factors-dashboard,
  .research-section,
  .expect-section {
    padding: 24px;
  }

  .expect-title {
    font-size: 24px;
  }

  .expect-copy {
    font-size: 15px;
  }

  .chart-body {
    height: 220px;
  }

  .research-toggle {
    font-size: 16px;
    padding: 16px 18px;
  }
}

.top-expect-panel {
  margin-bottom: 32px;
  padding: 42px 56px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 32px;
  box-shadow: 0 18px 48px rgba(50, 91, 73, 0.08);
  backdrop-filter: blur(10px);
}

.info-panel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.info-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 24px;
  font-weight: 700;
}

.info-icon.teal-soft {
  background: rgba(50, 91, 73, 0.1);
  color: #325b49;
}

.info-panel-header h3 {
  margin: 0;
  font-size: 2.2rem;
  line-height: 1.2;
  font-weight: 700;
  color: #1f2a24;
  letter-spacing: -0.02em;
}

.info-panel-text {
  margin: 0;
  font-size: 1.18rem;
  line-height: 1.9;
  color: #2f3a35;
  font-weight: 400;
}

@media (max-width: 768px) {
  .top-expect-panel {
    padding: 28px 22px;
    border-radius: 24px;
  }

  .info-panel-header {
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 18px;
  }

  .info-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    font-size: 20px;
  }

  .info-panel-header h3 {
    font-size: 1.7rem;
  }

  .info-panel-text {
    font-size: 1.02rem;
    line-height: 1.8;
  }
}
</style>
