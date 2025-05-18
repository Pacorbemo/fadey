import { Component, OnInit } from '@angular/core';
import { MensajesService } from '../../services/mensajes.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Chat {
  usuario_id: number;
  ultima_fecha: Date;
  username: string;
  ultimo_mensaje: string;
  foto_perfil: string;
}

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent implements OnInit{

  chats: Chat[] = [];

  constructor(private mensajesService: MensajesService) {}
    
  ngOnInit(): void {
    this.mensajesService.cargarChats().subscribe((chats: Chat[]) => {
      this.chats = chats;
      console.log(chats)
    });
  }

  trackByIdx(index: number, item: Chat): number {
    return index;
  }
}
