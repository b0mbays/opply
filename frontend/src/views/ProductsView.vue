<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Product } from "../types";
import { fetchProducts } from "../services/products";

const router = useRouter();
const products = ref<Product[]>([]);
const loading = ref(true);
const search = ref("");

onMounted(async () => {
  products.value = await fetchProducts();
  loading.value = false;
});

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return products.value;
  return products.value.filter((p) => p.name.toLowerCase().includes(q));
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function goToDetail(id: number) {
  router.push({ name: "product-detail", params: { id } });
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Products</h1>
      <div class="header-actions">
        <input
          v-model="search"
          class="search-input"
          type="search"
          placeholder="Search products…"
        />
        <button class="btn-primary" @click="router.push({ name: 'product-create' })">
          + New Product
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="filtered.length === 0" class="empty">No products found.</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>DESCRIPTION</th>
            <th>INGREDIENTS</th>
            <th>CREATED</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in filtered"
            :key="product.id"
            class="clickable-row"
            @click="goToDetail(product.id)"
          >
            <td class="product-name">{{ product.name }}</td>
            <td class="description">{{ product.description || '—' }}</td>
            <td>
              <span class="ingredient-badge">{{ product.ingredient_count }}</span>
            </td>
            <td>{{ formatDate(product.created_at) }}</td>
            <td @click.stop>
              <button class="btn-outline" @click="goToDetail(product.id)">View</button>
            </td>
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-input {
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 0.55rem 0.875rem;
  font-size: 0.875rem;
  outline: none;
  width: 220px;
  transition: border-color 0.15s, box-shadow 0.15s;
  color: var(--text);
  background: var(--white);
}

.search-input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(59, 31, 165, 0.1);
}

.btn-primary {
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--purple-dark);
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

.clickable-row {
  cursor: pointer;
  transition: background 0.1s;
}

.clickable-row:hover {
  background: #F7F6FC;
}

.product-name {
  font-weight: 600;
  color: var(--purple);
}

.description {
  color: var(--muted);
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ingredient-badge {
  display: inline-block;
  background: #EDE9FE;
  color: var(--purple);
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
}

.btn-outline {
  border: 1.5px solid var(--purple);
  color: var(--purple);
  background: none;
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-outline:hover {
  background: var(--purple);
  color: #fff;
}
</style>
