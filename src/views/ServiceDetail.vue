<template>
  <div class="service-detail-page">
    <NavBar />

    <main class="detail-main">
      <div class="detail-shell">
        <div v-if="loading" class="state-container">
          <div class="loader"></div>
          <p>Loading details...</p>
        </div>

        <template v-else-if="service && currentDetailPage">
          <div class="content-wrapper">
            <div class="top-actions">
              <button class="back-btn" @click="goBack">
                <span class="icon">←</span>
                <span>Back to Services</span>
              </button>
            </div>

            <section class="editorial-header">
              <h1>{{ displayHeroTitle }}</h1>
              <p v-if="serviceSubtitle" class="editorial-subtitle">
                {{ serviceSubtitle }}
              </p>
            </section>

            <section v-if="visibleArticles.length" class="editorial-content">
              <article
                v-for="article in visibleArticles"
                :key="article.id"
                class="editorial-article"
              >
                <div v-if="article.image && !article.imageError" class="article-hero-image">
                  <img
                    :src="article.image"
                    :alt="article.title || 'Article image'"
                    loading="lazy"
                    @error="handleImageError(article)"
                  />
                </div>

                <div v-else class="article-image-placeholder">
                  <span>{{ (article.title || 'A').charAt(0) }}</span>
                </div>

                <div class="article-text-body">
                  <h3 class="article-title">
                    {{ article.title || 'Untitled Article' }}
                  </h3>

                  <button class="read-more-btn" @click="openArticleModal(article)">
                    Read more
                    <span class="arrow">→</span>
                  </button>
                </div>
              </article>
            </section>

            <section v-else class="state-container empty-state">
              <div class="empty-icon">✧</div>
              <h3>Content coming soon</h3>
              <p>We are currently updating our detailed guides for this service.</p>
            </section>

            <section class="bottom-action">
              <div class="cta-card">
                <h3>Ready to start your healing journey?</h3>
                <button class="book-btn" @click="goToBooking">Book a Consultation</button>
              </div>
            </section>
          </div>
        </template>

        <div v-else class="state-container error-state">
          <div class="empty-icon">✦</div>
          <h3>Content not found</h3>
          <p>This detail page may not exist yet, or the link is incorrect.</p>
          <button class="back-btn-solid" @click="goBack">Return to Services</button>
        </div>
      </div>
    </main>

    <transition name="modal-fade">
      <div v-if="activeArticle" class="article-modal-overlay" @click.self="closeArticleModal">
        <div class="article-modal-card">
          <button class="modal-close-btn" @click="closeArticleModal" aria-label="Close">✕</button>

          <div class="modal-top-decoration"></div>

          <div class="article-modal-body">
            <h2 class="modal-title">
              {{ activeArticle.title || 'Untitled Article' }}
            </h2>

            <div
              v-if="activeArticle.image && !activeArticle.imageError"
              class="modal-image-wrapper"
            >
              <img
                :src="activeArticle.image"
                :alt="activeArticle.title || 'Article image'"
                class="modal-image"
              />
            </div>

            <div v-if="modalParagraphs.length" class="modal-content">
              <p v-for="(paragraph, index) in modalParagraphs" :key="index">
                {{ paragraph }}
              </p>
            </div>

            <p v-else class="modal-empty-copy">Detailed content is coming soon.</p>

            <div class="modal-actions">
              <button class="modal-back-btn" @click="closeArticleModal">← Back</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <PageFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import NavBar from '@/component/NavBar.vue'
import PageFooter from '@/component/PageFooter.vue'
import { db } from '@/firebase'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const service = ref(null)
const activeArticle = ref(null)

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeListItem(item) {
  if (typeof item === 'string') {
    return {
      id: uid('list'),
      title: item.trim(),
      description: '',
      detailPageId: '',
    }
  }

  return {
    id: String(item?.id || uid('list')).trim(),
    title: String(item?.title || '').trim(),
    description: String(item?.description || '').trim(),
    detailPageId: String(item?.detailPageId || '').trim(),
  }
}

