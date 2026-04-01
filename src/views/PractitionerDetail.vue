<template>
  <div class="our-team-page" :style="pageDynamicStyle">
    <NavBar />

    <section class="team-section">
      <div v-if="loading" class="state-card">Loading practitioner profile...</div>

      <div v-else-if="errorMessage" class="state-card error-card">
        {{ errorMessage }}
      </div>

      <div v-else-if="!member" class="state-card">Practitioner profile not found.</div>

      <div v-else class="team-list">
        <button type="button" class="back-btn" @click="goBack">← Back to Team</button>

        <article class="team-row">
          <div class="member-image-wrap">
            <img
              v-if="member.image && !imageError"
              :src="member.image"
              :alt="member.name || 'Practitioner'"
              class="member-image"
              @error="imageError = true"
            />
            <div v-else class="member-image-placeholder">
              <span>{{ member.name ? member.name.charAt(0) : 'H' }}</span>
            </div>
          </div>

          <div class="member-content">
            <div class="member-top">
              <h2>
                {{ member.name || 'Team Member' }}
                <span v-if="member.credentials" class="credentials">
                  {{ member.credentials }}
                </span>
                <span v-if="member.role" class="member-role-inline">
                  {{ member.role }}
                </span>
              </h2>

              <div class="about-wrap">
                <div class="member-about multiline-text">
                  {{ member.about || 'Practitioner profile coming soon.' }}
                </div>
              </div>
            </div>

            <div class="member-info-grid">
              <div v-if="parseLines(member.qualifications).length" class="info-card">
                <h3>Qualifications</h3>
                <ul>
                  <li v-for="(item, idx) in parseLines(member.qualifications)" :key="idx">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="parseLines(member.education).length" class="info-card">
                <h3>Education</h3>
                <ul>
                  <li v-for="(item, idx) in parseLines(member.education)" :key="idx">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="parseLines(member.services).length" class="info-card">
                <h3>Services</h3>
                <ul>
                  <li v-for="(item, idx) in parseLines(member.services)" :key="idx">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="parseLines(member.interests).length" class="info-card">
                <h3>Areas of Special Interest</h3>
                <ul>
                  <li v-for="(item, idx) in parseLines(member.interests)" :key="idx">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <PageFooter />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import NavBar from '../component/NavBar.vue'
import PageFooter from '../component/PageFooter.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const errorMessage = ref('')
const member = ref(null)
const imageError = ref(false)
const scrollY = ref(0)

const handleScroll = () => {
  scrollY.value = window.scrollY || window.pageYOffset || 0
}

const pageDynamicStyle = computed(() => {
  const scrollPercent = Math.min(scrollY.value / window.innerHeight, 1)

  return {
    background: `
      linear-gradient(
        180deg,
        #CFDAC8 0%,
        #FAF7F2 33%,
        #F5DFE6 66%,
        #EED6DF 100%
      )
    `,
    backgroundPosition: `0% ${scrollPercent * 40}%`,
    backgroundSize: '100% 200%',
  }
})

