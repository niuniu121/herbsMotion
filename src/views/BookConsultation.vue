<template>
  <div class="book-page" :style="pageBgStyle">
    <NavBar />

    <main class="book-content">
      <section class="hero-section">
        <h1 class="hero-title">Book a Consultation</h1>
        <div class="hero-badge">Book Online</div>
        <p class="hero-desc">
          Schedule your appointment with Herbs & Motion through our secure online booking system.
          Choose your preferred service, practitioner, and time that suits you best.
        </p>
      </section>

      <section class="top-info-grid">
        <div class="info-card">
          <div class="card-icon">👨‍⚕️</div>
          <div>
            <p class="card-label">Practitioner</p>
            <h3>Mr Geng H (Jay) Zheng</h3>
            <p class="card-text">
              Please select your preferred consultation type and available booking time through the
              booking system below.
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="card-icon">📍</div>
          <div>
            <p class="card-label">Clinic Address</p>
            <h3>696 Burke Rd, Camberwell</h3>
            <p class="card-text">
              Conveniently located for your in-person consultation and ongoing care.
            </p>
          </div>
        </div>
      </section>

      <section v-if="promotion.visible" class="promotion-section">
        <div class="promotion-card">
          <div class="promotion-left">
            <p class="promotion-tag">Promotion</p>
            <h2>{{ promotion.title }}</h2>
            <p>{{ promotion.content }}</p>
          </div>

          <div class="promotion-right">
            <div class="promotion-placeholder">Current Promotion</div>
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
              <li>Receive your booking confirmation online</li>
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
              <span>Practitioner: Mr Geng H (Jay) Zheng</span>
              <span>Address: 696 Burke Rd, Camberwell</span>
            </div>
          </div>
        </aside>
      </section>
    </main>

    <PageFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import NavBar from '@/component/NavBar.vue'
import PageFooter from '@/component/PageFooter.vue'

const scrollRatio = ref(0)
let handleIFrameMessage = null
let handleScroll = null

const promotion = ref({
  title: '',
  content: '',
  visible: false,
})

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
})
</script>

<style scoped>
.book-page {
  min-height: 100vh;
  transition: background 0.35s ease;
}

.book-content {
  padding: 56px 24px 100px;
}

.hero-section,
.top-info-grid,
.promotion-section,
.booking-layout {
  max-width: 1320px;
  margin-left: auto;
  margin-right: auto;
}

.hero-section {
  text-align: center;
  max-width: 920px;
  margin-bottom: 42px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  margin-bottom: 18px;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.1);
  color: #2f5b43;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-title {
  margin: 0 0 14px;
  font-size: clamp(2.2rem, 4vw, 3.6rem);
  line-height: 1.08;
  color: #2d5a42;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero-desc {
  max-width: 760px;
  margin: 0 auto;
  font-size: 1.04rem;
  line-height: 1.8;
  color: #5f6f66;
}

.top-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin-bottom: 28px;
}

.info-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(56, 92, 71, 0.08);
  backdrop-filter: blur(12px);
  box-shadow: 0 14px 35px rgba(47, 91, 67, 0.08);
}

.card-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(47, 91, 67, 0.1);
  font-size: 1.42rem;
}

.card-label {
  margin: 0 0 6px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #79907f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-card h3 {
  margin: 0 0 8px;
  color: #2d5a42;
  font-size: 1.2rem;
  font-weight: 800;
}

.card-text {
  margin: 0;
  color: #66786d;
  line-height: 1.7;
}

.promotion-section {
  margin-bottom: 30px;
}

.promotion-card {
  display: grid;
  grid-template-columns: 1.18fr 0.82fr;
  gap: 24px;
  align-items: stretch;
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(56, 92, 71, 0.08);
  box-shadow: 0 18px 40px rgba(47, 91, 67, 0.08);
  backdrop-filter: blur(12px);
}

.promotion-tag {
  margin: 0 0 8px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #7a8d80;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.promotion-card h2 {
  margin: 0 0 12px;
  color: #2d5a42;
  font-size: 1.7rem;
  font-weight: 800;
}

.promotion-card p {
  margin: 0;
  color: #64766a;
  line-height: 1.8;
}

.promotion-right {
  display: flex;
}

.promotion-placeholder {
  width: 100%;
  min-height: 180px;
  padding: 20px;
  border-radius: 22px;
  border: 2px dashed rgba(47, 91, 67, 0.2);
  background: rgba(47, 91, 67, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6d8375;
  font-weight: 700;
}

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

@media (max-width: 1100px) {
  .top-info-grid,
  .promotion-card,
  .booking-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .book-content {
    padding: 32px 16px 72px;
  }

  .hero-section {
    margin-bottom: 30px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-desc {
    font-size: 0.96rem;
    line-height: 1.72;
  }

  .info-card,
  .promotion-card,
  .booking-card,
  .side-card {
    padding: 18px;
    border-radius: 20px;
  }

  .info-card {
    flex-direction: column;
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
    font-size: 1.35rem;
  }

  .promotion-placeholder {
    min-height: 120px;
  }

  #cliniko-51970928 {
    min-height: 900px;
  }
}

@media (max-width: 480px) {
  .book-content {
    padding: 24px 12px 60px;
  }

  .hero-badge {
    font-size: 0.82rem;
    padding: 7px 14px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .card-icon {
    width: 46px;
    height: 46px;
    font-size: 1.2rem;
  }

  .info-card h3,
  .side-card h3 {
    font-size: 1.05rem;
  }

  .booking-head h2 {
    font-size: 1.2rem;
  }

  #cliniko-51970928 {
    min-height: 820px;
  }
}
</style>
