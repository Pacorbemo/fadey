import { Routes } from '@angular/router';
import { CitasComponent } from './components/citas/citas.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
	{ path: 'citas', component: CitasComponent },
	{ path: 'register', component: RegisterComponent }
];