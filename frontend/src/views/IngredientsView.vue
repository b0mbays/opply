<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Ingredient } from "../types";
import { fetchIngredients } from "../services/ingredients";

const ingredients = ref<Ingredient[]>([]);
const loading = ref(true);
const search = ref("");

onMounted(async () => {
  ingredients.value = await fetchIngredients();
  loading.value = false;
});

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return ingredients.value;
  return ingredients.value.filter((i) => i.name.toLowerCase().includes(q));
});
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Ingredients</h1>
      <input
        v-model="search"
        class="search-input"
        type="search"
        placeholder="Search ingredients…"
      />
    </div>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="filtered.length === 0" class="empty">No ingredients found.</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>INGREDIENT NAME</th>
            <th>SUPPLIER</th>
            <th>UNIT</th>
            <th>PRICE PER UNIT</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ing in filtered" :key="ing.id">
            <td class="ing-name">{{ ing.name }}</td>
            <td class="supplier">{{ ing.supplier_name }}</td>
            <td>{{ ing.unit }}</td>
            <td>£{{ ing.price_per_unit }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--purple);
}

.search-input {
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 0.55rem 0.875rem;
  font-size: 0.875rem;
  outline: none;
  width: 240px;
  transition: border-color 0.15s, box-shadow 0.15s;
  color: var(--text);
  background: var(--white);
}

.search-input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(59, 31, 165, 0.1);
}

.loading,
.empty {
  color: var(--muted);
}

.table-wrap {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  background: #FAFAFA;
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.ing-name {
  font-weight: 500;
}

.supplier {
  color: var(--muted);
}
</style>
