import { ref, computed } from "vue";

const token = ref<string | null>(localStorage.getItem("token"));

export function useAuth() {
  const isAuthenticated = computed(() => token.value !== null);

  function saveToken(newToken: string): void {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  function clearToken(): void {
    token.value = null;
    localStorage.removeItem("token");
  }

  return { isAuthenticated, saveToken, clearToken };
}
