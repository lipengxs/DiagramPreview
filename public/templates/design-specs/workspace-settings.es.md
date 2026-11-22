# Configuración del espacio de trabajo — especificación

> Ejemplo independiente de DiagramPreview. Adáptalo a tu producto; no es un formato oficial de Figma.

## Objetivo y alcance
Permitir al propietario cambiar el nombre y la preferencia de notificaciones.
No incluye facturación, invitaciones ni gestión de permisos.
Usar datos ficticios sin conexión a producción.

## Variables de diseño
- Acción principal: #1D4ED8 con texto blanco.
- Texto: #0F172A sobre #FFFFFF; secundario: #475569; error: #B91C1C.
- Fuente: system-ui; cuerpo 16px / 24px; título 24px / 32px.
- Espaciado: 4, 8, 12, 16, 24, 32px; radio de tarjeta: 8px.
- Usar variables con nombre, sin añadir colores o espacios arbitrarios.

## Componentes y estados
### Botón Guardar
- Normal: «Guardar cambios», fondo principal.
- Al pasar el puntero: #1E40AF con texto blanco legible.
- Foco: contorno visible de 2px separado 2px.
- Desactivado si no hay cambios o los datos no son válidos; explicar errores junto al campo.
- Guardando: mostrar un mensaje e impedir envíos duplicados.
- Éxito: anunciar «Cambios guardados» mediante una región dinámica.
- Ante un error, conservar los datos y permitir reintentar.
### Nombre del espacio
- Obligatorio, de 2 a 60 caracteres tras recortar espacios exteriores.
- Etiqueta y ayuda visibles; el texto de ejemplo no sustituye la etiqueta.
- Validar al perder el foco y antes de guardar; asociar el error al campo.
- No guardar datos inválidos.

## Interacción y datos
1. Cargar el nombre y la preferencia actuales.
2. Habilitar Guardar solo con valores válidos y modificados.
3. Simular una petición y mostrar la carga al enviar.
4. Al terminar correctamente, conservar valores confirmados y anunciar el resultado.
5. Ante un fallo, conservar el borrador y permitir reintentar.
- Carga inicial: mostrar un indicador con texto.
- Fallo inicial: permitir reintentar sin inventar datos guardados.
- Si el nombre está vacío, mostrar un mensaje de campo obligatorio.

## Diseño adaptable
- Por debajo de 768px: una columna, margen de 16px y botón de ancho completo.
- Desde 768px: formulario centrado, ancho máximo 640px y margen de 24px.
- Con ancho de 320px: sin desplazamiento horizontal.

## Accesibilidad
- Cada entrada tiene etiqueta programática; Tab sigue el orden visual.
- Todas las acciones funcionan con teclado y foco visible.
- Comunicar éxito y error mediante texto, no solo color.
- Verificar contraste mínimo 4.5:1 del texto normal contra el fondo real.

## Lista de aceptación
- [ ] Para nombres vacíos, mostrar error e impedir el envío.
- [ ] Fuera de 2–60 caracteres, mostrar un error concreto.
- [ ] Los clics repetidos durante el guardado producen una sola petición.
- [ ] Ante un error, conservar los datos y permitir reintentar.
- [ ] Anunciar el éxito sin mover el foco.
- [ ] Comprobar teclado y diseño a 320px.
- [ ] Comparar cada estado implementado con esta especificación.

## Decisiones antes de producción
- TODO: confirmar API, autorizaciones y errores con desarrollo.
- TODO: confirmar notificaciones y textos con producto.
- Sustituir la simulación después de aprobar el contrato de datos.
