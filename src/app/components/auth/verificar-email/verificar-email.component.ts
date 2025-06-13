import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CargandoComponent } from '../../shared/cargando/cargando.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-verificar-email',
  templateUrl: './verificar-email.component.html',
  styleUrls: ['./verificar-email.component.css'],
  imports: [CargandoComponent, RouterLink],
})
export class VerificarEmailComponent implements OnInit {
  verificando: boolean = true;
  mensaje: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.toastService.error('Token de verificación no proporcionado.', -1);
        this.verificando = false;
        return;
      }
      this.http.get(`/usuarios/verificar-email/${token}`).subscribe({
        next: (res: any) => {
          this.toastService.mostrar(res, 8000);
        },
        error: (err) => {
          this.toastService.error(err, 8000);
        },
        complete: () => {
          this.verificando = false;
          setTimeout(() => {
            this.router.navigate(['/editar-perfil']);
          }, 8000);
        }
      });
    });
  }
}
