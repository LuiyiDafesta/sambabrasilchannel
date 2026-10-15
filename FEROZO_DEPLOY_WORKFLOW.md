# Flujo de Despliegue para Ferozo vía GitHub - SambaBrasilChannel

Este proyecto (**Samba Brasil Channel**) está configurado con la arquitectura estructurada para Ferozo Hosting, donde la raíz del repositorio funciona directamente como el directorio público web (`public_html` o webroot) de Ferozo.

Todo el código fuente y el entorno de desarrollo se encuentran encapsulados dentro de la carpeta `_source/`.

---

## 📁 Estructura del Proyecto

```
SambaBrasilChannel/
├── .htaccess                 # Reglas de Apache, seguridad y ruteo SPA
├── .gitignore                # Exclusión estricta de credenciales y node_modules
├── FEROZO_DEPLOY_WORKFLOW.md # Este documento de instrucciones
├── README.md                 # Documentación del proyecto y servicios
├── robots.txt                # Configuración de rastreo SEO
├── upload_b2.php             # Endpoint PHP proxy para subir a Backblaze B2 / CDN Cloudflare
├── index.html                # Archivo principal servido por Ferozo en la raíz
├── assets/                   # Archivos estáticos finales compilados (JS, CSS, imágenes)
├── config/                   # Configuraciones del servidor (protegidas por .htaccess)
│   ├── b2_credentials.example.php # Plantilla para control de versiones
│   └── b2_credentials.php         # Credenciales reales activas (ignorado por Git)
├── supabase/                 # Esquemas SQL, migraciones y funciones
└── _source/                  # Código fuente de desarrollo de la aplicación (Frontend/React/Vite)
    ├── package.json
    ├── vite.config.ts        # Configurado para compilar hacia la raíz (outDir: '../')
    └── src/
```

---

## 🚀 ¿Cómo realizar cambios y desplegar a Ferozo?

Siempre que realices cambios en la aplicación dentro de `_source`, sigue este procedimiento:

### 1. Entrar a la carpeta de código fuente:
```bash
cd _source
```

### 2. Instalar dependencias (solo si se agregaron paquetes nuevos):
```bash
npm install
```

### 3. Desarrollo local (Live Server):
```bash
npm run dev
```

### 4. Compilar para producción:
```bash
npm run build
```
> **Nota:** La configuración de Vite (`outDir: '../'`) genera automáticamente el `index.html` y los recursos en `assets/` directamente en la raíz del proyecto.

### 5. Sincronizar y publicar a GitHub / Ferozo:
```bash
cd ..
git add .
git commit -m "feat: actualización del proyecto"
git push origin main
```

Una vez ejecutado el `push`, el webhook / integración de Git en tu panel de Ferozo sincronizará automáticamente los cambios en tiempo real.

---

## 🛡️ Seguridad y Buenas Prácticas
1. **NUNCA modifiques el `.htaccess`** eliminando los bloqueos a `_source/`, `config/` o `.env`.
2. Las claves secretas de base de datos y de Backblaze están excluidas por `.gitignore` y protegidas del acceso web directo.
3. El endpoint `upload_b2.php` permite recibir archivos y subirlos directamente al bucket de Backblaze B2 retornando la URL del CDN de Cloudflare (`https://cdn.sambabrasilchannel.com.ar`).
