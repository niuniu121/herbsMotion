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
            <button class="back-btn" @click="goBack">← Back</button>
          </div>

          <!-- Hero -->
          <section v-if="currentHeroImage" class="hero-section">
            <div class="hero-banner" :style="heroBannerStyle">
              <div class="hero-overlay">
                <h1>{{ displayHeroTitle }}</h1>
              </div>
            </div>
          </section>

          <section v-else class="title-only-section">
            <h1>{{ displayHeroTitle }}</h1>
          </section>

          <!-- Topic Navigator: 外层入口 -->
          <section v-if="topicNav.length > 1" class="article-nav-section">
            <div class="article-nav-card">
              <div class="article-nav-head">
                <h2>Explore Topics</h2>
                <p>Select a topic to open a different detail page.</p>
              </div>

              <div class="article-pill-list">
                <button
                  v-for="topic in topicNav"
                  :key="topic.id"
                  class="article-pill"
                  :class="{ active: topic.detailPageId === activeDetailPageId }"
                  @click="goToDetailPage(topic.detailPageId)"
                >
                  {{ topic.title }}
                </button>
              </div>
            </div>
          </section>

          <!-- Inner article navigator: 当前 detailPage 内部的 articles -->
          <section
            v-if="visibleArticles.length > 1"
            class="article-nav-section inner-article-nav-section"
          >
            <div class="article-nav-card">
              <div class="article-nav-head">
                <h2>Inside This Topic</h2>
                <p>Select an article inside this detail page.</p>
              </div>

              <div class="article-pill-list">
                <button
                  v-for="article in visibleArticles"
                  :key="article.id"
                  class="article-pill secondary-pill"
                  :class="{ active: article.id === activeArticleId }"
                  @click="goToArticle(article.id)"
                >
                  {{ article.title || 'Untitled Article' }}
                </button>
              </div>
            </div>
          </section>

          <!-- Main Article -->
          <section class="article-section">
            <article class="article-card" :class="{ 'with-image': !!currentArticle?.image }">
              <div v-if="currentArticle?.image" class="article-image-wrap">
                <img
                  :src="currentArticle.image"
                  :alt="currentArticle.title || 'Article image'"
                  class="article-image"
                />
              </div>

              <div class="article-body">
                <h2>
                  {{ currentArticle?.title || currentLinkedTopicTitle || 'Untitled Article' }}
                </h2>

                <div v-if="currentArticle?.excerpt" class="article-excerpt">
                  {{ currentArticle.excerpt }}
                </div>

                <div class="article-content">
                  <p v-for="(paragraph, index) in formattedParagraphs" :key="index">
                    {{ paragraph }}
                  </p>
                </div>
              </div>
            </article>
          </section>

          <section class="bottom-action">
            <button class="book-btn" @click="goToBooking">Book it now</button>
          </section>
        </template>

        <div v-else class="state-card">
          <div class="empty-icon">✦</div>
          <h3>Content not found</h3>
          <p>This detail page may not exist yet, or no content has been added.</p>
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
  let listItems = Array.isArray(raw.listItems) ? raw.listItems.map(normalizeListItem) : []

  let detailPages = Array.isArray(raw.detailPages) ? raw.detailPages.map(normalizeDetailPage) : []

  // 兼容旧数据：没有 detailPages 时，按 listItems 补空壳
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

const queryDetailId = computed(() => String(route.query.detail || '').trim())
const queryArticleId = computed(() => String(route.query.article || '').trim())

const topicNav = computed(() => {
  if (!service.value) return []

  return service.value.listItems.filter((item) => item.id && item.title && item.detailPageId)
})

const activeDetailPageId = computed(() => {
  if (!service.value?.detailPages?.length) return ''

  const matched = service.value.detailPages.find((page) => page.id === queryDetailId.value)

  if (matched) return matched.id

  const firstFromNav = topicNav.value[0]?.detailPageId
  if (firstFromNav) return firstFromNav

  return service.value.detailPages[0]?.id || ''
})

