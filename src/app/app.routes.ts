import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

import { ReservarCitasComponent } from './components/citas/reservar-citas/reservar-citas.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { InicioSesionComponent } from './components/auth/inicio-sesion/inicio-sesion.component';
import { CrearCitasComponent } from './components/citas/crear-citas/crear-citas.component';
import { MisCitasComponent } from './components/citas/mis-citas/mis-citas.component';
import { SolicitudesComponent } from './components/relaciones/solicitudes/solicitudes.component';
import { RelacionesComponent } from './components/relaciones/relaciones.component';
import { MensajesComponent } from './components/mensajes/chat/mensajes.component';
import { ChatsComponent } from './components/mensajes/lista-chats/chats.component';
import { EditarPerfilComponent } from './components/perfil/editar-perfil/editar-perfil.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { usuarioExistenteGuard } from './guards/usuario-existente.guard';
import { PaginaPrincipalComponent } from './components/pagina-principal/pagina-principal.component';
import { ProductosComponent } from './components/productos/productos.component';
import { MisProductosComponent } from './components/productos/mis-productos/mis-productos.component';
import { usuarioNoLogeadoGuard } from './guards/usuario-no-logeado.guard';
import { VerificarEmailComponent } from './components/auth/verificar-email/verificar-email.component';
import { CambiarPasswordComponent } from './components/auth/cambiar-password/cambiar-password.component';
import { ConfirmarEliminacionComponent } from './components/auth/confirmar-eliminacion/confirmar-eliminacion.component';

export const routes: Routes = [
  { path: 'registro', component: RegisterComponent},
  { path: 'inicio-sesion', component: InicioSesionComponent, canActivate:[usuarioNoLogeadoGuard] },
  { path: 'crear-citas', component: CrearCitasComponent, canActivate: [authGuard] },
  {
    path: 'mis-citas',
    component: MisCitasComponent,
    canActivate: [authGuard],
  },
  {
    path: 'mis-productos',
    component: MisProductosComponent,
    canActivate: [authGuard],
  },
  { path: 'solicitudes', component: SolicitudesComponent, canActivate: [authGuard] },
  { path: 'relaciones', component: RelacionesComponent, canActivate: [authGuard] },
  { path: 'chats', component: ChatsComponent, canActivate: [authGuard] },
  { path: 'editar-perfil', component: EditarPerfilComponent, canActivate: [authGuard] },
  { path: 'verificar-email', component: VerificarEmailComponent },
  { path: 'cambiar-password', component: CambiarPasswordComponent, canActivate: [authGuard] },
  { path: 'recuperar-password', loadComponent: () => import('./components/auth/recuperar-password/recuperar-password.component').then(m => m.RecuperarPasswordComponent), canActivate:[usuarioNoLogeadoGuard]},
  { path: 'restablecer-password/:token', loadComponent: () => import('./components/auth/restablecer-password/restablecer-password.component').then(m => m.RestablecerPasswordComponent) },
  { path: 'confirmar-eliminacion', component: ConfirmarEliminacionComponent },
  {
    path: ':username',
    canActivate: [usuarioExistenteGuard, authGuard],
    children: [
      { path: 'mensajes', component: MensajesComponent },
      { path: 'citas', component: ReservarCitasComponent },
      { path: 'productos', component: ProductosComponent },
      { path: '', component: PerfilComponent },
    ],
  },
  { path: '', component: PaginaPrincipalComponent, pathMatch: 'full', canActivate: [authGuard] },
  { path: '**', redirectTo: '/' },
];
