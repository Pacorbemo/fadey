import { Routes } from '@angular/router';
import { CitasComponent } from './components/citas/citas.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
	{ path: 'citas', component: CitasComponent },
	{ path: 'registro', component: RegisterComponent },
	{ path: 'inicio-sesion', component: LoginComponent },
	{ path: '', redirectTo: '/citas', pathMatch: 'full' },
	{ path: '**', redirectTo: '/citas' } 
];