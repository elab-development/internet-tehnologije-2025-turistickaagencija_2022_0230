import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { SignupComponent } from './features/signup/signup.component';
import { AuthGuard } from './core/services/auth/auth.guard';
import { ArrangementOfferComponent } from './features/arrangement-offer/arrangement-offer.component';
import { BookingComponent } from './features/booking/booking.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { UsersManagementComponent } from './features/admin-dashboard/users-management/users-management.component';
import { CountriesManagementComponent } from './features/admin-dashboard/countries-management/countries-management.component';
import { DestinationsManagementComponent } from './features/admin-dashboard/destinations-management/destinations-management.component';
import { HotelsManagementComponent } from './features/admin-dashboard/hotels-management/hotels-management.component';
import { ArrangementsManagementComponent } from './features/admin-dashboard/arrangements-management/arrangements-management.component';
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
        path: 'booking/:id',
        component: BookingComponent,
        canActivate: [AuthGuard]
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
    },
    {
        path: 'admin/countries',
        component: CountriesManagementComponent,
        canActivate: [AuthGuard],
        data: { requiredRole: 'ADMIN' }
    },
    {
        path: 'admin/destinations',
        component: DestinationsManagementComponent,
        canActivate: [AuthGuard],
        data: { requiredRole: 'ADMIN' }
    },
    {
        path: 'admin/hotels',
        component: HotelsManagementComponent,
        canActivate: [AuthGuard],
        data: { requiredRole: 'ADMIN' }
    },
    {
        path: 'admin/arrangements',
        component: ArrangementsManagementComponent,
        canActivate: [AuthGuard],
        data: { requiredRole: 'ADMIN' }
    }
];
