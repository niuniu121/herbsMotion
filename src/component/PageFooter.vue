<script setup>
const socialIcons = ['📱', '📷']
</script>

<template>
  <footer class="page-footer">
    <div class="container footer-inner">
      <div class="footer-left">
        <div class="logo-area footer-logo">
          <span class="logo-icon"
            ><img class="logo" src="../assets/logo_green.svg" style="width: 28px; height: auto"
          /></span>
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

      <div class="footer-links-group">
        <h4>Services</h4>
        <a href="#">Remedial Massage</a>
        <a href="#">Physiotherapy</a>
        <a href="#">Chinese Medicine</a>
      </div>
      <div class="footer-links-group">
        <h4>Company</h4>

        <RouterLink to="/our-team" @click="closeMobileMenu">About Us</RouterLink>

        <a href="#">Contact</a>
        <a href="#">Success Stories</a>
      </div>
      <div class="footer-links-group">
        <h4>Legal</h4>
        <a href="#"></a>
        <RouterLink to="/privacy-policy" @click="closeMobileMenu">Privacy Policy</RouterLink>

        <a href="#">Terms of Service</a>
      </div>
    </div>
    <div class="container text-center copyright-container">
      <p class="copyright-text">&copy; 2026 Herbs & Motion. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
/* ==========================================================================
   Footer Section 专属样式
   ========================================================================== */
.page-footer {
  padding: 80px 0 40px;
  /* 确保 Footer 有个默认底色，避免背景色没传过来时变白 */
  background-color: transparent;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.text-center {
  text-align: center;
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-dark, #2f4f39);
}

.footer-desc {
  font-size: 14px;
  color: var(--text-dark, #2f4f39);
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
  color: var(--text-dark, #2f4f39);
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
  color: var(--text-dark, #2f4f39);
}

.footer-links-group a {
  color: var(--text-dark, #2f4f39);
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
  color: var(--text-dark, #2f4f39);
  opacity: 0.6;
}

/* H5 移动端适配 */
@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .footer-left {
    align-items: flex-start;
  }
}
</style>
