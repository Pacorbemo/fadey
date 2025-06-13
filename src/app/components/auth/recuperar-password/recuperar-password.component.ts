import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { ToastService } from '../../../services/toast.service';
import { ValidacionesService } from '../../../services/validaciones.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css'],
  imports: [FormsModule],
})
export class RecuperarPasswordComponent {
  email: string = '';

  constructor(private http: HttpService, private toastService: ToastService, private validacionesService: ValidacionesService ) {}

  desactivarBoton (): boolean {
    return !!this.validacionesService.validarEmail(this.email);
  }

  enviarInstrucciones(): void {
    this.http
      .post(`/usuarios/recuperar-password`, { email: this.email }, true)
      .subscribe({
        next: (res) => {
          this.toastService.mostrar(res);
        },
        error: (err) => {
          this.toastService.error(err);
        },
      });
  }
}
