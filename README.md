# 🇧🇷 Samba Brasil Channel (SambaBrasilChannel)

Proyecto web interactivo y multimedia para **Samba Brasil Channel**, optimizado para alojamiento en **Ferozo PHP Estático**, almacenamiento de medios en **Backblaze B2**, distribución sin costos de salida con **Cloudflare CDN**, y persistencia de datos en **Supabase**.

---

## 🏗️ Arquitectura del Proyecto

```
SambaBrasilChannel/
├── .htaccess                 # Directivas de seguridad Apache, protección de fuentes y ruteo SPA
├── .gitignore                # Reglas estrictas de privacidad (credenciales y node_modules excluidos)
├── FEROZO_DEPLOY_WORKFLOW.md # Guía paso a paso para compilación y sincronización con Ferozo
├── README.md                 # Documentación técnica general
├── robots.txt                # Directivas de indexación para buscadores
├── upload_b2.php             # Proxy PHP para carga directa a Backblaze B2 (SigV4) y respuesta CDN
├── index.html                # Archivo principal compilado en la raíz para Ferozo
├── assets/                   # Archivos estáticos finales (JS, CSS empaquetados)
├── config/                   # Configuración del servidor (bloqueado por .htaccess)
│   ├── b2_credentials.example.php # Plantilla de variables para versionado
│   └── b2_credentials.php         # Credenciales de almacenamiento (ignorado por Git)
├── supabase/                 # Esquemas SQL, migraciones y funciones
│   └── schema.sql
└── _source/                  # Código fuente de la aplicación (React + TypeScript + Vite)
    ├── package.json
    ├── vite.config.ts        # Configurado para compilar hacia la raíz (`../`)
    ├── .env.example          # Variables de entorno cliente
    ├── .env                  # Variables locales activas (ignorado por Git)
    └── src/
        ├── lib/
        │   ├── supabase.ts   # Conexión cliente a Supabase
        │   └── storage.ts    # Conexión al CDN y proxy de subida
        ├── App.tsx
        ├── main.tsx
        └── index.css
```

---

## ⚡ Servicios Integrados

| Servicio | Identificador / Endpoint | Rol |
| :--- | :--- | :--- |
| **Hosting Web** | Ferozo Hosting | Servidor PHP / Apache para archivos estáticos y API proxy |
| **Repositorio Git** | `LuiyiDafesta/sambabrasilchannel` | Sincronización automática a Ferozo al hacer `push` |
| **Base de Datos** | Supabase (`tgiysffinqhwpyuebmon`) | Base de datos relacional PostgreSQL y autenticación |
| **Storage B2** | Backblaze B2 (`SambaBrasil`) | Almacenamiento seguro de fotos y archivos multimedia |
| **CDN Privado** | `https://cdn.sambabrasilchannel.com.ar` | Red de distribución Cloudflare proxy B2 (0% costo egress) |

---

## 📦 Flujo de Trabajo (Deploy a Ferozo)

1. Desarrollar dentro de `_source/`:
   ```bash
   cd _source
   npm run dev
   ```
2. Compilar hacia la raíz:
   ```bash
   npm run build
   ```
3. Subir a GitHub (despliegue automático a Ferozo):
   ```bash
   cd ..
   git add .
   git commit -m "feat: mi nueva funcionalidad"
   git push origin main
   ```
