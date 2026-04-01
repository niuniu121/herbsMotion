<template>
  <div class="services-page">
    <NavBar />

    <main class="services-main">
      <section class="hero-section">
        <div class="hero-content">
          <h1>Our Services</h1>
          <!-- <p class="hero-text">
            Explore our treatment services and click a topic below to view details.
          </p> -->
        </div>
      </section>

      <section class="services-list-section">
        <div class="section-inner">
          <div v-if="loading" class="state-card">
            <div class="loader"></div>
            <p>Loading services...</p>
          </div>

          <div v-else-if="displayServices.length" class="service-list">
            <article
              v-for="(service, index) in displayServices"
              :key="service.id"
              class="service-row"
              :class="{ reverse: index % 2 !== 0 }"
            >
              <div class="service-image-wrap" @click="goToServiceDetail(service)">
                <img
                  :src="service.cardImage || defaultImage"
                  :alt="service.title"
                  class="service-image"
                />
                <div class="image-overlay"></div>
              </div>

              <div class="service-content-card">
                <div class="service-inner">
                  <div class="title-row">
                    <h2 class="service-title" @click="goToServiceDetail(service)">
                      {{ service.title }}
                    </h2>
                    <button class="mini-link-btn" @click="goToServiceDetail(service)">
                      View Page →
                    </button>
                  </div>

                  <p v-if="service.subtitle" class="service-subtitle">
                    {{ service.subtitle }}
                  </p>

                  <div v-if="normalizedListItems(service).length" class="list-panel">
                    <div class="topic-list">
                      <button
                        v-for="item in normalizedListItems(service)"
                        :key="item.id"
                        class="topic-item"
                        @click="goToTopic(service, item)"
                      >
                        <span class="topic-dot"></span>
                        <span class="topic-title">{{ item.title }}</span>
                        <span class="topic-arrow">→</span>
                      </button>
                    </div>
                  </div>

                  <div v-else class="empty-points">No topics added yet.</div>

                  <div class="service-actions">
                    <button class="book-btn" @click="goToBooking(service)">Book Now</button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="state-card">
            <div class="empty-icon">✦</div>
            <h3>No services available yet</h3>
            <p>Services will appear here once they are published.</p>
          </div>
        </div>
      </section>
    </main>

    <PageFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs } from 'firebase/firestore'
import NavBar from '@/component/NavBar.vue'
import PageFooter from '@/component/PageFooter.vue'
import { db } from '@/firebase'

const router = useRouter()
const loading = ref(true)
const services = ref([])

const defaultImage =
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80'

const displayServices = computed(() => {
  return [...services.value]
    .filter((item) => item.active !== false)
    .sort((a, b) => Number(a.order || 999) - Number(b.order || 999))
})

function normalizeListItem(item) {
  if (typeof item === 'string') {
    return {
      id: '',
      title: item.trim(),
      description: '',
      detailPageId: '',
    }
  }

  return {
    id: String(item?.id || '').trim(),
    title: String(item?.title || '').trim(),
    description: String(item?.description || '').trim(),
    detailPageId: String(item?.detailPageId || '').trim(),
  }
}

function sanitizeService(raw = {}) {
  return {
    id: raw.id || '',
    slug: String(raw.slug || '').trim(),
    title: String(raw.title || '').trim(),
    subtitle: String(raw.subtitle || '').trim(),
    cardImage: String(raw.cardImage || '').trim(),
    bookingPath: String(raw.bookingPath || '/book').trim(),
    listItems: Array.isArray(raw.listItems) ? raw.listItems.map(normalizeListItem) : [],
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : 999,
    active: typeof raw.active === 'boolean' ? raw.active : true,
  }
}

function normalizedListItems(service) {
  if (!Array.isArray(service.listItems)) return []

  return service.listItems.filter((item) => item.id && item.title && item.detailPageId)
}

async function fetchServices() {
  loading.value = true

  try {
    const snapshot = await getDocs(collection(db, 'services'))

    services.value = snapshot.docs.map((docSnap) =>
      sanitizeService({
        id: docSnap.id,
        ...docSnap.data(),
      }),
    )
  } catch (error) {
    console.error('Failed to fetch services:', error)
    services.value = []
  } finally {
    loading.value = false
  }
}

function goToServiceDetail(service) {
  const slug = service.slug || service.id
  if (!slug) return

  const firstItem = normalizedListItems(service)[0]

  if (firstItem?.detailPageId) {
    router.push({
      path: `/our-services/${slug}`,
      query: {
        detail: firstItem.detailPageId,
      },
    })
    return
  }

  router.push(`/our-services/${slug}`)
}

