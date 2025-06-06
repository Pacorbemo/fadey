import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-restablecer-password',
  standalone: true,
  templateUrl: './restablecer-password.component.html',
  styleUrls: ['./restablecer-password.component.css'],
  imports: [FormsModule]
})
export class RestablecerPasswordComponent {
  password: string = '';
  passwordRepetir: string = '';
  mensaje: string = '';
  cambiando: boolean = false;
  private token: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
  }

  restablecerPassword() {
    if (this.password !== this.passwordRepetir) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }
    this.cambiando = true;
    this.mensaje = '';
    this.http.post(`/usuarios/restablecer-password/${this.token}`, { password: this.password })
      .subscribe({
        next: (res: any) => {
          this.mensaje = res.message || 'Contraseña restablecida correctamente.';
          this.cambiando = false;
          setTimeout(() => this.router.navigate(['/inicio-sesion']), 2000);
        },
        error: (err) => {
          this.mensaje = err.error?.error || 'Error al restablecer la contraseña.';
          this.cambiando = false;
        }
      });
  }
}
