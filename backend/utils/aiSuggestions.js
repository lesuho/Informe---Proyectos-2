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
 * using Hugging Face API if available, otherwise uses keyword analysis
 */
const generatePriority = async (title = '', description = '') => {
  try {
    // Asegurarse de que los parámetros sean strings
    const titleStr = title ? String(title) : '';
    const descStr = description ? String(description) : '';
    
    // Si tenemos token de Hugging Face, intentar usar la API
    if (HUGGING_FACE_TOKEN) {
      try {
        const text = `${titleStr} ${descStr}`.trim();
        if (!text) {
          return 'Media'; // Valor por defecto si no hay texto
        }
        
        // Usar un modelo de Hugging Face para análisis de sentimiento/prioridad
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
          { inputs: text },
          {
            headers: {
              'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 segundos de timeout
          }
        );
        
        console.log('Respuesta de Hugging Face:', response.data);
        
        // Procesar la respuesta del modelo
        if (response.data && Array.isArray(response.data) && response.data[0]) {
          const predictions = response.data[0];
          
          // Mapear sentimientos a prioridades
          // LABEL_0: negativo (baja prioridad)
          // LABEL_1: neutral (media prioridad) 
          // LABEL_2: positivo (alta prioridad)
          const maxScore = Math.max(...predictions.map(p => p.score));
          const bestMatch = predictions.find(p => p.score === maxScore);
          
          if (bestMatch) {
            switch(bestMatch.label) {
              case 'LABEL_0': // Negativo
                return 'Baja';
              case 'LABEL_1': // Neutral
                return 'Media';
              case 'LABEL_2': // Positivo
                return 'Alta';
              default:
                return 'Media';
            }
          }
        }
        
        // Si no se pudo procesar la respuesta, usar fallback
        console.log('No se pudo procesar la respuesta de Hugging Face, usando fallback');
        return fallbackGeneratePriority(titleStr, descStr);
        
      } catch (apiError) {
        console.error('Error al usar API de Hugging Face:', apiError.message);
        // Usar fallback si falla la API
        return fallbackGeneratePriority(titleStr, descStr);
      }
    } else {
      // Si no hay token, usar directamente el fallback
      console.log('No hay token de Hugging Face configurado, usando análisis de palabras clave');
      return fallbackGeneratePriority(titleStr, descStr);
    }
  } catch (error) {
    console.error('Error en generatePriority:', error);
    return 'Media'; // Valor por defecto en caso de error
  }
};

/**
 * Fallback method to generate priority using keyword analysis
 */
const fallbackGeneratePriority = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  
  const priorityWords = {
    high: ['urgente', 'inmediato', 'crítico', 'importante', 'pronto', 'prioritario', 'urgent', 'critical', 'important', 'deadline', 'fecha límite', 'asap', 'lo antes posible'],
    low: ['opcional', 'cuando puedas', 'si hay tiempo', 'secundario', 'baja prioridad', 'low priority', 'eventualmente', 'más tarde', 'sin prisa']
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