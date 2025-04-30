# MERN CRUD con Autenticación

Este proyecto es una aplicación web full-stack construida con el stack MERN (MongoDB, Express, React, Node.js) que incluye funcionalidades CRUD y autenticación de usuarios.

## Estructura del Proyecto

```
mern-crud-auth/
├── client/          # Frontend React
├── server/          # Backend Node.js
├── documents/       # Documentación del proyecto
└── docker/          # Configuración de Docker
```

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB
- Docker (opcional)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/lesuho/Informe---Proyectos-2.git
cd mern-crud-auth
```

2. Instalar dependencias:
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. Configurar variables de entorno:
```bash
# Crear archivo .env en la carpeta server
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar la aplicación:
```bash
# Backend
cd server
npm start

# Frontend (en otra terminal)
cd client
npm run dev
```

## Uso con Docker

```bash
docker-compose up --build
```

## Documentación

La documentación detallada del proyecto se encuentra en la carpeta `documents/`.

## Contribuidores

- [Lista de contribuidores](Integrantes.txt)