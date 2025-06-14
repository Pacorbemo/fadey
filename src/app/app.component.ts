import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { DatosService } from './services/datos.service';
import { BuscadorComponent } from './components/shared/buscador/buscador.component';
import { CommonModule } from '@angular/common';
import { NotificacionesComponent } from './components/shared/notificaciones/notificaciones.component';
import { UploadsPipe } from './pipes/uploads.pipe';
import { HttpService } from './services/http.service';
import { ToastComponent } from './components/shared/toast/toast.component';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BuscadorComponent,
    NotificacionesComponent,
    CommonModule,
    UploadsPipe,
    ToastComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  @ViewChild(BuscadorComponent) buscadorComponent!: BuscadorComponent;
  @ViewChild('menu') menuRef!: ElementRef;
  @ViewChild('burguer') burguerRef!: ElementRef;

  menuAbierto: boolean = false;
  burguerAbierto = false;

  constructor(
    public datosService: DatosService,
    private router: Router,
    private httpService: HttpService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if(this.datosService.tokenUsuario) {
      this.httpService.getToken('/usuarios').subscribe({
        next: (response: any) => {
          this.datosService.user = response;
        },
        error: (error: any) => {
          this.toastService.error(error);
          this.router.navigate(['/inicio-sesion'])
        },
      });
    }
  }

  paginaPrincipal(): boolean {
    return this.router.url == '/';
  }

  logout(): void {
    this.datosService.limpiarUser();
    this.router.navigate(['/inicio-sesion']);
  }

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.menuAbierto &&
      this.menuRef &&
      !this.menuRef.nativeElement.contains(event.target)
    ) {
      this.menuAbierto = false;
    }
    if( this.burguerAbierto && this.burguerRef && !this.burguerRef.nativeElement.contains(event.target)) {
      this.burguerAbierto = false;
    }
  }
}
