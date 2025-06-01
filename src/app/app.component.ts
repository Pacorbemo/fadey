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
import { BuscadorComponent } from './shared/buscador/buscador.component';
import { CommonModule } from '@angular/common';
import { NotificacionesComponent } from './shared/notificaciones/notificaciones.component';
import { UploadsPipe } from './pipes/uploads.pipe';
import { HttpService } from './services/http.service';

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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  @ViewChild(BuscadorComponent) buscadorComponent!: BuscadorComponent;
  @ViewChild('menu') menuRef!: ElementRef;

  menuAbierto: boolean = false;

  constructor(
    public datosService: DatosService,
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.datosService.tokenUsuario = localStorage.getItem('token') || '';
    this.datosService.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.httpService.httpGetToken('/usuarios').subscribe({
      next: (response: any) => {
        this.datosService.user = response;
        localStorage.setItem('user', JSON.stringify(response));
      },
      error: (error) => {
        console.error('Error al cargar el usuario:', error);
        this.router.navigate(['/inicio-sesion']);
      },
    });
  }

  paginaPrincipal(): boolean {
    return this.router.url == '/';
  }

  logout(): void {
    localStorage.clear();
    this.datosService.tokenUsuario = '';
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
  }
}
