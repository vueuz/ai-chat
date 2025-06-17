import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '../layouts/BasicLayout.vue'
import ChatPage from '../views/ChatPage.vue'

const routes = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      {
        path: '',
        name: 'chatDefault',
        component: ChatPage,
      },
      {
        path: 'chat/:id',
        name: 'chat',
        component: ChatPage,
        props: true, // Pass route params as props to ChatPage
      },
      // You can add other routes here that use BasicLayout
      // For example, a settings page:
      // {
      //   path: 'settings',
      //   name: 'settings',
      //   component: () => import('../views/SettingsPage.vue') // Lazy load settings page
      // },
    ],
  },
  // Add other top-level routes if needed (e.g., for a login page without BasicLayout)
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router