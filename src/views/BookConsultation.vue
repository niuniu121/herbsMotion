<template>
  <div class="book-page">
    <div class="sky-background">
      <div class="falling-leaves-container">
        <div class="leaf leaf-1"></div>
        <div class="leaf leaf-2"></div>
        <div class="leaf leaf-3"></div>
        <div class="leaf leaf-4"></div>
        <div class="leaf leaf-5"></div>
        <div class="leaf leaf-6"></div>
        <div class="leaf leaf-7"></div>
        <div class="leaf leaf-8"></div>
      </div>

      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>

      <div class="spark spark-1"></div>
      <div class="spark spark-2"></div>
      <div class="spark spark-3"></div>
      <div class="spark spark-4"></div>
    </div>
    <NavBar />

    <main class="coming-page">
      <section class="coming-hero">
        <div class="wood-sign">
          <img
            src="https://img.icons8.com/?size=100&id=121404&format=png&color=2f5b43"
            alt="sign icon"
            class="sign-icon"
          />
          <p>Coming Soon</p>
        </div>

        <div class="coming-card">
          <div class="sticker stick-tl"></div>
          <div class="sticker stick-tr"></div>
          <div class="floating-icon icon-anchor"></div>
          <div class="floating-icon icon-star"></div>
          <div class="floating-icon icon-compass"></div>

          <div class="icon-shell">
            <div class="icon-halo"></div>

            <svg
              class="booking-icon"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="22" y="28" width="76" height="66" rx="16" class="icon-stroke icon-delay-1" />
              <path d="M37 18V38" class="icon-stroke icon-delay-2" />
              <path d="M83 18V38" class="icon-stroke icon-delay-2" />
              <path d="M22 46H98" class="icon-stroke icon-delay-3" />
              <path d="M41 63L54 75L79 50" class="icon-stroke icon-accent icon-delay-4" />
            </svg>
          </div>

          <p class="eyebrow">Herbs & Motion</p>
          <h1 class="coming-title">Book a Consultation</h1>

          <p class="coming-subtitle">
            We’re preparing a more refined online booking experience for Herbs & Motion. This page
            will be available soon.
          </p>

          <div class="contact-invitation">
            <div class="invitation-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div class="invitation-content">
              <h3>Have a specific question?</h3>
              <p>Leave your details and we'll get back to you shortly.</p>
            </div>
            <button class="open-form-btn" @click="openLeadForm">Leave a Message</button>
          </div>

          <div class="divider"></div>

          <div class="action-row">
            <a class="primary-btn"> Email us</a>
            <a class="secondary-btn"> Call Us </a>
          </div>

          <p class="contact-note">info@herbsmotion.com.au · 0394844931</p>
        </div>
      </section>
    </main>

    <PageFooter />
  </div>
</template>

<script setup>
import NavBar from '@/component/NavBar.vue'
import PageFooter from '@/component/PageFooter.vue'

// Method to trigger the global Herbsie lead form modal
const openLeadForm = () => {
  // Connect this to your global state (e.g., Pinia store) or EventBus
  // Example: useHerbsieStore().openLeadForm()
  // or: window.dispatchEvent(new CustomEvent('open-herbsie-lead'))
  window.dispatchEvent(new CustomEvent('open-herbsie-lead'))
  console.log('Opening lead form modal...')
}
</script>

<style scoped>
.book-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* Background elements in customized Herbs & Motion style */
.sky-background {
  position: fixed;
  inset: 0;
  z-index: -2;
  background: linear-gradient(180deg, #faf7f2 0%, #faf0e6 52%, #faf7f2 100%);
}

/* Falling Leaves Animation Styles with DARK leaf colors for visibility */
.falling-leaves-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.35;
  z-index: -3;
}

.leaf {
  position: absolute;
  top: -100px;
  background: #2f5b43;
  border-radius: 99% 1% 99% 1%;
  filter: blur(5px);
  animation: leafFall infinite linear;
}

