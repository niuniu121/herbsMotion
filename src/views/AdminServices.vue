<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="header-row">
        <div>
          <span class="admin-badge">Admin Panel</span>
          <h1>Services Management</h1>
          <p>Manage the three main service modules and jump into each detail page.</p>
        </div>

        <div class="header-actions">
          <button class="secondary-btn" @click="seedIfNeeded" :disabled="seeding || loading">
            {{ seeding ? 'Preparing...' : 'Initialise Default Services' }}
          </button>
          <button class="secondary-btn" @click="router.push('/admin')">Back</button>
        </div>
      </div>

      <div v-if="loading" class="admin-card">Loading services...</div>

      <div v-else class="services-grid">
        <div v-for="service in sortedServices" :key="service.id" class="service-card">
          <div class="service-cover">
            <img v-if="service.cardImage" :src="service.cardImage" :alt="service.title" />
            <div v-else class="placeholder">No Image</div>
          </div>

          <div class="service-body">
            <div class="row top-row">
              <div>
                <h2>{{ service.title || 'Untitled Service' }}</h2>
                <p class="sub">{{ service.subtitle || 'No subtitle yet.' }}</p>
              </div>

              <label class="switch-wrap">
                <span>{{ service.active ? 'Visible' : 'Hidden' }}</span>
                <input type="checkbox" v-model="service.active" />
              </label>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Title</label>
                <input v-model="service.title" type="text" />
              </div>

              <div class="field">
                <label>Slug</label>
                <input v-model="service.slug" type="text" disabled />
              </div>

              <div class="field full">
                <label>Subtitle</label>
                <input v-model="service.subtitle" type="text" />
              </div>

              <div class="field full">
                <label>Card Image URL</label>
                <input
                  v-model="service.cardImage"
                  type="text"
                  placeholder="/images/physio.jpg or https://..."
                />
              </div>

              <div class="field">
                <label>Display Order</label>
                <input v-model.number="service.order" type="number" min="1" />
              </div>

              <div class="field">
                <label>Hero Title</label>
                <input v-model="service.heroTitle" type="text" />
              </div>
            </div>

            <div class="card-actions">
              <button
                class="primary-btn"
                @click="saveService(service)"
                :disabled="savingId === service.id"
              >
                {{ savingId === service.id ? 'Saving...' : 'Save' }}
              </button>

              <button class="outline-btn" @click="goToDetail(service)">Edit Detail Page</button>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="toast.show" class="toast">{{ toast.message }}</div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const router = useRouter()

const loading = ref(true)
const seeding = ref(false)
const savingId = ref('')
const services = ref([])

const toast = ref({
  show: false,
  message: '',
})

const defaultServices = [
  {
    id: 'remedial-massage',
    slug: 'remedial-massage',
    title: 'Remedial Massage',
    subtitle: 'Release tension, reduce pain, and support recovery.',
    heroTitle: 'REMEDIAL MASSAGE',
    heroImage: '',
    cardImage: '',
    overview:
      'Remedial massage focuses on relieving muscular tension, improving circulation, and supporting recovery from stress, tightness, and physical strain.',
    order: 1,
    active: true,
    items: [
      'Deep tissue massage',
      'Trigger point release',
      'Relaxation support',
      'Sports recovery massage',
    ],
  },
  {
    id: 'physiotherapy',
    slug: 'physiotherapy',
    title: 'Physiotherapy',
    subtitle: 'Restore movement, reduce pain, and improve daily function.',
    heroTitle: 'PHYSIOTHERAPY',
    heroImage: '',
    cardImage: '',
    overview:
      'Physiotherapy helps assess, treat, and manage musculoskeletal issues through movement-based rehabilitation, manual therapy, and tailored exercise plans.',
    order: 2,
    active: true,
    items: [
      'Musculoskeletal Orthopaedic Assessments',
      'Therapeutic Ultrasound',
      'Joint mobilisation',
      'Soft tissue mobilisation',
      'Clinical exercises',
    ],
  },
  {
    id: 'chinese-medicine',
    slug: 'chinese-medicine',
    title: 'Chinese Medicine',
    subtitle: 'Traditional care tailored to restore balance and wellbeing.',
    heroTitle: 'CHINESE MEDICINE',
    heroImage: '',
    cardImage: '',
    overview:
      'Chinese medicine combines traditional diagnostic methods and therapies such as acupuncture, herbal support, and lifestyle advice to improve overall wellbeing.',
    order: 3,
    active: true,
    items: [
      'Acupuncture',
      'Electroacupuncture',
      'Cupping therapy',
      'Herbal medicine prescriptions',
      'Chinese medicine dietary advice',
    ],
  },
]

