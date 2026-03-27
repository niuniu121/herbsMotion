<template>
  <RouterView />
  <HerbsieBot />
</template>
<script setup>
import { RouterView } from 'vue-router'
import HerbsieBot from './component/HerbsieBot.vue'
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
* {
  box-sizing: border-box;
}
</style>
