import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgComponentOutlet, CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { DatosService } from '../../services/datos.service';
import { BehaviorSubject } from 'rxjs';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { RelacionesService } from '../../services/relaciones.service';
import { UploadsPipe } from '../../pipes/uploads.pipe';
import { Usuario, usuarioVacio } from '../../interfaces/usuario.interface';
import { CargandoService } from '../../services/cargando.service';
import { CargandoComponent } from '../shared/cargando/cargando.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterModule, NgComponentOutlet, CapitalizePipe, UploadsPipe, CommonModule, CargandoComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  user: Usuario = usuarioVacio;

  component$ = new BehaviorSubject<any>(null);
  usuarioAutorizado: boolean = false;
  relacionActual: string = '';

  cargandoLocal: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private usuariosServices: UsuariosService,
    public datosService: DatosService,
    private relacionesService: RelacionesService,
    public cargandoService: CargandoService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: { [key: string]: string }) => {
        this.user.username = params['username'];
        this.usuariosServices.datosUsername(this.user.username).subscribe({
          next: (response) => {
            this.user = response.user;
            if (this.user.username == this.datosService.user.username) {
              this.usuarioAutorizado = true;
              this.loadComponent('citas');
              this.cargandoLocal = false;
            } else {
              this.relacionesService.comprobarRelacion(this.user.id).subscribe({
                next: relacionResponse => {
                  this.usuarioAutorizado = relacionResponse.relacion == 'aceptado';
                  this.relacionActual = relacionResponse.relacion;
                  if (this.usuarioAutorizado) {
                    this.loadComponent('citas');
                  }
                  this.cargandoLocal = false;
                }
              });
            }
          }
        });
      }
    });
  }

  mapaComponentes: { [key: string]: () => Promise<any> } = {
    citas: () =>
      import('../citas/reservar-citas/reservar-citas.component').then((m) => m.ReservarCitasComponent),
    mensajes: () =>
      import('../mensajes/chat/mensajes.component').then((m) => m.MensajesComponent),
    productos: () =>
      import('../productos/productos.component').then(
        (m) => m.ProductosComponent
      ),
  };

  async loadComponent(nombre: string) {
    const component = await this.mapaComponentes[nombre]();
    this.component$.next(component);
  }

  getMapaComponentesEntries(): string[] {
    return Object.keys(this.mapaComponentes);
  }

  solicitar(usernameBarbero: string): void {
    this.relacionesService.solicitar(usernameBarbero).subscribe({
      next: () => {
        this.relacionActual = 'pendiente';
        this.toastService.mostrar('Solicitud enviada correctamente.');
      },
      error: (error) => {
        this.toastService.error(error);
      }
    });
  }
}
