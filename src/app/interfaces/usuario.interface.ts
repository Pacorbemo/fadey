export interface Usuario {
	id: number;
	nombre: string;
	username: string;
	rol: string; 
	foto_perfil: string;
	localizacion: string;
	bio: string;
	email: string;
	email_verificado: boolean;
}

export const usuarioVacio: Usuario = {
	id: 0,
	nombre: '',
	username: '',
	rol: '',
	foto_perfil: '',
	localizacion: '',
	bio: '',
	email: '',
	email_verificado: false
};
