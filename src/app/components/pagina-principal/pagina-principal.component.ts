import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from './card/card.component';
import { BuscadorService } from '../shared/buscador/buscador.service';
import { CommonModule } from '@angular/common';
import { CargandoService } from '../../services/cargando.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [FormsModule, CardComponent, CommonModule],
  templateUrl: './pagina-principal.component.html',
  styleUrl: './pagina-principal.component.css',
})
export class PaginaPrincipalComponent implements OnInit {
  constructor(public buscadorService: BuscadorService, public cargandoService: CargandoService, private usuariosService : UsuariosService) {}

  ngOnInit(): void {
    this.buscadorService.getRandomUsuarios();
  }

  ngOnDestroy(): void {
    this.buscadorService.limpiarBuscador();
    this.buscadorService.limpiarResultados();
  }

  inputLetra(){
    if(this.buscadorService.buscador != this.buscadorService.buscador.trim()){
      return;
    }
    this.buscadorService.buscador = this.buscadorService.buscador.trim();
    if(this.buscadorService.buscador.length == 0){
      this.buscadorService.resultados = this.buscadorService.resultadosAleatorios;
    }
    else{
      this.buscadorService.buscarUsuarios();
    }
  }
}
