# Manual del Administrador

Este documento está dirigido al administrador del sistema/proyecto Fadey. Aquí se describen los procedimientos y tareas habilitadas en esta versión.

## 1. Instalación

1. Clona el repositorio del proyecto.
2. Instala las dependencias ejecutando:
   ```bash
   npm install
   ```
3. Crea la base de datos importando el archivo `fadey_backup.sql` en tu servidor MySQL.

## 2. Configuración

1. Crea un archivo `.env` en la raíz del proyecto siguiendo el formato de `.env.example` y completa los valores de conexión a la base de datos y servidor.
2. Verifica que la carpeta `uploads/` existe en la raíz para el almacenamiento de imágenes y archivos subidos.

## 3. Despliegue y Ejecución

### Backend

Ejecuta el backend con:
```bash
node server/index.js
```

### Frontend

Despliega el frontend con:
```bash
npm run build
```

### Ejecución simultánea para desarrollo

Puedes ejecutar ambos (frontend y backend) en el mismo terminal con:
```bash
npm run dev
```

Asegúrate de tener instalados los módulos `concurrently` y `nodemon`:
```bash
npm install concurrently nodemon --save-dev
```
