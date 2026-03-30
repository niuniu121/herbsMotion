<template>
  <div class="admin-login-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <div class="login-shell">
      <div class="brand-top">
        <div class="brand-badge">Admin Portal</div>
        <h1>Herbs & Motion Admin</h1>
        <p>
          Sign in to manage promotion content, update booking page messaging, and control whether
          the promotion section is shown or hidden.
        </p>
      </div>

      <div class="login-card">
        <div class="card-header">
          <p class="small-label">Secure Login</p>
          <h2>Welcome back</h2>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your admin email"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
          </div>

          <p v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </p>

          <button class="login-btn" type="submit" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/admin')
  } catch (error) {
    console.error('Login failed:', error)

    if (error.code === 'auth/invalid-credential') {
      errorMessage.value = 'Incorrect email or password.'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage.value = 'Please enter a valid email address.'
    } else {
      errorMessage.value = 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 38%, #f5dfe6 72%, #eed6df 100%);
  padding: 32px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.55;
}

.orb-1 {
  width: 260px;
  height: 260px;
  background: rgba(110, 154, 127, 0.22);
  top: 60px;
  left: -40px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.42);
  top: 120px;
  right: -80px;
}

.orb-3 {
  width: 260px;
  height: 260px;
  background: rgba(226, 190, 204, 0.28);
  bottom: 60px;
  left: 18%;
}

.login-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: 1fr 460px;
  gap: 36px;
  align-items: center;
}

.brand-top {
  padding: 24px 8px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.1);
  color: #2f5b43;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 18px;
}

.brand-top h1 {
  margin: 0 0 16px;
  font-size: clamp(2.2rem, 4vw, 3.6rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #2d5a42;
  font-weight: 800;
}

.brand-top p {
  margin: 0;
  max-width: 560px;
  font-size: 1.04rem;
  line-height: 1.85;
  color: #607266;
}

.login-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(56, 92, 71, 0.08);
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(47, 91, 67, 0.12);
  backdrop-filter: blur(14px);
}

.card-header {
  margin-bottom: 22px;
}

.small-label {
  margin: 0 0 8px;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #7b8f80;
}

.card-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #2d5a42;
  font-weight: 800;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #355642;
  font-weight: 700;
  font-size: 0.96rem;
}

.form-group input {
  width: 100%;
  padding: 15px 16px;
  border-radius: 16px;
  border: 1px solid #d7dfd8;
  background: rgba(255, 255, 255, 0.88);
  font-size: 1rem;
  color: #2d5a42;
  outline: none;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #6f947d;
  box-shadow: 0 0 0 4px rgba(111, 148, 125, 0.14);
}

.error-message {
  margin: -4px 0 0;
  color: #b84f67;
  font-size: 0.94rem;
  line-height: 1.6;
}

.login-btn {
  margin-top: 4px;
  height: 54px;
  border: none;
  border-radius: 999px;
  background: #2f5b43;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
  box-shadow: 0 12px 24px rgba(47, 91, 67, 0.18);
}

.login-btn:hover:not(:disabled) {
  background: #264b37;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
    gap: 22px;
    max-width: 560px;
  }

  .brand-top {
    text-align: center;
    padding: 0;
  }

  .brand-top p {
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .admin-login-page {
    padding: 20px 12px;
  }

  .login-card {
    padding: 22px 18px;
    border-radius: 22px;
  }

  .card-header h2 {
    font-size: 1.5rem;
  }

  .brand-top h1 {
    font-size: 2rem;
  }

  .brand-top p {
    font-size: 0.96rem;
    line-height: 1.75;
  }
}
</style>
