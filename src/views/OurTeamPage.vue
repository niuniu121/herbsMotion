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
  padding: 34px 20px 20px;
  text-align: center;
}

.hero-inner {
  max-width: 900px;
  margin: 0 auto;
}

.hero-inner h1 {
  margin: 0;
  color: #1a3326;
  font-size: clamp(2.4rem, 4.6vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-weight: 700;
}

/* ---------------- Team Section ---------------- */
.team-section {
  padding: 0 20px 36px;
}

.team-grid {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 22px;
  align-items: start;
}

/* ---------------- Team Card ---------------- */
.team-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 14px;
  cursor: pointer;
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 6px 24px rgba(26, 51, 38, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.55);
  display: flex;
  flex-direction: column;
}

.team-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 38px rgba(26, 51, 38, 0.08);
}

/* ---------------- Image Wrapper ---------------- */
.card-image-wrapper {
  width: 100%;
  aspect-ratio: 1 / 0.98;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f0f4f2;
  margin-bottom: 14px;
  position: relative;
}

.member-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.team-card:hover .member-image {
  transform: scale(1.03);
}

.member-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
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
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.member-role {
  margin: 0 0 14px;
  color: #7a8f83;
  font-size: 1rem;
  font-weight: 400;
  font-style: italic;
  line-height: 1.45;
  min-height: 2.2em;
}

/* ---------------- Elegant Text Link ---------------- */
.profile-link {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2f5b43;
  font-size: 1.2rem;
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
  padding: 56px 20px;
  color: #7a8f83;
  font-size: 1.05rem;
}

.error-card {
  color: #d36b6b;
}

/* ---------------- Responsive ---------------- */
@media (max-width: 1100px) {
  .team-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 820px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 26px 16px 16px;
  }

  .team-section {
    padding: 0 16px 28px;
  }

  .team-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    max-width: 420px;
  }

  .team-card {
    padding: 12px;
  }

  .hero-inner h1 {
    font-size: clamp(2.2rem, 9vw, 3.2rem);
  }
}
</style>
