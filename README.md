# Radio Fran 🇵🇷

Radio de Puerto Rico para móvil, con el diseño Tropical cristal: fondo original de San Juan al atardecer, tarjetas translúcidas, coral y verde oscuro.

- Reproducción en directo de emisoras AM/FM mediante sus señales HTTPS. HLS nativo en Safari y hls.js en navegadores compatibles.
- Búsqueda por nombre, municipio, categoría y frecuencia; filtros AM/FM y categorías.
- Favoritas persistentes, edición de orden, emisoras personales editables y eliminables.
- Reproductor fijo, vista ampliada, controles Media Session y temporizador de apagado mientras la app está ejecutándose.
- Acentos personalizables, vista compacta o lista amplia.
- PWA con icono Radio original adaptado del icono de User Plex autorizado por su propietario; standalone en iPhone.
- Caché de interfaz sin cachear audio; actualización al cargar y volver al primer plano, preservando preferencias. Si está reproduciendo, avisa antes de recargar.

## Publicación
GitHub Pages desde `main` y `/ (root)`. Todos los archivos usan rutas relativas compatibles con `/RadioFran/`.

## Validación
`npm run check` y `npm test` (sin instalar dependencias). No contiene claves privadas ni requiere base de datos.

## Señales
Catálogo curado de Puerto Rico, con señales de los sitios de las emisoras y Radio Browser, revisado el 18 de octubre de 2026. Las frecuencias mostradas son las principales, no todos los repetidores de una cadena. La disponibilidad, anuncios, bloqueos regionales y contenido pertenecen a cada emisora. No se graba ni retransmite audio a través de un servidor propio. La app no está afiliada a las emisoras.

El navegador puede limitar reproducción de fondo y temporizadores al suspender la app. El temporizador se aplica al reanudarse si el sistema suspendió JavaScript. La interfaz se conserva sin internet; el audio requiere conexión. Se debe comprobar la reproducción en un iPhone físico.

## Dependencias
hls.js 1.6.13 (BSD-2-Clause), incluido localmente en `assets/hls.light.min.js`. Ver `assets/HLS-LICENSE`. Gráficos de interfaz SVG propios e imágenes originales generadas para este proyecto.