const currentDetailPage = computed(() => {
  if (!service.value?.detailPages?.length) return null

  return service.value.detailPages.find((page) => page.id === activeDetailPageId.value) || null
})

const visibleArticles = computed(() => {
  return Array.isArray(currentDetailPage.value?.articles)
    ? currentDetailPage.value.articles.filter((article) => article.active !== false)
    : []
})

const activeArticleId = computed(() => {
  if (!visibleArticles.value.length) return ''

  const matched = visibleArticles.value.find((article) => article.id === queryArticleId.value)

  return matched?.id || visibleArticles.value[0]?.id || ''
})

const currentArticle = computed(() => {
  if (!visibleArticles.value.length) return null

  return (
    visibleArticles.value.find((article) => article.id === activeArticleId.value) ||
    visibleArticles.value[0] ||
    null
  )
})

const currentLinkedTopic = computed(() => {
  return topicNav.value.find((item) => item.detailPageId === activeDetailPageId.value) || null
})

const currentLinkedTopicTitle = computed(() => {
  return currentLinkedTopic.value?.title || ''
})

const currentHeroImage = computed(() => {
  if (currentArticle.value?.image) return currentArticle.value.image
  return ''
})

const displayHeroTitle = computed(() => {
  return (
    currentDetailPage.value?.heroTitle ||
    currentLinkedTopicTitle.value ||
    service.value?.heroTitle ||
    service.value?.title ||
    'Service Detail'
  )
})

const heroBannerStyle = computed(() => {
  const image = currentHeroImage.value || ''
  return {
    backgroundImage: `linear-gradient(rgba(74, 110, 90, 0.22), rgba(90, 120, 103, 0.28)), url('${image}')`,
  }
})

const formattedParagraphs = computed(() => {
  const content = String(currentArticle.value?.content || '').trim()
  if (!content) return ['No article content has been added yet.']

  return content
    .split(/\n{2,}|\r\n\r\n/)
    .map((item) => item.trim())
    .filter(Boolean)
})

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

function goToDetailPage(detailPageId = '') {
  if (!detailPageId) return

  router.replace({
    path: route.path,
    query: {
      detail: detailPageId,
    },
  })
}

function goToArticle(articleId = '') {
  if (!articleId || !activeDetailPageId.value) return

  router.replace({
    path: route.path,
    query: {
      detail: activeDetailPageId.value,
      article: articleId,
    },
  })
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
  padding: 92px 20px 90px;
}

.detail-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.top-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 18px;
}

.back-btn {
  border: none;
  border-radius: 999px;
  padding: 11px 18px;
  background: #4f8b6d;
  color: white;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 10px 20px rgba(79, 139, 109, 0.18);
}

.back-btn:hover {
  transform: translateY(-1px);
  opacity: 0.97;
  box-shadow: 0 14px 26px rgba(79, 139, 109, 0.22);
}

.back-btn.secondary {
  background: #6fa98a;
}

.hero-section {
  margin-bottom: 24px;
}

.hero-banner {
  min-height: 240px;
  border-radius: 30px;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  box-shadow: 0 18px 38px rgba(122, 142, 129, 0.14);
}

.hero-overlay {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  padding: 32px;
}

.hero-overlay h1,
.title-only-section h1 {
  margin: 0;
  font-size: clamp(2.2rem, 4.6vw, 4rem);
  line-height: 1.06;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.hero-overlay h1 {
  color: white;
  max-width: 900px;
  text-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);
}

.title-only-section {
  padding: 8px 0 10px;
  text-align: center;
  margin-bottom: 24px;
}

.title-only-section h1 {
  color: #4a6656;
}

.article-nav-section {
  margin-bottom: 22px;
}

.inner-article-nav-section {
  margin-top: -6px;
}

