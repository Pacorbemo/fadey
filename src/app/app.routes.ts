import { Routes } from '@angular/router';
import { CitasComponent } from './components/citas/citas.component';
import { RegisterComponent } from './components/register/register.component';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
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
import { usuarioNoLogeadoGuard } from './guards/usuario-no-logeado.guard';
import { VerificarEmailComponent } from './components/verificar-email/verificar-email.component';
import { CambiarPasswordComponent } from './components/cambiar-password/cambiar-password.component';

export const routes: Routes = [
  { path: 'registro', component: RegisterComponent, canActivate:[usuarioNoLogeadoGuard] },
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
