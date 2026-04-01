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
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import AdminServiceDetail from '@/views/AdminServiceDetail.vue'
import AppointmentRequest from '@/views/AppointmentRequest.vue'
import OurServices from '@/views/OurServices.vue'
import ServiceDetail from '@/views/ServiceDetail.vue'
import PractitionerDetail from '@/views/PractitionerDetail.vue'

const router = createRouter({
  history: createWebHashHistory(),

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },

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
      path: '/admin/services/:id',
      name: 'AdminServiceDetail',
      component: AdminServiceDetail,
    },

    // public
    {
      path: '/our-team',
      name: 'OurTeam',
      component: OurTeamPage,
    },
    {
      path: '/our-team/:slug',
      name: 'PractitionerDetail',
      component: PractitionerDetail,
    },
    {
      path: '/privacy-policy',
      name: 'PrivacyPolicy',
      component: PrivacyPolicy,
    },
    {
      path: '/appointment-request',
      name: 'AppointmentRequest',
      component: AppointmentRequest,
    },
    {
      path: '/our-services',
      name: 'OurServices',
      component: OurServices,
    },
    {
      path: '/our-services/:slug',
      name: 'ServiceDetail',
      component: ServiceDetail,
    },
  ],
})

export default router