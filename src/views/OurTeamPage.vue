<template>
  <div class="our-team-page" :style="pageDynamicStyle">
    <NavBar />

    <section class="hero-section">
      <div class="hero-inner">
        <h1>Meet Our Team</h1>
      </div>
    </section>

    <section class="team-section">
      <div v-if="loading" class="state-card">Loading our practitioners...</div>

      <div v-else-if="errorMessage" class="state-card error-card">
        {{ errorMessage }}
      </div>

      <div v-else-if="teamMembers.length === 0" class="state-card">
        Our practitioner profiles will be available soon.
      </div>

      <div v-else class="team-grid">
        <article
          v-for="(member, index) in teamMembers"
          :key="member.id || index"
          class="team-card"
          @click="goToDetail(member)"
        >
          <div class="card-image-wrapper">
            <img
              v-if="member.image && !member.imageError"
              :src="member.image"
              :alt="member.name || 'Practitioner'"
              class="member-image"
              @error="member.imageError = true"
            />
            <div v-else class="member-image-placeholder">
              <span>{{ member.name ? member.name.charAt(0) : 'H' }}</span>
            </div>
          </div>

          <div class="card-content">
            <h2 class="member-name">{{ member.name || 'Team Member' }}</h2>

            <p class="member-role">
              {{ member.rolesText || 'Practitioner' }}
            </p>

            <div class="profile-link">
              View Profile
              <span class="arrow">→</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <PageFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import NavBar from '../component/NavBar.vue'
import PageFooter from '../component/PageFooter.vue'

const router = useRouter()

const loading = ref(true)
const errorMessage = ref('')
const teamMembers = ref([])

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

const sanitizeRoles = (roles, fallbackRole = '') => {
  if (Array.isArray(roles)) {
    return roles.map((item) => String(item || '').trim()).filter(Boolean)
  }

  if (fallbackRole && String(fallbackRole).trim()) {
    return [String(fallbackRole).trim()]
  }

  return []
}

const buildSlug = (member, index) => {
  if (member?.slug && String(member.slug).trim()) {
    return String(member.slug).trim()
  }

  if (member?.name && String(member.name).trim()) {
    return String(member.name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  return `member-${index}`
}

const goToDetail = (member) => {
  router.push(`/our-team/${member.slug}`)
}

const fetchTeamMembers = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const docRef = doc(db, 'siteContent', 'ourTeam')
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      teamMembers.value = []
      return
    }

    const data = docSnap.data()

    teamMembers.value = Array.isArray(data.members)
      ? data.members
          .filter((member) => member.visible !== false)
          .map((member, index) => {
            const roles = sanitizeRoles(member.roles, member.role)
            return {
              id: member.id || `member_${index}`,
              slug: buildSlug(member, index),
              name: member.name || '',
              roles,
              rolesText: roles.join(' / '),
              image: member.image || '',
              imageError: false,
              visible: member.visible ?? true,
            }
          })
      : []
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    errorMessage.value = 'Failed to load practitioner profiles.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTeamMembers()
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
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

/* ---------------- Hero Section ---------------- */
.hero-section {
  padding: 80px 24px 40px;
  text-align: center;
}

.hero-inner {
  max-width: 800px;
  margin: 0 auto;
}

.hero-inner h1 {
  margin: 0;
  color: #1a3326;
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.hero-desc {
  margin: 24px auto 0;
  color: #5c7063;
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 600px;
}

/* ---------------- Team Section ---------------- */
.team-section {
  padding: 0 24px 120px;
}

.team-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 24px;
}

/* ---------------- Team Card ---------------- */
.team-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 24px rgba(26, 51, 38, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
}

.team-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 48px rgba(26, 51, 38, 0.08);
}

/* ---------------- Image Wrapper ---------------- */
.card-image-wrapper {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f0f4f2;
  margin-bottom: 16px;
  position: relative;
}

.member-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.team-card:hover .member-image {
  transform: scale(1.05);
}

.member-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #8aaa79;
  font-weight: 500;
}

/* ---------------- Card Content ---------------- */
.card-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.member-name {
  margin: 0 0 4px;
  color: #1a3326;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.member-role {
  margin: 0 0 16px;
  color: #7a8f83;
  font-size: 0.9rem;
  font-weight: 400;
  font-style: italic;
  line-height: 1.55;
  min-height: 2.8em;
}

/* ---------------- Elegant Text Link ---------------- */
.profile-link {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2f5b43;
  font-size: 0.85rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.arrow {
  transition: transform 0.3s ease;
}

.team-card:hover .profile-link {
  color: #1a3326;
}

.team-card:hover .arrow {
  transform: translateX(4px);
}

/* ---------------- State Cards ---------------- */
.state-card {
  text-align: center;
  padding: 60px 20px;
  color: #7a8f83;
  font-size: 1.1rem;
}

.error-card {
  color: #d36b6b;
}

/* ---------------- Responsive ---------------- */
@media (max-width: 1100px) {
  .team-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 20px 30px;
  }

  .team-section {
    padding: 0 20px 80px;
  }

  .team-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .team-card {
    padding: 12px;
  }
}
</style>