function normalizeArticle(article = {}) {
  return {
    id: String(article.id || uid('article')).trim(),
    title: String(article.title || '').trim(),
    excerpt: String(article.excerpt || '').trim(),
    content: String(article.content || '').trim(),
    image: String(article.image || '').trim(),
    active: typeof article.active === 'boolean' ? article.active : true,
    imageError: false,
  }
}

function normalizeDetailPage(page = {}) {
  return {
    id: String(page.id || uid('detail')).trim(),
    heroTitle: String(page.heroTitle || '').trim(),
    articles: Array.isArray(page.articles) ? page.articles.map(normalizeArticle) : [],
  }
}

function normalizeService(raw = {}, id = '') {
  const listItems = Array.isArray(raw.listItems) ? raw.listItems.map(normalizeListItem) : []
  let detailPages = Array.isArray(raw.detailPages) ? raw.detailPages.map(normalizeDetailPage) : []

  if (!detailPages.length && listItems.length) {
    detailPages = listItems
      .filter((item) => item.detailPageId)
      .map((item) => ({
        id: item.detailPageId,
        heroTitle: '',
        articles: [],
      }))
  }

  return {
    id,
    slug: String(raw.slug || id).trim(),
    title: String(raw.title || '').trim(),
    heroTitle: String(raw.heroTitle || raw.title || '').trim(),
    bookingPath: String(raw.bookingPath || '/book').trim(),
    active: typeof raw.active === 'boolean' ? raw.active : true,
    listItems,
    detailPages,
  }
}

function hasArticleContent(article = {}) {
  return Boolean(
    String(article?.title || '').trim() ||
    String(article?.excerpt || '').trim() ||
    String(article?.content || '').trim() ||
    String(article?.image || '').trim(),
  )
}

const queryDetailId = computed(() => String(route.query.detail || '').trim())

const linkedListItems = computed(() => {
  if (!service.value?.listItems?.length) return []
  return service.value.listItems.filter((item) => item.title && item.detailPageId)
})

const activeDetailPageId = computed(() => {
  if (!service.value?.detailPages?.length) return ''

  if (queryDetailId.value) {
    const matched = service.value.detailPages.find((page) => page.id === queryDetailId.value)
    if (matched) return matched.id
  }

  const firstLinked = linkedListItems.value[0]?.detailPageId
  if (firstLinked) return firstLinked

  return service.value.detailPages[0]?.id || ''
})

const currentDetailPage = computed(() => {
  if (!service.value?.detailPages?.length || !activeDetailPageId.value) return null
  return service.value.detailPages.find((page) => page.id === activeDetailPageId.value) || null
})

const currentLinkedItem = computed(() => {
  if (!activeDetailPageId.value) return null
  return (
    linkedListItems.value.find((item) => item.detailPageId === activeDetailPageId.value) || null
  )
})

const visibleArticles = computed(() => {
  if (!currentDetailPage.value?.articles?.length) return []

  return currentDetailPage.value.articles.filter(
    (article) => article.active !== false && hasArticleContent(article),
  )
})

const displayHeroTitle = computed(() => {
  return (
    currentDetailPage.value?.heroTitle ||
    currentLinkedItem.value?.title ||
    service.value?.heroTitle ||
    service.value?.title ||
    'Service Detail'
  )
})

const serviceSubtitle = computed(() => {
  if (currentLinkedItem.value?.description) return currentLinkedItem.value.description

  const firstExcerpt = visibleArticles.value.find((article) => article.excerpt)?.excerpt
  if (firstExcerpt) return firstExcerpt

  return ''
})

const modalParagraphs = computed(() => {
  const content = String(activeArticle.value?.content || '').trim()
  if (!content) return []

  return content
    .split(/\n{2,}|\r\n\r\n/)
    .map((item) => item.trim())
    .filter(Boolean)
})

function openArticleModal(article) {
  activeArticle.value = article
  document.body.style.overflow = 'hidden'
}

function closeArticleModal() {
  activeArticle.value = null
  document.body.style.overflow = ''
}

