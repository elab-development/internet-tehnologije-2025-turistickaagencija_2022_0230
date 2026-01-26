from django.urls import path
from . import views

urlpatterns = [
    path('destinacije/', views.destinacije),
    path('destinacije/<int:id>/', views.destinacija_detail),
    
    path('aranzmani/', views.aranzmani),
    path('aranzmani/<int:id>/', views.aranzman_detail),
    
    path('auth/signup/', views.register),
    path('auth/login/', views.login),
    path('auth/me/', views.me),
]