const parseLines = (value) => {
  if (!value) return []
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

const buildSlug = (memberData, index) => {
  if (memberData?.slug && String(memberData.slug).trim()) {
    return String(memberData.slug).trim()
  }

  if (memberData?.name && String(memberData.name).trim()) {
    return String(memberData.name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  return `member-${index}`
}

const fetchPractitioner = async () => {
  loading.value = true
  errorMessage.value = ''
  member.value = null
  imageError.value = false

  try {
    const docRef = doc(db, 'siteContent', 'ourTeam')
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      errorMessage.value = 'Practitioner profile not found.'
      return
    }

    const data = docSnap.data()
    const members = Array.isArray(data.members) ? data.members : []

    const visibleMembers = members
      .filter((item) => item.visible !== false)
      .map((item, index) => ({
        id: item.id || `member_${index}`,
        slug: buildSlug(item, index),
        name: item.name || '',
        role: item.role || '',
        credentials: item.credentials || '',
        image: item.image || '',
        qualifications: item.qualifications || '',
        education: item.education || '',
        services: item.services || '',
        interests: item.interests || '',
        about: item.about || '',
      }))

    const matched = visibleMembers.find((item) => item.slug === route.params.slug)

    if (!matched) {
      errorMessage.value = 'Practitioner profile not found.'
      return
    }

    member.value = matched
  } catch (error) {
    console.error('Failed to fetch practitioner profile:', error)
    errorMessage.value = 'Failed to load practitioner profile.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'OurTeam' })
}

watch(
  () => route.params.slug,
  () => {
    fetchPractitioner()
  },
)

onMounted(() => {
  fetchPractitioner()
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.our-team-page {
  min-height: 100vh;
  transition: background 0.25s ease-out;
  padding-bottom: 0;
}

.hero-section {
  padding: 92px 20px 28px;
}

.hero-inner {
  max-width: 1180px;
  margin: 0 auto;
}

.hero-kicker {
  margin: 0 0 14px;
  color: #4f7260;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-inner h1 {
  margin: 0;
  color: #2f5b43;
  font-size: clamp(2.8rem, 6vw, 4.7rem);
  line-height: 1.02;
  letter-spacing: -0.03em;
}

.hero-desc {
  max-width: 760px;
  margin: 18px 0 0;
  color: #62786d;
  font-size: 1.08rem;
  line-height: 1.85;
}

.team-section {
  padding: 18px 20px 80px;
}

.team-list {
  max-width: 1180px;
  margin: 0 auto;
}

.back-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.82);
  color: #315742;
  font-size: 0.96rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(64, 79, 68, 0.09);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 34px rgba(64, 79, 68, 0.12);
}

.team-row {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
  padding: 24px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(47, 91, 67, 0.08);
  box-shadow: 0 20px 42px rgba(64, 79, 68, 0.1);
}

.member-image-wrap {
  width: 250px;
  height: 320px;
  border-radius: 22px;
  overflow: hidden;
  background: linear-gradient(180deg, #edf4e7 0%, #f7f6f2 100%);
  flex-shrink: 0;
}

.member-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.member-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d9e6d4, #f4ece7);
}

.member-image-placeholder span {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: #2f5b43;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(47, 91, 67, 0.2);
}

.member-content {
  min-width: 0;
}

.member-top {
  margin-bottom: 22px;
}

.member-top h2 {
  margin: 0;
  color: #2f5b43;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.credentials {
  display: inline-block;
  margin-left: 10px;
  color: #6d8577;
  font-size: 0.95rem;
  font-weight: 600;
  vertical-align: middle;
}

.about-wrap {
  margin-top: 18px;
}

.member-about {
  color: #63786c;
  font-size: 1.02rem;
  line-height: 1.9;
  white-space: pre-line;
}

.member-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.info-card {
  border-radius: 22px;
  background: rgba(247, 250, 248, 0.96);
  border: 1px solid rgba(47, 91, 67, 0.07);
  padding: 18px 18px 16px;
}

.info-card h3 {
  margin: 0 0 10px;
  color: #355b47;
  font-size: 1rem;
}

.info-card ul {
  margin: 0;
  padding-left: 1.15rem;
  color: #60776b;
}

.info-card li {
  margin-bottom: 8px;
  line-height: 1.75;
}

.state-card {
  max-width: 1180px;
  margin: 0 auto;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(47, 91, 67, 0.08);
  box-shadow: 0 22px 48px rgba(64, 79, 68, 0.1);
  padding: 34px 28px;
  color: #60776b;
  font-size: 1.05rem;
}

.error-card {
  color: #a14f67;
}

@media (max-width: 1024px) {
  .team-row {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 22px;
  }

  .member-image-wrap {
    width: 220px;
    height: 290px;
  }

  .member-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 70px 16px 20px;
  }

  .team-section {
    padding: 18px 16px 60px;
  }

  .team-row {
    grid-template-columns: 1fr;
    padding: 18px;
    border-radius: 24px;
  }

  .member-image-wrap {
    width: 100%;
    height: 260px;
    border-radius: 18px;
  }

  .hero-inner h1 {
    font-size: clamp(2.4rem, 9vw, 3.6rem);
  }

  .hero-desc,
  .member-about,
  .info-card li {
    font-size: 0.98rem;
  }

  .info-card {
    border-radius: 18px;
  }
}
.member-role-inline {
  margin-left: 10px;
  font-size: 1.2rem;
  font-style: italic;
  color: #7b8f84;
  font-weight: 500;
  letter-spacing: 0.04em;
}
</style>
