# Fadey

Este proyecto es una aplicación web desarrollada con Angular (frontend) y Node.js/Express (backend) usando MySQL como base de datos.

## Pasos para la configuración inicial

1. **Crear la base de datos**
   - Importa el archivo `estructura.sql` en tu servidor MySQL para crear la estructura de la base de datos y las tablas necesarias.

2. **Configurar variables de entorno**
   - Crea un archivo `.env` en la raíz del proyecto siguiendo el formato de `.env.example` y completa los valores con tu configuración local (usuario, contraseña, etc).

3. **Instalar dependencias**
   - Ejecuta `npm install` en la raíz del proyecto para instalar las dependencias del frontend y backend.

## Cómo ejecutar el proyecto

### Backend

Ejecuta el backend con:

```bash
node server/index.js
```

El servidor se iniciará y mostrará la URL donde está corriendo.

### Frontend

Ejecuta el frontend con:

```bash
npm run start
```

Esto levantará el servidor de desarrollo de Angular. Accede a la aplicación desde tu navegador en la URL que se muestre (por defecto suele ser http://localhost:4200/).

---

## Ejecución simultánea para desarrollo

Adicionalmente, para facilitar el desarrollo puedes ejecutar:

```bash
npm run dev
```

Este comando levanta tanto el frontend como el backend en el mismo terminal usando concurrently y nodemon. Para que funcione, asegúrate de tener instalados los módulos:

- concurrently
- nodemon

Puedes instalarlos con:

```bash
npm install concurrently nodemon --save-dev
```

