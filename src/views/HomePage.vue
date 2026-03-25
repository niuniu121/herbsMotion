<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from '../component/NavBar.vue'
import PageFooter from '../component/PageFooter.vue'
import imgPhysio from '../assets/wulizhiliao1.png'
import imgMedicine from '../assets/zhongyi2.png'
import imgMassage from '../assets/anmo1.png'

const loading = ref(true)
const currentBgColor = ref('#CFDAC8')
const sectionRefs = ref([])
let observer = null

const heroCards = [
  {
    title: 'Physiotherapy',
    desc: 'For active movement',
    bgColor: '#3A7D87',
    bgImage: `url(${imgPhysio})`,
  },
  {
    title: 'Chinese Medicine',
    desc: 'For holistic health',
    bgColor: '#2D5041',
    bgImage: `url(${imgMedicine})`,
  },
  {
    title: 'Remedial Massage',
    desc: 'For my recovery',
    bgColor: '#967C60',
    bgImage: `url(${imgMassage})`,
  },
]

const setSectionRef = (el) => {
  if (el && !sectionRefs.value.includes(el)) {
    sectionRefs.value.push(el)
  }
}

onMounted(() => {
  window.scrollTo(0, 0)

  // 首次进入播放 loading，返回首页时直接显示
  if (!sessionStorage.getItem('home_first_loaded')) {
    setTimeout(() => {
      loading.value = false
      sessionStorage.setItem('home_first_loaded', 'true')
    }, 2000)
  } else {
    loading.value = false
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2,
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        currentBgColor.value = entry.target.dataset.bgcolor || '#CFDAC8'
      }
    })
  }, observerOptions)

  sectionRefs.value.forEach((section) => {
    if (section instanceof Element) {
      observer.observe(section)
    }
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  sectionRefs.value = []
})
</script>

<template>
  <div class="app-container">
    <Transition name="fade-out">
      <div v-if="loading" class="loading-overlay">
        <div class="loader-logo-container">
          <span class="logo-icon-wrap">
            <img class="logo-img" src="../assets/logo.png" alt="Herbs & Motion Logo" />
          </span>
        </div>
      </div>
    </Transition>

    <main
      :class="{ loaded: !loading }"
      class="main-content"
      :style="{ backgroundColor: currentBgColor }"
    >
      <NavBar />

      <section class="hero-section" :ref="setSectionRef" data-bgcolor="#CFDAC8">
        <div class="container text-center hero-text-container">
          <h1 class="hero-headline animate-on-load delay-1">
            Your Wellness Journey,<br />
            Starts here.
          </h1>
        </div>

        <div class="container hero-cards-container">
          <div
            v-for="(card, index) in heroCards"
            :key="index"
            class="hero-card-v2 animate-slide-in-up"
            :style="{
              '--card-index': index,
              '--bg-color': card.bgColor,
              '--bg-image': card.bgImage,
            }"
          >
            <div class="card-content">
              <h2 class="card-title">{{ card.title }}</h2>
              <div class="card-subtitle-group">
                <span class="card-desc">{{ card.desc }}</span>
                <span class="card-arrow">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 16 16 12 12 8"></polyline>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </span>
              </div>
            </div>
            <div class="card-illustration"></div>
          </div>
        </div>
      </section>

      <section class="philosophy-section" :ref="setSectionRef" data-bgcolor="#FAF7F2">
        <div class="container philosophy-inner">
          <div class="philosophy-text-block animate-slide-in-left">
            <p class="text-uppercase text-pink">OUR PHILOSOPHY</p>
            <h2 class="section-headline">
              Unlock your path to<br />
              holistic well-being with<br />
              Herbs & Motion.
            </h2>
            <p class="philosophy-description">
              We believe that true health is more than the absence of pain; it is the presence of
              vitality. Our integrated approach addresses the root causes of discomfort through
              evidence-based practice and traditional healing.
            </p>

            <div class="philosophy-features">
              <div class="feature-item">
                <span class="feature-icon">🌱</span>
                <div class="feature-text">
                  <h3>Natural Balance</h3>
                  <p>Restore inherent health.</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🩺</span>
                <div class="feature-text">
                  <h3>Expert Diagnosis</h3>
                  <p>Identify the root cause.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="philosophy-images animate-slide-in-right">
            <div class="image-card">
              <div class="photo-placeholder img-photo-placeholder">
                <img src="../assets/Acupuncture1.png" alt="Acupuncture tools" />
              </div>
            </div>

            <div class="image-card">
              <div class="photo-placeholder img-photo-placeholder">
                <img src="../assets/Herb.png" alt="Chinese herbs" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section text-center" :ref="setSectionRef" data-bgcolor="#F5DFE6">
        <div class="container cta-inner animate-on-load">
          <h2 class="section-headline">Start Your Healing Story Today</h2>
          <p class="cta-description">
            Your first consultation includes a complete body assessment and a customised treatment
            plan tailored to your lifestyle.
          </p>
          <button class="btn-book-now">Book Online Now</button>
        </div>
      </section>

      <div :ref="setSectionRef" data-bgcolor="#EED6DF">
        <PageFooter />
      </div>
    </main>
  </div>
