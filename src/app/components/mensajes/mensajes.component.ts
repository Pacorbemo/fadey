import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MensajesService } from '../../services/mensajes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { CargandoService } from '../../services/cargando.service';
import { Usuario } from '../../interfaces/usuario';

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
  receptor: Usuario = { id: 0, nombre: '', username: '', foto_perfil: '' };
  @ViewChild('mensajesContainer') contenedorMensajes!: ElementRef;
  private debeHacerScroll = false;
  constructor(
    private mensajesService: MensajesService,
    private ruta: ActivatedRoute,
    private usuariosService: UsuariosService,
    public cargandoService: CargandoService,
    private cdr: ChangeDetectorRef
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
    this.usuariosService.datosUsername(this.receptor.username).subscribe((usuario) => {
      this.receptor = usuario;
      this.mensajesService.conectar(this.usuarioActual);
      this.mensajesService.cargarMensajes(this.usuarioActual, this.receptor.id).subscribe((mensajesCargados: MensajeCargado[]) => {
        this.mensajes = mensajesCargados;
        this.cargandoService.cargando = false;
      });
    });
    this.mensajesService.recibirMensajes().subscribe((mensaje: any) => {
      this.mensajes = [...this.mensajes, mensaje]; 
    })
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
