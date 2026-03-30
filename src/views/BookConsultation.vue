<template>
  <div class="book-page" :style="pageBgStyle">
    <NavBar />

    <main class="book-content">
      <section class="hero-section">
        <h1 class="hero-title">Book a Consultation</h1>
        <p class="hero-desc">
          Schedule your appointment with Herbs & Motion through our secure online booking system.
          Choose your preferred service, practitioner, and time that suits you best.
        </p>
      </section>

      <!-- Map + Promotion -->
      <section class="top-split-section">
        <div class="top-split-grid" :class="{ 'single-column': !promotion.visible }">
          <!-- Left: Map -->
          <div class="location-card compact-location-card split-card">
            <div class="location-head compact-location-head">
              <div class="location-copy compact-location-copy">
                <div class="location-badge-row">
                  <span class="location-pin">📍</span>
                  <p class="card-label">Visit Our Clinic</p>
                </div>
                <h2>696 Burke Rd, Camberwell VIC 3124</h2>
                <p class="location-text">
                  Conveniently located for your in-person consultation and ongoing care.
                </p>
              </div>

              <a
                class="map-link"
                href="https://www.google.com/maps?q=696+Burke+Rd,+Camberwell+VIC+3124"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps
              </a>
            </div>

            <div class="map-shell compact-map-shell">
              <iframe
                title="Herbs & Motion clinic location"
                class="location-map compact-location-map split-location-map"
                src="https://www.google.com/maps?q=696%20Burke%20Rd,%20Camberwell%20VIC%203124&z=17&output=embed"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>

              <div class="map-note compact-map-note">
                Tap or click the map pin to view the full address in the popup.
              </div>
            </div>
          </div>

          <!-- Right: Promotion -->
          <div v-if="promotion.visible" class="promotion-card split-card promotion-half-card">
            <div class="promotion-left promotion-half-left">
              <p class="promotion-tag">Promotion</p>
              <h2>{{ promotion.title }}</h2>

              <div
                ref="promotionContentRef"
                :class="[
                  'promotion-text-wrap',
                  { collapsed: shouldCollapse && !promotionExpanded },
                ]"
              >
                <p class="promotion-text">
                  {{ promotion.content }}
                </p>
              </div>

              <button
                v-if="shouldCollapse"
                class="read-more-btn"
                @click="promotionExpanded = !promotionExpanded"
                type="button"
              >
                {{ promotionExpanded ? 'Read less' : 'Read more' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="booking-layout">
        <div class="booking-main">
          <div class="booking-card">
            <div class="booking-head">
              <div>
                <p class="small-label">Secure Booking System</p>
                <h2>Choose Your Appointment</h2>
              </div>
              <div class="secure-pill">Online Booking</div>
            </div>

            <div class="booking-frame-wrap">
              <iframe
                id="cliniko-51970928"
                src="https://geng-practice.au1.cliniko.com/bookings?embedded=true"
                frameborder="0"
                scrolling="auto"
                width="100%"
                height="1000"
                style="pointer-events: auto"
              ></iframe>
            </div>
          </div>
        </div>

        <aside class="booking-sidebar">
          <div class="side-card">
            <h3>What to Expect</h3>
            <ul>
              <li>Select your treatment or consultation type</li>
              <li>Choose an available practitioner and time</li>
              <li>Enter your details and confirm the booking</li>
              <li>Receive a confirmation email</li>
            </ul>
          </div>

          <div class="side-card">
            <h3>Before Your Visit</h3>
            <p>
              Please arrive a few minutes early and bring any relevant reports, referral letters, or
              scan results if applicable.
            </p>
          </div>

          <div class="side-card">
            <h3>Need Help Booking?</h3>
            <p>
              If you are unsure which appointment to choose, please contact the clinic directly and
              we will help guide you.
            </p>
            <div class="contact-mini">
              <span>Email: info@herbsmotion.com.au</span>
              <span>Phone: 0433644931</span>
            </div>
          </div>
        </aside>
      </section>
    </main>

    <PageFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import NavBar from '@/component/NavBar.vue'
import PageFooter from '@/component/PageFooter.vue'

const scrollRatio = ref(0)
let handleIFrameMessage = null
let handleScroll = null

const promotionExpanded = ref(false)
const promotionContentRef = ref(null)
const shouldCollapse = ref(false)
const PROMOTION_COLLAPSED_HEIGHT = 150

const promotion = ref({
  title: '',
  content: '',
  visible: false,
})

const checkPromotionOverflow = async () => {
  await nextTick()

  const el = promotionContentRef.value
  if (!el || !promotion.value?.content) {
    shouldCollapse.value = false
    return
  }

  shouldCollapse.value = el.scrollHeight > PROMOTION_COLLAPSED_HEIGHT
}

const fetchPromotion = async () => {
  try {
    const docRef = doc(db, 'siteContent', 'promotion')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      promotion.value = {
        title: data.title || '',
        content: data.content || '',
        visible: data.visible ?? false,
      }
    } else {
      promotion.value = {
        title: '',
        content: '',
        visible: false,
      }
    }

    promotionExpanded.value = false
    await checkPromotionOverflow()
  } catch (error) {
    console.error('Failed to fetch promotion:', error)
  }
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function mixColor(color1, color2, amount) {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  const r = Math.round(c1.r + (c2.r - c1.r) * amount)
  const g = Math.round(c1.g + (c2.g - c1.g) * amount)
  const b = Math.round(c1.b + (c2.b - c1.b) * amount)

  return `rgb(${r}, ${g}, ${b})`
}

const gradientColors = ['#CFDAC8', '#FAF7F2', '#F5DFE6', '#EED6DF']

const currentGradient = computed(() => {
  const totalSegments = gradientColors.length - 1
  const scaled = scrollRatio.value * totalSegments
  const index = Math.min(Math.floor(scaled), totalSegments - 1)
  const localT = scaled - index

  const start = gradientColors[index]
  const end = gradientColors[index + 1]

  return mixColor(start, end, localT)
})

const secondGradient = computed(() => {
  const shiftedRatio = Math.min(scrollRatio.value + 0.18, 1)
  const totalSegments = gradientColors.length - 1
  const scaled = shiftedRatio * totalSegments
  const index = Math.min(Math.floor(scaled), totalSegments - 1)
  const localT = scaled - index

  const start = gradientColors[index]
  const end = gradientColors[index + 1]

  return mixColor(start, end, localT)
})

const thirdGradient = computed(() => {
  const shiftedRatio = Math.max(scrollRatio.value - 0.12, 0)
  const totalSegments = gradientColors.length - 1
  const scaled = shiftedRatio * totalSegments
  const index = Math.min(Math.floor(scaled), totalSegments - 1)
  const localT = scaled - index

  const start = gradientColors[index]
  const end = gradientColors[index + 1]

  return mixColor(start, end, localT)
})

const pageBgStyle = computed(() => {
  return {
    background: `
      radial-gradient(circle at 15% 18%, rgba(255,255,255,0.55), transparent 24%),
      radial-gradient(circle at 85% 12%, rgba(255,255,255,0.35), transparent 20%),
      radial-gradient(circle at 70% 75%, rgba(255,255,255,0.22), transparent 22%),
      linear-gradient(180deg, ${currentGradient.value} 0%, ${secondGradient.value} 52%, ${thirdGradient.value} 100%)
    `,
  }
})

onMounted(() => {
  fetchPromotion()
  window.addEventListener('resize', checkPromotionOverflow)

  handleIFrameMessage = function (e) {
    const clinikoBookings = document.getElementById('cliniko-51970928')
    if (!clinikoBookings) return
    if (typeof e.data !== 'string') return

    if (e.data.search('cliniko-bookings-resize') > -1) {
      const height = Number(e.data.split(':')[1])
      if (!Number.isNaN(height)) {
        clinikoBookings.style.height = height + 'px'
      }
    }

    if (e.data.search('cliniko-bookings-page') > -1) {
      clinikoBookings.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  handleScroll = () => {
    const scrollTop = window.scrollY || window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight

    if (docHeight <= 0) {
      scrollRatio.value = 0
      return
    }

    scrollRatio.value = Math.min(Math.max(scrollTop / docHeight, 0), 1)
  }

  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('message', handleIFrameMessage)
})

onBeforeUnmount(() => {
  if (handleIFrameMessage) {
    window.removeEventListener('message', handleIFrameMessage)
  }

  if (handleScroll) {
    window.removeEventListener('scroll', handleScroll)
  }

  window.removeEventListener('resize', checkPromotionOverflow)
})
</script>

<style scoped>
.book-page {
  min-height: 100vh;
  transition: background 0.35s ease;
}

.book-content {
  padding: 18px 24px 100px;
}

.hero-section,
.top-split-section,
.booking-layout {
  max-width: 1240px;
  margin-left: auto;
  margin-right: auto;
}

.hero-section {
  text-align: center;
  max-width: 860px;
  margin-bottom: 8px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  margin-bottom: 10px;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.1);
  color: #2f5b43;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-title {
  margin: 0 0 6px;
  font-size: clamp(2rem, 3.6vw, 3.15rem);
  line-height: 1.03;
  color: #2d5a42;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero-desc {
  max-width: 700px;
  margin: 0 auto;
  font-size: 0.96rem;
  line-height: 1.6;
  color: #5f6f66;
}

/* =========================
   Top split layout
   ========================= */
.top-split-section {
  margin-bottom: 18px;
}

.top-split-grid {
  display: grid;
  grid-template-columns: 1.03fr 0.97fr;
  gap: 14px;
  align-items: stretch;
  margin-bottom: 40px;
}

.top-split-grid.single-column {
  grid-template-columns: 1fr;
}

.split-card {
  height: 100%;
}

/* =========================
   Location
   ========================= */
.location-card {
  padding: 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(56, 92, 71, 0.08);
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 38px rgba(47, 91, 67, 0.08);
}

.compact-location-card {
  padding: 15px;
  border-radius: 20px;
}

.location-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.compact-location-head {
  margin-bottom: 10px;
  align-items: center;
}

.location-copy {
  max-width: 760px;
}

.compact-location-copy {
  max-width: 640px;
}

.location-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.location-pin {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: rgba(47, 91, 67, 0.08);
  font-size: 1.08rem;
  flex-shrink: 0;
}

.card-label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #79907f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.location-card h2 {
  margin: 0 0 6px;
  color: #2d5a42;
  font-size: clamp(1.28rem, 2vw, 1.92rem);
  font-weight: 800;
  line-height: 1.12;
}

.compact-location-card h2 {
  font-size: clamp(1.15rem, 1.7vw, 1.55rem);
  margin: 0 0 6px;
}

.location-text {
  margin: 0;
  color: #66786d;
  line-height: 1.5;
  font-size: 0.92rem;
  max-width: 470px;
}

.compact-location-card .location-text {
  font-size: 0.9rem;
  line-height: 1.5;
}

.map-link {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.1);
  color: #2f5b43;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.map-link:hover {
  background: #2f5b43;
  color: #fff;
  transform: translateY(-1px);
}

.map-shell {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(47, 91, 67, 0.08);
  background: #f6f9f5;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.compact-map-shell {
  border-radius: 16px;
}

.location-map {
  display: block;
  width: 100%;
  height: 270px;
  border: 0;
}

.compact-location-map {
  height: 250px;
}

.split-location-map {
  height: 250px;
  min-height: 250px;
}

.map-note {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 7px 11px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.9);
  color: #5b6f63;
  font-size: 0.78rem;
  line-height: 1.3;
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 24px rgba(47, 91, 67, 0.08);
}

