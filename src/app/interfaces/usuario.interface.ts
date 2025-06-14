export interface Usuario {
	id: number;
	nombre: string;
	username: string;
	rol: string; 
	foto_perfil: string;
	bio: string;
	email: string;
	email_verificado: boolean;
	enviar_emails?: boolean;
}

export const usuarioVacio: Usuario = {
	id: 0,
	nombre: '',
	username: '',
	rol: '',
	foto_perfil: '',
	bio: '',
	email: '',
	email_verificado: false,
	enviar_emails: true
};