function goToTopic(service, item) {
  const slug = service.slug || service.id
  if (!slug || !item?.detailPageId) return

  router.push({
    path: `/our-services/${slug}`,
    query: {
      detail: item.detailPageId,
    },
  })
}

function goToBooking(service) {
  router.push(service.bookingPath || '/book')
}

onMounted(fetchServices)
</script>

<style scoped>
.services-page {
  min-height: 100vh;
  color: #31433a;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 32%, #f5dfe6 68%, #eed6df 100%);
}

.hero-section {
  padding: 15px 20px 45px;
}

.hero-content {
  max-width: 920px;
  margin: 0 auto;
  text-align: center;
}

.hero-content h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #4f6258;
  line-height: 1.08;
}

.hero-text {
  max-width: 720px;
  margin: 14px auto 0;
  color: #6e7d73;
  line-height: 1.8;
  font-size: 0.98rem;
}

.services-list-section {
  padding: 6px 20px 84px;
}

.section-inner {
  max-width: 1120px;
  margin: 0 auto;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.service-row {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 18px;
  align-items: stretch;
}

.service-row.reverse {
  grid-template-columns: 1fr 360px;
}

.service-row.reverse .service-image-wrap {
  order: 2;
}

.service-row.reverse .service-content-card {
  order: 1;
}

.service-image-wrap,
.service-content-card,
.state-card {
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.74);
  box-shadow: 0 14px 30px rgba(109, 126, 114, 0.1);
}

.service-image-wrap {
  min-height: 250px;
  position: relative;
  cursor: pointer;
}

.service-image {
  width: 100%;
  height: 100%;
  min-height: 250px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.08));
  pointer-events: none;
}

.service-content-card {
  display: flex;
  align-items: center;
}

.service-inner {
  width: 100%;
  padding: 24px 26px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}

.service-title {
  margin: 0;
  font-size: clamp(1.55rem, 2.6vw, 2.15rem);
  line-height: 1.15;
  color: #2f5b43;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.service-title:hover {
  opacity: 0.8;
}

.mini-link-btn {
  border: none;
  background: transparent;
  color: #6c7b72;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  padding: 4px 0;
}

.service-subtitle {
  margin: 0 0 16px;
  color: #6f7f75;
  line-height: 1.75;
  font-size: 0.97rem;
}

.list-panel {
  border-radius: 18px;
  background: rgba(247, 249, 246, 0.9);
  border: 1px solid rgba(221, 230, 222, 0.85);
  padding: 14px;
}

.list-panel-head {
  margin-bottom: 10px;
}

.list-panel-head span {
  display: inline-flex;
  font-size: 0.85rem;
  font-weight: 700;
  color: #738278;
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.topic-item {
  width: 100%;
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 10px;
  text-align: left;
  border: none;
  border-radius: 14px;
  background: white;
  padding: 12px 14px;
  cursor: pointer;
  font: inherit;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
  box-shadow: 0 4px 12px rgba(122, 138, 127, 0.06);
}

.topic-item:hover {
  transform: translateY(-1px);
  background: #fcfdfb;
  box-shadow: 0 8px 18px rgba(122, 138, 127, 0.1);
}

.topic-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #5f8f77;
}

.topic-title {
  color: #4f6158;
  font-weight: 700;
  line-height: 1.5;
}

.topic-arrow {
  color: #8a978f;
  font-weight: 700;
}

.empty-points {
  color: #839288;
  line-height: 1.7;
  padding: 10px 0 2px;
}

.service-actions {
  margin-top: 18px;
}

.book-btn {
  border: none;
  border-radius: 14px;
  padding: 12px 22px;
  background: #458568;
  color: white;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.book-btn:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}

.state-card {
  padding: 56px 24px;
  text-align: center;
}

.empty-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 12px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f7e8ee, #edf5ee);
}

.loader {
  width: 42px;
  height: 42px;
  margin: 0 auto;
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

@media (max-width: 1024px) {
  .service-row,
  .service-row.reverse {
    grid-template-columns: 1fr;
  }

  .service-row.reverse .service-image-wrap,
  .service-row.reverse .service-content-card {
    order: initial;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding: 80px 16px 22px;
  }

  .services-list-section {
    padding: 6px 16px 68px;
  }

  .service-inner {
    padding: 20px 18px;
  }

  .title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .service-title {
    font-size: 1.6rem;
  }

  .service-image-wrap,
  .service-image {
    min-height: 220px;
  }

  .topic-item {
    grid-template-columns: 12px 1fr;
  }

  .topic-arrow {
    display: none;
  }
}
</style>
