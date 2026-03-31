<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="header-row">
        <div>
          <span class="admin-badge">Admin Panel</span>
          <h1>Our Services Management</h1>
          <p>Manage service cards and list content. Each list item links to one detail page.</p>
        </div>

        <div class="header-actions">
          <button class="outline-btn" @click="router.push('/admin')">Back</button>
          <button class="save-btn" @click="addService">+ Add Service</button>
        </div>
      </div>

      <div v-if="loading" class="admin-card loading-card">Loading services...</div>

      <div v-else class="service-grid">
        <div
          v-for="(service, serviceIndex) in services"
          :key="service.localKey"
          class="admin-card service-card"
        >
          <div class="service-top">
            <div>
              <h2>{{ service.title || `Service ${serviceIndex + 1}` }}</h2>
              <p class="service-meta">{{ service.slug || 'no-slug-yet' }}</p>
            </div>

            <div class="service-top-actions">
              <button class="mini-outline-btn" @click="toggleExpand(service.localKey)">
                {{ expandedMap[service.localKey] ? 'Collapse' : 'Expand' }}
              </button>
              <button class="danger-btn" @click="confirmDeleteService(service)">Delete</button>
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label>Service Title</label>
              <input
                v-model="service.title"
                type="text"
                placeholder="e.g. Physiotherapy"
                @input="updateSlugIfNeeded(service)"
              />
            </div>

            <div class="field">
              <label>Slug</label>
              <input v-model="service.slug" type="text" placeholder="e.g. physiotherapy" />
            </div>

            <div class="field">
              <label>Subtitle</label>
              <input
                v-model="service.subtitle"
                type="text"
                placeholder="Short subtitle for this service"
              />
            </div>

            <div class="field">
              <label>Order</label>
              <input v-model.number="service.order" type="number" min="1" />
            </div>

            <div class="field full">
              <label>Card Image URL</label>
              <input
                v-model="service.cardImage"
                type="text"
                placeholder="/images/service.jpg or https://..."
              />
            </div>
          </div>

          <div class="switch-row">
            <label class="switch-wrap">
              <span>{{ service.active ? 'Visible' : 'Hidden' }}</span>
              <input
                type="checkbox"
                :checked="!!service.active"
                @change="service.active = !!$event.target.checked"
              />
            </label>
          </div>

          <transition name="fade">
            <div v-if="expandedMap[service.localKey]" class="list-section">
              <div class="section-head">
                <div>
                  <h3>List Content</h3>
                </div>
                <button class="save-btn small-btn" @click="addListItem(service)">+ Add Item</button>
              </div>

              <div v-if="!service.listItems.length" class="empty-box">
                No list content yet. Add the first item.
              </div>

              <div v-else class="list-items-wrap">
                <div
                  v-for="(item, itemIndex) in service.listItems"
                  :key="item.id"
                  class="list-item-card"
                  :class="{ dragging: dragState.itemId === item.id }"
                  draggable="true"
                  @dragstart="handleDragStart(service.localKey, item.id)"
                  @dragover.prevent
                  @drop.prevent="handleDrop(service.localKey, item.id)"
                  @dragend="handleDragEnd"
                >
                  <div class="list-item-top">
                    <div class="list-item-left">
                      <span class="drag-handle">⋮⋮</span>
                      <span class="item-order">{{ itemIndex + 1 }}</span>
                      <div class="item-id-wrap">
                        <strong>{{ item.title || `Item ${itemIndex + 1}` }}</strong>
                      </div>
                    </div>

                    <div class="list-item-actions">
                      <button class="mini-outline-btn" @click="goToDetail(service, item)">
                        Edit Detail
                      </button>
                      <button class="danger-btn" @click="confirmDeleteItem(service, item)">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div class="form-grid compact-grid">
                    <div class="field">
                      <label>List Title</label>
                      <input
                        v-model="item.title"
                        type="text"
                        placeholder="Shown in the list only"
                      />
                    </div>

                    <!-- <div class="field full">
                      <label>List Description</label>
                      <textarea
                        v-model="item.description"
                        rows="3"
                        placeholder="Short text shown in the list only"
                      ></textarea>
                    </div> -->
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <div class="service-bottom-actions">
            <button
              class="outline-btn"
              @click="saveSingleService(service)"
              :disabled="savingMap[service.localKey]"
            >
              {{ savingMap[service.localKey] ? 'Saving...' : 'Save Service' }}
            </button>
          </div>
        </div>

        <div v-if="!services.length" class="admin-card empty-page-card">
          No services yet. Click <strong>Add Service</strong> to create the first one.
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-head">
            <div>
              <h2>{{ modal.type === 'service' ? 'Delete Service?' : 'Delete Item?' }}</h2>
              <p>{{ modal.message }}</p>
            </div>
            <button class="icon-btn" @click="closeModal">✕</button>
          </div>

          <div class="warning-box">
            {{
              modal.type === 'service'
                ? 'This will remove the whole service and all linked detail pages.'
                : 'This will remove only this list item. Its linked detail page will also be removed.'
            }}
          </div>

          <div class="modal-actions">
            <button class="outline-btn" @click="closeModal">Cancel</button>
            <button class="danger-solid-btn" @click="confirmModalAction">Delete</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="toast.show" class="toast">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const router = useRouter()

