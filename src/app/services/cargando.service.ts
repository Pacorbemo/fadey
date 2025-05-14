import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class  CargandoService {
  private _cargandoSubject = new BehaviorSubject<boolean>(false);
  public cargando$ = this._cargandoSubject.asObservable();
  private _inicioTiempo: number = 0;

  set cargando(valor: boolean) {
    if (valor && !this._cargandoSubject.value) {
      this._inicioTiempo = Date.now();
    }
    this._cargandoSubject.next(valor);
  }

  ocultarCargando(): void {
    this._cargandoSubject.next(false);
  }

  get cargando(): boolean {
    return this._cargandoSubject.value;
  }

  // Si la peticion tarda menos de 0.5 segundos, se evita mostrar el texto de "Cargando..."
  public cargandoProlongado: Observable<boolean> = combineLatest([this.cargando$, interval(100)]).pipe(
    map(([estado, _]) => {
      if (!estado) {
        return false;
      }
      return (Date.now() - this._inicioTiempo) > 500;
    }),
    distinctUntilChanged()
  );
}
