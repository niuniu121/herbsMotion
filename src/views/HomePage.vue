<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// --- 引入 src/assets 图片 (已严格对照你的本地目录文件名修改) ---
import imgPhysio from '../assets/Physiotherapy2.png'
import imgMedicine from '../assets/Chinese_Medicine2.png'
import imgMassage from '../assets/Remedial_Massage.png' // 新换的图片
import logo from '../assets/logo.svg' // (如果你用到 svg 的话留着，没用到可以删)

// --- 逻辑处理 ---
const loading = ref(true)
const isScrolled = ref(false)
const currentBgColor = ref('#CFDAC8')

// 控制手机端汉堡包菜单的开关状态
const isMobileMenuOpen = ref(false)

const sectionRefs = ref([])

// 卡片数据 (按老板要求重新排序：Physio左, Medicine中, Massage右)
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
    bgColor: '#967C60',
    bgImage: `url(${imgMedicine})`,
  },
  {
    title: 'Remedial Massage',
    desc: 'For my recovery',
    bgColor: '#2D5041',
    bgImage: `url(${imgMassage})`,
  },
]

const socialIcons = ['📱', '📷']

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const setSectionRef = (el) => {
  if (el && !sectionRefs.value.includes(el)) {
    sectionRefs.value.push(el)
  }
}

// 切换移动端菜单，并在打开时禁止页面背景滚动
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 点击菜单项后自动关闭菜单
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1500)

  window.addEventListener('scroll', handleScroll)

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        currentBgColor.value = entry.target.dataset.bgcolor
      }
    })
  }, observerOptions)

  sectionRefs.value.forEach((section) => {
    observer.observe(section)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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
      <header :class="['page-header', { 'is-scrolled': isScrolled }]">
        <div class="container header-inner">
          <div class="logo-area">
            <span class="logo-icon"><img class="logo" src="../assets/logo.png" /></span>
            <span class="logo-text">Herbs & Motion</span>
          </div>

          <div :class="['nav-overlay', { 'is-open': isMobileMenuOpen }]">
            <nav class="nav-links">
              <a href="#" @click="closeMobileMenu">Home</a>
              <a href="#" @click="closeMobileMenu">About</a>
              <a href="#" @click="closeMobileMenu">Our Services</a>
              <a href="#" @click="closeMobileMenu">What to Expect</a>
              <a href="#" @click="closeMobileMenu">Focused Healing</a>
              <a href="#" class="mobile-only-link" @click="closeMobileMenu">Location</a>
            </nav>
          </div>

          <div class="auth-buttons">
            <a href="#" class="btn-login desktop-only">Location</a>
            <button class="btn-get-started">Book a Consultation</button>

            <div
              class="hamburger"
              :class="{ 'is-active': isMobileMenuOpen }"
              @click="toggleMobileMenu"
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </header>

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
            <div class="image-box box-1">
              <div class="photo-placeholder img-photo-placeholder">
                <img width="320px" src="../assets/zhenjiu.png" />
              </div>
            </div>
            <div class="image-box box-2">
              <div class="photo-placeholder img-photo-placeholder">
                <img width="260px" src="../assets/HerbTray.png" />
              </div>
            </div>
            <div class="heart-icon-overlay"><img width="48px" src="../assets/pinkLogo.png" /></div>
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

      <footer class="page-footer" :ref="setSectionRef" data-bgcolor="#EED6DF">
        <div class="container footer-inner">
          <div class="footer-left animate-on-load">
            <div class="logo-area footer-logo">
              <span class="logo-icon"><img class="logo" src="../assets/logo.png" /></span>
              <span class="logo-text">Herbs & Motion</span>
            </div>
            <p class="footer-desc">
              Integrating modern physical therapy with holistic wellness for lasting health and
              mobility.
            </p>
            <div class="social-links">
              <a href="#" v-for="icon in socialIcons" :key="icon">{{ icon }}</a>
            </div>
          </div>

          <div class="footer-links-group animate-on-load delay-1">
            <h4>Services</h4>
            <a href="#">Remedial Massage</a>
            <a href="#">Physiotherapy</a>
            <a href="#">Chinese Medicine</a>
          </div>
          <div class="footer-links-group animate-on-load delay-2">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Success Stories</a>
          </div>
          <div class="footer-links-group animate-on-load delay-3">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div class="container text-center copyright-container animate-on-load delay-4">
          <p class="copyright-text">&copy; 2026 Herbs & Motion. All rights reserved.</p>
        </div>
      </footer>
    </main>
  </div>
</template>

<style>
/* ==========================================================================
   Global Styles, Variables, and Animations
   ========================================================================== */
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

/* Buttons */
button {
  font-family: var(--font-family-main);
  cursor: pointer;
  border: none;
  border-radius: 20px;
  transition: all 0.3s ease;
}
.btn-get-started,
.btn-book-now {
  background: var(--primary-teal);
  color: white;
  padding: 10px 20px;
}
.btn-get-started:hover,
.btn-book-now:hover {
  background: var(--text-dark);
  transform: translateY(-2px);
}
.btn-login {
  color: var(--text-dark);
  text-decoration: none;
  padding: 10px 15px;
  font-weight: 500;
}
.btn-book-now {
  font-weight: bold;
  padding: 15px 30px;
}

/* Animations */
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

/* ==========================================================================
   全新 Loading 动画：柔和呼吸悬浮 (取消旋转)
   ========================================================================== */
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
  /* 替换成了新的温和呼吸动画 */
  animation: logo-gentle-breathe 2s ease-in-out infinite;
}

.fade-out-leave-active {
  transition: opacity 0.5s ease;
}
.fade-out-leave-to {
  opacity: 0;
}

/* 【已修改】柔和呼吸悬浮的关键帧，不再转圈，只是微微上下浮动+呼吸放大 */
@keyframes logo-gentle-breathe {
  0%,
  100% {
    transform: translateY(0) scale(0.95);
  }
  50% {
    transform: translateY(-8px) scale(1.05);
  }
}

/* ==========================================================================
   Main Content Layout
   ========================================================================== */
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
  opacity: 1;
}

