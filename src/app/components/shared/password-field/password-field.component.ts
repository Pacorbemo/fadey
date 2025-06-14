import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordService } from '../../../services/password.service';

@Component({
  selector: 'app-password-field',
  standalone: true,
  templateUrl: './password-field.component.html',
  styleUrls: ['./password-field.component.css'],
  imports: [FormsModule]
})
export class PasswordFieldComponent implements OnChanges {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() showStrength: boolean = false;
  @Input() showGenerator: boolean = false;
  @Input() value: string = '';
  @Input() mostrarRequisitos: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() passwordGenerada = new EventEmitter<string>();

  password: string = '';
  mostrar: boolean = false;
  fortaleza = { texto: '', clase: '' };

  constructor(private passwordService: PasswordService) {}

  ngOnInit() {
    this.password = this.value;
    this.onPasswordChange();
  }

  ngOnChanges() {
    this.password = this.value;
    if (this.showStrength) {
      this.fortaleza = this.passwordService.calcularFortaleza(this.password);
    }
  }

  onPasswordChange() {
    this.valueChange.emit(this.password);
    if (this.showStrength) {
      this.fortaleza = this.passwordService.calcularFortaleza(this.password);
    }
  }

  generarPassword() {
    this.password = this.passwordService.generarPasswordSegura();
    this.onPasswordChange();
    this.passwordGenerada.emit(this.password);
  }

  mostrarRequisitosFn() :boolean{
    return this.mostrarRequisitos && this.password.length > 0;
  }
}
