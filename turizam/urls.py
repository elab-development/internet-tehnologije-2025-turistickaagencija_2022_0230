from django.urls import path
from . import views

urlpatterns = [
    path('countries/', views.drzave),
    path('countries/<int:id>/', views.drzava_detail),
    
    path('destinations/', views.destinacije),
    path('destinations/<int:id>/', views.destinacija_detail),
    
    path('arangements/', views.aranzmani),
    path('arangements/<int:id>/', views.aranzman_detail),
    
    path('hotels/', views.hoteli),
    path('hotels/<int:id>/', views.hotel_detail),
    
    path('users/', views.users),
    
    path('auth/signup/', views.register),
    path('auth/login/', views.login),
    path('auth/me/', views.me),
]