.leaf-1 {
  width: 40px;
  height: 50px;
  left: 10%;
  animation-duration: 25s;
  animation-delay: 0s;
}
.leaf-2 {
  width: 30px;
  height: 40px;
  left: 30%;
  animation-duration: 20s;
  animation-delay: -5s;
  transform: skewY(15deg);
}
.leaf-3 {
  width: 50px;
  height: 60px;
  left: 50%;
  animation-duration: 30s;
  animation-delay: -10s;
}
.leaf-4 {
  width: 35px;
  height: 45px;
  right: 20%;
  animation-duration: 28s;
  animation-delay: -15s;
  transform: skewY(-10deg);
}
.leaf-5 {
  width: 45px;
  height: 55px;
  right: 5%;
  animation-duration: 22s;
  animation-delay: -20s;
}
.leaf-6 {
  width: 25px;
  height: 35px;
  left: 70%;
  animation-duration: 24s;
  animation-delay: -25s;
}
.leaf-7 {
  width: 48px;
  height: 58px;
  left: 20%;
  animation-duration: 32s;
  animation-delay: -12s;
}
.leaf-8 {
  width: 32px;
  height: 42px;
  right: 40%;
  animation-duration: 26s;
  animation-delay: -18s;
  transform: skewY(5deg);
}

@keyframes leafFall {
  0% {
    top: -100px;
    transform: translateX(0) rotate(0deg) skew(0deg) scale(1);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  40% {
    transform: translateX(20px) rotate(45deg) skew(5deg) scale(1.05);
  }
  80% {
    transform: translateX(-10px) rotate(-15deg) skew(-2deg) scale(0.95);
  }
  100% {
    top: 110vh;
    transform: translateX(30px) rotate(90deg) skew(10deg) scale(1.1);
    opacity: 0;
  }
}

/* Ambient floating orbs */
.floating-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(14px);
  z-index: -1;
  opacity: 0.5;
}

.orb-1 {
  width: 240px;
  height: 240px;
  top: -70px;
  left: -70px;
  background: rgba(47, 91, 67, 0.08);
  animation: orbMoveA 11s ease-in-out infinite;
}
.orb-2 {
  width: 200px;
  height: 200px;
  right: -40px;
  top: 80px;
  background: rgba(245, 223, 230, 0.45);
  animation: orbMoveB 13s ease-in-out infinite;
}
.orb-3 {
  width: 220px;
  height: 220px;
  bottom: -80px;
  right: 90px;
  background: rgba(127, 167, 128, 0.1);
  animation: orbMoveC 12s ease-in-out infinite;
}

/* Sparkles */
.spark {
  position: absolute;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.1);
  z-index: -1;
}

.spark::before,
.spark::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  background: inherit;
  border-radius: 999px;
}

.spark::before {
  width: 2px;
  height: 16px;
}
.spark::after {
  width: 16px;
  height: 2px;
}

.spark-1 {
  width: 16px;
  height: 16px;
  top: 70px;
  right: 120px;
  animation: sparkleFloat 7s ease-in-out infinite;
}
.spark-2 {
  width: 14px;
  height: 14px;
  top: 160px;
  left: 110px;
  animation: sparkleFloat 8.5s ease-in-out infinite 0.8s;
}
.spark-3 {
  width: 12px;
  height: 12px;
  bottom: 110px;
  left: 140px;
  animation: sparkleFloat 6.8s ease-in-out infinite 1.2s;
}
.spark-4 {
  width: 15px;
  height: 15px;
  bottom: 80px;
  right: 130px;
  animation: sparkleFloat 9s ease-in-out infinite 0.6s;
}

/* Main Content Styles */
.coming-page {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 34px 24px 92px;
  position: relative;
  z-index: 1;
}

