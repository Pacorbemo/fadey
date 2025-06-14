export interface GetCitasResponseInterface {
    totales: { [dia: number]: string[] };
    reservadas: { [dia: number]: string[] };
    reservadasUsuario: { [dia: number]: string[] };
}

export interface GetCitasInterface {
	totales: Date[];
	reservadas: Date[];
	reservadasUsuario: Date[];
}

export interface ArrayCitasInterface { [dia: number]: string[] }