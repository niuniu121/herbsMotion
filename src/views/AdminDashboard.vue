<template>
  <div class="admin-dashboard-page">
    <div class="admin-dashboard-container">
      <div class="top-bar">
        <div class="top-left">
          <span class="admin-badge">Admin Panel</span>
          <h1>Content Management</h1>
          <p>Manage promotion content, FAQ, QNA, team information, services and more.</p>
        </div>

        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>

      <div class="card-grid">
        <button class="admin-card" @click="goTo('/admin/promotion')">
          <div class="card-icon">📣</div>
          <h2>Promotion</h2>
          <p>Edit the booking page promotion title, content and visibility.</p>
          <span class="card-link">Open module →</span>
        </button>

        <button class="admin-card" @click="goTo('/admin/our-team')">
          <div class="card-icon">👥</div>
          <h2>Our Team</h2>
          <p>Upload and manage practitioner profiles, photos and bios.</p>
          <span class="card-link">Open module →</span>
        </button>

        <button class="admin-card" @click="goTo('/admin/faq')">
          <div class="card-icon">❓</div>
          <h2>FAQ</h2>
          <p>Create, edit and organise frequently asked questions.</p>
          <span class="card-link">Open module →</span>
        </button>

        <button class="admin-card" @click="goTo('/admin/qna')">
          <div class="card-icon">💬</div>
          <h2>QNA</h2>
          <p>Create, edit and organise QNA content for the website and chatbot.</p>
          <span class="card-link">Open module →</span>
        </button>

        <button class="admin-card" @click="goTo('/admin/services')">
          <div class="card-icon">🩺</div>
          <h2>Our Services</h2>
          <p>Manage services content, descriptions and display order.</p>
          <span class="card-link">Open module →</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'

const router = useRouter()
const auth = getAuth()

const goTo = (path) => {
  router.push(path)
}

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/admin/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.admin-dashboard-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #dfe7d8 0%, #f7f4ef 45%, #f4e1e7 100%);
  padding: 48px 24px 80px;
}

.admin-dashboard-container {
  max-width: 1100px;
  margin: 0 auto;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 36px;
}

.top-left h1 {
  margin: 14px 0 10px;
  font-size: 52px;
  line-height: 1.05;
  font-weight: 800;
  color: #2f6b4f;
}

.top-left p {
  margin: 0;
  font-size: 24px;
  line-height: 1.6;
  color: rgba(47, 107, 79, 0.75);
  max-width: 820px;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(47, 107, 79, 0.09);
  color: #2f6b4f;
  font-size: 18px;
  font-weight: 700;
}

.logout-btn {
  border: none;
  border-radius: 999px;
  background: #2f6b4f;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  padding: 16px 28px;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0 10px 24px rgba(47, 107, 79, 0.12);
}

.logout-btn:hover {
  transform: translateY(-2px);
  background: #285d45;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.admin-card {
  text-align: left;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(47, 107, 79, 0.09);
  border-radius: 28px;
  padding: 30px;
  box-shadow: 0 18px 40px rgba(47, 107, 79, 0.08);
  cursor: pointer;
  transition: 0.28s ease;
  backdrop-filter: blur(10px);
}

.admin-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 48px rgba(47, 107, 79, 0.14);
  border-color: rgba(47, 107, 79, 0.18);
}

.card-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(47, 107, 79, 0.1);
  font-size: 28px;
  margin-bottom: 20px;
}

.admin-card h2 {
  margin: 0 0 12px;
  font-size: 30px;
  font-weight: 800;
  color: #2f6b4f;
}

.admin-card p {
  margin: 0 0 18px;
  font-size: 20px;
  line-height: 1.65;
  color: rgba(47, 107, 79, 0.75);
}

.card-link {
  font-size: 18px;
  font-weight: 700;
  color: #2f6b4f;
}

@media (max-width: 900px) {
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .top-left h1 {
    font-size: 40px;
  }

  .top-left p {
    font-size: 20px;
  }
}

@media (max-width: 640px) {
  .admin-dashboard-page {
    padding: 28px 16px 56px;
  }

  .top-left h1 {
    font-size: 34px;
  }

  .top-left p {
    font-size: 18px;
  }

  .admin-card h2 {
    font-size: 26px;
  }

  .admin-card p {
    font-size: 18px;
  }

  .logout-btn {
    font-size: 18px;
    padding: 14px 24px;
  }
}
</style>