const loading = ref(true)
const services = ref([])

const expandedMap = reactive({})
const savingMap = reactive({})

const dragState = reactive({
  serviceKey: '',
  itemId: '',
})

const toast = ref({
  show: false,
  message: '',
})

const modal = ref({
  open: false,
  type: '',
  serviceKey: '',
  itemId: '',
  message: '',
})

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeSlug(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2200)
}

function createEmptyListItem() {
  return {
    id: uid('list'),
    title: '',
    description: '',
    detailPageId: uid('detail'),
  }
}

function createEmptyDetailPage(detailPageId = '') {
  return {
    id: detailPageId || uid('detail'),
    heroTitle: '',
    articles: [],
  }
}

function createEmptyService() {
  const firstItem = createEmptyListItem()

  return {
    id: '',
    localKey: uid('service'),
    title: '',
    slug: '',
    subtitle: '',
    cardImage: '',
    order: services.value.length + 1,
    active: true,
    listItems: [firstItem],
    detailPages: [createEmptyDetailPage(firstItem.detailPageId)],
    _autoSlug: true,
  }
}

function normalizeListItem(item) {
  if (typeof item === 'string') {
    return {
      id: uid('list'),
      title: item,
      description: '',
      detailPageId: uid('detail'),
    }
  }

  return {
    id: String(item?.id || uid('list')).trim(),
    title: String(item?.title || '').trim(),
    description: String(item?.description || '').trim(),
    detailPageId: String(item?.detailPageId || uid('detail')).trim(),
  }
}

function normalizeDetailPage(page) {
  return {
    id: String(page?.id || uid('detail')).trim(),
    heroTitle: String(page?.heroTitle || '').trim(),
    articles: Array.isArray(page?.articles) ? page.articles : [],
  }
}

function sanitizeService(snapshotId, raw = {}) {
  const listItems = Array.isArray(raw.listItems) ? raw.listItems.map(normalizeListItem) : []

  let detailPages = Array.isArray(raw.detailPages) ? raw.detailPages.map(normalizeDetailPage) : []

  // 兼容旧数据：如果之前只有 articles，没有 detailPages，就给每个 list item 建一个空 detailPage
  if (!detailPages.length && listItems.length) {
    detailPages = listItems.map((item) => createEmptyDetailPage(item.detailPageId || uid('detail')))
  }

  return {
    id: snapshotId,
    localKey: uid('service'),
    title: String(raw.title || '').trim(),
    slug: String(raw.slug || '').trim(),
    subtitle: String(raw.subtitle || '').trim(),
    cardImage: String(raw.cardImage || '').trim(),
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : 999,
    active: typeof raw.active === 'boolean' ? raw.active : true,
    listItems,
    detailPages,
    _autoSlug: !raw.slug,
  }
}

