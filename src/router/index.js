import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import TCMVisualization from '../views/TCMVisualization.vue'
import PhysioOutcomeView from '../views/PhysioOutcomeView.vue'
import FAQPage from '../views/FAQPage.vue'
import BookConsultation from '@/views/BookConsultation.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import AdminPromotion from '@/views/AdminPromotion.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/tcm',
      name: 'TCM',
      component: TCMVisualization,
    },
    {
      path: '/physio',
      name: 'Physio',
      component: PhysioOutcomeView,
    },
    {
      path: '/faq',
      name: 'FAQPage',
      component: FAQPage,
    },
    {
      path: '/book',
      name: 'BookConsultation',
      component: BookConsultation,
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: AdminLogin,
    },
    {
      path: '/admin/promotion',
      name: 'AdminPromotion',
      component: AdminPromotion,
    }
  ],
  // 🌟 修复版：使用 Promise 延迟滚动
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      // 延迟 100 毫秒，给 Vue 充足的时间去渲染新页面的 DOM
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            top: 0,
            behavior: 'smooth' // 加上这个，不仅会回到顶部，而且是丝滑地滚回去
          })
        }, 100)
      })
    }
  }
})

export default router