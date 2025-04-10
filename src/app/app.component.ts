import { Component, OnInit } from '@angular/core';
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
  title = 'Fadey';

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

  logout(): void{
    localStorage.clear();
    this.datosService.tokenUsuario = "";
    this.datosService.limpiarUser();
    this.router.navigate(['/inicio-sesion']);
  }
}
