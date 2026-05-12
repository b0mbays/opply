<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { ProductDetail, Ingredient } from "../types";
import { fetchProduct, updateProduct, deleteProduct } from "../services/products";
import { fetchIngredients } from "../services/ingredients";

const route = useRoute();
const router = useRouter();

const product = ref<ProductDetail | null>(null);
const loading = ref(true);
const editing = ref(false);
const deleting = ref(false);
const saving = ref(false);
const saveError = ref("");

// Edit form state
const editName = ref("");
const editDescription = ref("");
const editingIngredients = ref(false);
const allIngredients = ref<Ingredient[]>([]);
const editQuantities = ref<Record<number, string>>({});
const loadingIngredients = ref(false);

onMounted(async () => {
  const id = Number(route.params.id);
  product.value = await fetchProduct(id);
  loading.value = false;
});

function startEdit() {
  if (!product.value) return;
  editName.value = product.value.name;
  editDescription.value = product.value.description;
  editingIngredients.value = false;
  editing.value = true;
}

function cancelEdit() {
  editing.value = false;
  editingIngredients.value = false;
  saveError.value = "";
}

async function toggleIngredientEdit() {
  if (editingIngredients.value) {
    editingIngredients.value = false;
    return;
  }
  if (allIngredients.value.length === 0) {
    loadingIngredients.value = true;
    allIngredients.value = await fetchIngredients();
    loadingIngredients.value = false;
  }
  // Pre-fill quantities from current product ingredients
  const qty: Record<number, string> = {};
  for (const pi of product.value?.ingredients ?? []) {
    qty[pi.ingredient.id] = pi.quantity;
  }
  editQuantities.value = qty;
  editingIngredients.value = true;
}

function setQty(ingredientId: number, value: string) {
  if (!value || parseFloat(value) <= 0) {
    delete editQuantities.value[ingredientId];
  } else {
    editQuantities.value[ingredientId] = value;
  }
}

const selectedIngredients = computed(() =>
  allIngredients.value.filter((ing) => {
    const q = parseFloat(editQuantities.value[ing.id] ?? "0");
    return q > 0;
  })
);

async function save() {
  if (!product.value) return;
  saveError.value = "";
  saving.value = true;
  try {
    const payload: Parameters<typeof updateProduct>[1] = {
      name: editName.value.trim(),
      description: editDescription.value.trim(),
    };
    if (editingIngredients.value) {
      payload.ingredients = selectedIngredients.value.map((ing) => ({
        ingredient_id: ing.id,
        quantity: parseFloat(editQuantities.value[ing.id]).toFixed(3),
      }));
    }
    product.value = await updateProduct(product.value.id, payload);
    editing.value = false;
    editingIngredients.value = false;
  } catch (e: unknown) {
    saveError.value = e instanceof Error ? e.message : "Failed to save. Please try again.";
  } finally {
    saving.value = false;
  }
}

