<template>
  <div class="service-detail-page">
    <NavBar />

    <main class="detail-main">
      <div class="detail-shell">
        <div v-if="loading" class="state-card">
          <div class="loader"></div>
          <p>Loading detail page...</p>
        </div>

        <template v-else-if="service && currentDetailPage">
          <div class="top-actions">
            <button class="back-btn" @click="goBack">
              <span>←</span>
              <span>Back to Services</span>
            </button>
          </div>

          <!-- Title only: no hero background image -->
          <section class="title-header-section">
            <h1>{{ displayHeroTitle }}</h1>
            <p v-if="serviceSubtitle" class="title-header-subtitle">
              {{ serviceSubtitle }}
            </p>
          </section>

          <!-- only ONE matched detail page -->
          <section v-if="visibleArticles.length" class="single-topic-section">
            <div class="article-grid">
              <article v-for="article in visibleArticles" :key="article.id" class="article-card">
                <div v-if="article.image" class="article-image-wrap">
                  <img
                    :src="article.image"
                    :alt="article.title || 'Article image'"
                    class="article-image"
                  />
                </div>

                <div class="article-body">
                  <h3 class="article-title">
                    {{ article.title || 'Untitled Article' }}
                  </h3>

                  <p v-if="article.excerpt" class="article-excerpt">
                    {{ article.excerpt }}
                  </p>

                  <div
                    v-if="article.excerpt || getArticleParagraphs(article).length"
                    class="article-divider"
                  ></div>

                  <div class="article-content">
                    <p v-for="(paragraph, index) in getArticleParagraphs(article)" :key="index">
                      {{ paragraph }}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section v-else class="state-card">
            <div class="empty-icon">✦</div>
            <h3>No content yet</h3>
            <p>This detail page has been linked, but no article content has been added yet.</p>
          </section>

          <section class="bottom-action">
            <button class="book-btn" @click="goToBooking">Book a Consultation</button>
          </section>
        </template>

        <div v-else class="state-card">
          <div class="empty-icon">✦</div>
          <h3>Content not found</h3>
          <p>This detail page may not exist yet, or it is not linked correctly.</p>
          <button class="back-btn secondary" @click="goBack">Back to Services</button>
        </div>
      </div>
    </main>

    <PageFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import NavBar from '@/component/NavBar.vue'
import PageFooter from '@/component/PageFooter.vue'
import { db } from '@/firebase'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const service = ref(null)

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

function getArticleParagraphs(article) {
  const content = String(article?.content || '').trim()
  if (!content) return []

  return content
    .split(/\n{2,}|\r\n\r\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

async function loadService() {
  loading.value = true

  try {
    const slug = String(route.params.slug || '').trim()

    if (!slug) {
      service.value = null
      return
    }

    const snapshot = await getDoc(doc(db, 'services', slug))

    if (!snapshot.exists()) {
      service.value = null
      return
    }

    const normalized = normalizeService(snapshot.data(), snapshot.id)

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
  () => route.params.slug,
  () => {
    loadService()
  },
)

onMounted(loadService)
</script>

<style scoped>
.service-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 34%, #f5dfe6 70%, #eed6df 100%);
  color: #4d5f55;
}

.detail-main {
  padding: 92px 22px 90px;
}

.detail-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.top-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 22px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.72);
  color: #4d6859;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  box-shadow: 0 10px 26px rgba(95, 122, 106, 0.08);
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 14px 30px rgba(95, 122, 106, 0.12);
}

.back-btn.secondary {
  background: #5f8e74;
  color: #fff;
}

.title-header-section {
  margin-bottom: 34px;
  padding: 18px 4px 6px;
}

.title-header-section h1 {
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4.6rem);
  line-height: 1.02;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: #4f6b5b;
  max-width: 920px;
}

.title-header-subtitle {
  margin: 14px 0 0;
  max-width: 760px;
  font-size: 1.02rem;
  line-height: 1.8;
  color: #738379;
}

.single-topic-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.article-card {
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(109, 127, 115, 0.09);
  backdrop-filter: blur(10px);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(109, 127, 115, 0.13);
}

.article-image-wrap {
  width: 100%;
  height: 240px;
  background: #edf3ee;
  overflow: hidden;
}

.article-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s ease;
}

.article-card:hover .article-image {
  transform: scale(1.04);
}

.article-body {
  padding: 26px 24px 26px;
}

.article-title {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.18;
  font-weight: 900;
  color: #526c5c;
  letter-spacing: -0.02em;
}

.article-excerpt {
  margin: 14px 0 0;
  color: #6a7b72;
  font-size: 1rem;
  line-height: 1.82;
  font-weight: 600;
}

.article-divider {
  width: 100%;
  height: 1px;
  margin: 18px 0 18px;
  background: linear-gradient(
    90deg,
    rgba(91, 116, 102, 0.18) 0%,
    rgba(91, 116, 102, 0.08) 50%,
    rgba(91, 116, 102, 0) 100%
  );
}

.article-content p {
  margin: 0 0 14px;
  font-size: 0.99rem;
  line-height: 1.88;
  color: #617168;
}

.bottom-action {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.book-btn {
  border: none;
  border-radius: 999px;
  padding: 15px 32px;
  background: linear-gradient(135deg, #5a9476, #4b8367);
  color: #fff;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  box-shadow: 0 16px 32px rgba(79, 139, 109, 0.2);
}

.book-btn:hover {
  transform: translateY(-2px);
  opacity: 0.98;
  box-shadow: 0 20px 36px rgba(79, 139, 109, 0.24);
}

.state-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 30px;
  padding: 60px 24px;
  text-align: center;
  box-shadow: 0 18px 40px rgba(109, 127, 115, 0.1);
  backdrop-filter: blur(8px);
}

.state-card h3 {
  margin: 0 0 10px;
  color: #56705f;
  font-size: 1.55rem;
}

.state-card p {
  margin: 0 0 18px;
  color: #7b8a81;
  line-height: 1.8;
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f2e6ea, #e8f1e8);
  color: #60756b;
  font-weight: 800;
  font-size: 1.1rem;
}

.loader {
  width: 42px;
  height: 42px;
  margin: 0 auto 14px;
  border: 4px solid rgba(130, 152, 136, 0.2);
  border-top-color: #88a795;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .article-grid {
    grid-template-columns: 1fr;
  }

  .article-image-wrap {
    height: 220px;
  }
}

@media (max-width: 640px) {
  .detail-main {
    padding: 78px 16px 72px;
  }

  .top-actions {
    margin-bottom: 18px;
  }

  .title-header-section {
    margin-bottom: 26px;
    padding-top: 8px;
  }

  .title-header-section h1 {
    font-size: 2.4rem;
  }

  .article-card,
  .state-card {
    border-radius: 24px;
  }

  .article-body {
    padding: 22px 18px 22px;
  }

  .article-title {
    font-size: 1.28rem;
  }

  .article-excerpt,
  .article-content p {
    font-size: 0.98rem;
  }

  .book-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
