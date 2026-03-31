<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="header-row">
        <div>
          <span class="admin-badge">Admin Panel</span>
          <h1>Edit Detail Content</h1>
          <p>
            Edit one detail page only. Articles here are fully independent from outer list content.
          </p>
        </div>

        <div class="header-actions">
          <button class="outline-btn" @click="goBack">Back</button>
          <button
            class="save-btn"
            @click="saveDetailPage"
            :disabled="saving || loading || !currentDetailPage"
          >
            {{ saving ? 'Saving...' : 'Save Detail' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="admin-card loading-card">Loading detail content...</div>

      <div v-else-if="loadError" class="admin-card loading-card error-card">
        {{ loadError }}
      </div>

      <div v-else class="detail-layout">
        <!-- linked entry info -->
        <div class="admin-card main-card">
          <div class="section-head">
            <div>
              <h2>Linked Entry</h2>
              <p class="section-desc">
                This shows which outer list item opened this detail page. It is read-only here.
              </p>
            </div>
          </div>

          <div class="linked-meta">
            <div class="meta-row">
              <span class="meta-label">Service</span>
              <span class="meta-value">{{ form.title || '—' }}</span>
            </div>

            <div class="meta-row">
              <span class="meta-label">List Title</span>
              <span class="meta-value">{{ linkedListItem?.title || 'No linked list item' }}</span>
            </div>

            <div class="meta-row">
              <span class="meta-label">List Description</span>
              <span class="meta-value">{{ linkedListItem?.description || '—' }}</span>
            </div>

            <div class="meta-row">
              <span class="meta-label">detailPageId</span>
              <span class="meta-value mono">{{ selectedDetailId || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- main heading -->
        <div class="admin-card main-card" v-if="currentDetailPage">
          <div class="section-head">
            <div>
              <h2>Main Heading</h2>
              <p class="section-desc">
                This controls the large title shown at the top of this detail page.
              </p>
            </div>
          </div>

          <div class="field">
            <label>Big Title</label>
            <input
              v-model="currentDetailPage.heroTitle"
              type="text"
              placeholder="e.g. REMEDIAL MASSAGE"
            />
          </div>
        </div>

        <!-- articles manager -->
        <div class="admin-card main-card" v-if="currentDetailPage">
          <div class="section-head">
            <div>
              <h2>Articles Inside This Detail Page</h2>
              <p class="section-desc">
                These articles belong only to this detail page. They do not control outer list
                content.
              </p>
            </div>

            <button class="save-btn small-btn" @click="addArticleToCurrentDetail">
              + Add Article
            </button>
          </div>

          <div v-if="!currentDetailPage.articles.length" class="empty-box">
            No articles inside this detail page yet. Click <strong>Add Article</strong>.
          </div>

          <div v-else class="article-nav-list">
            <div
              v-for="(article, index) in currentDetailPage.articles"
              :key="article.id"
              class="article-nav-item"
              :class="{
                active: article.id === selectedArticleId,
                dragging: dragArticleId === article.id,
              }"
              draggable="true"
              @dragstart="handleDragStart(article.id)"
              @dragover.prevent
              @drop.prevent="handleDrop(article.id)"
              @dragend="handleDragEnd"
            >
              <div class="article-nav-left" @click="goToArticle(article.id)">
                <span class="drag-handle">⋮⋮</span>
                <span class="article-order">{{ index + 1 }}</span>
                <div class="article-nav-text">
                  <strong>{{ article.title || `Article ${index + 1}` }}</strong>
                  <small>{{ article.image ? 'With image' : 'No image' }}</small>
                </div>
              </div>

              <div class="article-nav-actions">
                <button class="mini-outline-btn" @click="goToArticle(article.id)">Edit</button>
                <button class="danger-btn" @click="confirmRemoveArticle(article.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- selected article editor -->
        <div class="admin-card main-card" v-if="currentArticle">
          <div class="section-head">
            <div>
              <h2>Selected Article</h2>
              <p class="section-desc">
                This is the article content shown inside the selected detail page.
              </p>
            </div>

            <div class="topic-badge">
              {{ currentArticleDisplay }}
            </div>
          </div>

          <div class="field">
            <label>Article Title</label>
            <input
              v-model="currentArticle.title"
              type="text"
              placeholder="e.g. What is remedial massage?"
            />
          </div>

          <div class="field">
            <label>Excerpt (Optional)</label>
            <textarea
              v-model="currentArticle.excerpt"
              rows="3"
              placeholder="Short introduction for this detail article..."
            ></textarea>
          </div>

          <div class="field">
            <label>Article Image URL (Optional)</label>
            <input
              v-model="currentArticle.image"
              type="text"
              placeholder="/images/example.jpg or https://..."
            />
          </div>

          <div class="field">
            <label>Article Content</label>
            <textarea
              v-model="currentArticle.content"
              rows="12"
              placeholder="Write the full article content here..."
            ></textarea>
          </div>

          <div class="switch-row">
            <label class="switch-wrap">
              <span>{{ currentArticle.active ? 'Visible' : 'Hidden' }}</span>
              <input
                type="checkbox"
                :checked="!!currentArticle.active"
                @change="currentArticle.active = !!$event.target.checked"
              />
            </label>
          </div>

          <div class="field">
            <label>Image Preview</label>
            <div class="image-preview">
              <img
                v-if="currentArticle.image"
                :src="currentArticle.image"
                alt="Article Preview"
                @error="currentArticle.image = ''"
              />
              <div v-else class="placeholder">No image for this article</div>
            </div>
          </div>
        </div>

        <div v-else-if="currentDetailPage" class="admin-card main-card">
          <div class="empty-box">
            This detail page has no selected article yet. Add one to start editing.
          </div>
        </div>

        <div class="action-bar" v-if="currentDetailPage">
          <button class="outline-btn" @click="goBack">Cancel</button>
          <button class="save-btn" @click="saveDetailPage" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- delete confirm -->
      <transition name="fade">
        <div v-if="deleteModal.open" class="modal-overlay" @click.self="closeDeleteModal">
          <div class="modal-card">
            <div class="modal-head">
              <div>
                <h2>Delete Article?</h2>
                <p>
                  This will remove
                  <strong>{{ deleteModal.articleTitle || 'this article' }}</strong>
                  from this detail page only.
                </p>
              </div>

              <button class="icon-btn" @click="closeDeleteModal">✕</button>
            </div>

            <div class="warning-box">Outer list content will not be affected.</div>

            <div class="modal-actions">
              <button class="outline-btn" @click="closeDeleteModal">Cancel</button>
              <button class="danger-solid-btn" @click="removeArticleConfirmed">Delete</button>
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const dragArticleId = ref(null)

const toast = ref({
  show: false,
  message: '',
})

const deleteModal = ref({
  open: false,
  articleId: '',
  articleTitle: '',
})

const form = ref({
  id: '',
  title: '',
  slug: '',
  subtitle: '',
  cardImage: '',
  order: 999,
  active: true,
  listItems: [],
  detailPages: [],
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

function createEmptyArticle() {
  return {
    id: uid('article'),
    title: '',
    excerpt: '',
    content: '',
    image: '',
    active: true,
  }
}

function createEmptyDetailPage(detailId = '') {
  return {
    id: detailId || uid('detail'),
    heroTitle: '',
    articles: [],
  }
}

function normalizeListItem(item) {
  if (typeof item === 'string') {
    return {
      id: uid('list'),
      title: item.trim(),
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

function normalizeArticle(article) {
  return {
    id: String(article?.id || uid('article')).trim(),
    title: String(article?.title || '').trim(),
    excerpt: String(article?.excerpt || '').trim(),
    content: String(article?.content || '').trim(),
    image: String(article?.image || '').trim(),
    active: typeof article?.active === 'boolean' ? article.active : true,
  }
}

function normalizeDetailPage(page) {
  return {
    id: String(page?.id || uid('detail')).trim(),
    heroTitle: String(page?.heroTitle || '').trim(),
    articles: Array.isArray(page?.articles) ? page.articles.map(normalizeArticle) : [],
  }
}

function sanitizeService(snapshotId, raw = {}) {
  const listItems = Array.isArray(raw.listItems) ? raw.listItems.map(normalizeListItem) : []

  let detailPages = Array.isArray(raw.detailPages) ? raw.detailPages.map(normalizeDetailPage) : []

  if (!detailPages.length) {
    const ids = listItems.map((item) => item.detailPageId).filter(Boolean)
    detailPages = ids.map((detailId) => createEmptyDetailPage(detailId))
  }

  return {
    id: snapshotId,
    title: String(raw.title || '').trim(),
    slug: String(raw.slug || '').trim(),
    subtitle: String(raw.subtitle || '').trim(),
    cardImage: String(raw.cardImage || '').trim(),
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : 999,
    active: typeof raw.active === 'boolean' ? raw.active : true,
    listItems,
    detailPages,
  }
}

const serviceId = computed(() => String(route.params.id || '').trim())
const selectedDetailId = computed(() => String(route.query.detail || '').trim())
const selectedArticleId = computed(() => String(route.query.article || '').trim())

const linkedListItem = computed(() => {
  return form.value.listItems.find((item) => item.detailPageId === selectedDetailId.value) || null
})

const currentDetailPage = computed(() => {
  return form.value.detailPages.find((page) => page.id === selectedDetailId.value) || null
})

const currentArticle = computed(() => {
  if (!currentDetailPage.value?.articles?.length) return null

  const matched = currentDetailPage.value.articles.find(
    (article) => article.id === selectedArticleId.value,
  )

  return matched || currentDetailPage.value.articles[0] || null
})

const currentArticleDisplay = computed(() => {
  if (!currentDetailPage.value?.articles?.length || !currentArticle.value) return 'Selected'
  const index = currentDetailPage.value.articles.findIndex(
    (article) => article.id === currentArticle.value.id,
  )
  return index >= 0 ? `Article ${index + 1}` : 'Selected'
})

function ensureCurrentDetailPageExists() {
  if (!selectedDetailId.value) return

  const exists = form.value.detailPages.some((page) => page.id === selectedDetailId.value)
  if (!exists) {
    form.value.detailPages.push(createEmptyDetailPage(selectedDetailId.value))
  }
}

function ensureAtLeastOneArticleSelected() {
  if (!currentDetailPage.value) return

  if (!currentDetailPage.value.articles.length) return

  const exists = currentDetailPage.value.articles.some(
    (article) => article.id === selectedArticleId.value,
  )

  if (!selectedArticleId.value || !exists) {
    goToArticle(currentDetailPage.value.articles[0].id)
  }
}

function buildPayload() {
  const listItems = Array.isArray(form.value.listItems)
    ? form.value.listItems.map((item) => ({
        id: String(item.id || uid('list')).trim(),
        title: String(item.title || '').trim(),
        description: String(item.description || '').trim(),
        detailPageId: String(item.detailPageId || uid('detail')).trim(),
      }))
    : []

  const usedDetailPageIds = new Set(listItems.map((item) => item.detailPageId).filter(Boolean))

  const detailPages = Array.isArray(form.value.detailPages)
    ? form.value.detailPages
        .filter((page) => usedDetailPageIds.has(page.id))
        .map((page) => ({
          id: String(page.id || uid('detail')).trim(),
          heroTitle: String(page.heroTitle || '').trim(),
          articles: Array.isArray(page.articles)
            ? page.articles.map((article) => ({
                id: String(article.id || uid('article')).trim(),
                title: String(article.title || '').trim(),
                excerpt: String(article.excerpt || '').trim(),
                content: String(article.content || '').trim(),
                image: String(article.image || '').trim(),
                active: typeof article.active === 'boolean' ? article.active : true,
              }))
            : [],
        }))
    : []

  return {
    title: String(form.value.title || '').trim(),
    slug: normalizeSlug(form.value.slug || form.value.title || ''),
    subtitle: String(form.value.subtitle || '').trim(),
    cardImage: String(form.value.cardImage || '').trim(),
    order: Number(form.value.order || 999),
    active: !!form.value.active,
    listItems,
    detailPages,
    updatedAt: serverTimestamp(),
  }
}

async function loadDetailPage() {
  loading.value = true
  loadError.value = ''

  try {
    if (!serviceId.value) {
      throw new Error('Missing service ID.')
    }

    if (!selectedDetailId.value) {
      throw new Error('Missing detailPageId in route.')
    }

    const snapshot = await getDoc(doc(db, 'services', serviceId.value))

    if (!snapshot.exists()) {
      throw new Error('Service not found.')
    }

    form.value = sanitizeService(snapshot.id, snapshot.data())

    ensureCurrentDetailPageExists()
    ensureAtLeastOneArticleSelected()
  } catch (error) {
    console.error('Failed to load detail page:', error)
    loadError.value = error?.message || 'Failed to load detail page.'
  } finally {
    loading.value = false
  }
}

function goToArticle(articleId) {
  router.replace({
    path: `/admin/services/${form.value.id}`,
    query: {
      detail: selectedDetailId.value,
      article: articleId,
    },
  })
}

function addArticleToCurrentDetail() {
  if (!currentDetailPage.value) return

  const newArticle = createEmptyArticle()
  currentDetailPage.value.articles.push(newArticle)
  goToArticle(newArticle.id)
}

function confirmRemoveArticle(articleId) {
  const article = currentDetailPage.value?.articles?.find((item) => item.id === articleId)

  deleteModal.value = {
    open: true,
    articleId,
    articleTitle: article?.title || '',
  }
}

function closeDeleteModal() {
  deleteModal.value = {
    open: false,
    articleId: '',
    articleTitle: '',
  }
}

function removeArticleConfirmed() {
  if (!currentDetailPage.value || !deleteModal.value.articleId) {
    closeDeleteModal()
    return
  }

  const articleId = deleteModal.value.articleId
  currentDetailPage.value.articles = currentDetailPage.value.articles.filter(
    (article) => article.id !== articleId,
  )

  const nextArticleId = currentDetailPage.value.articles[0]?.id || ''

  closeDeleteModal()

  if (nextArticleId) {
    goToArticle(nextArticleId)
  } else {
    router.replace({
      path: `/admin/services/${form.value.id}`,
      query: {
        detail: selectedDetailId.value,
      },
    })
  }

  showToast('Article removed from this detail page.')
}

function handleDragStart(articleId) {
  dragArticleId.value = articleId
}

function handleDrop(targetArticleId) {
  if (!dragArticleId.value || !currentDetailPage.value) return
  if (dragArticleId.value === targetArticleId) return

  const fromIndex = currentDetailPage.value.articles.findIndex(
    (article) => article.id === dragArticleId.value,
  )
  const toIndex = currentDetailPage.value.articles.findIndex(
    (article) => article.id === targetArticleId,
  )

  if (fromIndex === -1 || toIndex === -1) return

  const moved = currentDetailPage.value.articles.splice(fromIndex, 1)[0]
  currentDetailPage.value.articles.splice(toIndex, 0, moved)

  dragArticleId.value = null
}

function handleDragEnd() {
  dragArticleId.value = null
}

async function saveDetailPage() {
  if (!form.value.id || !currentDetailPage.value) {
    showToast('Unable to save this detail page.')
    return
  }

  saving.value = true

  try {
    if (Array.isArray(currentDetailPage.value.articles)) {
      currentDetailPage.value.articles = currentDetailPage.value.articles.map((article) => ({
        ...article,
        title: String(article.title || '').trim(),
        excerpt: String(article.excerpt || '').trim(),
        content: String(article.content || '').trim(),
        image: String(article.image || '').trim(),
      }))
    }

    await setDoc(doc(db, 'services', form.value.id), buildPayload(), { merge: true })

    showToast('Detail page saved successfully.')
  } catch (error) {
    console.error('Failed to save detail page:', error)
    showToast('Failed to save detail page.')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/admin/services')
}

watch(
  () => route.query.detail,
  () => {
    if (!loading.value) {
      loadDetailPage()
    }
  },
)

watch(
  () => route.query.article,
  () => {
    if (!loading.value) {
      ensureAtLeastOneArticleSelected()
    }
  },
)

onMounted(loadDetailPage)
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 38%, #f5dfe6 72%, #eed6df 100%);
  padding: 48px 24px 90px;
}

.admin-container {
  max-width: 1080px;
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
  max-width: 720px;
}

.detail-layout {
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

.loading-card {
  font-size: 18px;
  color: #2f6b4f;
  font-weight: 700;
}

.error-card {
  color: #c25674;
}

.main-card h2 {
  margin: 0 0 18px;
  color: #204763;
  font-size: 28px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.section-desc {
  margin: 8px 0 0;
  color: #6c7e74;
  line-height: 1.7;
}

.topic-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(47, 107, 79, 0.08);
  color: #2f6b4f;
  font-weight: 800;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  min-height: 220px;
  line-height: 1.8;
}

.article-nav-list {
  display: grid;
  gap: 12px;
}

.article-nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(47, 107, 79, 0.12);
  background: rgba(248, 251, 248, 0.7);
  border-radius: 18px;
  padding: 14px 16px;
}

.article-nav-item.active {
  border-color: rgba(47, 107, 79, 0.28);
  background: rgba(232, 243, 235, 0.78);
}

.article-nav-item.dragging {
  opacity: 0.55;
}

.article-nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.drag-handle {
  color: #7b8f84;
  font-weight: 700;
  cursor: grab;
  user-select: none;
}

.article-order {
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

.article-nav-text {
  min-width: 0;
}

.article-nav-text strong {
  display: block;
  color: #204763;
  line-height: 1.4;
}

.article-nav-text small {
  color: #708278;
}

.article-nav-actions,
.header-actions,
.action-bar,
.modal-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.linked-meta {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(248, 251, 248, 0.7);
  border: 1px solid rgba(221, 230, 222, 0.85);
}

.meta-row {
  display: grid;
  gap: 4px;
}

.meta-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: #6f8277;
}

.meta-value {
  color: #4f6158;
  line-height: 1.6;
  word-break: break-word;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.switch-row {
  display: flex;
  justify-content: flex-end;
  margin: 8px 0 18px;
}

.switch-wrap {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 700;
  color: #2f6b4f;
}

.image-preview {
  overflow: hidden;
  border-radius: 20px;
  background: #eef3ef;
  min-height: 240px;
  border: 1px solid rgba(47, 107, 79, 0.08);
  margin-top: 4px;
}

.image-preview img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
}

.placeholder {
  width: 100%;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f9487;
  font-weight: 700;
}

.empty-box {
  padding: 18px;
  border-radius: 18px;
  background: #f8fbf8;
  color: #6a7c72;
  font-weight: 600;
  line-height: 1.7;
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

  .section-head,
  .header-row,
  .article-nav-item,
  .modal-head {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions button,
  .article-nav-actions button,
  .action-bar button,
  .modal-actions button {
    width: 100%;
  }
}
</style>