async function doDelete() {
  if (!product.value) return;
  if (!confirm(`Delete "${product.value.name}"? This cannot be undone.`)) return;
  deleting.value = true;
  try {
    await deleteProduct(product.value.id);
    router.push({ name: "products" });
  } catch {
    deleting.value = false;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
</script>

<template>
  <div>
    <p class="breadcrumb">
      <router-link :to="{ name: 'products' }" class="breadcrumb-link">Products</router-link>
      <span class="breadcrumb-sep"> › </span>
      <span v-if="product">{{ product.name }}</span>
    </p>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="product" class="content">

      <!-- View mode -->
      <template v-if="!editing">
        <div class="heading-row">
          <h1 class="page-title">{{ product.name }}</h1>
        </div>
        <p v-if="product.description" class="product-description">{{ product.description }}</p>
        <p class="product-meta">Created {{ formatDate(product.created_at) }} · Updated {{ formatDate(product.updated_at) }}</p>

        <div class="two-col">
          <!-- Ingredients table -->
          <div class="breakdown">
            <h2 class="section-title">Ingredients ({{ product.ingredients.length }})</h2>
            <div v-if="product.ingredients.length === 0" class="empty">No ingredients added.</div>
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
                  <tr v-for="pi in product.ingredients" :key="pi.ingredient.id">
                    <td class="ing-name">{{ pi.ingredient.name }}</td>
                    <td class="ing-supplier">{{ pi.ingredient.supplier_name }}</td>
                    <td>{{ pi.ingredient.unit }}</td>
                    <td>{{ pi.quantity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-sidebar">
            <div class="actions-card">
              <p class="actions-title">Actions</p>
              <button class="btn-action btn-action--primary" @click="startEdit">
                Edit Product
              </button>
              <button
                class="btn-action btn-action--danger"
                :disabled="deleting"
                @click="doDelete"
              >
                {{ deleting ? "Deleting…" : "Delete Product" }}
              </button>
            </div>
            <button class="btn-back" @click="router.push({ name: 'products' })">
              ← Back to Products
            </button>
          </div>
        </div>
      </template>

      <!-- Edit mode -->
      <template v-else>
        <h1 class="page-title">Edit Product</h1>

        <div class="layout">
          <div class="form-col">
            <!-- Details -->
            <section class="card">
              <p class="card-label">Product Details</p>
              <div class="field">
                <label class="field-label" for="edit-name">Name *</label>
                <input
                  id="edit-name"
                  v-model="editName"
                  class="text-input"
                  type="text"
                />
              </div>
              <div class="field">
                <label class="field-label" for="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  v-model="editDescription"
                  class="textarea"
                  rows="3"
                />
              </div>
            </section>

            <!-- Ingredient replacement (optional) -->
            <section class="card">
              <div class="ingredient-header">
                <p class="card-label">Ingredients</p>
                <button class="btn-toggle" @click="toggleIngredientEdit">
                  {{ editingIngredients ? "Keep current" : "Replace ingredients" }}
                </button>
              </div>

              <div v-if="!editingIngredients" class="ingredients-preview">
                <p class="preview-note">Current: {{ product.ingredients.length }} ingredient{{ product.ingredients.length !== 1 ? 's' : '' }}. Click "Replace ingredients" to change them.</p>
              </div>

              <div v-else-if="loadingIngredients" class="loading">Loading…</div>
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
                      :class="{ 'row-active': parseFloat(editQuantities[ing.id] ?? '0') > 0 }"
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
                          :value="editQuantities[ing.id] ?? ''"
                          @input="setQty(ing.id, ($event.target as HTMLInputElement).value)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- Save panel -->
          <div class="summary-col">
            <div class="summary-card">
              <p class="card-label">Save Changes</p>

              <div v-if="editingIngredients">
                <p class="summary-section-label">New Ingredients ({{ selectedIngredients.length }})</p>
                <div v-if="selectedIngredients.length === 0" class="summary-empty">
                  No ingredients selected.
                </div>
                <div v-else class="summary-items">
                  <div
                    v-for="ing in selectedIngredients"
                    :key="ing.id"
                    class="summary-item"
                  >
                    <span class="summary-item-name">{{ ing.name }}</span>
                    <span class="summary-item-qty">× {{ editQuantities[ing.id] }} {{ ing.unit }}</span>
                  </div>
                </div>
              </div>

              <p v-if="saveError" class="save-error">{{ saveError }}</p>

              <button
                class="btn-submit"
                :disabled="saving || !editName.trim()"
                @click="save"
              >
                {{ saving ? "Saving…" : "Save Changes" }}
              </button>
              <button class="btn-cancel" @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </div>
      </template>
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
  gap: 1.5rem;
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

.product-description {
  margin: -0.75rem 0 0;
  font-size: 0.95rem;
  color: var(--text);
}

.product-meta {
  margin: -0.75rem 0 0;
  font-size: 0.8rem;
  color: var(--muted);
}

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

.empty {
  color: var(--muted);
  font-size: 0.875rem;
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

.ing-supplier {
  color: var(--muted);
}

.row-active {
  background: #F5F3FF;
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
  gap: 0.625rem;
}

.actions-title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--purple);
}

.btn-action {
  border: none;
  border-radius: 6px;
  padding: 0.55rem 0.875rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  text-align: left;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-action--primary {
  background: var(--purple);
  color: #fff;
}

.btn-action--primary:hover:not(:disabled) {
  background: var(--purple-dark);
}

.btn-action--danger {
  background: #FEE2E2;
  color: #991B1B;
}

.btn-action--danger:hover:not(:disabled) {
  background: #FECACA;
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

/* Edit mode layout */
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

.ingredient-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-toggle {
  background: none;
  border: 1.5px solid var(--purple);
  color: var(--purple);
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-toggle:hover {
  background: var(--purple);
  color: #fff;
}

.ingredients-preview {
  background: #F7F6FC;
  border-radius: 6px;
  padding: 0.75rem 1rem;
}

.preview-note {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
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

.summary-section-label {
  margin: 0 0 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.summary-empty {
  font-size: 0.85rem;
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

.save-error {
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