.article-nav-card {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 14px 28px rgba(128, 144, 132, 0.08);
  backdrop-filter: blur(8px);
}

.article-nav-head {
  margin-bottom: 14px;
}

.article-nav-head h2 {
  margin: 0 0 6px;
  font-size: 1.08rem;
  color: #56705f;
  font-weight: 800;
}

.article-nav-head p {
  margin: 0;
  color: #819084;
  line-height: 1.7;
  font-size: 0.95rem;
}

.article-pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.article-pill {
  border: none;
  border-radius: 999px;
  padding: 11px 17px;
  background: #edf5ef;
  color: #5f7468;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.article-pill:hover {
  transform: translateY(-1px);
  background: #e4efe7;
}

.article-pill.active {
  background: #4f8b6d;
  color: white;
  box-shadow: 0 10px 18px rgba(79, 139, 109, 0.16);
}

.secondary-pill {
  background: #f3f7f4;
}

.secondary-pill.active {
  background: #5e9078;
}

.article-section {
  margin-bottom: 28px;
}

.article-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 18px 36px rgba(128, 144, 132, 0.1);
  backdrop-filter: blur(6px);
}

.article-card.with-image {
  display: grid;
  grid-template-columns: minmax(320px, 430px) 1fr;
  align-items: stretch;
}

.article-image-wrap {
  min-height: 100%;
  background: #eef2ee;
}

.article-image {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
  display: block;
}

.article-body {
  padding: 40px 38px 42px;
}

.article-body h2 {
  margin: 0 0 18px;
  font-size: clamp(1.8rem, 3vw, 2.7rem);
  line-height: 1.12;
  color: #56705f;
  font-weight: 800;
}

.article-excerpt {
  margin: 0 0 18px;
  color: #718279;
  line-height: 1.85;
  font-size: 1rem;
}

.article-content p {
  margin: 0 0 16px;
  color: #627269;
  line-height: 1.95;
  font-size: 1.04rem;
}

.bottom-action {
  display: flex;
  justify-content: center;
}

.book-btn {
  border: none;
  border-radius: 18px;
  padding: 14px 30px;
  background: #4f8b6d;
  color: white;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 12px 22px rgba(79, 139, 109, 0.16);
}

.book-btn:hover {
  transform: translateY(-2px);
  opacity: 0.96;
  box-shadow: 0 16px 28px rgba(79, 139, 109, 0.2);
}

.state-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 28px;
  padding: 56px 24px;
  text-align: center;
  box-shadow: 0 16px 34px rgba(128, 144, 132, 0.1);
}

.state-card h3 {
  margin: 0 0 10px;
  color: #56705f;
  font-size: 1.5rem;
}

.state-card p {
  margin: 0 0 18px;
  color: #7d8d82;
  line-height: 1.8;
}

.empty-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 14px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f2e6ea, #e8f1e8);
  color: #60756b;
  font-weight: 800;
}

.loader {
  width: 42px;
  height: 42px;
  margin: 0 auto 14px;
  border: 4px solid rgba(130, 152, 136, 0.22);
  border-top-color: #88a795;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .article-card.with-image {
    grid-template-columns: 1fr;
  }

  .article-image {
    min-height: 260px;
  }

  .hero-banner,
  .hero-overlay {
    min-height: 190px;
  }
}

@media (max-width: 640px) {
  .detail-main {
    padding: 78px 16px 72px;
  }

  .hero-banner {
    border-radius: 22px;
  }

  .hero-overlay {
    padding: 24px 18px;
  }

  .article-nav-card,
  .article-card,
  .state-card {
    border-radius: 22px;
  }

  .article-body {
    padding: 24px 20px 28px;
  }

  .article-body h2 {
    font-size: 1.85rem;
  }

  .article-content p {
    font-size: 1rem;
  }

  .article-pill-list {
    gap: 8px;
  }

  .article-pill {
    width: 100%;
    text-align: left;
  }
}
</style>
