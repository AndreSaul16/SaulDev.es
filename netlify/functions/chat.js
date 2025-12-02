import OpenAI from 'openai';

// Logging para diagnóstico
console.log('🔍 Chat Function: Iniciando...');
console.log('OPENAI_API_KEY existe:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_KEY_API existe:', !!process.env.OPENAI_KEY_API);
console.log('OPENAI_ASSISTANT_ID:', process.env.OPENAI_ASSISTANT_ID);

// Inicializar cliente de OpenAI
const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY_API;

const openai = new OpenAI({
    apiKey: apiKey,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// Configuración de CORS
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

export const handler = async (event) => {
    console.log('📥 Request recibido:', event.httpMethod);

    // Manejar preflight CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
        console.log('❌ Método no permitido:', event.httpMethod);
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // Parse del body
        let body = event.body;
        console.log('📦 Tipo de body:', typeof body);
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error('❌ Error parseando body:', e);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid JSON body' }),
                };
            }
        }

        const { threadId, message } = body || {};
        console.log('📝 Mensaje:', message?.substring(0, 50) + '...');

        // Validación de entrada
        if (!message || typeof message !== 'string') {
            console.log('❌ Mensaje inválido');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message is required and must be a string' }),
            };
        }

        // Limitar longitud del mensaje
        if (message.length > 500) {
            console.log('❌ Mensaje muy largo');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message is too long (max 500 characters)' }),
            };
        }

        // Verificar que las variables de entorno estén configuradas
        const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY_API;
        if (!apiKey || !ASSISTANT_ID) {
            console.error('❌ Variables de entorno faltantes');
            console.error('OPENAI_API_KEY/OPENAI_KEY_API:', !!apiKey);
            console.error('ASSISTANT_ID:', ASSISTANT_ID);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Server configuration error',
                    details: 'Missing environment variables'
                }),
            };
        }

        let currentThreadId = threadId;

        // Crear nuevo thread si no existe
        if (!currentThreadId) {
            console.log('🆕 Creando nuevo thread...');
            try {
                const thread = await openai.beta.threads.create();
                currentThreadId = thread.id;
                console.log('✅ Thread creado:', currentThreadId);
            } catch (e) {
                console.error('❌ Error creando thread:', e);
                throw new Error(`Error creating thread: ${e.message}`);
            }
        }

        // Añadir mensaje del usuario al thread
        console.log('💬 Añadiendo mensaje al thread:', currentThreadId);
        try {
            await openai.beta.threads.messages.create(currentThreadId, {
                role: 'user',
                content: message,
            });
        } catch (e) {
            console.error('❌ Error añadiendo mensaje:', e);
            throw new Error(`Error adding message: ${e.message}`);
        }

        // Ejecutar el asistente
        console.log('🤖 Ejecutando asistente con ID:', ASSISTANT_ID);
        let run;
        try {
            run = await openai.beta.threads.runs.create(currentThreadId, {
                assistant_id: ASSISTANT_ID,
                max_completion_tokens: 250,
            });
            console.log('✅ Run creado:', run.id);
        } catch (e) {
            console.error('❌ Error creando run:', e);
            throw new Error(`Error creating run: ${e.message}`);
        }

        // Esperar a que el asistente complete la respuesta
        let runStatus;
        try {
            runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
        } catch (e) {
            console.error('❌ Error recuperando run status:', e);
            throw new Error(`Error retrieving run status: ${e.message}`);
        }

        let attempts = 0;
        const maxAttempts = 30; // 30 segundos máximo

        console.log('⏳ Esperando respuesta...');
        while (runStatus.status !== 'completed' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
            try {
                runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
            } catch (e) {
                console.error('❌ Error en polling:', e);
                throw e;
            }
            attempts++;
            console.log(`⏳ Intento ${attempts}/${maxAttempts} - Status: ${runStatus.status}`);

            // Si el run falla
            if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
                console.error('❌ Run falló:', runStatus);
                console.error('Last error:', runStatus.last_error);
                throw new Error(`Run failed with status: ${runStatus.status}. Error: ${JSON.stringify(runStatus.last_error)}`);
            }
        }

        // Timeout
        if (attempts >= maxAttempts) {
            console.error('❌ Timeout esperando respuesta');
            return {
                statusCode: 408,
                headers,
                body: JSON.stringify({ error: 'Request timeout' }),
            };
        }

        // Obtener los mensajes del thread
        console.log('📨 Obteniendo mensajes...');
        let messages;
        try {
            messages = await openai.beta.threads.messages.list(currentThreadId);
        } catch (e) {
            console.error('❌ Error listando mensajes:', e);
            throw new Error(`Error listing messages: ${e.message}`);
        }

        // El mensaje más reciente del asistente
        const assistantMessage = messages.data.find(msg => msg.role === 'assistant');

        if (!assistantMessage) {
            console.error('❌ No se encontró respuesta del asistente');
            throw new Error('No assistant response found');
        }

        // Extraer el contenido del mensaje
        let responseText = '';
        try {
            if (assistantMessage.content[0].type === 'text') {
                responseText = assistantMessage.content[0].text.value;
            } else {
                responseText = 'Recibí un tipo de contenido no soportado.';
                console.warn('⚠️ Contenido no texto:', assistantMessage.content[0]);
            }
        } catch (e) {
            console.error('❌ Error extrayendo texto:', e);
            responseText = 'Error procesando la respuesta.';
        }

        console.log('✅ Respuesta obtenida:', responseText.substring(0, 50) + '...');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                threadId: currentThreadId,
                response: responseText,
            }),
        };

    } catch (error) {
        console.error('❌ Error CRÍTICO en chat function:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to process chat message',
                details: error.message,
                type: error.name
            }),
        };
    }
};
