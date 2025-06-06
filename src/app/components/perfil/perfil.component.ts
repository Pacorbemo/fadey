import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { DatosService } from '../../services/datos.service';
import { BehaviorSubject } from 'rxjs';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { RelacionesService } from '../../services/relaciones.service';
import { UploadsPipe } from '../../pipes/uploads.pipe';
import { Usuario, usuarioVacio } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterModule, NgComponentOutlet, CapitalizePipe, UploadsPipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  user: Usuario = usuarioVacio;

  component$ = new BehaviorSubject<any>(null);
  usuarioAutorizado: boolean = false;
  relacionActual: string = '';

  constructor(
    private route: ActivatedRoute,
    private usuariosServices: UsuariosService,
    public datosService: DatosService,
    private relacionesService: RelacionesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: { [key: string]: string }) => {
        this.user.username = params['username'];
        this.usuariosServices.datosUsername(this.user.username).subscribe({
          next: (response) => {
            this.user = response;
            if (this.user.username == this.datosService.user.username) {
              this.usuarioAutorizado = true;
              this.loadComponent('citas');
            } else {
              this.relacionesService.comprobarRelacion(this.user.id).subscribe({
                next: relacionResponse => {
                  this.usuarioAutorizado = relacionResponse.relacion == 'aceptado';
                  this.relacionActual = relacionResponse.relacion;
                  if (this.usuarioAutorizado) {
                    this.loadComponent('citas');
                  }
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
      },
      error: (error) => {
        console.error('Error al solicitar relación:', error);
      }
    });
  }
}
