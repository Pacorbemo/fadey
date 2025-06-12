import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { FormsModule } from '@angular/forms';
import { UploadsPipe } from '../../pipes/uploads.pipe';
import { ToastComponent } from '../shared/toast/toast.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, UploadsPipe, ToastComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  usernameBarbero : string = '';
  productos: { id: number; nombre: string; descripcion: string; precio: string; stock: number; foto: string, reservaCantidad: number }[] = [];

  constructor(private route: ActivatedRoute, private httpService: HttpService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: params => {
        this.usernameBarbero = params['username'];
        this.httpService.getToken('/productos/barbero/' + this.usernameBarbero).subscribe({
          next: (response) => {
            this.productos = response.map((producto: {id: number; nombre: string; descripcion: string; precio: string; stock: number; foto: string}) => ({
              ...producto,
              reservaCantidad: 1
            }));
          }
        });
      }
    });
  }

  reservarProducto(producto: { id: number; nombre: string; descripcion: string; precio: string; stock: number; foto: string, reservaCantidad: number }) {
    if (producto.reservaCantidad > 0) {
      this.httpService.postToken('/productos/reservar', { idProducto: producto.id, cantidad: producto.reservaCantidad }).subscribe({
        next: (response) => {
          console.log('Reserva realizada:', response);
          producto.stock -= producto.reservaCantidad;
          producto.reservaCantidad = 0;
        },
        error: (error) => {
          this.toastService.mostrar(error);
        }
      });
    } else {
      this.toastService.mostrar('No se ha seleccionado ninguna cantidad para reservar.');
    }
  }
}
