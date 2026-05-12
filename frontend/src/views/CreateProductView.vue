<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Ingredient } from "../types";
import { fetchIngredients } from "../services/ingredients";
import { createProduct } from "../services/products";

const router = useRouter();

const name = ref("");
const description = ref("");
const allIngredients = ref<Ingredient[]>([]);
const quantities = ref<Record<number, string>>({});
const loadingIngredients = ref(true);
const submitting = ref(false);
const submitError = ref("");

onMounted(async () => {
  allIngredients.value = await fetchIngredients();
  loadingIngredients.value = false;
});

const selectedIngredients = computed(() =>
  allIngredients.value.filter((ing) => {
    const q = parseFloat(quantities.value[ing.id] ?? "0");
    return q > 0;
  })
);

const canSubmit = computed(
  () => name.value.trim().length > 0 && selectedIngredients.value.length > 0 && !submitting.value
);

function setQty(ingredientId: number, value: string) {
  if (!value || parseFloat(value) <= 0) {
    delete quantities.value[ingredientId];
  } else {
    quantities.value[ingredientId] = value;
  }
}

async function submit() {
  submitError.value = "";
  submitting.value = true;
  try {
    const ingredients = selectedIngredients.value.map((ing) => ({
      ingredient_id: ing.id,
      quantity: parseFloat(quantities.value[ing.id]).toFixed(3),
    }));
    const product = await createProduct(name.value.trim(), description.value.trim(), ingredients);
    router.push({ name: "product-detail", params: { id: product.id } });
  } catch (e: unknown) {
    submitError.value =
      e instanceof Error ? e.message : "Failed to create product. Please try again.";
    submitting.value = false;
  }
}
</script>

<template>
  <div>
    <p class="breadcrumb">
      <router-link :to="{ name: 'products' }" class="breadcrumb-link">Products</router-link>
      <span class="breadcrumb-sep"> › </span>
      New Product
    </p>

    <h1 class="page-title">Create Product</h1>

    <div v-if="loadingIngredients" class="loading">Loading ingredients…</div>
    <div v-else class="layout">
      <!-- Left: form -->
      <div class="form-col">
        <!-- Product info -->
        <section class="card">
          <p class="card-label">1. Product Details</p>
          <div class="field">
            <label class="field-label" for="product-name">Name *</label>
            <input
              id="product-name"
              v-model="name"
              class="text-input"
              type="text"
              placeholder="e.g. Oat Milk"
            />
          </div>
          <div class="field">
            <label class="field-label" for="product-desc">Description</label>
            <textarea
              id="product-desc"
              v-model="description"
              class="textarea"
              rows="3"
              placeholder="Optional description…"
            />
          </div>
        </section>

        <!-- Ingredient selection -->
        <section class="card">
          <p class="card-label">2. Select Ingredients</p>
          <div v-if="allIngredients.length === 0" class="empty">No ingredients available.</div>
          <div v-else class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>INGREDIENT</th>
                  <th>SUPPLIER</th>
                  <th>UNIT</th>
                  <th>QUANTITY</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="ing in allIngredients"
                  :key="ing.id"
                  :class="{ 'row-active': parseFloat(quantities[ing.id] ?? '0') > 0 }"
                >
                  <td class="ing-name">{{ ing.name }}</td>
                  <td class="ing-supplier">{{ ing.supplier_name }}</td>
                  <td>{{ ing.unit }}</td>
                  <td>
                    <input
                      class="qty-input"
                      type="number"
                      min="0"
                      step="0.001"
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

      <!-- Right: summary -->
      <div class="summary-col">
        <div class="summary-card">
          <p class="card-label">Summary</p>

          <div v-if="!name.trim()" class="summary-empty">Enter a product name to get started.</div>
          <div v-else>
            <p class="summary-product-name">{{ name }}</p>
            <p v-if="description" class="summary-description">{{ description }}</p>
          </div>

          <div v-if="selectedIngredients.length === 0" class="summary-empty">
            No ingredients selected.
          </div>
          <div v-else class="summary-ingredients">
            <p class="summary-section-label">Ingredients ({{ selectedIngredients.length }})</p>
            <div class="summary-items">
              <div
                v-for="ing in selectedIngredients"
                :key="ing.id"
                class="summary-item"
              >
                <span class="summary-item-name">{{ ing.name }}</span>
                <span class="summary-item-qty">× {{ quantities[ing.id] }} {{ ing.unit }}</span>
              </div>
            </div>
          </div>

          <p v-if="submitError" class="submit-error">{{ submitError }}</p>

          <button
            class="btn-submit"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ submitting ? "Creating…" : "Create Product" }}
          </button>

          <button class="btn-cancel" @click="router.push({ name: 'products' })">
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

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}

.text-input,
.textarea {
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 0.65rem 0.875rem;
  font-size: 0.9rem;
  outline: none;
  color: var(--text);
  background: var(--bg);
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.text-input:focus,
.textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(59, 31, 165, 0.1);
}

.textarea {
  resize: vertical;
}

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

.ing-supplier {
  color: var(--muted);
}

.qty-input {
  border: 1.5px solid var(--border);
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  font-size: 0.875rem;
  width: 80px;
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

.summary-product-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--purple);
}

.summary-description {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
}

.summary-section-label {
  margin: 0 0 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.85rem;
}

.summary-item-name {
  color: var(--text);
}

.summary-item-qty {
  color: var(--muted);
  font-size: 0.8rem;
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
