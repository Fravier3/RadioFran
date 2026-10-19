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

## Actualización 1.1.0
Encabezado del reproductor fijo con más espacio y contenido que se desplaza por separado para Safari/iPhone. Temporizador y enlaces externos ocultos mediante flags de producto. Logos originales de las 22 emisoras guardados localmente; procedencia documentada en `assets/logos/sources.json`. Se mantienen el nombre, URL, iconos instalados y la clave de preferencias. Caché 1.1.0 con revalidación de red, recarga controlada y limpieza únicamente de cachés antiguas de Radio Fran.

## Actualización 1.1.1
Favoritas comienza vacía en dispositivos nuevos o sin preferencias guardadas. Las emisoras elegidas por cada persona siguen guardándose solo en su navegador; se conservan durante las actualizaciones.

## Corrección 1.1.2
Limpieza única de favoritas almacenadas por las versiones antiguas, incluidas las precargadas. La marca `favoritesVersion: 2` preserva las elecciones posteriores; no se eliminan emisoras personales ni colores ni configuración. El módulo de preferencias se versiona junto al resto de la app para evitar mezclar archivos antiguos y nuevos.

## Corrección 1.1.3
WKAQ 580: reemplaza la señal HLS que devuelve error 500 al resolver la lista secundaria por la señal pública MP3 HTTPS de WKAQ. Verificada respuesta audio/mpeg, identificación ICY de WKAQ, decodificación MP3 y audio no silencioso el 19 de octubre de 2026. Se mantienen las favoritas y preferencias.