/* ==========================================================================
   Header Section (包含汉堡包菜单样式)
   ========================================================================== */
.page-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 25px 0;
  transition: all 0.4s ease;
}
.page-header.is-scrolled {
  padding: 15px 0;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
  z-index: 1600;
}
.logo-icon {
  font-size: 24px;
  color: var(--primary-teal);
}
.logo {
  width: 24px;
  display: flex;
  align-items: center;
}
.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-dark);
}

/* 桌面端导航 */
.nav-links {
  display: flex;
  gap: 30px;
}
.nav-links a {
  color: var(--text-dark);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}
.nav-links a:hover {
  color: var(--accent-pink);
}
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 1600;
}

/* 移动端专属类初始化 */
.mobile-only-link {
  display: none;
}
.hamburger {
  display: none;
} /* 桌面端隐藏汉堡包 */

/* ==========================================================================
   Hero Section & Cards 
   ========================================================================== */
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
  height: 420px;
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
  background-size: 56%;
  background-position: center bottom 20px;
  background-repeat: no-repeat;
  opacity: 0;
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

/* ==========================================================================
   Philosophy Section
   ========================================================================== */
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
  transition: transform 0.3s;
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

.philosophy-images {
  flex: 1;
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 450px;
}
.image-box {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  position: absolute;
}
.box-1 {
  width: 320px;
  height: 380px;
  top: 0;
  left: 0;
  z-index: 1;
}
.box-2 {
  width: 260px;
  height: 320px;
  bottom: 0;
  right: 0;
  z-index: 0;
}
.heart-icon-overlay {
  position: absolute;
  top: 160px;
  left: 280px;
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  border: 4px solid var(--accent-pink);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 10px 20px rgba(214, 139, 162, 0.2);
}

/* ==========================================================================
   CTA Section
   ========================================================================== */
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

/* ==========================================================================
   Footer Section
   ========================================================================== */
