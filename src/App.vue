<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HerbsieBot from '@/component/HerbsieBot.vue'
import PageLoader from '@/component/PageLoader.vue'

const route = useRoute()

const isAdminPage = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <PageLoader />

  <router-view />

  <HerbsieBot v-if="!isAdminPage" />
</template>
