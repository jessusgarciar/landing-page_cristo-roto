# Astro Landing · Cristo Roto

Landing turística de San José de Gracia: recorridos al Cristo Roto, restaurantes, comercios, hospedajes y servicios. Incluye galería, comentarios de visitantes y administración en `/sjg-admin/`.

Construida con Astro 6, Preact, TypeScript, Tailwind CSS 4 y Firebase (Authentication, Firestore y Storage).

## Iniciar

Requisitos: Node.js >= 22.12.0 y pnpm 11.16.0.

1. Instala dependencias: `pnpm install --frozen-lockfile`.
2. Copia `.env.example` a `.env` y completa la configuración web de Firebase.
3. Ejecuta `pnpm dev` y abre `http://localhost:4321`.

El sitio consulta Firestore durante la generación: necesita conexión y acceso de lectura a las colecciones de `landing-db`. El panel requiere una cuenta de Firebase Authentication con el claim `admin` o `superadmin`.

## Comandos

| Comando | Resultado |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo en el puerto 4321. |
| `pnpm build` | Genera el sitio estático en `build/`. |
| `pnpm preview` | Previsualiza la compilación local. |
| `pnpm deploy` | Compila y comprueba `build/index.html`; no publica. |

## Estructura

- `src/pages/`: landing y acceso al panel.
- `src/components/`: secciones públicas y componentes administrativos.
- `src/lib/`: configuración de Firebase, consultas y autenticación.
- `src/data/locales/`: textos en español, inglés y japonés.
- `public/`: imágenes, iconos y manifiesto.
- `firebase.json`, `firestore.landing.rules`, `firestore.landing.indexes.json` y `storage.rules`: configuración de infraestructura.

## Configuración y credenciales

- `.env` guarda la configuración local; solo `.env.example` se versiona.
- Las variables `PUBLIC_*` terminan en el navegador. La clave web de Firebase será visible en el sitio compilado; los permisos dependen de Authentication y las reglas de Firestore/Storage.
- No guardes claves privadas, cuentas de servicio, contraseñas ni tokens en `src/`, `public/` o variables `PUBLIC_*`.
