import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '../layouts/BasicLayout.vue'
import ChatPage from '../views/ChatPage.vue'
import KnowledgeBasePage from '../views/KnowledgeBasePage.vue'
import CaseStudyPage from '../views/CaseStudyPage.vue'

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
        props: true,
      },
      {
        path: 'knowledge',
        name: 'knowledge',
        component: KnowledgeBasePage,
      },
      {
        path: 'case',
        name: 'case',
        component: CaseStudyPage,
      },
    ],
  },
  // Add other top-level routes if needed (e.g., for a login page without BasicLayout)
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router