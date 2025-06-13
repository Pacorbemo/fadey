import { Component, OnInit } from '@angular/core';
import { MensajesService } from '../../../services/mensajes.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environments';
import { UploadsPipe } from '../../../pipes/uploads.pipe';
import { CargandoComponent } from '../../shared/cargando/cargando.component';
import { CargandoService } from '../../../services/cargando.service';

interface Chat {
  usuario_id: number;
  ultima_fecha: Date;
  username: string;
  ultimo_mensaje: string;
  foto_perfil: string;
  no_leidos?: number;
}

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, RouterLink, UploadsPipe, CargandoComponent],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent implements OnInit{

  chats: Chat[] = [];
  public environment = environment;

  constructor(private mensajesService: MensajesService, public cargandoService: CargandoService) {}
    
  ngOnInit(): void {
    this.mensajesService.cargarChats().subscribe((chats: Chat[]) => {
      this.chats = chats;
      this.cargandoService.ocultarCargando();
    });
  }

  hoy(date: string | Date): boolean {
    const d = new Date(date);
    const today = new Date();
    return d.toLocaleDateString() === today.toLocaleDateString()
  }
}
