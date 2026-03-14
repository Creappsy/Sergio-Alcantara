# Creappsy Form - Formulario de Datos para Artistas

Formulario de recopilación de datos para artistas musicales, construido con Next.js, TypeScript y React.

## Características

- **Next.js 14** con App Router
- **TypeScript** para tipado seguro
- **Backblaze B2** para almacenamiento de archivos
- **GoFile** como backup
- **Web3Forms** para envío de emails
- **Seguridad**:
  - Rate limiting
  - CSRF protection
  - XSS sanitization
  - Spam detection
  - Honeypot fields
  - Input validation

## Requisitos

- Node.js 18+
- Cuenta de Backblaze B2 (para archivos)
- API Key de Web3Forms (para emails)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/creappsy-form.git
cd creappsy-form

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env.local
```

## Configuración

Crea un archivo `.env.local` con las siguientes variables:

```env
# Backblaze B2 (almacenamiento)
B2_KEY_ID=tu_key_id
B2_APPLICATION_KEY=tu_application_key
B2_BUCKET_NAME=creappsy

# GoFile (backup)
GOFILE_TOKEN=tu_token
GOFILE_FOLDER_ID=tu_folder_id

# Web3Forms (email - público)
NEXT_PUBLIC_WEB3FORMS_KEY=tu_access_key
NEXT_PUBLIC_EMAIL_DESTINO=tu@email.com
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Producción

```bash
npm run build
npm start
```

## Despliegue en Vercel

1. Conecta tu repositorio de GitHub
2. Añade las variables de entorno en el dashboard
3. Despliega

## Estructura del Proyecto

```
creappsy-form/
├── app/
│   ├── api/
│   │   ├── upload/route.ts    # Subida de archivos (server-side)
│   │   └── submit/route.ts    # Envío de formulario (server-side)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── config.ts
│   ├── types.ts
│   └── utils.ts
├── public/
├── .env.local                 # ⚠️ NO subir a git
├── .gitignore
├── package.json
└── tsconfig.json
```

## Seguridad

- **Credenciales protegidas**: Las API keys de Backblaze y GoFile están en el servidor, no en el cliente
- **Rate Limiting**: Máximo 5 intentos por sesión
- **Validación**: Email, URL, colores hex, tipos de archivo
- **Sanitización**: XSS, HTML, caracteres peligrosos
- **Honeypot**: Campos ocultos para detectar bots

## Tecnologías

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Backblaze B2](https://www.backblaze.com/b2/)
- [Web3Forms](https://web3forms.com/)

## Licencia

MIT