import { Routes } from '@angular/router';
import { CitasComponent } from './components/citas/citas.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { CrearCitasComponent } from './components/crear-citas/crear-citas.component';
import { MisCitasComponent } from './components/mis-citas/mis-citas.component';
import { authGuard } from './guards/auth.guard';
import { SolicitudesComponent } from './components/solicitudes/solicitudes.component';
import { RelacionesComponent } from './components/relaciones/relaciones.component';
import { MensajesComponent } from './components/mensajes/mensajes.component';

export const routes: Routes = [
	// { path: 'citas', component: CitasComponent },
	{ path: ':username/citas', component: CitasComponent },
	{ path: 'crear-citas', component: CrearCitasComponent},
	{ path: 'registro', component: RegisterComponent },
	{ path: 'inicio-sesion', component: LoginComponent },
	{ path: 'mis-citas', component: MisCitasComponent, canActivate: [authGuard], canMatch: [authGuard] },
	{ path: 'solicitudes', component: SolicitudesComponent },
	{ path: 'relaciones', component: RelacionesComponent},
	{ path: 'mensajes', component: MensajesComponent},

	{ path: '', redirectTo: '/mis-citas', pathMatch: 'full' },
	{ path: '**', redirectTo: '/mis-citas' } 
];