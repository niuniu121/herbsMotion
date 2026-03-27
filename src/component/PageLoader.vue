<script setup>
import { defineProps } from 'vue'

// 接收外部传来的 loading 状态
const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <Transition name="fade-out">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loader-logo-container">
        <span class="logo-icon-wrap">
          <img class="logo-img" src="../assets/logo_green.svg" alt="Herbs & Motion Logo" />
        </span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ==========================================================================
   全局 Loading 动画：严格的 跳两下 -> 停 1 秒
   ========================================================================== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white; /* 或者用你喜欢的 #e2e8df */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
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
  /* 动画总长度设置为 2秒，只播放一次 */
  animation: logo-precise-bounce 2s ease-in-out forwards;
}

.fade-out-leave-active {
  transition: opacity 0.5s ease;
}
.fade-out-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
</style>
