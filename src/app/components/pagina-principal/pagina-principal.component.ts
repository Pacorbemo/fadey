import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from './card/card.component';
import { BuscadorService } from '../../shared/buscador/buscador.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [FormsModule, CardComponent, RouterLink, CommonModule],
  templateUrl: './pagina-principal.component.html',
  styleUrl: './pagina-principal.component.css'
})
export class PaginaPrincipalComponent {
  constructor(public buscadorService: BuscadorService) {
    this.buscadorService.buscador = 'cor';
    this.buscadorService.buscarUsuarios();
    setTimeout(() => { 
    for(let i = 0; i< 15; i++){
      this.buscadorService.resultados.push(this.buscadorService.resultados[0])
    }}, 500);
  }

    chunkArray(array: any[], size1: number, size2: number): any[][] {
    if (!array || size1 <= 0 || size2 <= 0) {
      return [];
    }
  
    const result = [];
    let toggle = true; // Alterna entre size1 y size2
    let i = 0;
  
    while (i < array.length) {
      const chunkSize = toggle ? size1 : size2; // Alterna entre los dos tamaños
      result.push(array.slice(i, i + chunkSize));
      i += chunkSize;
      toggle = !toggle; // Cambia el tamaño para la siguiente iteración
    }
  
    return result;
  }
}
