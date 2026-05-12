<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Supplier } from "../types";
import { fetchSuppliers } from "../services/suppliers";

const router = useRouter();
const suppliers = ref<Supplier[]>([]);
const loading = ref(true);

onMounted(async () => {
  suppliers.value = await fetchSuppliers();
  loading.value = false;
});

function goToDetail(id: number) {
  router.push({ name: "supplier-detail", params: { id } });
}
</script>

<template>
  <div>
    <h1 class="page-title">My Suppliers</h1>
    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="suppliers.length === 0" class="empty">No suppliers found.</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>SUPPLIER NAME</th>
            <th>DESCRIPTION</th>
            <th>INGREDIENTS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="supplier in suppliers"
            :key="supplier.id"
            class="clickable-row"
            @click="goToDetail(supplier.id)"
          >
            <td class="supplier-name">{{ supplier.name }}</td>
            <td class="description">{{ supplier.description }}</td>
            <td>{{ supplier.ingredient_count }}</td>
            <td @click.stop class="actions-cell">
              <button class="btn-outline" @click="goToDetail(supplier.id)">
                View Details
              </button>
              <button
                class="btn-primary"
                @click="router.push({ name: 'order-create', query: { supplier: supplier.id } })"
              >
                Place Order
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 1.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--purple);
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

.supplier-name {
  font-weight: 600;
  color: var(--purple);
}

.description {
  color: var(--muted);
  max-width: 360px;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-outline {
  border: 1.5px solid var(--purple);
  color: var(--purple);
  background: none;
  border-radius: 6px;
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.btn-outline:hover {
  background: var(--purple);
  color: #fff;
}

.btn-primary {
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--purple-dark);
}
</style>
