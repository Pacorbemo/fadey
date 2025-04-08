import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatosService } from './services/datos.service';
import { BuscadorComponent } from "./shared/buscador/buscador.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, BuscadorComponent],
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
    const username = JSON.parse(localStorage.getItem('user') || '{}').username;
    this.datosService.tokenUsuario = token;
    this.datosService.username = username;
  }

  logout(): void{
    localStorage.clear();
    this.datosService.tokenUsuario = "";
    this.datosService.username = ""
    this.router.navigate(['/inicio-sesion']);
  }
}
