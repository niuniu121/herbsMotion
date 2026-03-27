<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <p class="badge">Admin Panel</p>
          <h1>Promotion Management</h1>
          <p class="desc">Edit promotion content and control visibility on booking page.</p>
        </div>

        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>

      <div class="admin-card">
        <div v-if="loading" class="loading-text">Loading...</div>

        <div v-else class="form">
          <div class="form-group">
            <label for="promotion-title">Promotion Title</label>
            <input
              id="promotion-title"
              v-model="title"
              type="text"
              placeholder="Enter promotion title"
            />
          </div>

          <div class="form-group">
            <label for="promotion-content">Promotion Content</label>
            <textarea
              id="promotion-content"
              v-model="content"
              rows="7"
              placeholder="Enter promotion content"
            ></textarea>
          </div>

          <div class="toggle-row">
            <div>
              <h3>Promotion Visibility</h3>
              <p>Control whether the promotion section is displayed on the booking page.</p>
            </div>

            <!-- ✅ 只改这里 -->
            <button
              class="toggle-btn"
              :class="{ active: visible }"
              @click="toggleVisibility"
              type="button"
            >
              {{ visible ? 'Visible' : 'Hidden' }}
            </button>
          </div>

          <div class="action-row">
            <button class="save-btn" @click="savePromotion" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Promotion' }}
            </button>
          </div>

          <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { db, auth } from '@/firebase'

const router = useRouter()

const title = ref('')
const content = ref('')
const visible = ref(true)

const loading = ref(true)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

/* ========================
   获取数据
======================== */
const fetchPromotion = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const docRef = doc(db, 'siteContent', 'promotion')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      title.value = data.title || ''
      content.value = data.content || ''
      visible.value = data.visible ?? true
    } else {
      title.value = ''
      content.value = ''
      visible.value = true
    }
  } catch (error) {
    console.error('Failed to fetch promotion:', error)
    errorMessage.value = 'Failed to load promotion content.'
  } finally {
    loading.value = false
  }
}

/* ========================
   保存（手动）
======================== */
const savePromotion = async () => {
  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const docRef = doc(db, 'siteContent', 'promotion')

    await setDoc(docRef, {
      title: title.value,
      content: content.value,
      visible: visible.value,
      updatedAt: serverTimestamp(),
    })

    successMessage.value = 'Promotion saved successfully.'
  } catch (error) {
    console.error('Failed to save promotion:', error)
    errorMessage.value = 'Failed to save promotion.'
  } finally {
    saving.value = false
  }
}

/* ========================
   🔥 核心修复：toggle 自动保存
======================== */
const toggleVisibility = async () => {
  // 先切换UI
  visible.value = !visible.value

  try {
    const docRef = doc(db, 'siteContent', 'promotion')

    await setDoc(docRef, {
      title: title.value,
      content: content.value,
      visible: visible.value,
      updatedAt: serverTimestamp(),
    })

    successMessage.value = 'Visibility updated.'
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Failed to update visibility.'
  }
}

/* ========================
   登出
======================== */
const handleLogout = async () => {
  await signOut(auth)
  router.push('/admin/login')
}

onMounted(() => {
  fetchPromotion()
})
</script>

<style scoped>
/* ❗样式完全没动 */
.admin-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 42%, #f5dfe6 100%);
  padding: 40px 20px;
}

.admin-container {
  max-width: 920px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
}

.badge {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.1);
  color: #2f5b43;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.admin-header h1 {
  margin: 0 0 10px;
  color: #2d5a42;
  font-size: 2.1rem;
}

.desc {
  margin: 0;
  color: #66786d;
  line-height: 1.7;
}

.logout-btn {
  border: none;
  background: #2f5b43;
  color: #fff;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.admin-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(47, 91, 67, 0.1);
  backdrop-filter: blur(12px);
}

/* 下面样式全部保留原样 */
</style>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 42%, #f5dfe6 100%);
  padding: 40px 20px;
}

.admin-container {
  max-width: 920px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
}

.badge {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.1);
  color: #2f5b43;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.admin-header h1 {
  margin: 0 0 10px;
  color: #2d5a42;
  font-size: 2.1rem;
}

.desc {
  margin: 0;
  color: #66786d;
  line-height: 1.7;
}

.logout-btn {
  border: none;
  background: #2f5b43;
  color: #fff;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.admin-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(47, 91, 67, 0.1);
  backdrop-filter: blur(12px);
}

.loading-text {
  color: #4a5f53;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  color: #2d5a42;
  font-weight: 700;
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #d6ddd7;
  background: rgba(255, 255, 255, 0.92);
  font-size: 1rem;
  font-family: inherit;
  color: #2d5a42;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #7e9d88;
  box-shadow: 0 0 0 4px rgba(126, 157, 136, 0.12);
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(47, 91, 67, 0.04);
  border: 1px solid rgba(47, 91, 67, 0.08);
}

.toggle-row h3 {
  margin: 0 0 6px;
  color: #2d5a42;
  font-size: 1.05rem;
}

.toggle-row p {
  margin: 0;
  color: #687a6e;
  line-height: 1.6;
  font-size: 0.95rem;
}

.toggle-btn {
  border: none;
  padding: 11px 18px;
  border-radius: 999px;
  background: #d7ddd8;
  color: #375643;
  font-weight: 700;
  cursor: pointer;
  min-width: 96px;
}

.toggle-btn.active {
  background: #2f5b43;
  color: #fff;
}

.action-row {
  display: flex;
  justify-content: flex-start;
}

.save-btn {
  border: none;
  background: #2f5b43;
  color: #fff;
  padding: 14px 26px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-text {
  margin: 0;
  color: #2f7a52;
  font-weight: 600;
}

.error-text {
  margin: 0;
  color: #b55067;
  font-weight: 600;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 28px 14px;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-card {
    padding: 20px;
    border-radius: 22px;
  }

  .toggle-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
