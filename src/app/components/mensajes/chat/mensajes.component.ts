import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MensajesService } from '../../../services/mensajes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
 import { Usuario, usuarioVacio } from '../../../interfaces/usuario.interface';
import { CargandoService } from '../../../services/cargando.service';

interface MensajeCargado{
  emisor_id:number,
  mensaje: string,
  receptor_id: number,
  fecha_envio: Date,
  id: number,
  leido: boolean,
}

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class MensajesComponent implements OnInit, AfterViewInit, AfterViewChecked {
  private _mensajes: any[] = [];
  get mensajes(): any[] {
    return this._mensajes;
  }
  set mensajes(valor: any[]) {
    this._mensajes = valor;
    this.debeHacerScroll = true;
    this.cdr.detectChanges();
  }
  mensaje: string = '';
  usuarioActual: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);
  receptor: Usuario = usuarioVacio;
  @ViewChild('mensajesContainer') contenedorMensajes!: ElementRef;
  private debeHacerScroll = false;
  mensajesPaginadosOffset: number = 0;
  mensajesPaginadosLimit: number = 30;
  mensajesCargadosCompletos: boolean = false;
  cargandoMasMensajes: boolean = false;

  constructor(
    private mensajesService: MensajesService,
    private ruta: ActivatedRoute,
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef,
    private cargandoService: CargandoService
  ) {}

  ngAfterViewInit(): void {
    this.debeHacerScroll = true;
  }

  ngAfterViewChecked(): void {
    if (this.debeHacerScroll) {
      this.scrollAlFinal();
      this.debeHacerScroll = false;
    }
  }

  ngOnInit(): void {
    this.ruta.params.subscribe((params) => {
      this.receptor.username = params['username'];
    });
    this.usuariosService.datosUsername(this.receptor.username).subscribe((response) => {
      this.receptor = response.user;
      this.mensajesService.conectar(this.usuarioActual);
      // Marcar mensajes como leídos al abrir el chat
      this.mensajesService.marcarMensajesLeidos(this.receptor.id).subscribe();
      this.cargarMensajesInicial();
    });
    this.mensajesService.recibirMensajes().subscribe((mensaje: any) => {
      this.mensajes = [...this.mensajes, mensaje]; 
    })
  }

  cargarMensajesInicial() {
    this.mensajesCargadosCompletos = false;
    this.cargandoMasMensajes = false;
    this.mensajesService.cargarMensajes(this.receptor.id, this.mensajesPaginadosLimit, this.mensajesPaginadosOffset)
      .subscribe((mensajesCargados: MensajeCargado[]) => {
        this.mensajes = mensajesCargados;
        if (mensajesCargados.length < this.mensajesPaginadosLimit) {
          this.mensajesCargadosCompletos = true;
        }
        this.cargandoService.ocultarCargando();
      });
  }

  cargarMasMensajes() {
    if (this.mensajesCargadosCompletos || this.cargandoMasMensajes) return;
    this.cargandoMasMensajes = true;
    // Guardar posición actual del scroll antes de cargar más
    const contenedor = this.contenedorMensajes?.nativeElement;
    const scrollAntes = contenedor ? contenedor.scrollHeight - contenedor.scrollTop : 0;
    this.mensajesService.cargarMensajes(this.receptor.id, this.mensajesPaginadosLimit, this.mensajesPaginadosOffset + this.mensajesPaginadosLimit)
      .subscribe((mensajesCargados: MensajeCargado[]) => {
        if (mensajesCargados.length < this.mensajesPaginadosLimit) {
          this.mensajesCargadosCompletos = true;
        }
        this._mensajes = [...mensajesCargados, ...this._mensajes];
        this.mensajesPaginadosOffset += this.mensajesPaginadosLimit;
        this.cargandoMasMensajes = false;
        setTimeout(() => {
          if (contenedor) {
            contenedor.scrollTop = contenedor.scrollHeight - scrollAntes;
          }
        });
        this.cargandoService.ocultarCargando();
      });
  }

  onScrollMensajes(event: any) {
    const el = event.target;
    if (el.scrollTop < 80 && !this.cargandoMasMensajes && !this.mensajesCargadosCompletos) {
      this.cargarMasMensajes();
    }
  }

  enviarMensaje(): void {
    if (this.mensaje.trim()) {
      this.mensajesService.enviarMensaje(this.usuarioActual, this.receptor.id, this.mensaje);
      this.mensajes = [
        ...this.mensajes,
        {
          emisor_id: this.usuarioActual,
          mensaje: this.mensaje,
          fecha_envio: new Date(),
        }
      ];
      this.mensaje = '';
    }
  }

  mensajesAgrupadosPorDia(): { fecha: string, mensajes: any[] }[] {
    if (!this.mensajes || this.mensajes.length === 0) return [];
    const grupos: { [fecha: string]: any[] } = {};
    for (const mensaje of this.mensajes) {
      const fecha = new Date(mensaje.fecha_envio).toLocaleDateString();
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(mensaje);
    }
    return Object.entries(grupos).map(([fecha, mensajes]) => ({ fecha, mensajes }));
  }

  scrollAlFinal(): void {
    if (this.contenedorMensajes) {
      const el = this.contenedorMensajes.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
