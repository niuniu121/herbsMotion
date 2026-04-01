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

            <section v-if="visibleArticles.length" class="editorial-content" ref="masonryGridRef">
              <article
                v-for="article in visibleArticles"
                :key="article.id"
                class="editorial-article"
                :ref="(el) => setMasonryItemRef(article.id, el)"
              >
                <div v-if="article.image && !article.imageError" class="article-hero-image">
                  <img
                    :src="article.image"
                    :alt="article.title || 'Article image'"
                    loading="lazy"
                    @load="layoutMasonry"
                    @error="handleImageError(article)"
                  />
                </div>

                <div class="article-text-body">
                  <h3 class="article-title">
                    {{ article.title || 'Untitled Article' }}
                  </h3>

                  <p v-if="article.excerpt" class="article-excerpt">
                    {{ article.excerpt }}
                  </p>

                  <div
                    v-if="getArticleParagraphs(article).length"
                    class="article-paragraphs"
                    :ref="(el) => setArticleContentRef(article.id, el)"
                  >
                    <p
                      v-for="(paragraph, index) in getVisibleParagraphs(article)"
                      :key="`${article.id}-${index}`"
                      :class="{ expanded: expandedArticles[article.id] }"
                    >
                      {{ paragraph }}
                    </p>
                  </div>

                  <p v-else class="article-empty-copy">Detailed content is coming soon.</p>

                  <button
                    v-if="shouldShowReadMore(article.id)"
                    class="read-more-btn"
                    @click="toggleArticle(article.id)"
                  >
                    {{ expandedArticles[article.id] ? 'Show less' : 'Read more' }}
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

    <PageFooter />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import NavBar from '@/component/NavBar.vue'
import PageFooter from '@/component/PageFooter.vue'
import { db } from '@/firebase'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const service = ref(null)
const expandedArticles = ref({})
const articleContentRefs = ref({})
const articleOverflowMap = ref({})

const masonryGridRef = ref(null)
const masonryItemRefs = ref({})

let resizeObserver = null

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

function getArticleParagraphs(article) {
  const content = String(article?.content || '').trim()
  if (!content) return []

  return content
    .split(/\n{2,}|\r\n\r\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function getVisibleParagraphs(article) {
  const paragraphs = getArticleParagraphs(article)
  if (expandedArticles.value[article.id]) return paragraphs
  return paragraphs.slice(0, 1)
}

function toggleArticle(id) {
  expandedArticles.value[id] = !expandedArticles.value[id]

  nextTick(() => {
    checkOverflowForArticle(id)
    layoutMasonry()
  })
}

function setArticleContentRef(id, el) {
  if (el) {
    articleContentRefs.value[id] = el
    if (resizeObserver) resizeObserver.observe(el)
  } else {
    delete articleContentRefs.value[id]
  }
}

function setMasonryItemRef(id, el) {
  if (el) {
    masonryItemRefs.value[id] = el
  } else {
    delete masonryItemRefs.value[id]
  }
}

function checkOverflowForArticle(id) {
  const el = articleContentRefs.value[id]
  if (!el) return

  const isExpanded = !!expandedArticles.value[id]

  if (isExpanded) {
    articleOverflowMap.value[id] = true
    return
  }

  const firstParagraph = el.querySelector('p')
  if (!firstParagraph) {
    articleOverflowMap.value[id] = false
    return
  }

  articleOverflowMap.value[id] =
    firstParagraph.scrollHeight > firstParagraph.clientHeight + 1 ||
    firstParagraph.scrollWidth > firstParagraph.clientWidth + 1
}

function checkAllOverflows() {
  visibleArticles.value.forEach((article) => {
    checkOverflowForArticle(article.id)
  })
}

function shouldShowReadMore(id) {
  return !!articleOverflowMap.value[id]
}

function setupResizeObserver() {
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return

  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  resizeObserver = new ResizeObserver(() => {
    checkAllOverflows()
    layoutMasonry()
  })

  Object.values(articleContentRefs.value).forEach((el) => {
    if (el) resizeObserver.observe(el)
  })
}

function layoutMasonry() {
  nextTick(() => {
    const grid = masonryGridRef.value
    if (!grid || typeof window === 'undefined') return

    const computedStyle = window.getComputedStyle(grid)
    const rowGap =
      parseFloat(computedStyle.getPropertyValue('row-gap')) ||
      parseFloat(computedStyle.getPropertyValue('gap')) ||
      34
    const rowHeight = parseFloat(computedStyle.getPropertyValue('grid-auto-rows')) || 10

    Object.values(masonryItemRefs.value).forEach((item) => {
      if (!item) return

      item.style.gridRowEnd = 'auto'

      const itemHeight = item.getBoundingClientRect().height
      const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap))

      item.style.gridRowEnd = `span ${rowSpan}`
    })
  })
}