.coming-hero {
  width: 100%;
  max-width: 1180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* Wood Sign */
.wood-sign {
  position: absolute;
  top: -60px;
  left: -80px;
  width: 160px;
  height: 80px;
  background-color: #e5ccb4;
  border: 4px solid #b8987b;
  border-radius: 12px;
  box-shadow:
    0 4px 0 #9f8369,
    0 8px 16px rgba(159, 131, 105, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transform: rotate(-5deg);
}

.wood-sign::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 120px;
  background-color: #b8987b;
  border-radius: 0 0 8px 8px;
}

.sign-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 4px;
}

.wood-sign p {
  margin: 0;
  color: #2f5b43;
  font-family: 'Patrick Hand', cursive, sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Card Styles */
.coming-card {
  position: relative;
  width: 100%;
  max-width: 900px;
  padding: 56px 42px 48px;
  border-radius: 38px;
  overflow: hidden;
  text-align: center;
  isolation: isolate;
  background-color: rgba(250, 247, 242, 0.8);
  border: 1px solid rgba(56, 92, 71, 0.06);
  box-shadow: 0 24px 70px rgba(47, 91, 67, 0.07);
  backdrop-filter: blur(12px);
}

/* Stickers & Icons */
.sticker {
  position: absolute;
  width: 60px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  z-index: 1;
}

.stick-tl {
  top: -10px;
  left: 20%;
  transform: rotate(-25deg);
  border-radius: 0 0 10px 10px;
}
.stick-tr {
  top: -5px;
  right: 15%;
  transform: rotate(20deg);
  border-radius: 0 0 10px 10px;
}

.floating-icon {
  position: absolute;
  width: 20px;
  height: 20px;
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0.15;
  z-index: 0;
}

.icon-anchor {
  top: 15%;
  left: 10%;
  background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21V9M12 9L15 12M12 9L9 12M20 16C18.8954 16 18 16.8954 18 18C18 19.1046 18.8954 20 20 20C21.1046 20 22 19.1046 22 18C22 16.8954 21.1046 16 20 16ZM12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3Z" stroke="%232f5b43" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
}
.icon-star {
  top: 40%;
  right: 8%;
  background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="%232f5b43" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
}
.icon-compass {
  bottom: 10%;
  left: 12%;
  background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="%232f5b43" stroke-width="1.5"/><path d="M16.2 7.8L13.2 13.2L7.8 16.2L10.8 10.8L16.2 7.8Z" stroke="%232f5b43" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
}

/* Typography */
.eyebrow {
  margin: 0 0 10px;
  color: #7a8a7f;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.coming-title {
  margin: 0;
  color: #264936;
  font-size: clamp(2.4rem, 5.2vw, 4.5rem);
  line-height: 0.96;
  letter-spacing: -0.035em;
  font-weight: 800;
}

.coming-subtitle {
  max-width: 640px;
  margin: 18px auto 0;
  color: #627368;
  font-size: 1rem;
  line-height: 1.8;
}

/* Center Logo Icon */
.icon-shell {
  position: relative;
  width: 130px;
  height: 130px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-halo {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background:
    radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.95),
      rgba(255, 255, 255, 0.16) 58%,
      transparent 72%
    ),
    rgba(47, 91, 67, 0.08);
  animation: haloPulse 6s ease-in-out infinite;
}

.booking-icon {
  position: relative;
  z-index: 2;
  width: 88px;
  height: 88px;
  padding: 16px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 249, 246, 0.9));
  box-shadow:
    0 14px 30px rgba(47, 91, 67, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  animation: floatSoft 5s ease-in-out infinite;
}

.icon-stroke {
  stroke: #2f5b43;
  stroke-width: 5.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  animation: drawLine 1s ease forwards;
}

.icon-accent {
  stroke: #8aaa79;
}
.icon-delay-1 {
  animation-delay: 0.1s;
}
.icon-delay-2 {
  animation-delay: 0.32s;
}
.icon-delay-3 {
  animation-delay: 0.56s;
}
.icon-delay-4 {
  animation-delay: 0.82s;
}