function updateSlugIfNeeded(service) {
  if (service._autoSlug) {
    service.slug = normalizeSlug(service.title || '')
  }
}

function addService() {
  const service = createEmptyService()
  services.value.unshift(service)
  expandedMap[service.localKey] = true
  savingMap[service.localKey] = false
}

function toggleExpand(serviceKey) {
  expandedMap[serviceKey] = !expandedMap[serviceKey]
}

function addListItem(service) {
  const newItem = createEmptyListItem()

  service.listItems.push(newItem)

  const exists = service.detailPages.some((page) => page.id === newItem.detailPageId)
  if (!exists) {
    service.detailPages.push(createEmptyDetailPage(newItem.detailPageId))
  }
}

function ensureDetailPagesForList(service) {
  if (!Array.isArray(service.detailPages)) {
    service.detailPages = []
  }

  service.listItems.forEach((item) => {
    if (!item.detailPageId) {
      item.detailPageId = uid('detail')
    }

    const exists = service.detailPages.some((page) => page.id === item.detailPageId)
    if (!exists) {
      service.detailPages.push(createEmptyDetailPage(item.detailPageId))
    }
  })
}

function buildPayload(service) {
  ensureDetailPagesForList(service)

  const listItems = Array.isArray(service.listItems)
    ? service.listItems
        .map((item) => ({
          id: String(item.id || uid('list')).trim(),
          title: String(item.title || '').trim(),
          description: String(item.description || '').trim(),
          detailPageId: String(item.detailPageId || uid('detail')).trim(),
        }))
        .filter((item) => item.id)
    : []

  const usedDetailPageIds = new Set(listItems.map((item) => item.detailPageId).filter(Boolean))

  const detailPages = Array.isArray(service.detailPages)
    ? service.detailPages
        .filter((page) => usedDetailPageIds.has(page.id))
        .map((page) => ({
          id: String(page.id || uid('detail')).trim(),
          heroTitle: String(page.heroTitle || '').trim(),
          articles: Array.isArray(page.articles) ? page.articles : [],
        }))
    : []

  return {
    title: String(service.title || '').trim(),
    slug: normalizeSlug(service.slug || service.title || ''),
    subtitle: String(service.subtitle || '').trim(),
    cardImage: String(service.cardImage || '').trim(),
    order: Number(service.order || 999),
    active: !!service.active,
    listItems,
    detailPages,
    updatedAt: serverTimestamp(),
  }
}

async function loadServices() {
  loading.value = true

  try {
    const snapshot = await getDocs(collection(db, 'services'))
    const rows = snapshot.docs.map((docSnap) => sanitizeService(docSnap.id, docSnap.data()))

    rows.sort((a, b) => Number(a.order || 999) - Number(b.order || 999))
    services.value = rows

    rows.forEach((service) => {
      expandedMap[service.localKey] = false
      savingMap[service.localKey] = false
    })
  } catch (error) {
    console.error('Failed to load services:', error)
    showToast('Failed to load services.')
  } finally {
    loading.value = false
  }
}

async function saveSingleService(service) {
  savingMap[service.localKey] = true

  try {
    service.slug = normalizeSlug(service.slug || service.title || '')

    const payload = buildPayload(service)

    let targetId = service.id
    if (!targetId) {
      targetId = uid('serviceDoc')
      service.id = targetId
    }

    await setDoc(doc(db, 'services', targetId), payload, { merge: true })

    showToast('Service saved successfully.')
  } catch (error) {
    console.error('Failed to save service:', error)
    showToast('Failed to save service.')
  } finally {
    savingMap[service.localKey] = false
  }
}