function handleImageError(article) {
  article.imageError = true
}

async function loadService() {
  loading.value = true
  activeArticle.value = null

  try {
    const slug = String(route.params.slug || '').trim()

    if (!slug) {
      service.value = null
      return
    }

    const q = query(collection(db, 'services'), where('slug', '==', slug))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      service.value = null
      return
    }

    const docSnap = querySnapshot.docs[0]
    const normalized = normalizeService(docSnap.data(), docSnap.id)

    if (normalized.active === false) {
      service.value = null
      return
    }

    service.value = normalized
  } catch (error) {
    console.error('Failed to load service detail:', error)
    service.value = null
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/our-services')
}

function goToBooking() {
  router.push(service.value?.bookingPath || '/book')
}

watch(
  () => [route.params.slug, route.query.detail],
  async () => {
    closeArticleModal()
    await loadService()
  },
)

onMounted(async () => {
  await loadService()
})

window.addEventListener?.('keydown', (event) => {
  if (event.key === 'Escape' && activeArticle.value) {
    closeArticleModal()
  }
})
</script>

<style scoped>
.service-detail-page {
  min-height: 100vh;
  background-color: #fafafa;
  background-image:
    radial-gradient(circle at 15% 0%, rgba(207, 218, 200, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 85% 100%, rgba(245, 223, 230, 0.3) 0%, transparent 40%);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  color: #1a3326;
}

.detail-main {
  padding: 104px 24px 96px;
}

.detail-shell {
  max-width: 1540px;
  margin: 0 auto;
}

.content-wrapper {
  max-width: 1420px;
  margin: 0 auto;
}

.top-actions {
  max-width: 1240px;
  margin: 0 auto 14px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #7a8f83;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.back-btn .icon {
  transition: transform 0.2s ease;
}

.back-btn:hover {
  color: #1a3326;
}

.back-btn:hover .icon {
  transform: translateX(-4px);
}

.editorial-header {
  max-width: 1240px;
  margin: 0 auto 28px;
  text-align: left;
}

.editorial-header h1 {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4rem);
  line-height: 1.06;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #163426;
}

.editorial-subtitle {
  margin: 12px 0 0;
  font-size: 1rem;
  line-height: 1.72;
  color: #5c7063;
  max-width: 720px;
}

.editorial-content {
  max-width: 1240px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px 24px;
  align-items: start;
}

.editorial-article {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(47, 91, 67, 0.08);
  box-shadow: 0 10px 26px rgba(26, 51, 38, 0.05);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.editorial-article:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 34px rgba(26, 51, 38, 0.08);
}

.article-hero-image,
.article-image-placeholder {
  width: 100%;
  aspect-ratio: 4 / 4.9;
  background: #eef3ee;
  overflow: hidden;
}

.article-hero-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.article-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2f5b43;
  font-size: 2.2rem;
  font-weight: 700;
}

.article-text-body {
  padding: 16px 16px 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.article-title {
  margin: 0 0 12px;
  font-size: 1rem;
  line-height: 1.35;
  font-weight: 700;
  color: #1a3326;
  letter-spacing: -0.01em;
  min-height: 2.7em;
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(47, 91, 67, 0.08);
  border: 1px solid rgba(47, 91, 67, 0.12);
  color: #2f5b43;
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.read-more-btn:hover {
  transform: translateY(-1px);
  background: rgba(47, 91, 67, 0.12);
  box-shadow: 0 8px 18px rgba(47, 91, 67, 0.1);
}

.arrow {
  transition: transform 0.2s ease;
}

.read-more-btn:hover .arrow {
  transform: translateX(3px);
}

.bottom-action {
  max-width: 1240px;
  margin: 72px auto 0;
}

.cta-card {
  background: #e9f2e9;
  border-radius: 24px;
  padding: 44px 28px;
  text-align: center;
}

.cta-card h3 {
  margin: 0 0 24px;
  font-size: 1.45rem;
  color: #1a3326;
  font-weight: 700;
}

.book-btn {
  background: #2f5b43;
  color: #ffffff;
  border: none;
  border-radius: 100px;
  padding: 16px 40px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
  box-shadow: 0 8px 20px rgba(47, 91, 67, 0.15);
}

.book-btn:hover {
  transform: translateY(-2px);
  background: #1a3326;
  box-shadow: 0 12px 24px rgba(47, 91, 67, 0.2);
}

.article-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(21, 36, 28, 0.44);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 2000;
}

.article-modal-card {
  position: relative;
  width: min(760px, 100%);
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(250, 247, 242, 0.98) 100%);
  border-radius: 28px;
  box-shadow: 0 28px 80px rgba(17, 39, 28, 0.22);
  border: 1px solid rgba(47, 91, 67, 0.1);
}

