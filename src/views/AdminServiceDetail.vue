<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="header-row">
        <div>
          <span class="admin-badge">Admin Panel</span>
          <h1>{{ form.title || 'Service Detail' }}</h1>
          <p>Edit this service module and control what appears on the website.</p>
        </div>

        <div class="header-actions">
          <button class="secondary-btn" @click="goBack">Back</button>
        </div>
      </div>

      <div v-if="loading" class="admin-card loading-card">Loading service detail...</div>

      <div v-else class="detail-layout">
        <div class="admin-card main-card">
          <div class="section-title-row">
            <h2>Basic Information</h2>
            <label class="switch-wrap">
              <span>{{ form.active ? 'Visible' : 'Hidden' }}</span>
              <input v-model="form.active" type="checkbox" />
            </label>
          </div>

          <div class="form-grid">
            <div class="field">
              <label>Service Title</label>
              <input v-model="form.title" type="text" placeholder="e.g. Physiotherapy" />
            </div>

            <div class="field">
              <label>Slug</label>
              <input v-model="form.slug" type="text" disabled />
            </div>

            <div class="field full">
              <label>Subtitle</label>
              <input
                v-model="form.subtitle"
                type="text"
                placeholder="Short card description shown on services page"
              />
            </div>

            <div class="field">
              <label>Display Order</label>
              <input v-model.number="form.order" type="number" min="1" />
            </div>

            <div class="field">
              <label>Hero Title</label>
              <input
                v-model="form.heroTitle"
                type="text"
                placeholder="Large title shown on detail page"
              />
            </div>

            <div class="field full">
              <label>Overview</label>
              <textarea
                v-model="form.overview"
                rows="5"
                placeholder="Write the main service overview here..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="admin-card main-card">
          <h2>Images</h2>

          <div class="form-grid">
            <div class="field full">
              <label>Card Image URL</label>
              <input
                v-model="form.cardImage"
                type="text"
                placeholder="/images/service-card.jpg or https://..."
              />
            </div>

            <div class="field full">
              <label>Hero Image URL</label>
              <input
                v-model="form.heroImage"
                type="text"
                placeholder="/images/service-hero.jpg or https://..."
              />
            </div>
          </div>

          <div class="preview-grid">
            <div class="image-preview-box">
              <p class="preview-label">Card Image Preview</p>
              <div class="image-preview">
                <img
                  v-if="form.cardImage"
                  :src="form.cardImage"
                  alt="Card Preview"
                  @error="onCardImageError"
                />
                <div v-else class="placeholder">No Card Image</div>
              </div>
            </div>

            <div class="image-preview-box">
              <p class="preview-label">Hero Image Preview</p>
              <div class="image-preview">
                <img
                  v-if="form.heroImage"
                  :src="form.heroImage"
                  alt="Hero Preview"
                  @error="onHeroImageError"
                />
                <div v-else class="placeholder">No Hero Image</div>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-card main-card">
          <div class="section-title-row">
            <h2>Service Items</h2>
            <button class="outline-btn small-btn" @click="addItem">+ Add Item</button>
          </div>

          <div v-if="!form.items.length" class="empty-box">No service items yet.</div>

          <div v-else class="items-list">
            <div v-for="(item, index) in form.items" :key="`${index}-${item}`" class="item-row">
              <div class="item-number">{{ index + 1 }}</div>

              <input
                v-model="form.items[index]"
                type="text"
                class="item-input"
                placeholder="Enter service item..."
              />

              <div class="item-actions">
                <button
                  class="icon-btn"
                  @click="moveItemUp(index)"
                  :disabled="index === 0"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  class="icon-btn"
                  @click="moveItemDown(index)"
                  :disabled="index === form.items.length - 1"
                  title="Move down"
                >
                  ↓
                </button>
                <button class="danger-btn" @click="removeItem(index)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <button class="secondary-btn" @click="goBack">Cancel</button>
          <button class="primary-btn" @click="saveService" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <transition name="fade">
        <div v-if="toast.show" class="toast">
          {{ toast.message }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)

const toast = ref({
  show: false,
  message: '',
})

const form = ref({
  id: '',
  slug: '',
  title: '',
  subtitle: '',
  heroTitle: '',
  heroImage: '',
  cardImage: '',
  overview: '',
  order: 1,
  active: true,
  items: [],
})

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2200)
}

async function loadService() {
  loading.value = true
  try {
    const id = route.params.id
    const serviceRef = doc(db, 'services', id)
    const snapshot = await getDoc(serviceRef)

    if (!snapshot.exists()) {
      showToast('Service not found.')
      router.push('/admin/services')
      return
    }

    const data = snapshot.data()

    form.value = {
      id: snapshot.id,
      slug: data.slug || snapshot.id,
      title: data.title || '',
      subtitle: data.subtitle || '',
      heroTitle: data.heroTitle || '',
      heroImage: data.heroImage || '',
      cardImage: data.cardImage || '',
      overview: data.overview || '',
      order: Number(data.order || 1),
      active: typeof data.active === 'boolean' ? data.active : true,
      items: Array.isArray(data.items) ? [...data.items] : [],
    }
  } catch (error) {
    console.error('Failed to load service detail:', error)
    showToast('Failed to load service detail.')
  } finally {
    loading.value = false
  }
}

