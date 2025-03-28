import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [ FormsModule ],
})
export class RegisterComponent {
  username: string = '';
  nombre: string = '';
  email: string = '';
  telefono: string = '';
  barbero: boolean = true;
  password: string = '';
  confirmPassword: string = '';

  esCliente:boolean = !this.barbero;

  constructor(private usuariosService: UsuariosService) {}


  registrarUsuario(): void {
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const usuario = {
      username: this.username,
      nombre: this.nombre,
      email: this.email,
      barbero: this.barbero,
      telefono: this.telefono,
      password: this.password
    };

    this.usuariosService.registrar(usuario).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        alert('Registro exitoso');
      },
      (error) => {
        alert('Error al registrar usuario');
      }
    );
  }
}