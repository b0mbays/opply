import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../composables/useAuth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { guest: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/ingredients",
      name: "ingredients",
      component: () => import("../views/IngredientsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/suppliers",
      name: "suppliers",
      component: () => import("../views/SuppliersView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/suppliers/:id",
      name: "supplier-detail",
      component: () => import("../views/SupplierDetailView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/orders",
      name: "orders",
      component: () => import("../views/OrdersView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/orders/new",
      name: "order-create",
      component: () => import("../views/CreateOrderView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/orders/:id",
      name: "order-detail",
      component: () => import("../views/OrderDetailView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/products",
      name: "products",
      component: () => import("../views/ProductsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/products/new",
      name: "product-create",
      component: () => import("../views/CreateProductView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/products/:id",
      name: "product-detail",
      component: () => import("../views/ProductDetailView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: "login" };
  }
  if (to.meta.guest && isAuthenticated.value) {
    return { name: "dashboard" };
  }
});

export default router;
