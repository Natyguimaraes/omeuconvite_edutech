export function slugify(text) {
    return text

     .normalize('NFD')                // Remove acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove marcas de acento restantes
    .toLowerCase()
    .replace(/\s+/g, '-')            // Espaços viram hífens
    .replace(/[^\w\-]+/g, '')        // Remove caracteres não alfanuméricos
    .replace(/\-\-+/g, '-')          // Substitui múltiplos hífens por um só
    .replace(/^-+/, '')              // Remove hífens do começo
    .replace(/-+$/, '');             // Remove hífens do final
}