.compact-map-note {
  left: 10px;
  bottom: 10px;
  padding: 7px 11px;
  border-radius: 11px;
  font-size: 0.76rem;
}

/* =========================
   Promotion
   ========================= */
.promotion-card {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 16px 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(56, 92, 71, 0.08);
  box-shadow: 0 18px 40px rgba(47, 91, 67, 0.08);
  backdrop-filter: blur(12px);
}

.promotion-half-card {
  min-height: 250px;
}

.promotion-half-left {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 100%;
  padding-top: 0;
}

.promotion-tag {
  margin: 0 0 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #7a8d80;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.promotion-card h2 {
  margin: 0 0 10px;
  color: #2d5a42;
  font-size: clamp(1.34rem, 2vw, 1.82rem);
  font-weight: 800;
  line-height: 1.18;
  max-width: 420px;
}

.promotion-card p {
  margin: 0;
  color: #64766a;
  line-height: 1.62;
}

.promotion-text-wrap {
  max-width: 460px;
  overflow: hidden;
  transition: max-height 0.28s ease;
}

.promotion-text-wrap.collapsed {
  max-height: 150px;
}

.promotion-text {
  margin-top: 0;
  white-space: pre-line;
  font-size: 0.92rem;
}

.read-more-btn {
  align-self: flex-start;
  margin-top: 12px;
  min-height: 38px;
  padding: 0 16px;
  border: none;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.1);
  color: #2f5b43;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.read-more-btn:hover {
  background: #2f5b43;
  color: #fff;
  transform: translateY(-1px);
}

