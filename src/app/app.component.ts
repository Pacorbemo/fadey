import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatosService } from './services/datos.service';
import { BuscadorComponent } from "./shared/buscador/buscador.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, BuscadorComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  @ViewChild(BuscadorComponent) buscadorComponent!: BuscadorComponent;
  
  title = 'Fadey';
  menuAbierto: boolean = false;

  constructor(
    public datosService: DatosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || '';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.datosService.tokenUsuario = token;
    this.datosService.user = user;
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

  @HostListener('document:click', ['$event'])
  cerrarMenu(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const user = document.querySelector('.user');
    const buscador = document.querySelector('.autocomplete-list');

    // Si el clic no es en el menú, cierra el menú
    if (user && !user.contains(target)) {
      this.menuAbierto = false;
    }
    
    // Si el clic no es en el buscador, cierra la lista de resultados
    if (buscador && !buscador.contains(target) && this.buscadorComponent) {
      this.buscadorComponent.limpiarResultados();
    }
  }
}