.page-footer {
  padding: 80px 0 40px;
}
.footer-inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
}
.footer-left {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.footer-logo {
  margin-bottom: 10px;
  cursor: pointer;
}
.footer-desc {
  font-size: 14px;
  color: var(--text-dark);
  line-height: 1.6;
  opacity: 0.8;
}
.social-links {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}
.social-links a {
  font-size: 20px;
  color: var(--text-dark);
  text-decoration: none;
  transition: opacity 0.3s;
}
.social-links a:hover {
  opacity: 0.6;
}
.footer-links-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.footer-links-group h4 {
  margin: 0 0 10px;
  font-weight: bold;
  color: var(--text-dark);
}
.footer-links-group a {
  color: var(--text-dark);
  text-decoration: none;
  font-size: 14px;
  opacity: 0.8;
  transition: opacity 0.3s;
}
.footer-links-group a:hover {
  opacity: 1;
  text-decoration: underline;
}
.copyright-container {
  margin-top: 60px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 20px;
}
.copyright-text {
  font-size: 12px;
  color: var(--text-dark);
  opacity: 0.6;
}

/* ==========================================================================
   H5 移动端响应式适配 (Mobile Responsive & Hamburger Menu)
   ========================================================================== */
@media (max-width: 768px) {
  /* --- Header & 汉堡包菜单 --- */
  .desktop-only {
    display: none !important;
  }
  .btn-get-started {
    padding: 8px 12px;
    font-size: 13px;
  }

  /* 汉堡包按钮样式 */
  .hamburger {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 24px;
    height: 18px;
    cursor: pointer;
    margin-left: 15px;
    z-index: 1600; /* 确保在菜单之上 */
  }
  .hamburger span {
    display: block;
    width: 100%;
    height: 2px;
    background-color: var(--text-dark);
    transition: all 0.3s ease-in-out;
    transform-origin: left center;
  }
  /* 汉堡包点击变成 X */
  .hamburger.is-active span:nth-child(1) {
    transform: rotate(45deg);
  }
  .hamburger.is-active span:nth-child(2) {
    opacity: 0;
    width: 0;
  }
  .hamburger.is-active span:nth-child(3) {
    transform: rotate(-45deg);
  }

  /* 移动端全屏折叠菜单 (抽屉) */
  .nav-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(235, 240, 232, 0.96); /* 贴合主题色的背景 */
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    z-index: 1500;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 默认在顶部屏幕之外 */
    transform: translateY(-100%);
    transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);
  }
  .nav-overlay.is-open {
    transform: translateY(0); /* 划入屏幕 */
  }

  /* 菜单内的链接排版 */
  .nav-links {
    flex-direction: column;
    gap: 35px;
    text-align: center;
  }
  .nav-links a {
    font-size: 24px;
    font-weight: bold;
    color: var(--text-dark);
  }
  .mobile-only-link {
    display: block;
    margin-top: 15px;
    color: var(--primary-teal) !important;
  }

  /* --- 主视觉 & 卡片区适配 --- */
  .hero-headline {
    font-size: 38px;
  }
  .hero-cards-container {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 0 15px;
  }
  /* 【核心修复】：强制卡片在手机端有足够高度，防止图片被吃掉 */
  .hero-card-v2 {
    width: 100%;
    max-width: 100%;
    min-height: 400px; /* 强制高度 */
    height: 400px;
  }
  .card-illustration {
    background-size: 80%; /* 缩小一点确保手机上完整展示 */
    background-position: center bottom 10px;
  }

  /* --- Philosophy 区块适配 --- */
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
    height: auto;
    min-height: 360px;
    display: flex;
    justify-content: center;
  }
  .box-1 {
    width: 240px;
    height: 280px;
    position: relative;
    z-index: 2;
  }
  .box-2 {
    width: 180px;
    height: 220px;
    top: 100px;
    right: 0;
    position: absolute;
    z-index: 1;
  }
  .heart-icon-overlay {
    top: 220px;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 70px;
    z-index: 3;
  }
  .heart-icon-overlay img {
    width: 36px;
  }

  /* --- CTA & Footer 区块适配 --- */
  .cta-section {
    padding: 60px 0;
  }
  .cta-inner {
    padding: 40px 20px;
    border-radius: 16px;
  }

  .footer-inner {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .footer-left {
    align-items: flex-start;
  }
}
</style>
