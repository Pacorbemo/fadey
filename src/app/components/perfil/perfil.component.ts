import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { DatosService } from '../../services/datos.service';
import { BehaviorSubject } from 'rxjs';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterModule, NgComponentOutlet, CapitalizePipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  user: { foto_perfil: string; username: string; nombre: string } = {
    foto_perfil: '',
    username: '',
    nombre: '',
  };

  component$ = new BehaviorSubject<any>(null);

  constructor(
    private route: ActivatedRoute,
    private usuariosServices: UsuariosService,
    public datosService: DatosService
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe((params: { [key: string]: string }) => {
      this.user.username = params['username'];
      this.usuariosServices
        .datosUsername(this.user.username)
        .subscribe(
          (response: {
            foto_perfil: string;
            username: string;
            nombre: string;
            id: number;
          }) => {
            this.user = response;
          }
        );
    });
    this.loadComponent('citas');
  }

  mapaComponentes: { [key: string]: () => Promise<any> } = {
    citas: () =>
      import('../citas/citas.component').then((m) => m.CitasComponent),
    mensajes: () =>
      import('../mensajes/mensajes.component').then((m) => m.MensajesComponent),
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
}
