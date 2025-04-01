import { Routes } from '@angular/router';
import { CitasComponent } from './components/citas/citas.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { CrearCitasComponent } from './components/crear-citas/crear-citas.component';
import { MisCitasComponent } from './components/mis-citas/mis-citas.component';

export const routes: Routes = [
	// { path: 'citas', component: CitasComponent },
	{ path: ':username/citas', component: CitasComponent },
	{ path: 'crear-citas', component: CrearCitasComponent},
	{ path: 'registro', component: RegisterComponent },
	{ path: 'inicio-sesion', component: LoginComponent },
	{ path: 'mis-citas', component: MisCitasComponent },

	{ path: '', redirectTo: '/crear-citas', pathMatch: 'full' },
	{ path: '**', redirectTo: '/crear-citas' } 
];