# API de Seguridad en el Desarrollo de Aplicaciones 🛡️

Esta es una API robusta desarrollada como proyecto escolar, enfocada en implementar las mejores prácticas de seguridad, validación de datos y manejo de sesiones.

## 🚀 Tecnologías Principales

* *Lenguaje:* [TypeScript](https://www.typescriptlang.org/)
* *ORM:* [Prisma](https://www.prisma.io/)
* *Base de Datos:* [SQLite](https://www.sqlite.org/) (Ligera y portable para desarrollo)

## 📦 Librerías y Dependencias

El proyecto utiliza un conjunto de herramientas especializadas para garantizar la eficiencia y protección de los datos:

| Librería | Propósito |
| :--- | :--- |
| *Express* | Framework web principal. |
| *Helmet* | Configuración de cabeceras HTTP seguras. |
| *Express-rate-limit* | Prevención de ataques de fuerza bruta y DoS. |
| *JSONWebToken* | Autenticación basada en tokens. |
| *Cookie-parser* | Gestión y firma de cookies. |
| *Bcrypt* | Hashing seguro de contraseñas. |
| *Zod* | Validación estricta de esquemas de datos. |
| *CORS* | Control de acceso de recursos cruzados. |
| *Compression* | Optimización del tamaño de las respuestas. |
| *Multer* | Manejo de carga de archivos (multipart/form-data). |
| *Dotenv* | Gestión de variables de entorno. |

---
Nota
## 📄 Variables de Entorno

Para que el proyecto funcione correctamente, crea un archivo .env en la raíz del directorio y configura las siguientes variables:

| Variable | Descripción |
| :--- | :--- |
| *DATABASE_URL** | URL de conexión para Prisma (ej. file:./dev.db). |
| *JWT_SECRET** | Clave secreta para la generación de tokens. |
| *SALT* | Valor para el hashing de contraseñas con Bcrypt. |
| *PORT* | Puerto de escucha del servidor (por defecto 3000). |
| *NODE_ENV* | Entorno de ejecución (development o production). |

> Los campos marcados con asterisco (*) son estrictamente obligatorios para el arranque.


## 🛠️ Instalación y Configuración

Sigue estos pasos para poner en marcha el entorno de desarrollo localmente:

### 1. Instalar dependencias
Primero, descarga todos los paquetes necesarios definidos en el package.json:
```bash
npm i
```
Nota: debes tener un aversión de Node.js 20.19+, 22.12+, 24.0+ en adelante.


### 2. Configurar la base de datos
Ejecuta las migraciones para crear las tablas en SQLite según el esquema de Prisma:
```bash
npx prisma migrate dev
```

### 3. Generar el cliente de Prisma
Genera el cliente tipado para poder interactuar con la base de datos desde TypeScript:
```bash
npx prisma generate
```

### 4. Iniciar el servidor
Finalmente, arranca la aplicación en modo de desarrollo:
```bash
npm run dev
```

### 5. Corroborar el funcionamiento
Para asegurar que la api esté funcionando en tu navegador busca la siguiente dirección URL:
```bash
http://localhost:[PORT]:/
```

O si estás usando Postman llama a la siguiente URL con el método GET:
```bash
http://localhost:[PORT]:/
```

Si todo sale bien, la api debe devolver el siguiente código html:
```html
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
</style>
<div style="font-family: sans-serif; text-align: center; min-width: 100vw; min-height: 100vh; display: flex; justify-content: center; align-items: center; background-color:rgb(240, 186, 77); flex-direction: column;">
    <h1 style="color: green; font-size: 48px;">✅ API is <span style="color: #007bff;">RUNNING</span></h1>
    <p style="font-size: 24px;">Everything looks good 🚀</p>
</div>
```
