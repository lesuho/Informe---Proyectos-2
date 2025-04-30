import axios from './axios';

export const getPrioritySuggestion = async (description) => {
    try {
        const response = await axios.post('/ai/suggest-priority', { description });
        return response.data;
    } catch (error) {
        console.error('Error al obtener sugerencia de prioridad:', error);
        throw error;
    }
};