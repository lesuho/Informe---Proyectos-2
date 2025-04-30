import mongoose from "mongoose";
import dayjs from "dayjs";
import { HfInference } from '@huggingface/inference';

// Inicializar el cliente de Hugging Face con manejo de errores
let hf;
try {
    if (!process.env.HF_API_TOKEN) {
        console.error('Error: HF_API_TOKEN no está definido en las variables de entorno');
        process.exit(1);
    }
    hf = new HfInference(process.env.HF_API_TOKEN);
} catch (error) {
    console.error('Error al inicializar Hugging Face:', error);
    process.exit(1);
}

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    completed: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWith: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['viewer', 'editor'],
            default: 'viewer'
        }
    }],
    completedAt: {
        type: Date,
        default: null
    },
    suggestedDeadline: {
        type: Date
    },
    suggestedPriority: {
        type: String,
        enum: ['low', 'medium', 'high']
    },
    suggestionExplanation: {
        type: String
    }
}, {
    timestamps: true
});

// Método para calcular la prioridad automáticamente
taskSchema.methods.calculatePriority = function() {
    const now = new Date();
    const timeDiff = this.deadline - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Palabras clave para cada nivel de prioridad
    const highPriorityKeywords = ['urgente', 'importante', 'crítico', 'inmediato', 'prioritario', 'emergencia'];
    const mediumPriorityKeywords = ['necesario', 'relevante', 'significativo', 'considerable', 'moderado'];
    const lowPriorityKeywords = ['opcional', 'secundario', 'complementario', 'adicional', 'menor'];

    // Convertir descripción a minúsculas para la comparación
    const description = this.description.toLowerCase();

    // Verificar palabras clave en la descripción
    const hasHighPriorityKeyword = highPriorityKeywords.some(keyword => description.includes(keyword));
    const hasMediumPriorityKeyword = mediumPriorityKeywords.some(keyword => description.includes(keyword));
    const hasLowPriorityKeyword = lowPriorityKeywords.some(keyword => description.includes(keyword));

    // Determinar prioridad basada en palabras clave y días restantes
    if (hasHighPriorityKeyword || daysDiff <= 1) {
        return 'high';
    } else if (hasMediumPriorityKeyword || daysDiff <= 2) {
        return 'medium';
    } else if (hasLowPriorityKeyword || daysDiff <= 3) {
        return 'low';
    } else {
        return 'low'; // Prioridad por defecto
    }
};

// Middleware para actualizar la prioridad antes de guardar
taskSchema.pre('save', function(next) {
    if (this.isModified('deadline')) {
        this.priority = this.calculatePriority();
    }
    next();
});

// Método para obtener sugerencias de la IA
taskSchema.methods.getAISuggestions = async function() {
    try {
        const prompt = `Tarea a analizar:
Título: ${this.title}
Descripción: ${this.description}

Instrucciones: Analiza la tarea y determina su prioridad. Responde SOLO con un objeto JSON que tenga esta estructura exacta:
{
    "prioridad": "high|medium|low",
    "explicacion": "razón de la prioridad",
    "fechaSugerida": "YYYY-MM-DD"
}`;

        const response = await hf.textGeneration({
            model: 'bigcode/starcoder',
            inputs: prompt,
            parameters: {
                max_new_tokens: 250,
                temperature: 0.2,
                top_p: 0.95,
                return_full_text: false
            }
        });

        if (!response || !response.generated_text) {
            throw new Error('No se recibió respuesta válida de Hugging Face');
        }

        // Procesar la respuesta
        let suggestions;
        try {
            // Intentar encontrar el JSON en la respuesta
            const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                suggestions = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No se encontró JSON válido en la respuesta');
            }
        } catch (error) {
            console.error('Error al parsear JSON:', error);
            
            // Usar el método calculatePriority como respaldo
            const calculatedPriority = this.calculatePriority();
            
            // Ajustar la fecha según la prioridad calculada
            let suggestedDays;
            switch (calculatedPriority) {
                case 'high':
                    suggestedDays = 1; // 1 día para tareas urgentes
                    break;
                case 'medium':
                    suggestedDays = 3; // 3 días para tareas medias
                    break;
                case 'low':
                    suggestedDays = 7; // 7 días para tareas de baja prioridad
                    break;
                default:
                    suggestedDays = 3;
            }

            suggestions = {
                prioridad: calculatedPriority,
                explicacion: 'Prioridad y fecha calculadas basadas en el contenido y urgencia de la tarea',
                fechaSugerida: dayjs().add(suggestedDays, 'day').format('YYYY-MM-DD')
            };
        }

        // Validar y normalizar las sugerencias
        if (!['high', 'medium', 'low'].includes(suggestions.prioridad)) {
            suggestions.prioridad = 'medium';
        }

        // Ajustar la fecha según la prioridad si no fue establecida por la IA
        let suggestedDays;
        switch (suggestions.prioridad) {
            case 'high':
                suggestedDays = 1; // 1 día para tareas urgentes
                break;
            case 'medium':
                suggestedDays = 3; // 3 días para tareas medias
                break;
            case 'low':
                suggestedDays = 7; // 7 días para tareas de baja prioridad
                break;
            default:
                suggestedDays = 3;
        }

        // Actualizar la fecha sugerida según la prioridad
        suggestions.fechaSugerida = dayjs().add(suggestedDays, 'day').format('YYYY-MM-DD');

        // Actualizar la tarea con las sugerencias
        this.suggestedDeadline = new Date(suggestions.fechaSugerida);
        this.suggestedPriority = suggestions.prioridad;
        this.priority = suggestions.prioridad;
        this.suggestionExplanation = suggestions.explicacion;

        return {
            suggestedDeadline: this.suggestedDeadline,
            suggestedPriority: this.suggestedPriority,
            explanation: this.suggestionExplanation
        };
    } catch (error) {
        console.error('Error al obtener sugerencias:', error);
        
        // Usar el método calculatePriority como respaldo
        const calculatedPriority = this.calculatePriority();
        
        // Ajustar la fecha según la prioridad calculada
        let suggestedDays;
        switch (calculatedPriority) {
            case 'high':
                suggestedDays = 1; // 1 día para tareas urgentes
                break;
            case 'medium':
                suggestedDays = 3; // 3 días para tareas medias
                break;
            case 'low':
                suggestedDays = 7; // 7 días para tareas de baja prioridad
                break;
            default:
                suggestedDays = 3;
        }

        const defaultSuggestions = {
            suggestedDeadline: dayjs().add(suggestedDays, 'day').toDate(),
            suggestedPriority: calculatedPriority,
            explanation: 'Se utilizó el cálculo automático de prioridad y fecha debido a un error en la IA.'
        };
        
        this.suggestedDeadline = defaultSuggestions.suggestedDeadline;
        this.suggestedPriority = defaultSuggestions.suggestedPriority;
        this.priority = defaultSuggestions.suggestedPriority;
        this.suggestionExplanation = defaultSuggestions.explanation;
        
        return defaultSuggestions;
    }
};

// Middleware para obtener sugerencias antes de guardar
taskSchema.pre('save', async function(next) {
    if (this.isModified('title') || this.isModified('description')) {
        await this.getAISuggestions();
    }
    next();
});

// Método para solicitar una nueva sugerencia
taskSchema.methods.requestNewSuggestion = async function() {
    try {
        const suggestions = await this.getAISuggestions();
        if (suggestions) {
            // Guardar los cambios en la base de datos
            await this.save();
            return suggestions;
        }
        return null;
    } catch (error) {
        console.error('Error al solicitar nueva sugerencia:', error);
        throw error;
    }
};

export default mongoose.model("Task", taskSchema);