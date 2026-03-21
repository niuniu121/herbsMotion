<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 【关键修复 1】：Vite 中引入 src/assets 图片必须通过 import 导入！
import imgMassage from '../assets/massage2.png'
import imgPhysio from '../assets/Physiotherapy2.png'
import imgMedicine from '../assets/Chinese_Medicine2.png'
import logo from '../assets/logo.svg'

// --- 逻辑处理 ---
const loading = ref(true)
const isScrolled = ref(false)
// 页面动态背景色，初始为老板喜欢的低饱和度绿色
const currentBgColor = ref('#CFDAC8')

// 用于存放需要监听的区域节点
const sectionRefs = ref([])

// 卡片数据 (直接使用 import 进来的图片变量)
const heroCards = [
  {
    title: 'Remedial Massage',
    desc: 'For my recovery',
    bgColor: '#2D5041',
    bgImage: `url(${imgMassage})`,
  },
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

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1500)

  window.addEventListener('scroll', handleScroll)

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.4,
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
          <span class="logo-text-animate">Herbs & Motion</span>
        </div>
        <div class="loader-spinner"></div>
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
          <nav class="nav-links">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Our Services</a>
            <a href="#">What to Expect</a>
            <a href="#">Focused Healing</a>
          </nav>
          <div class="auth-buttons">
            <a href="#" class="btn-login">Location</a>
            <button class="btn-get-started">Book a Consultation</button>
          </div>
        </div>
      </header>

      <section class="hero-section" :ref="setSectionRef" data-bgcolor="#CFDAC8">
        <div class="container text-center hero-text-container">
          <h1 class="hero-headline animate-on-load delay-1">
            Your Wellness Journey,<br />
            Starts here.
          </h1>
          <!-- <p class="hero-subline animate-on-load delay-2">
            Expert remedial therapy and ancient Chinese medicine combined to restore your natural
            rhythm.
          </p> -->
          <!-- <p class="hero-question animate-on-load delay-3">
            What type of care are you looking for?
          </p> -->
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
            Your first consultation includes a complete body assessment and a customized treatment
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
          <p class="copyright-text">&copy; 2024 Herbs & Motion. All rights reserved.</p>
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
@keyframes loader-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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
  background: #333;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  font-size: 14px;
}
.img-photo-placeholder {
  width: 100%;
  height: 100%;
}

/* ==========================================================================
   Loading Screen Styles
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
.logo-placeholder {
  font-size: 30px;
  font-weight: bold;
  color: var(--primary-teal);
}
.loader-spinner {
  margin-top: 20px;
  border: 4px solid rgba(50, 91, 73, 0.1);
  border-left-color: var(--primary-teal);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: loader-rotate 1s linear infinite;
}
.fade-out-leave-active {
  transition: opacity 0.5s ease;
}
.fade-out-leave-to {
  opacity: 0;
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
   Header Section
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
}

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
.hero-subline {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 50px;
  opacity: 0.9;
}
.hero-question {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
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
  height: 350px;
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
  background-size: 85%;
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

/* SVG箭头样式，确保能完美显示 */
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
  color: var(--accent-pink);
  font-size: 40px;
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
   全新 Loading 动画：弹性渐入 + 持续呼吸浮动
   ========================================================================== */
.loader-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 1. 图标包裹层出场 */
.logo-icon-wrap {
  margin-right: 15px;
  display: inline-block;
  opacity: 0; /* 初始隐藏 */
  /* 出场：像植物发芽一样缩放渐入，持续0.8秒 */
  animation: bloom-in 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

.logo-img {
  width: 45px; /* 这里可以根据你的 logo 实际大小调整 */
  height: auto;
  /* 出场完毕后：加入一个持续的轻微上下呼吸浮动，显得有生命力 */
  animation: float-breathe 3s ease-in-out infinite 0.8s;
}

/* 2. 文字跳跃出场 */
/* 2. 文字跳跃出场 */
.logo-text-animate {
  font-size: 32px;
  font-weight: bold;
  color: #94a78f; /* 👈 这里改成了和 logo 保持一致的高级灰绿色 */
  display: inline-block;
  opacity: 0;
  animation: jump-fade-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s forwards;
}

/* --- 核心动画 Keyframes --- */

/* 图标：旋转+缩放渐入 (像叶子舒展) */
@keyframes bloom-in {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-20deg);
  }
  60% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

/* 文字：从下方弹跳进入 */
@keyframes jump-fade-in {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  50% {
    opacity: 1;
    transform: translateY(-8px);
  } /* 冲过头一点 */
  75% {
    transform: translateY(4px);
  } /* 弹回来一点 */
  100% {
    opacity: 1;
    transform: translateY(0);
  } /* 稳稳落下 */
}

/* 持续浮动效果 (悬浮感) */
@keyframes float-breathe {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

/*首页加载loading*/
/* ==========================================================================
   Loading 动画：专门针对加载页的文字和图标
   ========================================================================== */

/* 1. 图标像植物发芽一样缩放渐入，并在加载时上下呼吸浮动 */
.loading-overlay .logo-icon {
  display: inline-block;
  opacity: 0;
  animation: bloom-in 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

.loading-overlay .logo-icon img {
  width: 45px;
  height: auto;
  animation: float-breathe 3s ease-in-out infinite 0.8s;
}

/* 2. 文字跳跃渐入，并强制修改颜色为 #94a78f */
/* 2. 文字跳跃渐入，优化清晰度和对比度 */
.loading-overlay .logo-text {
  font-size: 34px; /* 稍微放大一点点 */
  font-weight: 800; /* 👈 进一步加粗，增加文字的视觉面积 */
  letter-spacing: 0.5px; /* 👈 增加一点点字间距，防止浅色文字糊在一起 */
  color: #72856e !important; /* 👈 这是 #94a78f 的同色调加深版，保持了灰绿感，但在白底上更清晰 */
  display: inline-block;
  opacity: 0;
  animation: jump-fade-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s forwards;
  /* 👈 终极秘籍：加一层极其微弱的阴影，不仔细看看不出来，但能让文字边缘瞬间锐利 */
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.04);
}

/* --- 核心动画 Keyframes --- */
@keyframes bloom-in {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-20deg);
  }
  60% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes jump-fade-in {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  50% {
    opacity: 1;
    transform: translateY(-8px);
  }
  75% {
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float-breathe {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
</style>
