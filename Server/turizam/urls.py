from django.urls import path
from . import views

urlpatterns = [
    path('countries/', views.drzave),
    path('countries/<int:id>/', views.drzava_detail),
    
    path('destinations/', views.destinacije),
    path('destinations/<int:id>/', views.destinacija_detail),
    path('destinations/top/', views.top_destinacije),
    
    path('arrangements/', views.aranzmani),
    path('arrangements/<int:id>/', views.aranzman_detail),
    path('arrangements/top/', views.top_aranzmani),
    path('arrangements/filter/', views.aranzmani_filter),
    
    path('bookings/', views.bookings),
    path('bookings/<int:id>/', views.booking_detail),
    
    path('hotels/', views.hoteli),
    path('hotels/<int:id>/', views.hotel_detail),
    
    path('users/', views.users),
    path('users/<int:id>/', views.user_detail, name='user-detail'),
    path('admin/dashboard/', views.admin_dashboard),
    
    path('auth/signup/', views.register),
    path('auth/login/', views.login),
    path('auth/me/', views.me),
]
