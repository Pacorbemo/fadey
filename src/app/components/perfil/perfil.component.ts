import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  user: { foto_perfil: string; username: string; nombre: string } = { foto_perfil: '', username: '', nombre: '' };

  constructor(private route: ActivatedRoute, private usuariosServices: UsuariosService) {}

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe((params: { [key: string]: string }) => {
      this.user.username = params['username'];
      this.usuariosServices.datosUsername(this.user.username).subscribe((response: { foto_perfil: string; username: string; nombre: string, id:number }) => {
        this.user = response
      });
    });
  }
}