function goToDetail(service, item) {
  if (!service.id) {
    showToast('Please save this service before editing detail content.')
    return
  }

  if (!item?.detailPageId) {
    item.detailPageId = uid('detail')
  }

  ensureDetailPagesForList(service)

  router.push({
    path: `/admin/services/${service.id}`,
    query: {
      detail: item.detailPageId,
    },
  })
}

function confirmDeleteService(service) {
  modal.value = {
    open: true,
    type: 'service',
    serviceKey: service.localKey,
    itemId: '',
    message: `Delete "${service.title || 'this service'}"?`,
  }
}

function confirmDeleteItem(service, item) {
  modal.value = {
    open: true,
    type: 'item',
    serviceKey: service.localKey,
    itemId: item.id,
    message: `Delete "${item.title || 'this item'}"?`,
  }
}

function closeModal() {
  modal.value = {
    open: false,
    type: '',
    serviceKey: '',
    itemId: '',
    message: '',
  }
}

async function confirmModalAction() {
  const service = services.value.find((entry) => entry.localKey === modal.value.serviceKey)
  if (!service) {
    closeModal()
    return
  }

  if (modal.value.type === 'service') {
    try {
      if (service.id) {
        await deleteDoc(doc(db, 'services', service.id))
      }

      services.value = services.value.filter((entry) => entry.localKey !== service.localKey)
      showToast('Service deleted.')
    } catch (error) {
      console.error('Delete service failed:', error)
      showToast('Failed to delete service.')
    } finally {
      closeModal()
    }
    return
  }

  if (modal.value.type === 'item') {
    const targetItem = service.listItems.find((listItem) => listItem.id === modal.value.itemId)
    const detailPageId = targetItem?.detailPageId || ''

    service.listItems = service.listItems.filter((listItem) => listItem.id !== modal.value.itemId)

    if (detailPageId) {
      service.detailPages = service.detailPages.filter((page) => page.id !== detailPageId)
    }

    try {
      if (service.id) {
        const payload = buildPayload(service)
        await setDoc(doc(db, 'services', service.id), payload, { merge: true })
      }

      showToast('Item deleted.')
    } catch (error) {
      console.error('Delete item failed:', error)
      showToast('Failed to delete item.')
    } finally {
      closeModal()
    }
  }
}

function handleDragStart(serviceKey, itemId) {
  dragState.serviceKey = serviceKey
  dragState.itemId = itemId
}

function handleDrop(serviceKey, targetItemId) {
  if (!dragState.serviceKey || !dragState.itemId) return
  if (dragState.serviceKey !== serviceKey) return
  if (dragState.itemId === targetItemId) return

  const service = services.value.find((entry) => entry.localKey === serviceKey)
  if (!service) return

  const fromIndex = service.listItems.findIndex((item) => item.id === dragState.itemId)
  const toIndex = service.listItems.findIndex((item) => item.id === targetItemId)

  if (fromIndex === -1 || toIndex === -1) return

  const movedItem = service.listItems.splice(fromIndex, 1)[0]
  service.listItems.splice(toIndex, 0, movedItem)

  handleDragEnd()
}

function handleDragEnd() {
  dragState.serviceKey = ''
  dragState.itemId = ''
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
  max-width: 1180px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 28px;
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
  font-size: 40px;
  line-height: 1.05;
  color: #2f6b4f;
}

.header-row p {
  margin: 0;
  font-size: 17px;
  color: rgba(47, 107, 79, 0.82);
  max-width: 620px;
}

.header-actions,
.service-top-actions,
.list-item-actions,
.service-bottom-actions,
.modal-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.service-grid {
  display: grid;
  gap: 22px;
}

.admin-card {
  background: rgba(255, 255, 255, 0.84);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(47, 107, 79, 0.08);
  backdrop-filter: blur(4px);
}

.loading-card,
.empty-page-card {
  font-size: 18px;
  color: #2f6b4f;
  font-weight: 700;
}

