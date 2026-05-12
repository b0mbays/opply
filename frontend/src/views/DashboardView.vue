<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import type { BuyerProfile, Order, OrderStatus } from "../types";
import api from "../services/api";
import { fetchOrders } from "../services/orders";

const router = useRouter();
const profile = ref<BuyerProfile | null>(null);
const orders = ref<Order[]>([]);
const loading = ref(true);

onMounted(async () => {
  const [profileRes, ordersData] = await Promise.all([
    api.get<BuyerProfile>("/api/buyers/me/"),
    fetchOrders(),
  ]);
  profile.value = profileRes.data;
  orders.value = ordersData;
  loading.value = false;
});

const statusCounts = computed<Record<OrderStatus, number>>(() => {
  const counts: Record<string, number> = {};
  for (const order of orders.value) {
    counts[order.status] = (counts[order.status] ?? 0) + 1;
  }
  return counts as Record<OrderStatus, number>;
});

const recentOrders = computed(() =>
  [...orders.value].sort((a, b) => b.id - a.id).slice(0, 3)
);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STAT_STATUSES: { status: OrderStatus; label: string; color: string }[] = [
  { status: "PENDING", label: "Pending", color: "#F59E0B" },
  { status: "CONFIRMED", label: "Confirmed", color: "#3B82F6" },
  { status: "PROCESSING", label: "Processing", color: "#8B5CF6" },
  { status: "DELIVERED", label: "Delivered", color: "#10B981" },
];
</script>

<template>
  <div v-if="loading" class="loading">Loading…</div>
  <div v-else class="dashboard">
    <h1 class="page-title">Dashboard</h1>

    <!-- Challenge Overview -->
    <section class="challenge-overview">
      <h2>Challenge Overview</h2>
      <p>
        <strong>Welcome to Opply's engineering code challenge.</strong> Opply is a B2B procurement
        platform that connects <em>Buyers</em> (food &amp; beverage brands) with <em>Suppliers</em>
        (ingredient manufacturers). Opply acts as a merchant of record — buyers order through the
        platform and Opply manages supplier relationships, pricing, and fulfilment.
      </p>
      <h3>Entities in this codebase</h3>
      <ul>
        <li><strong>Supplier</strong> — a company that provides ingredients.</li>
        <li><strong>Ingredient</strong> — a product offered by a supplier, with a unit and price.</li>
        <li><strong>Buyer</strong> — a buying company with a linked Django user account.</li>
        <li>
          <strong>Order</strong> — a set of order items (ingredient + quantity + snapshot price)
          placed by a buyer. Orders move through a state machine:
          <code>PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED</code> (or
          <code>CANCELLED</code> from PENDING / CONFIRMED).
        </li>
        <li>
          <strong>Product</strong> — a named product belonging to a buyer, composed of an ordered
          list of ingredients and their quantities.
        </li>
      </ul>
      <p class="session-prompt">
        During your session you will be given a <strong>specific use case</strong> to implement.
        Use this page, the API docs in the README, and the existing code as a starting point.
      </p>
    </section>

    <!-- Buyer profile strip -->
    <section class="profile-card" v-if="profile">
      <div class="profile-field">
        <p class="label">Company</p>
        <p class="value">{{ profile.company_name }}</p>
      </div>
      <div class="profile-field">
        <p class="label">Username</p>
        <p class="value">{{ profile.username }}</p>
      </div>
      <div class="profile-field">
        <p class="label">Total orders</p>
        <p class="value">{{ profile.total_orders }}</p>
      </div>
    </section>

    <!-- Stats row -->
    <section>
      <div class="stat-grid">
        <div
          v-for="s in STAT_STATUSES"
          :key="s.status"
          class="stat-card"
          :style="{ '--accent': s.color }"
        >
          <p class="stat-label">{{ s.label }}</p>
          <p class="stat-count">{{ statusCounts[s.status] ?? 0 }}</p>
        </div>
      </div>
    </section>

    <!-- Recent orders -->
    <section v-if="recentOrders.length">
      <h2 class="section-title">Recent Orders</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ORDER #</th>
              <th>STATUS</th>
              <th>ITEMS</th>
              <th>TOTAL</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in recentOrders"
              :key="order.id"
              class="clickable-row"
              @click="router.push({ name: 'order-detail', params: { id: order.id } })"
            >
              <td>#{{ order.id }}</td>
              <td>
                <span :class="['badge', `badge--${order.status.toLowerCase()}`]">
                  {{ order.status }}
                </span>
              </td>
              <td>{{ order.item_count }}</td>
              <td>£{{ order.total_amount }}</td>
              <td>{{ formatDate(order.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.loading {
  padding: 2rem;
  color: var(--muted);
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--purple);
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--purple);
}

/* Challenge overview */
.challenge-overview {
  background: #EDE9FE;
  border-left: 4px solid var(--purple);
  border-radius: 0 8px 8px 0;
  padding: 1.5rem;
}

.challenge-overview h2 {
  margin-top: 0;
  color: var(--purple);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.challenge-overview h3 {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text);
}

.challenge-overview ul {
  padding-left: 1.25rem;
  line-height: 1.9;
  font-size: 0.9rem;
}

.session-prompt {
  background: var(--white);
  border-left: 3px solid var(--purple);
  padding: 0.75rem 1rem;
  border-radius: 0 6px 6px 0;
  margin-top: 1rem;
  font-size: 0.9rem;
}

/* Profile card */
.profile-card {
  display: flex;
  gap: 2.5rem;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.label {
  font-size: 0.7rem;
  color: var(--muted);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.value {
  font-weight: 600;
  font-size: 1.05rem;
  margin: 0;
  color: var(--text);
}

/* Stat cards */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent, var(--purple));
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
}

.stat-label {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.stat-count {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
}

/* Table */
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
