/**
 * Utilidades para procesamiento de Markdown y generación de metadatos
 */

/**
 * Genera un slug URL-friendly a partir de un título
 * @param {string} title - Título del post
 * @returns {string} Slug generado
 */
export function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD') // Normalizar caracteres Unicode
        .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
        .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
        .replace(/\s+/g, '-') // Reemplazar espacios por guiones
        .replace(/-+/g, '-') // Eliminar guiones duplicados
        .trim();
}

/**
 * Calcula el tiempo estimado de lectura
 * @param {string} content - Contenido del post en markdown
 * @param {number} wpm - Palabras por minuto (por defecto 200)
 * @returns {string} Tiempo de lectura formateado
 */
export function calculateReadingTime(content, wpm = 200) {
    // Eliminar código y elementos markdown para contar solo texto
    const text = content
        .replace(/```[\s\S]*?```/g, '') // Eliminar bloques de código
        .replace(/`[^`]*`/g, '') // Eliminar código inline
        .replace(/!\[.*?\]\(.*?\)/g, '') // Eliminar imágenes
        .replace(/\[.*?\]\(.*?\)/g, '') // Eliminar links
        .replace(/[#*_~`]/g, ''); // Eliminar caracteres markdown

    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wpm);

    if (minutes < 1) return '< 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
}

/**
 * Cuenta las palabras en el contenido
 * @param {string} content - Contenido del post
 * @returns {number} Número de palabras
 */
export function countWords(content) {
    const text = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/[#*_~`]/g, '');

    return text.trim().split(/\s+/).length;
}

/**
 * Extrae un extracto del contenido
 * @param {string} content - Contenido completo
 * @param {number} maxLength - Longitud máxima del extracto
 * @returns {string} Extracto generado
 */
export function extractExcerpt(content, maxLength = 200) {
    // Eliminar frontmatter si existe
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

    // Eliminar markdown
    const text = withoutFrontmatter
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^#+\s+/gm, '')
        .replace(/[*_~`]/g, '')
        .trim();

    // Tomar primeras palabras
    if (text.length <= maxLength) return text;

    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return truncated.substring(0, lastSpace) + '...';
}

/**
 * Parser robusto de frontmatter YAML
 * @param {string} markdown - Contenido markdown con frontmatter
 * @returns {Object} { metadata, content }
 */
export function parseFrontmatter(markdown) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = markdown.match(frontmatterRegex);

    if (!match) {
        return {
            metadata: {},
            content: markdown,
        };
    }

    const frontmatter = match[1];
    const content = match[2];

    const metadata = {};

    frontmatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();

        if (!key || !value) return;

        // Parse arrays [item1, item2, item3]
        if (value.startsWith('[') && value.endsWith(']')) {
            metadata[key] = value
                .slice(1, -1)
                .split(',')
                .map(v => v.trim().replace(/^['"]|['"]$/g, ''))
                .filter(v => v);
        }
        // Parse booleans
        else if (value === 'true' || value === 'false') {
            metadata[key] = value === 'true';
        }
        // Parse numbers
        else if (!isNaN(value) && value !== '') {
            metadata[key] = Number(value);
        }
        // Parse strings (remove quotes)
        else {
            metadata[key] = value.replace(/^['"]|['"]$/g, '');
        }
    });

    return { metadata, content };
}

/**
 * Valida que un post tenga los campos requeridos
 * @param {Object} post - Objeto del post
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePost(post) {
    const errors = [];

    if (!post.title || typeof post.title !== 'string' || post.title.trim() === '') {
        errors.push('El título es requerido');
    }

    if (!post.content || typeof post.content !== 'string' || post.content.trim() === '') {
        errors.push('El contenido es requerido');
    }

    if (post.tags && !Array.isArray(post.tags)) {
        errors.push('Los tags deben ser un array');
    }

    if (post.date) {
        const date = new Date(post.date);
        if (isNaN(date.getTime())) {
            errors.push('La fecha no es válida');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Formatea una fecha en español
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
