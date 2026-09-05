import { createRouter, createWebHistory, type RouteLocationRaw } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/models'

declare module 'vue-router' {
  interface RouteMeta {
    // Omit both for a fully public route.
    roles?: Role[]
    guestOnly?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/LandingView.vue') },
    { path: '/rules', name: 'rules', component: () => import('@/views/RulesView.vue') },
    { path: '/apply', name: 'apply', component: () => import('@/views/ApplyView.vue') },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignupView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/pending-approval',
      name: 'pending-approval',
      component: () => import('@/views/PendingApprovalView.vue'),
      meta: { roles: ['officer', 'management'] },
    },
    {
      path: '/student',
      name: 'student',
      component: () => import('@/views/StudentDashboardView.vue'),
      meta: { roles: ['student'] },
    },
    {
      path: '/officer',
      name: 'officer',
      component: () => import('@/views/OfficerDashboardView.vue'),
      meta: { roles: ['officer', 'management'] },
    },
    {
      path: '/management',
      name: 'management',
      component: () => import('@/views/ManagementDashboardView.vue'),
      meta: { roles: ['management'] },
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})

// Firebase restores the session asynchronously on page load, so the very
// first navigation must wait for that restore (and the matching Firestore
// profile fetch) to finish before a guard can tell "signed out" from "not
// resolved yet" apart.
function waitForAuthReady(authStore: ReturnType<typeof useAuthStore>) {
  if (authStore.ready) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const stop = watch(
      () => authStore.ready,
      (isReady) => {
        if (isReady) {
          stop()
          resolve()
        }
      },
    )
  })
}

export function dashboardRouteForRole(role: Role | null): RouteLocationRaw {
  if (role === 'student') return { name: 'student' }
  if (role === 'officer') return { name: 'officer' }
  if (role === 'management') return { name: 'management' }
  return { name: 'home' }
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await waitForAuthReady(authStore)

  const { isSignedIn, role, isApproved } = authStore

  if (to.meta.guestOnly) {
    return isSignedIn ? dashboardRouteForRole(role) : true
  }

  if (!to.meta.roles) return true

  if (!isSignedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!role || !to.meta.roles.includes(role)) {
    return dashboardRouteForRole(role)
  }

  const needsApproval = role === 'officer' || role === 'management'
  if (needsApproval && !isApproved && to.name !== 'pending-approval') {
    return { name: 'pending-approval' }
  }
  if (needsApproval && isApproved && to.name === 'pending-approval') {
    return dashboardRouteForRole(role)
  }

  return true
})

export default router
