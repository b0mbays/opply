<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../services/auth";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { saveToken } = useAuth();

const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleSubmit() {
  error.value = "";
  loading.value = true;
  try {
    const token = await login(username.value, password.value);
    saveToken(token);
    await router.push({ name: "dashboard" });
  } catch {
    error.value = "Invalid credentials. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>Opply</h1>
        <p>Code Challenge</p>
      </div>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="field">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="demo"
            required
          />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? "Signing in…" : "Sign in" }}
        </button>
      </form>
      <p class="hint">Demo credentials: <code>demo / demo1234</code></p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.login-card {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(59, 31, 165, 0.12);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 380px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--purple);
  letter-spacing: -0.03em;
}

.login-header p {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.field input {
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 0.65rem 0.875rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  color: var(--text);
}

.field input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(59, 31, 165, 0.12);
}

button[type="submit"] {
  margin-top: 0.5rem;
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

button[type="submit"]:hover:not(:disabled) {
  background: var(--purple-dark);
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #dc2626;
  font-size: 0.85rem;
  margin: 0;
}

.hint {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: var(--muted);
}

.hint code {
  background: var(--bg);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}
</style>
