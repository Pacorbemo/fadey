import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DatosService } from './services/datos.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Fadey';

  constructor(
    public datosService: DatosService,
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || '';
    const username = JSON.parse(localStorage.getItem('user') || '{}').username;
    this.datosService.tokenUsuario = token;
    this.datosService.username = username;
  }
}
