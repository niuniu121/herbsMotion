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
  padding: 24px 20px 14px;
  text-align: center;
}

.hero-inner {
  max-width: 900px;
  margin: 0 auto;
}

.hero-inner h1 {
  margin: 0;
  margin-top: 20px;
  margin-bottom: 100px;
  color: #1a3326;
  font-size: clamp(2.1rem, 4vw, 3.6rem);
  line-height: 1.04;
  letter-spacing: -0.03em;
  font-weight: 700;
}

/* ---------------- Team Section ---------------- */
.team-section {
  padding: 0 20px 28px;
}

.team-grid {
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 34px 32px;
  align-items: stretch;
}

/* ---------------- Team Card ---------------- */
.team-card {
  background: transparent;
  padding: 0 6px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 100%;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.team-card:hover {
  transform: translateY(-8px);
}

/* ---------------- Round Image Frame ---------------- */
.card-image-wrapper {
  width: calc(100% - 18px);
  max-width: 285px;
  aspect-ratio: 1 / 1;
  margin: 0 auto 18px auto;
  position: relative;
  background-color: transparent;
  flex-shrink: 0;
}

.card-image-wrapper::before {
  content: '';
  position: absolute;
  inset: -8px;
  border: 1.5px solid #8aaa79;
  border-radius: 50%;
  z-index: 1;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-image-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #f5dfe6;
  border-radius: 50%;
  transform: translate(12px, 12px);
  z-index: 0;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.member-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  border-radius: 50%;
  position: relative;
  z-index: 2;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.member-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #2f5b43;
  font-family: serif;
  background-color: #e9f0ea;
  border-radius: 50%;
  position: relative;
  z-index: 2;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.team-card:hover .card-image-wrapper::after {
  transform: translate(16px, 16px);
  background-color: #cfdac8;
}

.team-card:hover .card-image-wrapper::before {
  border-color: #2f5b43;
  inset: -10px;
}

.team-card:hover .member-image {
  transform: scale(1.03);
}

/* ---------------- Content ---------------- */
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  min-height: 100px;
}

.member-name {
  margin: 0 0 6px;
  color: #1a3326;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.28;
  min-height: 2.56em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-role {
  margin: 0 0 14px;
  color: #5a7062;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.45;
  min-height: 2.7em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-link {
  margin-top: auto;
  margin-bottom: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #2f5b43;
  font-size: 0.94rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.3s ease;
  padding-bottom: 4px;
  border-bottom: 1px solid transparent;
  min-height: 28px;
}

.arrow {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 1.08rem;
}

.team-card:hover .profile-link {
  color: #1a3326;
  border-bottom: 1px solid #1a3326;
}

.team-card:hover .arrow {
  transform: translateX(6px);
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
    max-width: 980px;
    gap: 30px 26px;
  }

  .card-image-wrapper {
    max-width: 260px;
  }
}

@media (max-width: 900px) {
  .team-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 760px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 24px 16px 12px;
  }

  .team-section {
    padding: 0 16px 24px;
  }

  .team-grid {
    grid-template-columns: 1fr;
    gap: 34px;
    max-width: 430px;
  }

  .team-card {
    padding: 0 0 14px;
  }

  .card-image-wrapper {
    width: calc(100% - 28px);
    max-width: 285px;
  }

  .hero-inner h1 {
    font-size: clamp(2rem, 9vw, 3rem);
  }

  .card-content {
    min-height: auto;
  }

  .member-name {
    min-height: auto;
  }

  .member-role {
    min-height: auto;
  }
}
</style>
