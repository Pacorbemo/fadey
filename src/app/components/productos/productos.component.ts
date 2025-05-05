import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  usernameBarbero : string = '';
  productos: { id: number; nombre: string; descripcion: string; precio: string; stock: number; foto: string, reservaCantidad: number }[] = [];


  constructor(private route: ActivatedRoute, private httpService: HttpService) { }

  async ngOnInit(): Promise<void> {
    await this.route.params.subscribe(params => {
      this.usernameBarbero = params['username'];
    })
    await this.httpService.httpGetToken('/productos/barbero/' + this.usernameBarbero).subscribe((response) => {
      this.productos = response.map((producto: {id: number; nombre: string; descripcion: string; precio: string; stock: number; foto: string}) => ({
        ...producto,
        reservaCantidad: 1
      }));
    })
  }

  reservarProducto(producto: { id: number; nombre: string; descripcion: string; precio: string; stock: number; foto: string, reservaCantidad: number }) {
    if (producto.reservaCantidad > 0) {
      this.httpService.httpPostToken('/productos/reservar', { idProducto: producto.id, cantidad: producto.reservaCantidad }).subscribe((response) => {
        console.log('Reserva realizada:', response);
        producto.stock -= producto.reservaCantidad;
        producto.reservaCantidad = 0;
      });
    } else {
      console.log('No se ha seleccionado ninguna cantidad para reservar.');
    }
  }
}
