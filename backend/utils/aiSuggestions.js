const axios = require('axios');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Obtener token de Hugging Face
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;

/**
 * Generates a suggested date for a task using the Hugging Face API
 * If the API fails, uses a fallback method to generate a date
 * @param {string} priority - The priority of the task (Alta, Media, Baja)
 */
const generateSuggestedDate = async (priority = 'Media') => {
  // Usar directamente el método de respaldo para garantizar consistencia
  return fallbackGenerateSuggestedDate(priority);
};

/**
 * Fallback method to generate a suggested date based on priority
 * @param {string} priority - The priority of the task (Alta, Media, Baja)
 */
const fallbackGenerateSuggestedDate = (priority = 'Media') => {
  const today = new Date();
  const futureDate = new Date(today);
  
  // Asignar días según la prioridad de forma estricta
  let daysToAdd;
  
  switch(priority) {
    case 'Alta':
      // Para tareas de alta prioridad: 1-5 días
      daysToAdd = Math.floor(Math.random() * 5) + 1;
      break;
    case 'Media':
      // Para tareas de media prioridad: 7-12 días
      daysToAdd = Math.floor(Math.random() * 6) + 7;
      break;
    case 'Baja':
      // Para tareas de baja prioridad: 14-28 días
      daysToAdd = Math.floor(Math.random() * 15) + 14;
      break;
    default:
      daysToAdd = 10; // Valor por defecto
  }
  
  futureDate.setDate(today.getDate() + daysToAdd);
  console.log(`Generando fecha para tarea ${priority}: ${daysToAdd} días (${futureDate.toISOString().split('T')[0]})`);
  
  return futureDate;
};

/**
 * Generates a priority for a task based on its title and description
 * using keyword analysis
 */
const generatePriority = async (title, description) => {
  const text = (title + ' ' + description).toLowerCase();
  
  const priorityWords = {
    high: ['urgente', 'inmediato', 'crítico', 'importante', 'pronto', 'prioritario'],
    low: ['opcional', 'cuando puedas', 'si hay tiempo', 'secundario']
  };
  
  if (priorityWords.high.some(word => text.includes(word))) {
    return 'Alta';
  }
  
  if (priorityWords.low.some(word => text.includes(word))) {
    return 'Baja';
  }
  
  return 'Media';
};

module.exports = {
  generateSuggestedDate,
  generatePriority
};