/* 保留这组也没问题，虽然正文现在不是用 transition 包着 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.28s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* =========================
   Booking
   ========================= */
.booking-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.78fr);
  gap: 28px;
  align-items: start;
}

.booking-main,
.booking-sidebar {
  min-width: 0;
}

.booking-card {
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(56, 92, 71, 0.08);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 45px rgba(47, 91, 67, 0.08);
}

.booking-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 20px;
}

.small-label {
  margin: 0 0 6px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #7a8d80;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.booking-head h2 {
  margin: 0;
  font-size: 1.65rem;
  color: #2d5a42;
  font-weight: 800;
}

.secure-pill {
  flex-shrink: 0;
  padding: 10px 16px;
  border-radius: 999px;
  background: #2f5b43;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(47, 91, 67, 0.18);
}

.booking-frame-wrap {
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(47, 91, 67, 0.08);
  background: #fff;
  width: 100%;
}

#cliniko-51970928 {
  display: block;
  width: 100%;
  min-height: 1000px;
  background: #fff;
}

.booking-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side-card {
  padding: 22px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(56, 92, 71, 0.08);
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 35px rgba(47, 91, 67, 0.07);
}

.side-card h3 {
  margin: 0 0 12px;
  font-size: 1.15rem;
  color: #2d5a42;
  font-weight: 800;
}

