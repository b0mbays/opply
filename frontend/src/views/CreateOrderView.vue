<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Supplier, Ingredient } from "../types";
import { fetchSuppliers, fetchSupplierIngredients } from "../services/suppliers";
import { createOrder } from "../services/orders";

const route = useRoute();
const router = useRouter();

const suppliers = ref<Supplier[]>([]);
const ingredients = ref<Ingredient[]>([]);
const selectedSupplierId = ref<number | null>(null);
const quantities = ref<Record<number, number>>({});
const loadingSuppliers = ref(true);
const loadingIngredients = ref(false);
const submitting = ref(false);
const submitError = ref("");

onMounted(async () => {
  suppliers.value = await fetchSuppliers();
  loadingSuppliers.value = false;

  const preselect = route.query.supplier;
  if (preselect) {
    selectedSupplierId.value = Number(preselect);
  }
});

watch(selectedSupplierId, async (id) => {
  quantities.value = {};
  ingredients.value = [];
  if (!id) return;
  loadingIngredients.value = true;
  ingredients.value = await fetchSupplierIngredients(id);
  loadingIngredients.value = false;
});

const selectedSupplier = computed(() =>
  suppliers.value.find((s) => s.id === selectedSupplierId.value) ?? null
);

// Items in the cart (quantity > 0)
const cartItems = computed(() =>
  ingredients.value
    .filter((ing) => (quantities.value[ing.id] ?? 0) > 0)
    .map((ing) => ({
      ingredient: ing,
      quantity: quantities.value[ing.id],
      lineTotal: (parseFloat(ing.price_per_unit) * quantities.value[ing.id]).toFixed(2),
    }))
);

const orderTotal = computed(() =>
  cartItems.value
    .reduce((sum, item) => sum + parseFloat(item.lineTotal), 0)
    .toFixed(2)
);

const canSubmit = computed(() => cartItems.value.length > 0 && !submitting.value);

function setQty(ingredientId: number, value: string) {
  const n = parseInt(value, 10);
  if (isNaN(n) || n <= 0) {
    delete quantities.value[ingredientId];
  } else {
    quantities.value[ingredientId] = n;
  }
}

async function submit() {
  submitError.value = "";
  submitting.value = true;
  try {
    const items = cartItems.value.map((item) => ({
      ingredient_id: item.ingredient.id,
      quantity: item.quantity,
    }));
    const order = await createOrder(items);
    router.push({ name: "order-detail", params: { id: order.id } });
  } catch (e: unknown) {
    submitError.value =
      e instanceof Error ? e.message : "Failed to place order. Please try again.";
    submitting.value = false;
  }
}
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <p class="breadcrumb">
      <router-link :to="{ name: 'orders' }" class="breadcrumb-link">Orders</router-link>
      <span class="breadcrumb-sep"> › </span>
      New Order
    </p>

    <h1 class="page-title">Place an Order</h1>

    <div v-if="loadingSuppliers" class="loading">Loading suppliers…</div>
    <div v-else class="layout">
      <!-- Left: form -->
      <div class="form-col">
        <!-- Supplier selector -->
        <section class="card">
          <p class="card-label">1. Select Supplier</p>
          <select
            class="supplier-select"
            :value="selectedSupplierId ?? ''"
            @change="selectedSupplierId = Number(($event.target as HTMLSelectElement).value) || null"
          >
            <option value="">— Choose a supplier —</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </section>

        <!-- Ingredients -->
        <section v-if="selectedSupplierId" class="card">
          <p class="card-label">2. Add Ingredients</p>

          <div v-if="loadingIngredients" class="loading">Loading ingredients…</div>
          <div v-else-if="ingredients.length === 0" class="empty">
            No ingredients available for this supplier.
          </div>
          <div v-else class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>INGREDIENT</th>
                  <th>UNIT</th>
                  <th>PRICE / UNIT</th>
                  <th>QUANTITY</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="ing in ingredients"
                  :key="ing.id"
                  :class="{ 'row-active': (quantities[ing.id] ?? 0) > 0 }"
                >
                  <td class="ing-name">{{ ing.name }}</td>
                  <td>{{ ing.unit }}</td>
                  <td>£{{ ing.price_per_unit }}</td>
                  <td>
                    <input
                      class="qty-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      :value="quantities[ing.id] ?? ''"
                      @input="setQty(ing.id, ($event.target as HTMLInputElement).value)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Right: order summary -->
      <div class="summary-col">
        <div class="summary-card">
          <p class="card-label">Order Summary</p>

          <div v-if="cartItems.length === 0" class="summary-empty">
            No items added yet.
          </div>
          <div v-else>
            <div class="summary-supplier">
              <span class="summary-sup-label">Supplier</span>
              <span class="summary-sup-name">{{ selectedSupplier?.name }}</span>
            </div>

            <div class="summary-items">
              <div
                v-for="item in cartItems"
                :key="item.ingredient.id"
                class="summary-item"
              >
                <span class="summary-item-name">{{ item.ingredient.name }}</span>
                <span class="summary-item-qty">×{{ item.quantity }}</span>
                <span class="summary-item-total">£{{ item.lineTotal }}</span>
              </div>
            </div>

            <div class="summary-total">
              <span>Total</span>
              <span>£{{ orderTotal }}</span>
            </div>
          </div>

          <p v-if="submitError" class="submit-error">{{ submitError }}</p>

          <button
            class="btn-submit"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ submitting ? "Placing order…" : "Place Order" }}
          </button>

          <button class="btn-cancel" @click="router.push({ name: 'orders' })">
            Cancel
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

.page-title {
  margin: 0 0 1.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--purple);
}

.loading {
  color: var(--muted);
}

/* Two-column layout */
.layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.summary-col {
  width: 280px;
  position: sticky;
  top: 2rem;
}

/* Cards */
.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--purple);
}

/* Supplier select */
.supplier-select {
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 0.65rem 0.875rem;
  font-size: 0.9rem;
  outline: none;
  color: var(--text);
  background: var(--bg);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}

.supplier-select:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(59, 31, 165, 0.1);
}

/* Ingredients table */
.empty {
  color: var(--muted);
  font-size: 0.875rem;
}

.table-wrap {
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  padding: 0.65rem 0.875rem;
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
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.row-active {
  background: #F5F3FF;
}

.ing-name {
  font-weight: 500;
}

.qty-input {
  border: 1.5px solid var(--border);
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  font-size: 0.875rem;
  width: 72px;
  text-align: center;
  outline: none;
  color: var(--text);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.qty-input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 2px rgba(59, 31, 165, 0.1);
}

/* Summary card */
.summary-card {
  background: #EDE9FE;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-empty {
  font-size: 0.85rem;
  color: var(--muted);
}

.summary-supplier {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.summary-sup-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.summary-sup-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--purple);
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.summary-item-name {
  flex: 1;
  color: var(--text);
}

.summary-item-qty {
  color: var(--muted);
  font-size: 0.8rem;
}

.summary-item-total {
  font-weight: 600;
  color: var(--text);
  min-width: 56px;
  text-align: right;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 2px solid var(--border);
  font-weight: 700;
  font-size: 1rem;
  color: var(--purple);
}

.submit-error {
  margin: 0;
  font-size: 0.8rem;
  color: #DC2626;
}

.btn-submit {
  width: 100%;
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.btn-submit:hover:not(:disabled) {
  background: var(--purple-dark);
}

.btn-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-cancel {
  width: 100%;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.15s;
}

.btn-cancel:hover {
  color: var(--purple);
}
</style>
