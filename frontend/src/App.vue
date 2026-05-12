<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "./composables/useAuth";
import api from "./services/api";
import type { BuyerProfile } from "./types";

const router = useRouter();
const { isAuthenticated, clearToken } = useAuth();

const profile = ref<BuyerProfile | null>(null);

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const res = await api.get<BuyerProfile>("/api/buyers/me/");
      profile.value = res.data;
    } catch {
      // not critical
    }
  }
});

function logout() {
  clearToken();
  profile.value = null;
  router.push({ name: "login" });
}

const userInitial = () =>
  profile.value?.username?.[0]?.toUpperCase() ?? "?";
</script>

<template>
  <div id="app-root">
    <!-- Sidebar -->
    <aside v-if="isAuthenticated" class="sidebar">
      <div class="sidebar-logo">Opply</div>
      <nav class="sidebar-nav">
        <router-link :to="{ name: 'dashboard' }" class="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Dashboard
        </router-link>
        <router-link :to="{ name: 'ingredients' }" class="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Ingredients
        </router-link>
        <router-link :to="{ name: 'orders' }" class="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Orders
        </router-link>
        <router-link :to="{ name: 'products' }" class="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          Products
        </router-link>
        <router-link :to="{ name: 'suppliers' }" class="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          Suppliers
        </router-link>
      </nav>
      <div class="sidebar-bottom">
        <button class="logout-btn" @click="logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main :class="{ 'with-sidebar': isAuthenticated }">
      <div v-if="isAuthenticated" class="main-header">
        <div v-if="profile" class="user-avatar" :title="profile.username">{{ userInitial() }}</div>
      </div>
      <router-view />
    </main>
  </div>
</template>

<style>
:root {
  --purple: #3B1FA5;
  --purple-dark: #2D1580;
  --teal: #2ECDB0;
  --bg: #F7F6FC;
  --white: #FFFFFF;
  --border: #E5E0F8;
  --text: #1A1A2E;
  --muted: #6B7280;
  --green: #10B981;
  --orange: #F59E0B;
  --blue: #3B82F6;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, sans-serif;
  background: var(--bg);
  color: var(--text);
}
</style>

<style scoped>
#app-root {
  min-height: 100vh;
  display: flex;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  height: 100vh;
  background: var(--purple);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-logo {
  background: var(--white);
  color: var(--purple);
  font-weight: 800;
  font-size: 1.4rem;
  padding: 1.25rem 1.5rem;
  letter-spacing: -0.02em;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.875rem;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item.router-link-active {
  background: var(--teal);
  color: #fff;
}

.sidebar-bottom {
  padding: 1rem 0.75rem 1.5rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  width: 100%;
  transition: background 0.15s, color 0.15s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Main */
main {
  flex: 1;
  background: var(--bg);
  min-height: 100vh;
  padding: 2rem;
  position: relative;
}

main.with-sidebar {
  margin-left: 220px;
}

.main-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--white);
  color: var(--purple);
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border);
  cursor: default;
  user-select: none;
}
</style>
