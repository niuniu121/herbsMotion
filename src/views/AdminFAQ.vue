<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="header-row">
        <div>
          <span class="admin-badge">Admin Panel</span>
          <h1>FAQ Management</h1>
          <p>Manage frequently asked questions for the website.</p>
        </div>
        <div class="header-actions">
          <button class="secondary-btn" @click="router.push('/admin')">Back</button>
        </div>
      </div>

      <div class="admin-card">
        <h2>Coming Soon</h2>
        <p>This module will allow you to create, edit, delete and reorder FAQ items.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #dfe7d8 0%, #f7f4ef 45%, #f4e1e7 100%);
  padding: 48px 24px 80px;
}
.admin-container {
  max-width: 1100px;
  margin: 0 auto;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 28px;
}
.admin-badge {
  display: inline-flex;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(47, 107, 79, 0.09);
  color: #2f6b4f;
  font-weight: 700;
}
h1 {
  margin: 14px 0 10px;
  font-size: 52px;
  color: #2f6b4f;
}
p {
  color: rgba(47, 107, 79, 0.75);
  font-size: 22px;
}
.admin-card {
  background: rgba(255, 255, 255, 0.78);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 18px 40px rgba(47, 107, 79, 0.08);
}
.admin-card h2 {
  color: #2f6b4f;
}
.secondary-btn {
  border: none;
  border-radius: 999px;
  background: #2f6b4f;
  color: white;
  font-weight: 700;
  padding: 14px 24px;
  cursor: pointer;
}
</style>
