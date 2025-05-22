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
import { ProductosComponent } from './components/productos/productos.component';
import { MisProductosComponent } from './components/mis-productos/mis-productos.component';

export const routes: Routes = [
  { path: 'crear-citas', component: CrearCitasComponent, canActivate: [authGuard] },
  { path: 'registro', component: RegisterComponent },
  { path: 'inicio-sesion', component: LoginComponent },
  {
    path: 'mis-citas',
    component: MisCitasComponent,
    canActivate: [authGuard],
    canMatch: [authGuard],
  },
  {
    path: 'mis-productos',
    component: MisProductosComponent,
    canActivate: [authGuard],
    canMatch: [authGuard],
  },
  { path: 'solicitudes', component: SolicitudesComponent, canActivate: [authGuard] },
  { path: 'relaciones', component: RelacionesComponent, canActivate: [authGuard] },
  { path: 'chats', component: ChatsComponent, canActivate: [authGuard] },
  { path: 'editar-perfil', component: EditarPerfilComponent, canActivate: [authGuard] },
  {
    path: ':username',
    canActivate: [usuarioExistenteGuard, authGuard],
    children: [
      { path: 'mensajes', component: MensajesComponent },
      { path: 'citas', component: CitasComponent },
      { path: 'productos', component: ProductosComponent },
      { path: '', component: PerfilComponent },
    ],
  },

  { path: '', component: PaginaPrincipalComponent, pathMatch: 'full', canActivate: [authGuard] },
  { path: '**', redirectTo: '/' },
];
