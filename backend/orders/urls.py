from django.urls import path

from .views import OrderDetailView, OrderListCreateView, OrderTransitionView

urlpatterns = [
    path("", OrderListCreateView.as_view(), name="order-list-create"),
    path("<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("<int:pk>/transition/", OrderTransitionView.as_view(), name="order-transition"),
]