.side-card p {
  margin: 0;
  color: #64766a;
  line-height: 1.75;
}

.side-card ul {
  margin: 0;
  padding-left: 18px;
  color: #64766a;
}

.side-card li {
  margin-bottom: 10px;
  line-height: 1.65;
}

.contact-mini {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-mini span {
  color: #466451;
  font-size: 0.95rem;
  font-weight: 600;
}

/* =========================
   Responsive
   ========================= */
@media (max-width: 1100px) {
  .top-split-grid,
  .booking-layout {
    grid-template-columns: 1fr;
  }

  .promotion-half-card,
  .split-location-map {
    min-height: unset;
  }

  .location-map,
  .compact-location-map,
  .split-location-map {
    height: 220px;
    min-height: 220px;
  }

  .promotion-card {
    min-height: auto;
  }

  .promotion-text-wrap,
  .promotion-card h2 {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .book-content {
    padding: 18px 16px 72px;
  }

  .hero-section {
    margin-bottom: 10px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-desc {
    font-size: 0.94rem;
    line-height: 1.6;
  }

  .location-card,
  .promotion-card,
  .booking-card,
  .side-card {
    padding: 16px;
    border-radius: 18px;
  }

  .compact-location-card {
    padding: 14px;
  }

  .location-head {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .location-card h2 {
    font-size: 1.45rem;
  }

  .compact-location-card h2 {
    font-size: 1.22rem;
  }

  .location-map,
  .compact-location-map,
  .split-location-map {
    height: 200px;
    min-height: 200px;
  }

  .map-note {
    left: 10px;
    right: 10px;
    bottom: 10px;
    font-size: 0.76rem;
  }

  .booking-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .booking-head h2 {
    font-size: 1.35rem;
  }

  .secure-pill {
    padding: 8px 14px;
    font-size: 0.86rem;
  }

  .promotion-card h2 {
    font-size: 1.36rem;
  }

  .promotion-text-wrap.collapsed {
    max-height: 132px;
  }

  #cliniko-51970928 {
    min-height: 900px;
  }
}

@media (max-width: 480px) {
  .book-content {
    padding: 16px 12px 60px;
  }

  .hero-badge {
    font-size: 0.8rem;
    padding: 7px 13px;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .location-pin {
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }

  .location-card h2,
  .side-card h3 {
    font-size: 1.05rem;
  }

  .location-map,
  .compact-location-map,
  .split-location-map {
    height: 182px;
    min-height: 182px;
  }

  .promotion-card h2 {
    font-size: 1.22rem;
  }

  .promotion-text-wrap.collapsed {
    max-height: 118px;
  }

  .booking-head h2 {
    font-size: 1.2rem;
  }

  #cliniko-51970928 {
    min-height: 820px;
  }
}

.book-content {
  padding: 8px 24px 100px;
}

.hero-section {
  margin-bottom: 2px;
}

.top-split-section {
  margin-top: 0;
  margin-bottom: 14px;
}
</style>
