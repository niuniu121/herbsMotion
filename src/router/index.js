import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import TCMVisualization from '../views/TCMVisualization.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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