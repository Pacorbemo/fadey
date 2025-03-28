import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private usuariosService: UsuariosService) {}

  iniciarSesion(): void {
    const credenciales = {
      username: this.username,
      password: this.password,
    };

    this.usuariosService.login(credenciales).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        alert('Inicio de sesión exitoso');
      },
      (error) => {
        alert('Error al iniciar sesión');
      }
    );
  }
}