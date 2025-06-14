import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MensajesService } from '../../../services/mensajes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { Usuario, usuarioVacio } from '../../../interfaces/usuario.interface';
import { CargandoService } from '../../../services/cargando.service';
import { DatosService } from '../../../services/datos.service';
import { Router } from '@angular/router';

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
    this.scroll.debeHacer = true;
    this.cdr.detectChanges();
  }
  mensaje: string = '';

  usuario = {
    actual: this.datosService.user.id,
    receptor: usuarioVacio
  };

  paginacion = {
    offset: 0,
    limit: 30,
    cargadosCompletos: false,
    cargandoMas: false
  };

  scroll = {
    debeHacer: false
  };

  @ViewChild('mensajesContainer') contenedorMensajes!: ElementRef;

  constructor(
    private mensajesService: MensajesService,
    private ruta: ActivatedRoute,
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef,
    public cargandoService: CargandoService,
    public datosService: DatosService,
    private router : Router
  ) {}

  ngAfterViewInit(): void {
    this.scroll.debeHacer = true;
  }

  ngAfterViewChecked(): void {
    if (this.scroll.debeHacer) {
      this.scrollAlFinal();
      this.scroll.debeHacer = false;
    }
  }

  ngOnInit(): void {
    if(this.router.url.endsWith('/mensajes')){
      document.documentElement.style.setProperty('--restar', '0px')
    }else{
      document.documentElement.style.setProperty('--restar', '20vh')
    }

    this.ruta.params.subscribe((params) => {
      this.usuario.receptor.username = params['username'];
    });
    this.usuariosService.datosUsername(this.usuario.receptor.username).subscribe((response) => {
      this.usuario.receptor = response.user;
      this.mensajesService.conectar(this.usuario.actual);
      // Marcar mensajes como leídos al abrir el chat
      this.mensajesService.marcarMensajesLeidos(this.usuario.receptor.id).subscribe();
      this.cargarMensajesInicial();
    });
    this.mensajesService.recibirMensajes().subscribe((mensaje: any) => {
      this.mensajes = [...this.mensajes, mensaje]; 
    })
  }

  cargarMensajesInicial() {
    this.paginacion.cargadosCompletos = false;
    this.paginacion.cargandoMas = false;
    this.mensajesService.cargarMensajes(this.usuario.receptor.id, this.paginacion.limit, this.paginacion.offset)
      .subscribe((mensajesCargados: MensajeCargado[]) => {
        this.mensajes = mensajesCargados;
        this.cargandoService.ocultarCargando();
        if (mensajesCargados.length < this.paginacion.limit) {
          this.paginacion.cargadosCompletos = true;
        }
      });
  }

  cargarMasMensajes() {
    if (this.paginacion.cargadosCompletos || this.paginacion.cargandoMas) return;
    this.paginacion.cargandoMas = true;
    // Guardar posición actual del scroll antes de cargar más
    const contenedor = this.contenedorMensajes?.nativeElement;
    console.log(contenedor)
    const scrollAntes = contenedor ? contenedor.scrollHeight - contenedor.scrollTop : 0;
    this.mensajesService.cargarMensajes(this.usuario.receptor.id, this.paginacion.limit, this.paginacion.offset + this.paginacion.limit)
      .subscribe((mensajesCargados: MensajeCargado[]) => {
        if (mensajesCargados.length < this.paginacion.limit) {
          this.paginacion.cargadosCompletos = true;
        }
        this._mensajes = [...mensajesCargados, ...this._mensajes];
        this.paginacion.offset += this.paginacion.limit;
        this.paginacion.cargandoMas = false;
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
    if (el.scrollTop < 400 && !this.paginacion.cargadosCompletos && !this.paginacion.cargandoMas) {
      this.cargarMasMensajes();
      console.log("llamar")
    }
  }

  enviarMensaje(): void {
    if (this.mensaje.trim()) {
      this.mensajesService.enviarMensaje(this.usuario.actual, this.usuario.receptor.id, this.mensaje);
      this.mensajes = [
        ...this.mensajes,
        {
          emisor_id: this.usuario.actual,
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
