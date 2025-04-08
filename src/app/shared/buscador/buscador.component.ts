import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css'
})
export class BuscadorComponent {

  constructor(private router: Router){}

  navegar(ruta: string): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([ruta]);
    });
  }
}