/* Contact Invitation CTA */
.contact-invitation {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 30px auto;
  padding: 16px 20px 16px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(47, 91, 67, 0.1);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(47, 91, 67, 0.04);
  max-width: 500px;
  text-align: left;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.contact-invitation:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(47, 91, 67, 0.08);
}

.invitation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #e9f2e9;
  color: #2f5b43;
  border-radius: 14px;
  flex-shrink: 0;
}

.invitation-content {
  flex: 1;
}

.invitation-content h3 {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 700;
  color: #2f5b43;
}

.invitation-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #627368;
  line-height: 1.4;
}

.open-form-btn {
  padding: 10px 18px;
  background: #2f5b43;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.open-form-btn:hover {
  background: #244633;
}

/* Footer Section */
.divider {
  width: min(100%, 540px);
  height: 1px;
  margin: 28px auto 22px;
  background: linear-gradient(
    90deg,
    rgba(47, 91, 67, 0),
    rgba(47, 91, 67, 0.14),
    rgba(47, 91, 67, 0)
  );
}

.support-copy {
  max-width: 600px;
  margin: 0 auto;
  color: #6f7f75;
  font-size: 0.95rem;
  line-height: 1.8;
}

.action-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.primary-btn,
.secondary-btn {
  min-width: 190px;
  min-height: 50px;
  padding: 0 22px;
  border-radius: 999px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all 0.26s ease;
}

.primary-btn {
  color: #fff;
  background: #2f5b43;
  box-shadow: 0 14px 28px rgba(47, 91, 67, 0.18);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(47, 91, 67, 0.24);
}

.secondary-btn {
  color: #2f5b43;
  background: rgba(47, 91, 67, 0.09);
  border: 1px solid rgba(47, 91, 67, 0.1);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  background: rgba(47, 91, 67, 0.13);
}

.contact-note {
  margin: 18px 0 0;
  color: #8a948e;
  font-size: 1.5rem;
  line-height: 1.7;
}

/* Keyframes */
@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes floatSoft {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}
@keyframes haloPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}
@keyframes orbMoveA {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(26px, 10px);
  }
  100% {
    transform: translate(0, 0);
  }
}
@keyframes orbMoveB {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-20px, 16px);
  }
  100% {
    transform: translate(0, 0);
  }
}
@keyframes orbMoveC {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-12px, -18px);
  }
  100% {
    transform: translate(0, 0);
  }
}
@keyframes sparkleFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-8px) scale(1.08);
    opacity: 0.35;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.1;
  }
}

/* Media Queries */
@media (max-width: 1024px) {
  .wood-sign {
    left: -40px;
  }
}

@media (max-width: 768px) {
  .coming-page {
    padding: 20px 16px 74px;
  }
  .coming-card {
    padding: 40px 22px 34px;
    border-radius: 28px;
  }
  .coming-title {
    font-size: 2.35rem;
  }
  .coming-subtitle {
    font-size: 0.96rem;
    line-height: 1.7;
  }

  .action-row {
    flex-direction: column;
    align-items: center;
  }
  .primary-btn,
  .secondary-btn {
    width: 100%;
    max-width: 290px;
  }

  .wood-sign {
    position: relative;
    top: 0;
    left: 0;
    transform: rotate(0);
    margin-bottom: 30px;
  }

  .stick-tl,
  .stick-tr,
  .icon-anchor,
  .icon-star,
  .icon-compass {
    display: none;
  }
  .orb-1,
  .orb-2,
  .orb-3 {
    opacity: 0.6;
  }
}

@media (max-width: 600px) {
  .contact-invitation {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  .open-form-btn {
    width: 100%;
    margin-top: 12px;
  }
}

@media (max-width: 480px) {
  .coming-title {
    font-size: 2rem;
  }
  .icon-shell {
    width: 108px;
    height: 108px;
    margin-bottom: 20px;
  }
  .booking-icon {
    width: 76px;
    height: 76px;
    padding: 13px;
    border-radius: 22px;
  }
  .coming-subtitle,
  .support-copy,
  .contact-note {
    font-size: 0.92rem;
  }
}
</style>
