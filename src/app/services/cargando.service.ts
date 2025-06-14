import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, Observable, timer } from 'rxjs';
import { map, distinctUntilChanged, pairwise, filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class  CargandoService {
  private _cargandoSubject = new BehaviorSubject<boolean>(false);  
  public cargando$ = this._cargandoSubject.asObservable();
  public cargandoProlongado = false;

  set cargando(valor: boolean) {
    this._cargandoSubject.next(valor);
  }

  get cargando(): boolean {
    return this._cargandoSubject.value;
  }
  
  ocultarCargando(): void {
    this._cargandoSubject.next(false);
  }
        
  constructor(){
    // Si la peticion tarda menos de 0.5 segundos, se evita mostrar el texto de "Cargando..."
    this.cargando$.pipe(
      pairwise(),                               // Emite el valor anterior y el actual como un array
      filter(([prev, curr]) => !prev && curr),  // Comprueba que el valor anterior es false y el actual es true
      switchMap(() =>
        timer(500).pipe(                        // Espera 0.5 segundos antes de emitir
          switchMap(() => this.cargando$),      // Vuelve a comprobar el estado de cargando
          filter((cargando) => cargando)        // Comprueba que siga siendo true
        )
      )
    ).subscribe(() => {                         // Si se cumplen todas las condiciones, se activa el cargando prolongado
      this.cargandoProlongado = true;           
    });

    // Siempre que cargando sea false, cargandoProlongado es false
    this.cargando$
      .pipe(filter(cargando => !cargando && this.cargandoProlongado))
      .subscribe(() => {
        this.cargandoProlongado = false;
    })
  }
}
