<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Order } from "../types";
import { fetchOrders } from "../services/orders";


const router = useRouter();
const orders = ref<Order[]>([]);
const loading = ref(true);

onMounted(async () => {
  orders.value = await fetchOrders();
  loading.value = false;
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function goToDetail(id: number) {
  router.push({ name: "order-detail", params: { id } });
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Orders</h1>
      <button class="btn-primary" @click="router.push({ name: 'order-create' })">
        + New Order
      </button>
    </div>
    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="orders.length === 0" class="empty">No orders yet.</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>ORDER #</th>
            <th>STATUS</th>
            <th>ITEMS</th>
            <th>TOTAL</th>
            <th>DATE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="clickable-row"
            @click="goToDetail(order.id)"
          >
            <td class="order-id">#{{ order.id }}</td>
            <td>
              <span :class="['badge', `badge--${order.status.toLowerCase()}`]">
                {{ order.status }}
              </span>
            </td>
            <td>{{ order.item_count }}</td>
            <td>£{{ order.total_amount }}</td>
            <td>{{ formatDate(order.created_at) }}</td>
            <td @click.stop>
              <button class="btn-outline" @click="goToDetail(order.id)">
                View
              </button>
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

.order-id {
  font-weight: 600;
  color: var(--purple);
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

/* Badges */
.badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge--pending { background: #FEF3C7; color: #92400E; }
.badge--confirmed { background: #DBEAFE; color: #1D4ED8; }
.badge--processing { background: #EDE9FE; color: #5B21B6; }
.badge--shipped { background: #FFEDD5; color: #9A3412; }
.badge--delivered { background: #D1FAE5; color: #065F46; }
.badge--cancelled { background: #FEE2E2; color: #991B1B; }
</style>
