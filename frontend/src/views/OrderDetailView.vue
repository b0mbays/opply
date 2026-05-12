<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { OrderDetail, OrderStatus } from "../types";
import { fetchOrder, transitionOrder } from "../services/orders";

const route = useRoute();
const router = useRouter();

const order = ref<OrderDetail | null>(null);
const loading = ref(true);
const transitioning = ref(false);
const transitionError = ref("");

onMounted(async () => {
  const id = Number(route.params.id);
  order.value = await fetchOrder(id);
  loading.value = false;
});

const STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const isCancelled = computed(() => order.value?.status === "CANCELLED");

const currentStepIndex = computed(() => {
  if (!order.value) return -1;
  if (isCancelled.value) return -1;
  return STEPS.indexOf(order.value.status);
});

const allowedTransitions = computed<OrderStatus[]>(() => {
  if (!order.value) return [];
  return VALID_TRANSITIONS[order.value.status] ?? [];
});

const total = computed(() => {
  if (!order.value) return "0.00";
  const sum = order.value.items.reduce(
    (acc, item) => acc + parseFloat(item.line_total),
    0
  );
  return sum.toFixed(2);
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function stepClass(index: number) {
  const current = currentStepIndex.value;
  if (index < current) return "step step--done";
  if (index === current) return "step step--current";
  return "step step--future";
}

async function doTransition(status: OrderStatus) {
  if (!order.value) return;
  transitionError.value = "";
  transitioning.value = true;
  try {
    order.value = await transitionOrder(order.value.id, status);
  } catch (e: unknown) {
    transitionError.value =
      e instanceof Error ? e.message : "Transition failed.";
  } finally {
    transitioning.value = false;
  }
}

function transitionLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: "Mark Pending",
    CONFIRMED: "Confirm",
    PROCESSING: "Start Processing",
    SHIPPED: "Mark Shipped",
    DELIVERED: "Mark Delivered",
    CANCELLED: "Cancel Order",
  };
  return map[status] ?? status;
}
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <p class="breadcrumb">
      <router-link :to="{ name: 'orders' }" class="breadcrumb-link">Orders</router-link>
      <span class="breadcrumb-sep"> › </span>
      <span v-if="order">Order #{{ order.id }}</span>
    </p>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="order" class="content">
      <!-- Page heading -->
      <div class="heading-row">
        <h1 class="page-title">Order #{{ order.id }}</h1>
        <span :class="['badge', `badge--${order.status.toLowerCase()}`]">
          {{ order.status }}
        </span>
      </div>
      <p class="order-meta">Placed on {{ formatDate(order.created_at) }}</p>

      <!-- Status stepper -->
      <div class="stepper-wrap" v-if="!isCancelled">
        <div class="stepper">
          <template v-for="(step, i) in STEPS" :key="step">
            <div :class="stepClass(i)">
              <div class="step-circle">
                <svg v-if="i < currentStepIndex" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p class="step-label">{{ step }}</p>
            </div>
            <div v-if="i < STEPS.length - 1" :class="['step-line', i < currentStepIndex ? 'step-line--done' : '']" />
          </template>
        </div>
      </div>
      <div v-else class="cancelled-note">
        This order was cancelled.
      </div>

      <!-- Two-column: breakdown + quick actions -->
      <div class="two-col">
        <!-- Order breakdown table -->
        <div class="breakdown">
          <h2 class="section-title">Order Breakdown</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>QUANTITY</th>
                  <th>UNIT PRICE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in order.items" :key="item.ingredient.id">
                  <td class="item-name">{{ item.ingredient.name }}</td>
                  <td>{{ item.quantity }} {{ item.ingredient.unit }}</td>
                  <td>£{{ item.unit_price }}</td>
                  <td>£{{ item.line_total }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="totals-row">
                  <td colspan="3" class="totals-label">Total</td>
                  <td class="totals-value">£{{ total }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Quick actions sidebar -->
        <div class="actions-sidebar">
          <div class="actions-card">
            <p class="actions-title">Quick Actions</p>
            <p class="actions-subtitle">Transition Status</p>
            <div v-if="allowedTransitions.length === 0" class="no-transitions">
              No transitions available.
            </div>
            <div v-else class="transition-btns">
              <button
                v-for="next in allowedTransitions"
                :key="next"
                :class="['btn-transition', next === 'CANCELLED' ? 'btn-transition--danger' : 'btn-transition--primary']"
                :disabled="transitioning"
                @click="doTransition(next)"
              >
                {{ transitionLabel(next) }}
              </button>
            </div>
            <p v-if="transitionError" class="transition-error">{{ transitionError }}</p>
          </div>
          <button class="btn-back" @click="router.push({ name: 'orders' })">
            ← Back to Orders
          </button>
        </div>
      </div>
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

.loading {
  color: var(--muted);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.heading-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--purple);
}

.order-meta {
  margin: -1.5rem 0 0;
  font-size: 0.875rem;
  color: var(--muted);
}

/* Stepper */
.stepper-wrap {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.75rem 2rem;
}

.stepper {
  display: flex;
  align-items: flex-start;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step--done .step-circle {
  background: var(--purple);
  color: #fff;
}

.step--current .step-circle {
  background: transparent;
  border: 2.5px solid var(--teal);
  color: var(--teal);
}

.step--future .step-circle {
  background: transparent;
  border: 2px solid #D1D5DB;
  color: #D1D5DB;
}

.step-label {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  white-space: nowrap;
}

.step--done .step-label { color: var(--purple); }
.step--current .step-label { color: var(--teal); }
.step--future .step-label { color: #9CA3AF; }

.step-line {
  flex: 1;
  height: 2px;
  background: #E5E7EB;
  margin-top: 15px;
  align-self: flex-start;
  min-width: 20px;
}

.step-line--done {
  background: var(--purple);
}

.cancelled-note {
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  color: #991B1B;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Two-column */
.two-col {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--purple);
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

.item-name {
  font-weight: 500;
}

.totals-row td {
  border-top: 2px solid var(--border);
  border-bottom: none;
  font-weight: 700;
}

.totals-label {
  text-align: right;
  color: var(--muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.totals-value {
  color: var(--purple);
  font-size: 1rem;
}

/* Actions sidebar */
.actions-sidebar {
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.actions-card {
  background: #EDE9FE;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.actions-title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--purple);
}

.actions-subtitle {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}

.no-transitions {
  font-size: 0.8rem;
  color: var(--muted);
}

.transition-btns {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-transition {
  border: none;
  border-radius: 6px;
  padding: 0.55rem 0.875rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  text-align: left;
}

.btn-transition:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-transition--primary {
  background: var(--purple);
  color: #fff;
}

.btn-transition--primary:hover:not(:disabled) {
  background: var(--purple-dark);
}

.btn-transition--danger {
  background: #FEE2E2;
  color: #991B1B;
}

.btn-transition--danger:hover:not(:disabled) {
  background: #FECACA;
}

.transition-error {
  margin: 0;
  font-size: 0.8rem;
  color: #DC2626;
}

.btn-back {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0;
  text-align: left;
  transition: color 0.15s;
}

.btn-back:hover {
  color: var(--purple);
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
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
