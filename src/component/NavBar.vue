<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isDropdownOpen = ref(false) // 控制移动端下拉菜单

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// 切换移动端抽屉菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
    isDropdownOpen.value = false // 关闭菜单时重置下拉状态
  }
}

// 点击链接后关闭整个菜单
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  isDropdownOpen.value = false
  document.body.style.overflow = ''
}

// 控制移动端下拉菜单的展开/收起
const toggleDropdownMobile = () => {
  if (window.innerWidth <= 768) {
    isDropdownOpen.value = !isDropdownOpen.value
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header :class="['page-header', { 'is-scrolled': isScrolled }]">
    <div class="container header-inner">
      <div class="logo-area">
        <span class="logo-icon"><img class="logo" src="../assets/logo.png" alt="logo" /></span>
        <span class="logo-text">Herbs & Motion</span>
      </div>

      <div :class="['nav-overlay', { 'is-open': isMobileMenuOpen }]">
        <nav class="nav-links">
          <RouterLink to="/" @click="closeMobileMenu">Home</RouterLink>
          <a href="#" @click="closeMobileMenu">About</a>

          <div class="dropdown-wrapper" @click="toggleDropdownMobile">
            <a href="#" class="dropdown-trigger" @click.prevent>
              Visualization
              <svg
                :class="['chevron-icon', { rotate: isDropdownOpen }]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </a>
            <div :class="['dropdown-menu', { 'show-mobile': isDropdownOpen }]">
              <RouterLink to="/tcm" @click="closeMobileMenu">TCM</RouterLink>
              <a href="#" @click="closeMobileMenu">Physio</a>
            </div>
          </div>

          <a href="#" @click="closeMobileMenu">Our Services</a>
          <a href="#" @click="closeMobileMenu">What to Expect</a>
          <a href="#" @click="closeMobileMenu">Focused Healing</a>
          <a href="#" class="mobile-only-link" @click="closeMobileMenu">Location</a>
        </nav>
      </div>

      <div class="auth-buttons">
        <a href="#" class="btn-login desktop-only">Location</a>
        <button class="btn-get-started">Book a Consultation</button>

        <div class="hamburger" :class="{ 'is-active': isMobileMenuOpen }" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 继承全局变量 (Ensure these are defined in your main.css or App.vue) */
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
  /* Added to ensure the container stretches to the max-width if necessary, 
     though usually handled by the global .container class */
  width: 100%;
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
  z-index: 1600;
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
  align-items: center;
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

/* --- Added/Fixed Button Styles for the Auth/Action Area --- */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 15px; /* Adjust spacing between Location and Button */
  position: relative;
  z-index: 1600;
}

/* Style for the Location link */
.btn-login {
  color: var(--text-dark);
  text-decoration: none;
  font-weight: 500;
  padding: 10px 15px; /* Give it some padding for a better click area */
  transition: color 0.3s;
}
.btn-login:hover {
  color: var(--accent-pink);
}

/* Style for the Book a Consultation button */
.btn-get-started {
  background-color: var(--primary-teal);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-family: inherit; /* Inherit font from body */
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-get-started:hover {
  background-color: var(--text-dark);
  transform: translateY(-2px);
}

.mobile-only-link {
  display: none;
}
.hamburger {
  display: none;
}

/* --- 桌面端下拉菜单样式 --- */
.dropdown-wrapper {
  position: relative;
}
.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.chevron-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: white;
  min-width: 140px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 10px 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  text-align: center;
}
/* 桌面端 hover 展开 */
@media (min-width: 769px) {
  .dropdown-wrapper:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(15px);
  }
  .dropdown-wrapper:hover .chevron-icon {
    transform: rotate(180deg);
  }
}
.dropdown-menu a {
  padding: 10px 20px;
  font-size: 15px;
  display: block;
}
.dropdown-menu a:hover {
  background: rgba(207, 218, 200, 0.3); /* 浅绿背景 */
  color: var(--primary-teal);
}

/* ==========================================================================
   H5 移动端响应式适配 (Mobile Responsive & Hamburger Menu)
   ========================================================================== */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  .btn-get-started {
    padding: 8px 12px;
    font-size: 13px;
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 24px;
    height: 18px;
    cursor: pointer;
    margin-left: 15px;
    z-index: 1600;
  }
  .hamburger span {
    display: block;
    width: 100%;
    height: 2px;
    background-color: var(--text-dark);
    transition: all 0.3s ease-in-out;
    transform-origin: left center;
  }
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

  .nav-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(235, 240, 232, 0.96);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    z-index: 1500;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(-100%);
    transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);
  }
  .nav-overlay.is-open {
    transform: translateY(0);
  }

  .nav-links {
    flex-direction: column;
    gap: 30px;
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

  /* 移动端下拉菜单覆盖样式 */
  .dropdown-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .dropdown-menu {
    position: static;
    transform: none;
    box-shadow: none;
    background: transparent;
    opacity: 0;
    visibility: hidden;
    padding: 0;
    min-width: auto;
    height: 0;
    overflow: hidden;
    transition: none; /* 移动端用 vue 控制显隐即可 */
  }
  .dropdown-menu.show-mobile {
    opacity: 1;
    visibility: visible;
    height: auto;
    margin-top: 15px;
    gap: 15px;
  }
  .dropdown-menu a {
    font-size: 20px;
    padding: 5px 0;
    color: #72856e;
  }
  .chevron-icon.rotate {
    transform: rotate(180deg);
  }
}
</style>
