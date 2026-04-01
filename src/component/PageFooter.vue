<script setup>
import { ref } from 'vue'

const copied = ref(false)

const email = 'info@herbsmotion.com.au'
const phone = '0433644931'

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch (error) {
    console.error('Failed to copy email:', error)
  }
}
</script>

<template>
  <footer class="page-footer">
    <div class="container footer-inner">
      <div class="footer-left">
        <div class="logo-area footer-logo">
          <span class="logo-icon">
            <img class="logo" src="../assets/logo_green.svg" alt="Herbs & Motion logo" />
          </span>
          <span class="logo-text">Herbs & Motion</span>
        </div>

        <div class="contact-card">
          <div class="contact-row">
            <span class="contact-label">Email</span>
            <button class="contact-email-btn" @click="copyEmail" type="button">
              {{ email }}
            </button>
          </div>

          <transition name="fade">
            <span v-if="copied" class="copied-tip">Copied!</span>
          </transition>

          <div class="contact-row">
            <span class="contact-label">Phone</span>
            <a class="contact-link" :href="`tel:${phone}`">{{ phone }}</a>
          </div>
        </div>

        <div class="social-links">
          <a href="#" v-for="icon in socialIcons" :key="icon">{{ icon }}</a>
        </div>
      </div>

      <div class="footer-links-group">
        <h4>Services</h4>
        <RouterLink to="/our-services">Chinese Medicine</RouterLink>
        <RouterLink to="/our-services">Physiotherapy</RouterLink>
        <RouterLink to="/our-services">Remedial Massage</RouterLink>
      </div>

      <div class="footer-links-group">
        <h4>About Us</h4>
        <RouterLink to="/our-team">Meet Our Team</RouterLink>
        <RouterLink to="/tcm">Focussed Healing</RouterLink>
        <RouterLink to="/our-services">Our Services</RouterLink>
      </div>

      <div class="footer-links-group">
        <h4>Legal</h4>
        <RouterLink to="/privacy-policy">Privacy Policy</RouterLink>
      </div>
    </div>

    <div class="container text-center copyright-container">
      <p class="copyright-text">&copy; 2026 Herbs & Motion. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.page-footer {
  padding: 88px 0 36px;
  background: transparent;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.text-center {
  text-align: center;
}

.footer-inner {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.footer-logo {
  margin-bottom: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 34px;
  height: auto;
  display: block;
}

.logo-text {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-dark, #2f4f39);
  letter-spacing: 0.2px;
}

.footer-desc {
  max-width: 420px;
  font-size: 16px;
  color: var(--text-dark, #2f4f39);
  line-height: 1.8;
  opacity: 0.82;
  margin: 0;
}

.contact-card {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(10px);
  box-shadow:
    0 10px 30px rgba(47, 79, 57, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
  width: fit-content;
  min-width: 300px;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.contact-label {
  min-width: 58px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dark, #2f4f39);
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.contact-link,
.contact-email-btn {
  font-size: 17px;
  font-weight: 600;
  color: #2f6c4a;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.contact-link:hover,
.contact-email-btn:hover {
  opacity: 0.75;
  transform: translateY(-1px);
}

.copied-tip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #2f6c4a, #3f7f59);
  padding: 6px 12px;
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(47, 108, 74, 0.14);
}

.social-links {
  display: flex;
  gap: 14px;
  margin-top: 6px;
}

.social-links a {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--text-dark, #2f4f39);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.38);
  box-shadow:
    0 8px 18px rgba(47, 79, 57, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.social-links a:hover {
  opacity: 0.85;
  transform: translateY(-2px);
}

.footer-links-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 10px;
}

.footer-links-group h4 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-dark, #2f4f39);
}

.footer-links-group a {
  color: var(--text-dark, #2f4f39);
  text-decoration: none;
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.82;
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.footer-links-group a:hover {
  opacity: 1;
  transform: translateX(2px);
  text-decoration: underline;
}

.copyright-container {
  margin-top: 64px;
  border-top: 1px solid rgba(47, 79, 57, 0.09);
  padding-top: 22px;
}

.copyright-text {
  font-size: 13px;
  color: var(--text-dark, #2f4f39);
  opacity: 0.62;
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (max-width: 992px) {
  .footer-inner {
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 36px;
  }

  .footer-left {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .page-footer {
    padding: 68px 0 28px;
  }

  .footer-inner {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .footer-left {
    align-items: flex-start;
  }

  .logo-text {
    font-size: 24px;
  }

  .footer-desc {
    font-size: 15px;
    max-width: 100%;
  }

  .contact-card {
    min-width: unset;
    width: 100%;
  }

  .contact-link,
  .contact-email-btn {
    font-size: 16px;
    word-break: break-word;
    text-align: left;
  }

  .footer-links-group h4 {
    font-size: 17px;
  }

  .footer-links-group a {
    font-size: 15px;
  }
}
</style>