function handleWindowResize() {
  checkAllOverflows()
  layoutMasonry()
}

function handleImageError(article) {
  article.imageError = true
  nextTick(() => {
    layoutMasonry()
  })
}

async function loadService() {
  loading.value = true
  expandedArticles.value = {}
  articleContentRefs.value = {}
  articleOverflowMap.value = {}
  masonryItemRefs.value = {}

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

    await nextTick()
    setupResizeObserver()
    checkAllOverflows()
    layoutMasonry()
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
    await loadService()
  },
)

watch(
  visibleArticles,
  async () => {
    await nextTick()
    setupResizeObserver()
    checkAllOverflows()
    layoutMasonry()
  },
  { deep: true },
)

onMounted(async () => {
  await loadService()
  window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  window.removeEventListener('resize', handleWindowResize)
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
  padding: 104px 28px 96px;
}

.detail-shell {
  max-width: 1560px;
  margin: 0 auto;
}

.content-wrapper {
  max-width: 1480px;
  margin: 0 auto;
}

.top-actions {
  max-width: 1320px;
  margin: 0 auto 18px;
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
  max-width: 1320px;
  margin: 0 auto 34px;
  text-align: left;
}

.editorial-header h1 {
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 4.2rem);
  line-height: 1.06;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #163426;
}

.editorial-subtitle {
  margin: 16px 0 0;
  font-size: 1.04rem;
  line-height: 1.72;
  color: #5c7063;
  max-width: 760px;
}

.editorial-content {
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 34px;
  row-gap: 34px;
  grid-auto-rows: 10px;
  align-items: start;
}

.editorial-article {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(26, 51, 38, 0.05);
  border: 1px solid rgba(26, 51, 38, 0.04);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  will-change: transform;
}

.editorial-article:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 38px rgba(26, 51, 38, 0.08);
}

.article-hero-image {
  width: 100%;
  background: #f0f4f2;
  overflow: hidden;
}

.article-hero-image img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: contain;
}

.article-text-body {
  padding: 22px 22px 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.article-title {
  margin: 0 0 12px;
  font-size: 1.14rem;
  line-height: 1.3;
  font-weight: 700;
  color: #1a3326;
  letter-spacing: -0.01em;
}

.article-excerpt {
  margin: 0 0 12px;
  font-size: 0.95rem;
  line-height: 1.65;
  font-weight: 500;
  color: #8aaa79;
}

.article-paragraphs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.article-paragraphs p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.78;
  color: #5c7063;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.25s ease;
}

.article-paragraphs p.expanded {
  display: block;
  -webkit-line-clamp: unset;
  overflow: visible;
}

.article-empty-copy {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #7a8f83;
}

.read-more-btn {
  margin-top: 14px;
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.92rem;
  font-weight: 600;
  color: #2f5b43;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.read-more-btn:hover {
  opacity: 0.75;
  transform: translateY(-1px);
}

.bottom-action {
  max-width: 1320px;
  margin: 76px auto 0;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1200px) {
  .detail-main {
    padding: 96px 22px 88px;
  }

  .top-actions,
  .editorial-header,
  .editorial-content,
  .bottom-action {
    max-width: 1180px;
  }

  .editorial-content {
    column-gap: 26px;
    row-gap: 26px;
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

  .top-actions {
    margin-bottom: 14px;
  }

  .editorial-header {
    margin-bottom: 26px;
  }

  .editorial-header h1 {
    font-size: 2.2rem;
  }

  .article-text-body {
    padding: 18px 18px 20px;
  }

  .article-title {
    font-size: 1.08rem;
  }

  .article-excerpt,
  .article-paragraphs p {
    font-size: 0.92rem;
  }

  .cta-card {
    padding: 38px 22px;
  }
}

@media (max-width: 640px) {
  .editorial-content {
    grid-template-columns: 1fr;
    column-gap: 18px;
    row-gap: 18px;
  }
}
</style>
