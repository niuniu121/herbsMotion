<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HerbsieBot from '@/component/HerbsieBot.vue'
import PageLoader from '@/component/PageLoader.vue'

const route = useRoute()

const isAdminPage = computed(() => {
  return route.name === 'AdminLogin' || route.name === 'AdminPromotion'
})
</script>

<template>
  <PageLoader v-if="!isAdminPage" />
  <router-view />
  <HerbsieBot v-if="!isAdminPage" />
</template>
