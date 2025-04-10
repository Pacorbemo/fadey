import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { DatosService } from '../../services/datos.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, RouterLink],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private usuariosService: UsuariosService,
    private datosService: DatosService,
    private router: Router
  ) {}

  iniciarSesion(): void {
    const credenciales = {
      username: this.username,
      password: this.password,
    };

    this.usuariosService.login(credenciales).subscribe(
      (response) => {
        this.datosService.tokenUsuario = response.token;
        this.datosService.user = response.user;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.router.navigate(["/mis-citas"]);
      },
      (error) => {
        alert('Error al iniciar sesión');
      }
    );
  }
}