const sortedServices = computed(() => {
  return [...services.value].sort((a, b) => (a.order || 999) - (b.order || 999))
})

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2200)
}

async function loadServices() {
  loading.value = true
  try {
    const snapshot = await getDocs(collection(db, 'services'))
    services.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
  } catch (error) {
    console.error('Failed to load services:', error)
    showToast('Failed to load services.')
  } finally {
    loading.value = false
  }
}

async function seedIfNeeded() {
  seeding.value = true
  try {
    const snapshot = await getDocs(collection(db, 'services'))
    if (!snapshot.empty) {
      showToast('Services already exist in Firebase.')
      return
    }

    for (const service of defaultServices) {
      await setDoc(doc(db, 'services', service.id), {
        ...service,
        updatedAt: serverTimestamp(),
      })
    }

    showToast('Default service modules created.')
    await loadServices()
  } catch (error) {
    console.error('Seed failed:', error)
    showToast('Failed to initialise default services.')
  } finally {
    seeding.value = false
  }
}

async function saveService(service) {
  savingId.value = service.id
  try {
    await setDoc(
      doc(db, 'services', service.id),
      {
        slug: service.slug,
        title: service.title,
        subtitle: service.subtitle,
        heroTitle: service.heroTitle,
        heroImage: service.heroImage || '',
        cardImage: service.cardImage || '',
        overview: service.overview || '',
        order: Number(service.order || 999),
        active: !!service.active,
        items: Array.isArray(service.items) ? service.items : [],
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    showToast(`${service.title} saved.`)
  } catch (error) {
    console.error('Save failed:', error)
    showToast('Failed to save service.')
  } finally {
    savingId.value = ''
  }
}

function goToDetail(service) {
  router.push(`/admin/services/${service.id}`)
}

onMounted(loadServices)
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 38%, #f5dfe6 72%, #eed6df 100%);
  padding: 48px 24px 90px;
}

.admin-container {
  max-width: 1240px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.admin-badge {
  display: inline-flex;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(47, 107, 79, 0.1);
  color: #2f6b4f;
  font-weight: 700;
}

h1 {
  margin: 14px 0 8px;
  font-size: 48px;
  line-height: 1.05;
  color: #2f6b4f;
}

.header-row p {
  margin: 0;
  font-size: 18px;
  color: rgba(47, 107, 79, 0.8);
  max-width: 720px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.secondary-btn,
.primary-btn,
.outline-btn {
  border: none;
  border-radius: 999px;
  padding: 14px 22px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.secondary-btn,
.primary-btn {
  background: #2f6b4f;
  color: white;
}

.secondary-btn:hover,
.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(47, 107, 79, 0.18);
}

.outline-btn {
  background: white;
  color: #2f6b4f;
  border: 1.5px solid rgba(47, 107, 79, 0.2);
}

.outline-btn:hover {
  background: #f8fcf9;
}

.admin-card {
  background: rgba(255, 255, 255, 0.78);
  border-radius: 26px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(47, 107, 79, 0.08);
}

.services-grid {
  display: grid;
  gap: 22px;
}

.service-card {
  display: grid;
  grid-template-columns: 310px 1fr;
  gap: 0;
  overflow: hidden;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 40px rgba(47, 107, 79, 0.08);
}

.service-cover {
  background: #eef3ef;
  min-height: 280px;
}

.service-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f9487;
  font-weight: 700;
}

.service-body {
  padding: 28px;
}

.top-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

h2 {
  margin: 0;
  color: #204763;
  font-size: 32px;
}

.sub {
  margin-top: 8px;
  color: #5f6d66;
  font-size: 16px;
}

.switch-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2f6b4f;
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  font-size: 14px;
  color: #2f6b4f;
  font-weight: 700;
}

.field input,
.field textarea {
  border: 1.5px solid rgba(47, 107, 79, 0.15);
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.95);
  outline: none;
}

.field input:focus,
.field textarea:focus {
  border-color: #2f6b4f;
}

.card-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.toast {
  position: fixed;
  right: 28px;
  bottom: 28px;
  background: #2f6b4f;
  color: white;
  padding: 14px 18px;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(47, 107, 79, 0.2);
  z-index: 999;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 980px) {
  .service-card {
    grid-template-columns: 1fr;
  }

  .service-cover {
    min-height: 220px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
