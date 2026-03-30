import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import TCMVisualization from '../views/TCMVisualization.vue'
import PhysioOutcomeView from '../views/PhysioOutcomeView.vue'
import FAQPage from '../views/FAQPage.vue'
import BookConsultation from '@/views/BookConsultation.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminPromotion from '@/views/AdminPromotion.vue'
import AdminFAQ from '@/views/AdminFAQ.vue'
import AdminOurTeam from '@/views/AdminOurTeam.vue'
import AdminServices from '@/views/AdminServices.vue'
import OurTeamPage from '@/views/OurTeamPage.vue'


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
      name: 'FAQ',
      component: FAQPage,
    },
    {
      path: '/book',
      name: 'BookConsultation',
      component: BookConsultation,
    },

    // admin
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: AdminLogin,
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
    },
    {
      path: '/admin/promotion',
      name: 'AdminPromotion',
      component: AdminPromotion,
    },
    {
      path: '/admin/faq',
      name: 'AdminFAQ',
      component: AdminFAQ,
    },
    {
      path: '/admin/our-team',
      name: 'AdminOurTeam',
      component: AdminOurTeam,
    },
    {
      path: '/admin/services',
      name: 'AdminServices',
      component: AdminServices,
    },
    {
      path: '/our-team',
      name: 'OurTeam',
      component: OurTeamPage,
    },
  ],
})

export default router