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
import { ChatsComponent } from './components/chats/chats.component';
import { EditarPerfilComponent } from './components/editar-perfil/editar-perfil.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { usuarioExistenteGuard } from './guards/usuario-existente.guard';
import { PaginaPrincipalComponent } from './components/pagina-principal/pagina-principal.component';

export const routes: Routes = [
	{ path: 'crear-citas', component: CrearCitasComponent},
	{ path: 'registro', component: RegisterComponent },
	{ path: 'inicio-sesion', component: LoginComponent },
	{ path: 'mis-citas', component: MisCitasComponent, canActivate: [authGuard], canMatch: [authGuard] },
	{ path: 'solicitudes', component: SolicitudesComponent },
	{ path: 'relaciones', component: RelacionesComponent},
	{ path: 'chats', component: ChatsComponent},
	{ path: 'editar-perfil', component: EditarPerfilComponent},
	{
		path: ':username',
		canActivate: [usuarioExistenteGuard],
		children: [
		  { path: 'citas', component: CitasComponent },
		  { path: 'mensajes', component: MensajesComponent },
		  { path: '', component: PerfilComponent},
		],
	},
	
	{ path: '', component:PaginaPrincipalComponent, pathMatch: 'full' },
	{ path: '**', redirectTo: '/mis-citas' } 
];