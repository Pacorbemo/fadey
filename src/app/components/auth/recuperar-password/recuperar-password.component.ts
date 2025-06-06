import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css'],
  imports: [FormsModule]
})
export class RecuperarPasswordComponent {
  email: string = '';
  enviado: boolean = false;
  error: string = '';

  constructor(private http: HttpService) {}

  enviarInstrucciones() {
    this.error = '';
    this.enviado = false;
    this.http.post(`/usuarios/recuperar-password`, { email: this.email }, true)
      .subscribe({
        next: (res) => {
          this.enviado = true;
          this.error = '';
        },
        error: (err) => {
          this.error = err.error?.error || 'Error enviando el email. Inténtalo de nuevo más tarde.';
        }
      });
  }
}
