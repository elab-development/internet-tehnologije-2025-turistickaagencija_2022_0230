import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { SignupComponent } from './features/signup/signup.component';
import { AuthGuard } from './core/services/auth/auth.guard';
import { ArrangementOfferComponent } from './features/arrangement-offer/arrangement-offer.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { UsersManagementComponent } from './features/admin-dashboard/users-management/users-management.component';
import { UserBookingsComponent } from './features/user-bookings/user-bookings.component';

export const routes: Routes = [
    {
        path: '', 
        component: HomeComponent,

    },    
    {
        path: 'home',
        component: HomeComponent,

    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'arrangement-offer',
        component: ArrangementOfferComponent
    },
    {
        path: 'my-bookings',
        component: UserBookingsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin/dashboard',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard],
        data: { requiredRole: 'ADMIN' }
    },
    {
        path: 'admin/users',
        component: UsersManagementComponent,
        canActivate: [AuthGuard],
        data: { requiredRole: 'ADMIN' }
    }
];