.service-card {
  display: grid;
  gap: 20px;
}

.service-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  flex-wrap: wrap;
}

.service-top h2 {
  margin: 0 0 8px;
  color: #204763;
  font-size: 28px;
}

.service-meta {
  margin: 0;
  color: #6f8277;
  word-break: break-word;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.compact-grid {
  grid-template-columns: 1fr;
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
  line-height: 1.8;
  min-height: 120px;
}

.switch-row {
  display: flex;
  justify-content: flex-end;
}

.switch-wrap {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 700;
  color: #2f6b4f;
}

.list-section {
  display: grid;
  gap: 18px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.section-head h3 {
  margin: 0 0 8px;
  color: #204763;
  font-size: 24px;
}

.section-head p {
  margin: 0;
  color: #6c7e74;
  line-height: 1.7;
  max-width: 700px;
}

.list-items-wrap {
  display: grid;
  gap: 14px;
}

.list-item-card {
  border: 1px solid rgba(47, 107, 79, 0.12);
  background: rgba(248, 251, 248, 0.7);
  border-radius: 20px;
  padding: 18px;
  display: grid;
  gap: 14px;
}

.list-item-card.dragging {
  opacity: 0.55;
}

.list-item-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.list-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.drag-handle {
  color: #7b8f84;
  font-weight: 700;
  cursor: grab;
  user-select: none;
}

.item-order {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(47, 107, 79, 0.08);
  color: #2f6b4f;
  font-weight: 800;
  flex-shrink: 0;
}

.item-id-wrap {
  min-width: 0;
}

.item-id-wrap strong {
  display: block;
  color: #204763;
  line-height: 1.4;
}

.item-id-wrap small {
  color: #708278;
  word-break: break-word;
}

.empty-box {
  padding: 18px;
  border-radius: 18px;
  background: #f8fbf8;
  color: #6a7c72;
  font-weight: 600;
}

.mini-outline-btn,
.outline-btn,
.save-btn,
.danger-btn,
.danger-solid-btn,
.icon-btn {
  border: none;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.mini-outline-btn {
  padding: 10px 14px;
  background: white;
  color: #2f6b4f;
  border: 1.5px solid rgba(47, 107, 79, 0.16);
}

.outline-btn,
.save-btn {
  padding: 14px 22px;
}

.small-btn {
  padding: 11px 18px;
}

.save-btn {
  background: #2f6b4f;
  color: white;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(47, 107, 79, 0.18);
}

.outline-btn {
  background: white;
  color: #2f6b4f;
  border: 1.5px solid rgba(47, 107, 79, 0.2);
}

.outline-btn:hover,
.mini-outline-btn:hover {
  background: #f8fcf9;
}

.danger-btn {
  padding: 10px 16px;
  background: #fff2f4;
  color: #c25674;
  border: 1px solid rgba(194, 86, 116, 0.18);
}

.danger-solid-btn {
  padding: 14px 22px;
  background: #d56c81;
  color: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(47, 58, 50, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-card {
  width: min(560px, 100%);
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 24px 50px rgba(47, 58, 50, 0.16);
}

.modal-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.modal-head h2 {
  margin: 0 0 8px;
  color: #2f6b4f;
}

.modal-head p {
  margin: 0;
  color: #66776d;
  line-height: 1.7;
}

.warning-box {
  padding: 14px 16px;
  border-radius: 16px;
  background: #fff7f8;
  color: #9a5d6e;
  margin-bottom: 18px;
  line-height: 1.7;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: white;
  color: #2f6b4f;
  border: 1.5px solid rgba(47, 107, 79, 0.12);
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
    font-size: 34px;
  }

  .header-row,
  .service-top,
  .section-head,
  .list-item-top,
  .modal-head {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .header-actions button,
  .service-top-actions button,
  .list-item-actions button,
  .service-bottom-actions button,
  .modal-actions button {
    width: 100%;
  }
}
</style>