</template>

<style>
:root {
  --white-content: #ffffff;
  --primary-teal: #325b49;
  --primary-teal-light: #4a6e59;
  --accent-pink: #d68ba2;
  --text-dark: #2f4f39;
  --text-primary: #1f2e23;
  --font-family-main: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family-main);
  color: var(--text-primary);
  overflow-x: hidden;
  background-color: #cfdac8;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.text-center {
  text-align: center;
}

.text-uppercase {
  text-transform: uppercase;
}

.text-pink {
  color: var(--accent-pink);
}

button {
  font-family: var(--font-family-main);
  cursor: pointer;
  border: none;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.btn-book-now {
  background: var(--primary-teal);
  color: white;
  padding: 15px 30px;
  font-weight: bold;
}

.btn-book-now:hover {
  background: var(--text-dark);
  transform: translateY(-2px);
}

/* --- Animations --- */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-on-load,
.animate-slide-in-up,
.animate-slide-in-left,
.animate-slide-in-right {
  opacity: 0;
}

.loaded .animate-on-load {
  animation: fadeIn 1s forwards;
}

.loaded .animate-slide-in-up {
  animation: slideInUp 0.8s forwards;
}

.loaded .animate-slide-in-left {
  animation: slideInLeft 0.8s forwards;
}

.loaded .animate-slide-in-right {
  animation: slideInRight 0.8s forwards;
}

.delay-1 {
  animation-delay: 0.1s !important;
}

.delay-2 {
  animation-delay: 0.2s !important;
}

.delay-3 {
  animation-delay: 0.3s !important;
}

.delay-4 {
  animation-delay: 0.4s !important;
}

/* Placeholders */
.photo-placeholder {
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-photo-placeholder {
  width: 100%;
  height: 100%;
}

.img-photo-placeholder img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* ========================================================================== */
/* Loading Screen */
/* ========================================================================== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  transition: opacity 0.5s ease;
}

.loader-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon-wrap {
  display: inline-block;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

.logo-img {
  width: 65px;
  height: auto;
  animation: logo-precise-bounce 2s ease-in-out forwards;
}

.fade-out-leave-active {
  transition: opacity 0.5s ease;
}

.fade-out-leave-to {
  opacity: 0;
}

@keyframes logo-precise-bounce {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
  5% {
    transform: translateY(0) scaleX(1.15) scaleY(0.85);
  }
  15% {
    transform: translateY(-25px) scaleX(0.9) scaleY(1.1) rotate(-8deg);
  }
  25% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
  30% {
    transform: translateY(0) scaleX(1.15) scaleY(0.85);
  }
  40% {
    transform: translateY(-25px) scaleX(0.9) scaleY(1.1) rotate(8deg);
  }
  50% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

/* ========================================================================== */
/* Main Content Layout */
/* ========================================================================== */
.main-content {
  position: relative;
  z-index: 1;
  opacity: 0;
  transition:
    opacity 1s ease 0.5s,
    background-color 0.8s ease-in-out;
  min-height: 100vh;
}

.main-content.loaded {
  opacity: 1 !important;
}

/* ========================================================================== */
/* Hero Section & Cards */
/* ========================================================================== */
.hero-section {
  padding: 40px 0 100px;
  overflow: hidden;
}

.hero-headline {
  font-size: 56px;
  font-weight: bold;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 20px;
}

.hero-cards-container {
  display: flex;
  gap: 30px;
  margin-top: 50px;
  justify-content: center;
  position: relative;
  padding: 0 20px;
}

.hero-card-v2 {
  flex: 1;
  height: 400px;
  max-width: 380px;
  background-color: var(--bg-color);
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
  animation-delay: calc(var(--card-index) * 0.2s);
  display: flex;
  flex-direction: column;
}

.hero-card-v2:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.card-content {
  padding: 40px 35px 0;
  color: white;
  z-index: 2;
}

.card-illustration {
  flex: 1;
  width: 100%;
  background-image: var(--bg-image);
  background-size: 100% auto;
  background-position: bottom center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: transform 0.4s ease;
}

.hero-card-v2:hover .card-illustration {
  transform: scale(1.05);
}

.card-title,
.card-desc,
.card-arrow {
  opacity: 0;
}

.card-title {
  font-size: 32px;
  font-weight: 500;
  margin: 0 0 15px 0;
  letter-spacing: -0.5px;
}

.card-subtitle-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.card-arrow {
  display: flex;
  align-items: center;
  color: white;
}

.card-arrow svg {
  width: 22px;
  height: 22px;
  display: block;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.hero-card-v2:hover .card-arrow svg {
  transform: translateX(6px);
}

.loaded .card-title {
  animation: fadeIn 0.5s forwards calc(0.8s + var(--card-index) * 0.1s + 0.2s);
}

.loaded .card-desc {
  animation: fadeIn 0.5s forwards calc(0.8s + var(--card-index) * 0.1s + 0.3s);
}

.loaded .card-arrow {
  animation: fadeIn 0.5s forwards calc(0.8s + var(--card-index) * 0.1s + 0.4s);
}

.loaded .card-illustration {
  animation: slideInUp 0.8s forwards calc(0.8s + var(--card-index) * 0.1s + 0.5s);
}

/* ========================================================================== */
/* Philosophy Section */
/* ========================================================================== */
.philosophy-section {
  padding: 120px 0;
}

.philosophy-inner {
  display: flex;
  align-items: center;
  gap: 80px;
}

.philosophy-text-block {
  flex: 1;
}

.philosophy-description {
  margin-bottom: 40px;
  line-height: 1.6;
  font-size: 18px;
  opacity: 0.9;
}

.section-headline {
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.1;
}

.philosophy-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 28px;
  color: var(--accent-pink);
}

.feature-text h3 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
}

.feature-text p {
  margin: 0;
  font-size: 14px;
  color: var(--text-dark);
  opacity: 0.8;
}

/* clean side-by-side image layout */
.philosophy-images {
  flex: 1;
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
}

.image-card {
  flex: 1;
  max-width: 280px;
  height: 380px;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease;
}

.image-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12);
}

/* ========================================================================== */
/* CTA Section */
/* ========================================================================== */
.cta-section {
  padding: 100px 0;
}

.cta-inner {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 80px 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
  max-width: 900px;
  margin: 0 auto;
}

.cta-description {
  margin: 20px auto 40px;
  max-width: 600px;
  line-height: 1.6;
  font-size: 18px;
}

/* ========================================================================== */
/* Mobile */
/* ========================================================================== */
@media (max-width: 768px) {
  .hero-headline {
    font-size: 38px;
  }

  .hero-cards-container {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 0 15px;
  }

  .hero-card-v2 {
    width: 100%;
    max-width: 100%;
    min-height: 400px;
    height: 350px;
  }

  .card-illustration {
    background-size: 100% auto;
    background-position: center bottom;
  }

  .philosophy-section {
    padding: 60px 0;
  }

  .philosophy-inner {
    flex-direction: column;
    gap: 50px;
  }

  .section-headline {
    font-size: 32px;
  }

  .philosophy-features {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .philosophy-images {
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .image-card {
    width: 100%;
    max-width: 320px;
    height: 300px;
  }

  .cta-section {
    padding: 60px 0;
  }

  .cta-inner {
    padding: 40px 20px;
    border-radius: 16px;
  }
}
</style>
