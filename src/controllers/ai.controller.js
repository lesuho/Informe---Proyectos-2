export const suggestPriority = async (req, res) => {
    try {
        console.log('Solicitud recibida:', req.body);
        const { description } = req.body;
        
        // Validar entrada requerida
        if (!description || typeof description !== 'string') {
            console.log('Descripción no proporcionada o inválida');
            return res.status(400).json({
                message: "La descripción es requerida y debe ser texto"
            });
        }

        const descLower = description.toLowerCase().trim();
        let priority = 'medium';
        let explanation = '';

        // Palabras clave para cada nivel de prioridad
        const highPriorityKeywords = ['urgente', 'importante', 'crítico', 'inmediato', 'prioritario', 'emergencia', 'asap', 'lo antes posible'];
        const mediumPriorityKeywords = ['necesario', 'relevante', 'significativo', 'considerable', 'moderado', 'normal', 'estándar'];
        const lowPriorityKeywords = ['opcional', 'secundario', 'complementario', 'adicional', 'menor', 'cuando puedas', 'sin prisa', 'baja prioridad'];

        // Verificar palabras clave en la descripción
        const hasHighPriorityKeyword = highPriorityKeywords.some(keyword => descLower.includes(keyword));
        const hasMediumPriorityKeyword = mediumPriorityKeywords.some(keyword => descLower.includes(keyword));
        const hasLowPriorityKeyword = lowPriorityKeywords.some(keyword => descLower.includes(keyword));

        // Determinar prioridad basada en palabras clave
        if (hasHighPriorityKeyword) {
            priority = 'high';
            explanation = 'Se detectaron palabras clave de alta prioridad en la descripción';
        } else if (hasLowPriorityKeyword) {
            priority = 'low';
            explanation = 'Se detectaron palabras clave de baja prioridad en la descripción';
        } else if (hasMediumPriorityKeyword) {
            priority = 'medium';
            explanation = 'Se detectaron palabras clave de prioridad media en la descripción';
        } else {
            // Si no hay palabras clave, analizar el contexto
            if (descLower.includes('!') || descLower.includes('?')) {
                priority = 'high';
                explanation = 'La descripción contiene signos de exclamación o interrogación, indicando posible urgencia';
            } else if (descLower.length < 20) {
                priority = 'low';
                explanation = 'La descripción es muy corta, sugiriendo una tarea simple';
            } else {
                explanation = 'No se detectaron palabras clave específicas, se asigna prioridad media por defecto';
            }
        }

        console.log('Prioridad sugerida:', priority);
        
        return res.json({
            priority,
            explanation
        });
    } catch (error) {
        console.error('Error en suggestPriority:', error);
        return res.status(500).json({
            message: 'Error al sugerir prioridad',
            error: error.message
        });
    }
};