import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { DatosService } from '../../services/datos.service';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-mis-productos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './mis-productos.component.html',
  styleUrl: './mis-productos.component.css',
  host: {
    '(drop)': 'handleDrop($event)', // En cualquier lugar del componente que se arrastre la imagen la aceptará
    '(dragover)': 'handleDragOver($event)',
  },
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

  pantallaSubject = new Subject<boolean>();
  productos: Producto[] = [];
  expandidos: number[] = [];
  reservados: { [id: number]: { cantidad: number; username: string }[] } = {};
  @ViewChild('fileInput') fileInput!: ElementRef;

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
  oscurecerPantalla = false;
  private arrastrando = false;

  constructor(
    private httpService: HttpService,
    private datosService: DatosService
  ) {
    this.pantallaSubject.pipe(debounceTime(30)).subscribe((oscurecer) => {
      this.oscurecerPantalla = oscurecer;
      console.log(oscurecer)
    });
  }

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
    this.httpService.httpGetToken(`/productos/reservados`).subscribe(
      (response) => {
        this.reservados = response;
      },
      (error) => {
        console.error('Error al obtener los productos reservados:', error);
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
      fileInput.value = '';
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.arrastrando) {
      this.arrastrando = true;
      this.pantallaSubject.next(true);
    }
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando = false;
    this.pantallaSubject.next(false);
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.producto.foto = file;
      event.dataTransfer.clearData();
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.arrastrando = false;
    this.pantallaSubject.next(false);
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
              () => {},
              (error) => {
                console.error('Error al actualizar el producto:', error);
              }
            );
        }
      }
    }
    this.editingCell = null;
  }

  expandir(producto: Producto): void {
    const index = this.expandidos.indexOf(producto.id);
    if (index === -1) {
      this.expandidos.push(producto.id);
    } else {
      this.expandidos.splice(index, 1);
    }
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
