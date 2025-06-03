const unicode = require("unorm");
const { db } = require("../db/db.config");

const oficiales = [
  "soporte",
  "equipo",
  "staff",
  "admin",
  "administrador",
  "moderador",
  "mod",
  "root",
  "system",
  "sistema",
  "oficial",
  "ayuda",
  "support",
  "official",
  "team",
  "webmaster",
  "dev",
  "desarrollador",
  "superuser",
  "admin1",
  "admin2",
  "admin3",
  "mod1",
  "mod2",
  "mod3",
];
const reservados = [
  "admin",
  "root",
  "superuser",
  "crear-citas",
  "registro",
  "inicio-sesion",
  "mis-citas",
  "mis-productos",
  "solicitudes",
  "relaciones",
  "chats",
  "editar-perfil",
  "mensajes",
  "citas",
  "productos",
  "**",
];

function validarUsername(username) {
  if (!username || username.trim() === "") {
    return "El nombre de usuario es requerido";
  }
  username = unicode.nfkc(username);
  if (username.length < 3 || username.length > 20) {
    return "El nombre de usuario debe tener entre 3 y 20 caracteres";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "El nombre de usuario solo puede contener letras, números y guiones bajos";
  }
  if (username.startsWith("_") || username.endsWith("_")) {
    return "El nombre de usuario no puede comenzar o terminar con un guion bajo";
  }
  if (
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(username) ||
    /^(http|www\.|https)/i.test(username)
  ) {
    return "El nombre de usuario es inválido";
  }
  if (/^\d+$/.test(username)) {
    return "El nombre de usuario no puede ser solo números";
  }
  if (
    reservados.includes(username.toLowerCase()) ||
    oficiales.includes(username.toLowerCase())
  ) {
    return "El nombre de usuario no está disponible";
  }
  db.query(
	"SELECT COUNT(*) AS count FROM Usuarios WHERE username = ?",
	[username],
	(err, results) => {
	  if (err) {
		console.error("Error al validar el nombre de usuario:", err);
		return "Error al validar el nombre de usuario";
	  }
	  if (results[0].count > 0) {
		return "El nombre de usuario ya está en uso";
	  }
	  return null;
	}
  );
}

function validarEmail(email) {
  if (!email || email.trim() === "") {
	return "El email es requerido";
  }
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
	return "El email no es válido";
  }
	db.query(
		"SELECT COUNT(*) AS count FROM Usuarios WHERE email = ?",
		[email],
		(err, results) => {
			if (err) {
				console.error("Error al validar el email:", err);
				return "Error al validar el email";
			}
			if (results[0].count > 0) {
				return "El email ya está en uso";
			}
			return null;
		}
	);
}

module.exports = {
validarUsername,
validarEmail
};
