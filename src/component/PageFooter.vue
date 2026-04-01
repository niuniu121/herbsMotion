<script setup>
import { ref } from 'vue'

const copied = ref(false)

const email = 'info@herbsmotion.com.au'
const phone = '0433644931'

const clinicAddress = '696 Burke Rd, Camberwell VIC 3124'
const googleMapsUrl =
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(clinicAddress)

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

        <a
          class="mini-map-card"
          :href="googleMapsUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open clinic location in Google Maps"
        >
          <div class="mini-map-visual">
            <div class="map-grid"></div>
            <div class="map-road road-one"></div>
            <div class="map-road road-two"></div>
            <div class="map-road road-three"></div>

            <div class="map-pin">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 22C12 22 5 14.8 5 9.5C5 5.36 8.13 2 12 2C15.87 2 19 5.36 19 9.5C19 14.8 12 22 12 22Z"
                  fill="currentColor"
                />
                <circle cx="12" cy="9.5" r="2.8" fill="white" />
              </svg>
            </div>
          </div>

          <div class="mini-map-content">
            <div class="mini-map-top">
              <span class="mini-map-badge">Location</span>
              <span class="mini-map-arrow">↗</span>
            </div>

            <h4>Visit Our Clinic</h4>
            <p>{{ clinicAddress }}</p>
            <span class="mini-map-link">Open in Google Maps</span>
          </div>
        </a>
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
  padding: 84px 0 34px;
  background: transparent;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
}

.text-center {
  text-align: center;
}

.footer-inner {
  display: grid;
  grid-template-columns: 520px 1fr 1fr 0.9fr;
  gap: 64px;
  align-items: start;
}

.footer-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  width: 520px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 2px;
}

.logo {
  width: 38px;
  height: auto;
  display: block;
}

.logo-text {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.05;
  color: var(--text-dark, #2f4f39);
  letter-spacing: 0.2px;
}

.footer-desc {
  width: 100%;
  max-width: 470px;
  margin: 0;
  font-size: 19px;
  line-height: 1.7;
  color: var(--text-dark, #2f4f39);
  opacity: 0.84;
}

.contact-card,
.mini-map-card {
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
}

.contact-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 28px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(12px);
  box-shadow:
    0 10px 28px rgba(47, 79, 57, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.58);
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.contact-label {
  min-width: 116px;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-dark, #2f4f39);
  opacity: 0.72;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.contact-link,
.contact-email-btn {
  font-size: 21px;
  font-weight: 700;
  color: #2f6c4a;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
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
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #2f6c4a, #3f7f59);
  box-shadow: 0 8px 18px rgba(47, 108, 74, 0.14);
}

/* map card */
.mini-map-card {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 20px;
  align-items: center;
  padding: 18px;
  border-radius: 32px;
  text-decoration: none;
  color: inherit;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(14px);
  box-shadow:
    0 10px 24px rgba(47, 79, 57, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.62);
  transition:
    transform 0.26s ease,
    box-shadow 0.26s ease;
}

.mini-map-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 14px 28px rgba(47, 79, 57, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.66);
}

.mini-map-visual {
  position: relative;
  width: 100%;
  height: 146px;
  border-radius: 26px;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.72), transparent 32%),
    linear-gradient(135deg, #dde7de 0%, #eef4ef 46%, #f6efe8 100%);
  box-shadow:
    inset 0 0 0 1px rgba(47, 79, 57, 0.05),
    0 8px 18px rgba(47, 79, 57, 0.04);
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(47, 79, 57, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(47, 79, 57, 0.04) 1px, transparent 1px);
  background-size: 18px 18px;
}

.map-road {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 2px 8px rgba(47, 79, 57, 0.04);
}

.road-one {
  width: 170px;
  height: 22px;
  top: 20px;
  left: -24px;
  transform: rotate(20deg);
}

.road-two {
  width: 160px;
  height: 18px;
  bottom: 30px;
  left: 56px;
  transform: rotate(-32deg);
}

.road-three {
  width: 90px;
  height: 14px;
  bottom: 10px;
  left: 78px;
  transform: rotate(35deg);
  opacity: 0.82;
}

.map-pin {
  position: absolute;
  left: 52%;
  top: 50%;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -55%);
  color: #2f6c4a;
  filter: drop-shadow(0 8px 10px rgba(47, 108, 74, 0.16));
  animation: pinFloat 2.8s ease-in-out infinite;
}

.mini-map-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.mini-map-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mini-map-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(47, 108, 74, 0.08);
  color: #2f6c4a;
  font-size: 14px;
  font-weight: 800;
}

.mini-map-arrow {
  font-size: 22px;
  color: #2f6c4a;
  opacity: 0.68;
  transition:
    transform 0.24s ease,
    opacity 0.24s ease;
}

.mini-map-card:hover .mini-map-arrow {
  transform: translate(2px, -2px);
  opacity: 1;
}

.mini-map-content h4 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.18;
  color: var(--text-dark, #2f4f39);
}

.mini-map-content p {
  margin: 0;
  font-size: 18px;
  line-height: 1.55;
  color: var(--text-dark, #2f4f39);
  opacity: 0.84;
}

.mini-map-link {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-top: 2px;
  font-size: 18px;
  font-weight: 800;
  color: #2f6c4a;
}

.footer-links-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-top: 14px;
}

.footer-links-group h4 {
  margin: 0 0 12px;
  font-size: 30px;
  font-weight: 800;
  color: var(--text-dark, #2f4f39);
}

.footer-links-group a {
  color: var(--text-dark, #2f4f39);
  text-decoration: none;
  font-size: 18px;
  line-height: 1.7;
  opacity: 0.84;
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.footer-links-group a:hover {
  opacity: 1;
  transform: translateX(2px);
  text-decoration: underline;
}

.copyright-container {
  margin-top: 70px;
  padding-top: 24px;
  border-top: 1px solid rgba(47, 79, 57, 0.08);
}

.copyright-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-dark, #2f4f39);
  opacity: 0.62;
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

@keyframes pinFloat {
  0%,
  100% {
    transform: translate(-50%, -55%);
  }
  50% {
    transform: translate(-50%, -62%);
  }
}

@media (max-width: 1200px) {
  .footer-inner {
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 42px;
  }

  .footer-left {
    grid-column: 1 / -1;
    width: 100%;
    max-width: 520px;
  }
}

@media (max-width: 768px) {
  .page-footer {
    padding: 64px 0 28px;
  }

  .container {
    padding: 0 20px;
  }

  .footer-inner {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .footer-left {
    width: 100%;
    max-width: 100%;
  }

  .logo-text {
    font-size: 26px;
  }

  .footer-desc {
    max-width: 100%;
    font-size: 16px;
  }

  .contact-card,
  .mini-map-card {
    max-width: 100%;
  }

  .contact-card {
    padding: 18px 20px;
  }

  .contact-label {
    min-width: 82px;
    font-size: 15px;
  }

  .contact-link,
  .contact-email-btn {
    font-size: 17px;
    word-break: break-word;
    text-align: left;
  }

  .mini-map-card {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .mini-map-visual {
    height: 132px;
  }

  .mini-map-content h4 {
    font-size: 20px;
  }

  .mini-map-content p,
  .mini-map-link {
    font-size: 16px;
  }

  .footer-links-group {
    padding-top: 0;
    gap: 14px;
  }

  .footer-links-group h4 {
    font-size: 24px;
  }

  .footer-links-group a {
    font-size: 17px;
  }
}
</style>
