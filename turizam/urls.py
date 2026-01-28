from django.urls import path
from . import views

urlpatterns = [
    path('drzave/', views.drzave),
    path('drzave/<int:id>/', views.drzava_detail),
    
    path('destinacije/', views.destinacije),
    path('destinacije/<int:id>/', views.destinacija_detail),
    
    path('aranzmani/', views.aranzmani),
    path('aranzmani/<int:id>/', views.aranzman_detail),
    
    path('users/', views.users),
    
    path('auth/signup/', views.register),
    path('auth/login/', views.login),
    path('auth/me/', views.me),
]
