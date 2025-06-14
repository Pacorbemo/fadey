import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios.service';
import { CitasService } from '../../../services/citas.service';

const DIAS = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

export interface HorarioDia {
  abierto: boolean;
  inicio: string;
  fin: string;
}

@Component({
  selector: 'app-preferencias-horario-barbero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h3>Preferencias</h3>
    <div class="preferencias-horario">
      <h3>Horario semanal recurrente</h3>
      <table>
        <thead>
          <tr>
            <th>Día</th>
            <th>Abierto</th>
            <th>Hora inicio</th>
            <th>Hora fin</th>
          </tr>
        </thead>
        <tbody>

          @for(dia of horario; track dias[i]; let i = $index) {
            <tr>
              <td>{{ dias[i] }}</td>
              <td><input type="checkbox" [(ngModel)]="dia.abierto"></td>
              <td>
                <select [(ngModel)]="dia.inicio" [disabled]="!dia.abierto">
                  @for(h of horas; track h) {
                    @if(h != '23:30'){
                      <option [value]="h">{{h}}</option>
                    }
                  }
                </select>
              </td>
              <td>
                <select [(ngModel)]="dia.fin" [disabled]="!dia.abierto">
                  @for(h of horas; track h) {
                    @if(h != '00:00'){
                      <option [value]="h">{{h}}</option>
                    }
                  }
                </select>
              </td>
            </tr>
          }
        </tbody>
      </table>
      <div class="acciones-horario">
        <button type="button" (click)="guardar()">Guardar patrón</button>
        <button type="button" (click)="restablecerSemana()">Aplicar a la semana actual</button>
        <button type="button" (click)="aplicarFuturo()">Aplicar a próximas semanas</button>
        <label>Semanas futuras: <input type="number" min="1" [(ngModel)]="semanasFuturas"></label>
      </div>
      @if(mensaje) {
        <div class="mensaje-horario">{{mensaje}}</div>
      }
    </div>
  `,
  styleUrls: ['./preferencias-horario-barbero.component.css']
})
export class PreferenciasHorarioBarberoComponent {
  @Input() horario: HorarioDia[] = DIAS.map(() => ({ abierto: true, inicio: '09:00', fin: '17:00' }));
  dias = DIAS;
  mensaje = '';
  horas = Array.from({length: 24 * 2}, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  });
  semanasFuturas = 1;

  constructor(private usuariosService: UsuariosService, private citasService: CitasService) {
    this.cargarHorario();
  }

  cargarHorario() {
    this.usuariosService.getHorarioBarbero().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.horario)) {
          this.horario = data.horario;
        }
      }
    });
  }

  guardar() {
    if (!this.validarHorario()) {
      this.mensaje = 'Revisa que las horas de inicio sean anteriores a las de fin y que no haya solapamientos.';
      return;
    }
    this.usuariosService.setHorarioBarbero(this.horario).subscribe({
      next: () => {
        this.mensaje = 'Patrón guardado correctamente';
      },
      error: () => {
        this.mensaje = 'Error al guardar el patrón';
      }
    });
  }

  validarHorario(): boolean {
    for (let dia of this.horario) {
      if (dia.abierto && dia.inicio >= dia.fin) {
        return false;
      }
    }
    return true;
  }

  aplicarFuturo() {
    if (!this.validarHorario()) {
      this.mensaje = 'Revisa que las horas de inicio sean anteriores a las de fin y que no haya solapamientos.';
      return;
    }
    this.usuariosService.setHorarioBarbero(this.horario).subscribe({
      next: () => {
        const hoy = new Date();
        const primerDia = new Date(hoy);
        const dia = primerDia.getDay();
        const diff = dia === 0 ? -6 : 1 - dia;
        primerDia.setDate(primerDia.getDate() + diff + 7); // Lunes de la próxima semana
        const ultimoDia = new Date(primerDia);
        ultimoDia.setDate(primerDia.getDate() + 7 * this.semanasFuturas - 1); // Domingo de la última semana seleccionada
        this.citasService.generarCitasSemana(primerDia, ultimoDia).subscribe({
          next: (res) => {
            this.mensaje = `Patrón guardado y aplicado a las próximas ${this.semanasFuturas} semanas. Citas creadas: ${res.creadas}`;
          },
          error: (err) => {
            this.mensaje = err?.error?.error || 'Error al aplicar el patrón a próximas semanas';
          }
        });
      },
      error: () => {
        this.mensaje = 'Error al guardar el patrón antes de aplicar.';
      }
    });
  }

  restablecerSemana() {
    if (!this.validarHorario()) {
      this.mensaje = 'Revisa que las horas de inicio sean anteriores a las de fin y que no haya solapamientos.';
      return;
    }
    this.usuariosService.setHorarioBarbero(this.horario).subscribe({
      next: () => {
        const hoy = new Date();
        const primerDia = new Date(hoy);
        const dia = primerDia.getDay();
        const diff = dia === 0 ? -6 : 1 - dia;
        primerDia.setDate(primerDia.getDate() + diff); // Lunes de la semana actual
        const ultimoDia = new Date(primerDia);
        ultimoDia.setDate(primerDia.getDate() + 6); // Domingo de la semana actual
        this.citasService.generarCitasSemana(primerDia, ultimoDia).subscribe({
          next: (res) => {
            this.mensaje = `Patrón guardado y semana restablecida al patrón. Citas creadas: ${res.creadas}`;
          },
          error: (err) => {
            this.mensaje = err?.error?.error || 'Error al restablecer la semana actual';
          }
        });
      },
      error: () => {
        this.mensaje = 'Error al guardar el patrón antes de restablecer.';
      }
    });
  }
}
