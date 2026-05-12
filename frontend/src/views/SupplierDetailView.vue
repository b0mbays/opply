<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Supplier, Ingredient } from "../types";
import { fetchSupplier, fetchSupplierIngredients } from "../services/suppliers";

const route = useRoute();
const router = useRouter();

const supplier = ref<Supplier | null>(null);
const ingredients = ref<Ingredient[]>([]);
const loading = ref(true);

onMounted(async () => {
  const id = Number(route.params.id);
  const [s, ings] = await Promise.all([
    fetchSupplier(id),
    fetchSupplierIngredients(id),
  ]);
  supplier.value = s;
  ingredients.value = ings;
  loading.value = false;
});
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <p class="breadcrumb">
      <router-link :to="{ name: 'suppliers' }" class="breadcrumb-link">My Suppliers</router-link>
      <span class="breadcrumb-sep"> › </span>
      <span v-if="supplier">{{ supplier.name }}</span>
    </p>

    <h1 class="page-title">Supplier Details</h1>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="supplier" class="content">
      <!-- Two-column layout -->
      <div class="two-col">
        <!-- Left: info card -->
        <div class="info-card">
          <div class="info-row">
            <p class="info-label">Supplier Name</p>
            <p class="info-value">{{ supplier.name }}</p>
          </div>
          <div class="info-row">
            <p class="info-label">Description</p>
            <p class="info-value">{{ supplier.description || '—' }}</p>
          </div>
          <div class="info-row">
            <p class="info-label">Ingredients</p>
            <p class="info-value">{{ ingredients.length }}</p>
          </div>
        </div>

        <!-- Right: actions card -->
        <div class="actions-card">
          <p class="actions-title">Actions</p>
          <button
            class="btn-primary"
            @click="router.push({ name: 'order-create', query: { supplier: supplier?.id } })"
          >
            Place Order
          </button>
        </div>
      </div>

      <!-- Ingredients table -->
      <section class="ingredients-section">
        <h2 class="section-title">Ingredients</h2>
        <div v-if="ingredients.length === 0" class="empty">No ingredients listed.</div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>UNIT</th>
                <th>PRICE PER UNIT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ing in ingredients" :key="ing.id">
                <td class="ing-name">{{ ing.name }}</td>
                <td>{{ ing.unit }}</td>
                <td>£{{ ing.price_per_unit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.breadcrumb-link {
  color: var(--muted);
  text-decoration: none;
  transition: color 0.15s;
}

.breadcrumb-link:hover {
  color: var(--purple);
}

.breadcrumb-sep {
  margin: 0 0.4rem;
}

.page-title {
  margin: 0 0 1.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--purple);
}

.loading {
  color: var(--muted);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Two-column */
.two-col {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

/* Info card */
.info-card {
  flex: 1;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.info-value {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text);
}

/* Actions card */
.actions-card {
  width: 240px;
  background: #EDE9FE;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions-title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--purple);
}

.btn-primary {
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover {
  background: var(--purple-dark);
}

/* Ingredients section */
.ingredients-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--purple);
}

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
</style>