.modal-top-decoration {
  height: 12px;
  background: linear-gradient(90deg, #cfdac8 0%, #f5dfe6 50%, #e9f2e9 100%);
}

.article-modal-body {
  padding: 28px 20px 30px 28px;
  overflow-y: auto;
  max-height: calc(88vh - 12px);
  scrollbar-gutter: stable;
}

.modal-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: rgba(47, 91, 67, 0.08);
  color: #2f5b43;
  font-size: 1rem;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.modal-close-btn:hover {
  transform: scale(1.05);
  background: rgba(47, 91, 67, 0.14);
}

.modal-badge {
  display: inline-block;
  margin: 0 0 10px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.08);
  color: #2f5b43;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.modal-title {
  margin: 0 0 18px;
  font-size: clamp(1.6rem, 3vw, 2.3rem);
  line-height: 1.15;
  color: #163426;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.modal-image-wrapper {
  margin-bottom: 20px;
  border-radius: 22px;
  overflow: hidden;
  background: #eef3ee;
}

.modal-image {
  display: block;
  width: 100%;
  max-height: 520px;
  object-fit: contain;
  object-position: center;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-content p,
.modal-empty-copy {
  margin: 0;
  font-size: 1rem;
  line-height: 1.78;
  color: #4d6257;
}

.modal-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-start;
}

.modal-back-btn {
  border: none;
  border-radius: 999px;
  background: #2f5b43;
  color: #fff;
  padding: 12px 18px;
  font-size: 0.94rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  box-shadow: 0 10px 22px rgba(47, 91, 67, 0.18);
}

.modal-back-btn:hover {
  transform: translateY(-1px);
  background: #1f4430;
}

.state-container {
  text-align: center;
  padding: 80px 20px;
  max-width: 600px;
  margin: 0 auto;
}

.empty-state h3,
.error-state h3 {
  color: #1a3326;
  font-size: 1.5rem;
  margin: 0 0 12px;
}

.state-container p {
  color: #7a8f83;
  line-height: 1.6;
  margin: 0 0 24px;
}

.empty-icon {
  font-size: 2.5rem;
  color: #8aaa79;
  margin-bottom: 16px;
}

.loader {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid rgba(138, 170, 121, 0.2);
  border-top-color: #8aaa79;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.back-btn-solid {
  background: #ffffff;
  border: 1px solid #d9e3dd;
  color: #2f5b43;
  padding: 12px 24px;
  border-radius: 100px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn-solid:hover {
  background: #f4f7f5;
  border-color: #8aaa79;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1200px) {
  .editorial-content {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .editorial-content {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .detail-main {
    padding: 92px 16px 76px;
  }

  .editorial-header h1 {
    font-size: 2.2rem;
  }

  .editorial-content {
    gap: 22px 18px;
  }

  .article-modal-body {
    padding: 24px 18px 24px;
  }

  .modal-image {
    max-height: 260px;
  }
}

@media (max-width: 640px) {
  .editorial-content {
    grid-template-columns: 1fr;
  }
}

.article-modal-body::-webkit-scrollbar {
  width: 8px;
}

.article-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.article-modal-body::-webkit-scrollbar-thumb {
  background: rgba(47, 91, 67, 0.22);
  border-radius: 999px;
}

.article-modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(47, 91, 67, 0.34);
}
</style>