async function saveService() {
  if (!form.value.id) return

  saving.value = true
  try {
    await setDoc(
      doc(db, 'services', form.value.id),
      {
        slug: form.value.slug || form.value.id,
        title: form.value.title?.trim() || '',
        subtitle: form.value.subtitle?.trim() || '',
        heroTitle: form.value.heroTitle?.trim() || '',
        heroImage: form.value.heroImage?.trim() || '',
        cardImage: form.value.cardImage?.trim() || '',
        overview: form.value.overview?.trim() || '',
        order: Number(form.value.order || 1),
        active: !!form.value.active,
        items: (form.value.items || []).map((item) => String(item || '').trim()).filter(Boolean),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    showToast('Service updated successfully.')
  } catch (error) {
    console.error('Failed to save service:', error)
    showToast('Failed to save service.')
  } finally {
    saving.value = false
  }
}

function addItem() {
  form.value.items.push('')
}

function removeItem(index) {
  form.value.items.splice(index, 1)
}

function moveItemUp(index) {
  if (index === 0) return
  const arr = [...form.value.items]
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  form.value.items = arr
}

function moveItemDown(index) {
  if (index === form.value.items.length - 1) return
  const arr = [...form.value.items]
  ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  form.value.items = arr
}

function onCardImageError() {
  form.value.cardImage = ''
}

function onHeroImageError() {
  form.value.heroImage = ''
}

function goBack() {
  router.push('/admin/services')
}

onMounted(loadService)
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 38%, #f5dfe6 72%, #eed6df 100%);
  padding: 48px 24px 90px;
}

.admin-container {
  max-width: 1180px;
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
  color: rgba(47, 107, 79, 0.82);
  max-width: 720px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.detail-layout {
  display: grid;
  gap: 22px;
}

.admin-card {
  background: rgba(255, 255, 255, 0.82);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(47, 107, 79, 0.08);
  backdrop-filter: blur(4px);
}

.loading-card {
  font-size: 18px;
  color: #2f6b4f;
  font-weight: 700;
}

.main-card h2 {
  margin: 0 0 18px;
  color: #204763;
  font-size: 28px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
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
  background: rgba(255, 255, 255, 0.96);
  outline: none;
  transition: 0.2s ease;
  color: #2d3a33;
}

.field input:focus,
.field textarea:focus {
  border-color: #2f6b4f;
  box-shadow: 0 0 0 4px rgba(47, 107, 79, 0.08);
}

.field textarea {
  resize: vertical;
  min-height: 130px;
  line-height: 1.6;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.image-preview-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #2f6b4f;
}

.image-preview {
  overflow: hidden;
  border-radius: 20px;
  background: #eef3ef;
  min-height: 220px;
  border: 1px solid rgba(47, 107, 79, 0.08);
}

.image-preview img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.placeholder {
  width: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f9487;
  font-weight: 700;
}

.items-list {
  display: grid;
  gap: 14px;
}

.item-row {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 12px;
  align-items: center;
}

.item-number {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(47, 107, 79, 0.08);
  color: #2f6b4f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.item-input {
  width: 100%;
  border: 1.5px solid rgba(47, 107, 79, 0.15);
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.96);
  outline: none;
  color: #2d3a33;
}

.item-input:focus {
  border-color: #2f6b4f;
  box-shadow: 0 0 0 4px rgba(47, 107, 79, 0.08);
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.secondary-btn,
.primary-btn,
.outline-btn,
.icon-btn,
.danger-btn {
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

.small-btn {
  padding: 11px 18px;
}

.icon-btn {
  background: white;
  color: #2f6b4f;
  border: 1.5px solid rgba(47, 107, 79, 0.15);
  padding: 10px 14px;
  min-width: 44px;
}

.icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.danger-btn {
  background: #fff2f4;
  color: #c25674;
  border: 1px solid rgba(194, 86, 116, 0.18);
  padding: 10px 16px;
}

.empty-box {
  padding: 18px;
  border-radius: 18px;
  background: #f8fbf8;
  color: #6a7c72;
  font-weight: 600;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

@media (max-width: 900px) {
  h1 {
    font-size: 38px;
  }

  .form-grid,
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .item-row {
    grid-template-columns: 1fr;
  }

  .item-number {
    width: 42px;
    height: 42px;
  }

  .item-actions {
    justify-content: flex-start;
  }
}
</style>
