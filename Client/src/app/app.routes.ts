import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { SignupComponent } from './features/signup/signup.component';
import { AuthGuard } from './core/services/auth/auth.guard';
import { ArrangementOfferComponent } from './features/arrangement-offer/arrangement-offer.component';

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
    }
];
