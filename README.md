# Proyecto MERN CRUD con Autenticación

Este proyecto es una aplicación web full-stack construida con el stack MERN (MongoDB, Express, React, Node.js) que incluye funcionalidades CRUD y autenticación de usuarios.

## Estructura del Proyecto

```
proyecto/
├── FRONTEND/        # Frontend React
├── BACKEND/         # Backend Node.js
└── DOCUMENTOS/      # Documentación del proyecto
    ├── README.md
    └── Integrantes.txt
```

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB
- Docker (opcional)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/lesuho/Informe---Proyectos-2.git
cd Informe---Proyectos-2
```

2. Instalar dependencias:
```bash
# Backend
cd BACKEND
npm install

# Frontend
cd ../FRONTEND
npm install
```

3. Configurar variables de entorno:
```bash
# Crear archivo .env en la carpeta BACKEND
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar la aplicación:
```bash
# Backend
cd BACKEND
npm start

# Frontend (en otra terminal)
cd FRONTEND
npm run dev
```

## Uso con Docker

```bash
docker-compose up --build
```

## Documentación

La documentación detallada del proyecto se encuentra en la carpeta `DOCUMENTOS/`. 