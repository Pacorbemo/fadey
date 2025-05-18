import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatosService } from './services/datos.service';
import { BuscadorComponent } from "./shared/buscador/buscador.component";
import { CommonModule } from '@angular/common';
import { BuscadorService } from './shared/buscador/buscador.service';
import { NotificacionesComponent } from './shared/notificaciones/notificaciones.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, BuscadorComponent, NotificacionesComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  @ViewChild(BuscadorComponent) buscadorComponent!: BuscadorComponent;
  
  menuAbierto: boolean = false;

  constructor(
    public datosService: DatosService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.datosService.tokenUsuario = localStorage.getItem('token') || '';
    this.datosService.user = JSON.parse(localStorage.getItem('user') || '{}');
  }

  paginaPrincipal(): boolean {
    return this.router.url == '/';
  }

  logout(): void {
    localStorage.clear();
    this.datosService.tokenUsuario = "";
    this.datosService.limpiarUser();
    this.router.navigate(['/inicio-sesion']);
  }

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }
}
