import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-mis-productos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mis-productos.component.html',
  styleUrl: './mis-productos.component.css',
})
export class MisProductosComponent {
  producto: {
    [key: string]: any;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    foto: File | null;
  } = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    foto: null,
  };
  productos: Producto[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Arreglo con los campos que se pueden editar
  campos = [
    { field: 'nombre', label: 'Nombre', type: 'text', colClass: 'col-1' },
    {
      field: 'descripcion',
      label: 'Descripción',
      type: 'text',
      colClass: 'col-2',
    },
    { field: 'precio', label: 'Precio', type: 'number', colClass: 'col-3' },
    { field: 'stock', label: 'Stock', type: 'number', colClass: 'col-4' },
  ];

  editingCell: { id: number; field: string } | null = null;

  constructor(
    private httpService: HttpService,
    private datosService: DatosService
  ) {}

  ngOnInit(): void {
    this.httpService
      .httpGetToken(`/productos/barbero/${this.datosService.user.username}`)
      .subscribe(
        (response) => {
          this.productos = response;
        },
        (error) => {
          console.error('Error al obtener los productos:', error);
        }
      );
  }

  urlImagen(): string {
    return URL.createObjectURL(this.producto.foto as Blob);
  }

  seleccionarImagen(event: any): void {
    this.producto.foto = event.target.files[0];
  }

  seleccionarCambioImagen(event: any): void {
    event.preventDefault();
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('foto', file);
    this.httpService
      .httpPutToken(`/productos/${this.editingCell?.id}`, formData)
      .subscribe(
        (response) => {
          if (response.foto_url) {
            const producto = this.productos.find(
              (p) => p.id === this.editingCell!.id
            );
            if (producto) {
              producto.foto = response.foto_url;
            }
          }
          this.editingCell = null;
        },
        (error) => {
          console.error('Error al actualizar el producto:', error);
        }
      );
  }

  eliminarImagen(event: any): void {
    event.preventDefault();
    this.producto.foto = null;
    const fileInput = this.fileInput.nativeElement as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Limpiar el valor del input de archivo
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.producto.foto = file;
      event.dataTransfer.clearData();
    }
  }

  subirProducto() {
    const formData = new FormData();
    formData.append('nombre', this.producto.nombre);
    formData.append('descripcion', this.producto.descripcion);
    formData.append('precio', this.producto.precio.toString());
    formData.append('stock', this.producto.stock.toString());
    if (this.producto.foto) {
      formData.append('foto', this.producto.foto);
    }

    this.httpService.httpPostToken('/productos', formData).subscribe(
      (response) => {
        console.log('Producto subido correctamente:', response);
        alert('Producto subido correctamente');
      },
      (error) => {
        console.error('Error al subir el producto:', error);
        alert('Error al subir el producto');
      }
    );
    console.log('Producto subido:', this.producto);
  }

  editCell(producto: Producto, field: string): void {
    this.editingCell = { id: producto.id, field };
    setTimeout(() => {
      const input = document.getElementById(`input-${producto.id}-${field}`);
      if (input) {
        input.focus();
      }
    }, 0);
  }

  finishEditCell(): void {
    if (this.editingCell) {
      const { id, field } = this.editingCell;
      const producto = this.productos.find((p) => p.id === id);
      if (producto) {
        const input = document.getElementById(
          `input-${id}-${field}`
        ) as HTMLInputElement;
        if (input) {
          producto[field] = input.value;
          this.httpService
            .httpPutToken(`/productos/${id}`, { [field]: producto[field] })
            .subscribe(
              (response) => {
                console.log('Producto actualizado correctamente:', response);
              },
              (error) => {
                console.error('Error al actualizar el producto:', error);
              }
            );
        }
      }
    }
    this.editingCell = null;
  }
}

interface Producto {
  [key: string]: any;
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  foto: string | null;
}
