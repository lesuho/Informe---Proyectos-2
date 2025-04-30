# Proyecto MERN CRUD con Autenticación

## Descripción
Este proyecto es una aplicación web full-stack construida con el stack MERN (MongoDB, Express, React, Node.js) que incluye funcionalidades CRUD y autenticación de usuarios.

## Estructura del Proyecto
```
proyecto/
├── BACKEND/        # Servidor Node.js y Express
├── FRONTEND/       # Cliente React
└── DOCUMENTOS/     # Documentación del proyecto
```

## Tecnologías Utilizadas
- MongoDB: Base de datos NoSQL
- Express.js: Framework de backend
- React: Biblioteca de frontend
- Node.js: Entorno de ejecución
- Docker: Contenedorización

## Configuración del Proyecto

### Requisitos Previos
- Node.js (v14 o superior)
- MongoDB
- Docker (opcional)

### Instalación y Ejecución
1. Clonar el repositorio
```bash
git clone https://github.com/lesuho/Informe---Proyectos-2.git
cd Informe---Proyectos-2
```

2. Configurar Backend (BACKEND/)
```bash
cd BACKEND
npm install
# Configurar .env con las variables necesarias
npm start
```

3. Configurar Frontend (FRONTEND/)
```bash
cd FRONTEND
npm install
npm run dev
```

### Uso con Docker
```bash
docker-compose up --build
```

## Integrantes del Proyecto
Ver [Integrantes.txt](Integrantes.txt) para la lista completa de contribuidores. 