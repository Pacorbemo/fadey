import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verificar-email',
  templateUrl: './verificar-email.component.html',
  styleUrls: ['./verificar-email.component.css']
})
export class VerificarEmailComponent implements OnInit {
  estado: 'verificando' | 'exito' | 'error' = 'verificando';
  mensaje: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.estado = 'error';
        this.mensaje = 'Token de verificación no proporcionado.';
        return;
      }
      this.http.get(`/usuarios/verificar-email/${token}`).subscribe({
        next: (res: any) => {
          this.estado = 'exito';
          this.mensaje = '¡Email verificado correctamente! Ya puedes usar todas las funciones de tu cuenta.';
        },
        error: (err) => {
          this.estado = 'error';
          this.mensaje = err?.error?.error || 'Error al verificar el email.';
        }
      });
    });
  }
}
