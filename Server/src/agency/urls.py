from django.urls import path
from . import views

urlpatterns = [
    path('countries/', views.countries),
    path('countries/<int:id>/', views.country_detail),

    path('destinations/', views.destinations),
    path('destinations/<int:id>/', views.destination_detail),
    path('destinations/top/', views.top_destinations),

    path('arrangements/', views.arrangements),
    path('arrangements/<int:id>/', views.arrangement_detail),
    path('arrangements/top/', views.top_arrangements),
    path('arrangements/filter/', views.arrangements_filter),

    path('bookings/', views.bookings),
    path('bookings/<int:id>/', views.booking_detail),

    path('hotels/', views.hotels),
    path('hotels/<int:id>/', views.hotel_detail),

    path('transports/', views.transports),
    path('transports/<int:id>/', views.transport_detail),

    path('users/', views.users),
    path('users/<int:id>/', views.user_detail, name='user-detail'),
    path('admin/dashboard/', views.admin_dashboard),

    path('auth/signup/', views.register),
    path('auth/login/', views.login),
    path('auth/users/activation/', views.activate),
    path('auth/users/reset_password/', views.request_password_reset),
    path('auth/users/reset_password_confirm/', views.confirm_password_reset),
    path('auth/me/', views.me),
]
