<template>
  <button
    class="floating-book-btn"
    @click="goToBooking"
    aria-label="Go to online booking"
    type="button"
  >
    <div class="book-tooltip">
      <span>Book Online</span>
    </div>

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
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToBooking() {
  router.push('/book')
}
</script>

<style scoped>
.floating-book-btn {
  position: fixed;
  left: 22px;
  bottom: 28px;
  z-index: 9999;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.icon-shell {
  position: relative;
  width: 68px;
  height: 68px;
  border-radius: 999px;
  background: linear-gradient(145deg, #f8f4ee, #edf3ea);
  box-shadow:
    0 10px 24px rgba(47, 108, 74, 0.18),
    inset 0 2px 8px rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: gentleFloat 3.2s ease-in-out infinite;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.floating-book-btn:hover .icon-shell {
  transform: translateY(-3px) scale(1.04);
  box-shadow:
    0 14px 30px rgba(47, 108, 74, 0.24),
    inset 0 2px 8px rgba(255, 255, 255, 0.95);
}

.icon-halo {
  position: absolute;
  inset: -7px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(84, 140, 103, 0.16) 0%,
    rgba(84, 140, 103, 0.08) 48%,
    rgba(84, 140, 103, 0) 72%
  );
  animation: haloPulse 2.8s ease-in-out infinite;
  pointer-events: none;
}

.booking-icon {
  width: 34px;
  height: 34px;
}

.icon-stroke {
  stroke: #2f6c4a;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  animation: drawLine 1.15s ease forwards;
}

.icon-accent {
  stroke: #57a26f;
}

.icon-delay-1 {
  animation-delay: 0.05s;
}
.icon-delay-2 {
  animation-delay: 0.18s;
}
.icon-delay-3 {
  animation-delay: 0.32s;
}
.icon-delay-4 {
  animation-delay: 0.46s;
}

.book-tooltip {
  background: linear-gradient(135deg, #2f6c4a, #3d7f59);
  color: #fff;
  border-radius: 18px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 10px 24px rgba(47, 108, 74, 0.2);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.floating-book-btn:hover .book-tooltip {
  transform: translateX(2px);
}

@keyframes gentleFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}

@keyframes haloPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

@media (max-width: 768px) {
  .floating-book-btn {
    left: 14px;
    bottom: 18px;
    gap: 8px;
  }

  .icon-shell {
    width: 58px;
    height: 58px;
  }

  .booking-icon {
    width: 28px;
    height: 28px;
  }

  .book-tooltip {
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 14px;
  }
}
</style>
