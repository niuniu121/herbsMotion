<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isDropdownOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value

  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
    isDropdownOpen.value = false
  } else {
    document.body.style.overflow = ''
    isDropdownOpen.value = false
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  isDropdownOpen.value = false
  document.body.style.overflow = ''
}

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
  document.body.style.overflow = ''
})
</script>

<template>
  <header :class="['page-header', { 'is-scrolled': isScrolled }]">
    <div class="container header-inner">
      <RouterLink to="/" class="logo-area" @click="closeMobileMenu">
        <span class="logo-icon-wrap">
          <img class="logo-icon" src="../assets/logo_green.svg" alt="Herbs & Motion icon" />
        </span>

        <span class="logo-wordmark-wrap">
          <img class="logo-wordmark" src="../assets/Logo_Name.svg" alt="Herbs & Motion" />
        </span>
      </RouterLink>

      <div :class="['nav-overlay', { 'is-open': isMobileMenuOpen }]">
        <nav class="nav-links">
          <RouterLink to="/" @click="closeMobileMenu">Home</RouterLink>
          <a href="#" @click="closeMobileMenu">Our team</a>

          <div class="dropdown-wrapper" @click="toggleDropdownMobile">
            <a href="#" class="dropdown-trigger" @click.prevent>
              Focussed Healing
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
              <RouterLink to="/physio" @click="closeMobileMenu">Physio</RouterLink>
            </div>
          </div>

          <a href="#" @click="closeMobileMenu">Our Services</a>
          <RouterLink to="/faq" @click="closeMobileMenu">FAQ</RouterLink>
          <a href="#" class="mobile-only-link" @click="closeMobileMenu">Location</a>
        </nav>
      </div>

      <div class="auth-buttons">
        <a href="#" class="btn-login desktop-only">Location</a>
        <router-link to="/book" class="btn-get-started"> Book a Consultation </router-link>
        <button
          class="hamburger"
          :class="{ 'is-active': isMobileMenuOpen }"
          @click="toggleMobileMenu"
          type="button"
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 22px 0;
  transition: all 0.35s ease;
}

.page-header.is-scrolled {
  padding: 14px 0;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 40px;
  width: 100%;
  min-width: 0;
}

/* =========================
   Logo
   ========================= */
.logo-area {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  cursor: pointer;
  position: relative;
  z-index: 1600;
  flex-shrink: 0;
}

.logo-icon-wrap,
.logo-wordmark-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.logo-wordmark {
  height: 30px;
  width: auto;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
  transform: translateY(-0.5px);
}

/* =========================
   Navigation
   ========================= */
.nav-overlay {
  display: flex;
  align-items: center;
  min-width: 0;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 42px;
}

.nav-links a {
  color: var(--text-dark);
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  line-height: 1;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.nav-links a:hover {
  color: var(--accent-pink);
}

/* =========================
   Actions
   ========================= */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1600;
  flex-shrink: 0;
  margin-left: auto;
}

.btn-login {
  color: var(--text-dark);
  text-decoration: none;
  font-weight: 500;
  padding: 10px 12px;
  line-height: 1;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.btn-login:hover {
  color: var(--accent-pink);
}

.btn-get-started {
  background-color: var(--primary-teal);
  color: white;
  border: none;
  border-radius: 999px;
  padding: 14px 26px;
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-get-started:hover {
  background-color: var(--text-dark);
  transform: translateY(-2px);
}

/* =========================
   Dropdown
   ========================= */
.dropdown-wrapper {
  position: relative;
}

.dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 14px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  min-width: 150px;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  text-align: center;
  z-index: 1200;
}

.dropdown-menu a {
  padding: 12px 18px;
  font-size: 15px;
  line-height: 1.2;
  display: block;
}

.dropdown-menu a:hover {
  background: rgba(207, 218, 200, 0.3);
  color: var(--primary-teal);
}

@media (min-width: 769px) {
  .dropdown-wrapper:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
  }

  .dropdown-wrapper:hover .chevron-icon {
    transform: rotate(180deg);
  }
}

/* =========================
   Hamburger
   ========================= */
.mobile-only-link {
  display: none;
}

.hamburger {
  display: none;
  background: transparent;
  border: none;
  padding: 0;
}

.hamburger span {
  display: block;
}

/* =========================
   Tablet refinement
   ========================= */
@media (max-width: 1200px) {
  .header-inner {
    gap: 28px;
  }

  .nav-links {
    gap: 28px;
  }

  .btn-get-started {
    padding: 13px 22px;
    font-size: 15px;
  }
}

@media (max-width: 992px) {
  .header-inner {
    gap: 22px;
  }

  .nav-links {
    gap: 20px;
  }

  .nav-links a {
    font-size: 15px;
  }

  .logo-wordmark {
    height: 28px;
  }

  .logo-icon {
    width: 34px;
    height: 34px;
  }
}

/* =========================
   Mobile / H5
   ========================= */
@media (max-width: 768px) {
  .page-header {
    padding: 16px 0;
  }

  .page-header.is-scrolled {
    padding: 12px 0;
  }

  .header-inner {
    justify-content: space-between;
    gap: 12px;
  }

  .logo-area {
    gap: 10px;
    min-width: 0;
    flex: 1;
  }

  .logo-icon-wrap,
  .logo-wordmark-wrap {
    height: 34px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .logo-wordmark {
    height: 22px;
    max-width: 100%;
    transform: translateY(-0.5px);
  }

  .desktop-only {
    display: none !important;
  }

  .auth-buttons {
    gap: 10px;
    margin-left: 0;
  }

  .btn-get-started {
    padding: 10px 14px;
    font-size: 12px;
    line-height: 1.15;
    border-radius: 22px;
    white-space: normal;
    width: 132px;
    min-height: 44px;
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .hamburger {
    display: inline-flex;
    flex-direction: column;
    justify-content: space-between;
    width: 26px;
    height: 20px;
    cursor: pointer;
    margin-left: 2px;
    z-index: 1601;
    flex-shrink: 0;
  }

  .hamburger span {
    width: 100%;
    height: 2.4px;
    background-color: var(--text-dark);
    border-radius: 999px;
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
    inset: 0;
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
    transition: transform 0.45s cubic-bezier(0.77, 0, 0.175, 1);
    flex: unset;
  }

  .nav-overlay.is-open {
    transform: translateY(0);
  }

  .nav-links {
    flex-direction: column;
    gap: 28px;
    text-align: center;
  }

  .nav-links a {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-dark);
  }

  .mobile-only-link {
    display: block;
    margin-top: 6px;
    color: var(--primary-teal) !important;
  }

  .dropdown-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dropdown-trigger {
    justify-content: center;
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
    transition: none;
    margin-top: 0;
  }

  .dropdown-menu.show-mobile {
    opacity: 1;
    visibility: visible;
    height: auto;
    margin-top: 14px;
  }

  .dropdown-menu a {
    font-size: 20px;
    padding: 6px 0;
    color: #72856e;
  }

  .chevron-icon.rotate {
    transform: rotate(180deg);
  }
}

.btn-get-started {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 18px 42px;
  background: #2f5b43;
  color: #ffffff;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-get-started:hover {
  background: #264b37;
  color: #ffffff;
  text-decoration: none;
}

.btn-get-started:visited,
.btn-get-started:active,
.btn-get-started:focus {
  color: #ffffff;
  text-decoration: none;
}
</style>
