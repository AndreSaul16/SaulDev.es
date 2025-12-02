---
title: Mi Primer Post en el Blog
date: 2025-12-01
tags: [react, javascript, webdev, tutorial]
excerpt: Este es un post de prueba para demostrar todas las capacidades del sistema de blog con markdown, código, tablas y más.
---

# Bienvenido a Mi Blog

Este es un **post de prueba** que demuestra todas las capacidades del sistema de blog. Aquí podrás ver cómo se renderiza el markdown con estilos tipo GitHub.

## Características Principales

El sistema de blog incluye:

- ✅ Upload de archivos markdown
- ✅ Autenticación WebAuthn
- ✅ Generación automática de metadatos
- ✅ Preview en tiempo real
- ✅ Syntax highlighting para código
- ✅ Renderizado estilo GitHub

## Ejemplo de Código

### JavaScript

```javascript
// Función para saludar
function greeting(name) {
    console.log(`¡Hola, ${name}!`);
    return `Bienvenido al blog`;
}

// Uso
const message = greeting('Desarrollador');
console.log(message);
```

### Python

```python
def calculate_fibonacci(n):
    """Calcula la secuencia de Fibonacci"""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Generar los primeros 10 números
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
```

## Listas y Tareas

### Lista Sin Ordenar

- Primer elemento
- Segundo elemento
  - Sub-elemento 1
  - Sub-elemento 2
- Tercer elemento

### Lista Ordenada

1. Paso uno
2. Paso dos
3. Paso tres

## Tablas

| Framework | Popularidad | Dificultad |
|-----------|-------------|------------|
| React     | ⭐⭐⭐⭐⭐   | Media      |
| Vue       | ⭐⭐⭐⭐     | Fácil      |
| Angular   | ⭐⭐⭐       | Difícil    |

## Blockquotes

> "La mejor manera de predecir el futuro es inventarlo."
> 
> — Alan Kay

> **Nota importante:** Este es un ejemplo de blockquote con contenido importante que debe destacarse.

## Enlaces e Imágenes

Puedes visitar [mi portfolio](https://sauldev.es) para ver más proyectos.

Para código inline usa `const variable = 'valor'` así.

## Conclusión

Este post demuestra todas las capacidades de renderizado markdown del blog. El sistema:

1. **Renderiza** markdown con estilos tipo GitHub
2. **Genera** metadatos automáticos (tiempo de lectura, palabras)
3. **Valida** autenticación para subir posts
4. **Optimiza** la experiencia de usuario

¡Espero que disfrutes escribiendo y leyendo posts en este blog! 🚀
