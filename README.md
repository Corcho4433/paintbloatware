# PaintBloatware

Aplicación web de tipo red social centrada en dibujo generado por código. Los usuarios escriben scripts en **Lua** en un editor integrado; el resultado se renderiza en tiempo real en un canvas y puede publicarse como post. Incluye feed con filtros por etiquetas, perfiles de usuario, comentarios en hilo, likes, autenticación (email y OAuth con Google/GitHub), wiki de documentación y una sección premium (Nitro) con integración de pagos.

---

## Funcionalidades

- **Editor de código (Lua):** En `/draw` se escribe Lua que dibuja sobre una grilla. La salida se obtiene en vivo mediante un servidor de render vía WebSocket y se muestra en un canvas.
- **Feed y descubrimiento:** Página principal con posts recientes, filtro por tags y scroll infinito. Vista FastDraws con dibujos y comentarios en hilo.
- **Publicación:** Subida de posts (imagen y código opcional), descripción y tags. Opción de ocultar el código. Beneficios adicionales para usuarios Nitro.
- **Usuarios:** Registro e inicio de sesión (email u OAuth con Google/GitHub). Perfil (`/user/:id`), configuración (tema del editor, tamaño de grilla) y cierre de sesión.
- **Interacción:** Likes, comentarios anidados y vista de post individual.
- **Wiki:** Artículos en Markdown con resaltado de sintaxis para Lua.
- **Administración:** Panel de administración en `/dashboard`.
- **Nitro:** Sección premium en `/comprar-nitro` con integración a Mercado Pago.

---

## Dependencias de servicios

Para que la aplicación funcione por completo (API, render en vivo y almacenamiento de assets) se requieren estos servicios externos:

### Backend en Rust (API REST + WebSocket)

- **API REST:** debe estar disponible en `http://localhost:60014`. El frontend hace proxy de `/api` hacia este servidor (autenticación, usuarios, posts, comentarios, etc.).
- **Servidor WebSocket de render:** debe estar disponible en `ws://localhost:8080`. El frontend se conecta a la ruta `/render` (proxy hacia este WebSocket) para enviar el código Lua y recibir los frames renderizados que se muestran en el canvas del editor.

Sin el backend en Rust levantado, el login, el feed, la subida de posts y el render en vivo en `/draw` no funcionarán.

### MinIO

- **Almacenamiento de objetos:** MinIO debe estar disponible en `http://localhost:9000`. El frontend hace proxy de `/minio` hacia este servicio para servir y subir imágenes y otros assets (por ejemplo, las imágenes de los posts).

Sin MinIO, la carga y visualización de imágenes asociadas a los posts fallará.

---

## Cómo ejecutar el proyecto

### Requisitos

- **Node.js** (o **Bun**) para instalar dependencias y ejecutar los scripts.
- Para uso completo: backend en Rust (puertos 60014 y 8080) y MinIO (puerto 9000), tal como se describe arriba.

### Pasos

1. **Clonar e instalar dependencias**

   ```bash
   git clone <repo>
   cd paintbloatware
   npm install
   ```

   Con Bun: `bun install`.

2. **Modo desarrollo**

   ```bash
   npm run dev
   ```

   La aplicación se sirve en **http://localhost:60015** (configurado en `vite.config.ts`). El proxy de Vite redirige `/api` al backend, `/render` al WebSocket de render y `/minio` a MinIO.

3. **Build para producción**

   ```bash
   npm run build
   ```

   La salida se genera en la carpeta `dist/`.

4. **Previsualizar el build**

   ```bash
   npm run preview
   ```

   Sirve el contenido de `dist/` localmente para probar el build.

5. **Otros scripts**

   - `npm run lint` — ejecuta ESLint.
   - `npm run start` — sirve `dist/index.html` con Bun (requiere haber ejecutado `build` antes).

Si solo se ejecuta el frontend sin backend ni MinIO, la interfaz y el editor serán utilizables, pero las llamadas a API, el render por WebSocket y la subida/visualización de assets fallarán hasta que esos servicios estén disponibles.

---

## Stack tecnológico

- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS, Flowbite, Zustand (estado y persistencia), Formik y Yup (formularios).
- **Complementos:** react-syntax-highlighter (Lua en editor y wiki), react-markdown y remark-gfm (wiki), SDK de Mercado Pago, Axios, js-cookie.
