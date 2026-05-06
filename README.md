# pharma-care-hub

## Qué hace esta aplicación

Esta app funciona localmente sin depender de Base44.

## Cómo usarla en tu ordenador

1. Abre una terminal.
2. Ve a la carpeta del proyecto:
   ```bash
   cd /Users/aitorsanvicente/Downloads/pharma-care-hub
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia la app en modo desarrollo:
   ```bash
   npm run dev
   ```
5. Abre el navegador en la dirección que muestre Vite.

## Cómo construir el proyecto

Para generar la versión lista para producción:

```bash
npm run build
```

## Ya está corregido

- No usa Base44.
- No necesita variables de entorno de Base44.
- `npm run lint` funciona.
- `npm run build` funciona.

## Cómo subirlo a GitHub

1. Crea un repositorio nuevo en GitHub.
2. Copia la URL del repositorio.
3. En tu proyecto local, conecta el remoto:
   ```bash
   git remote add origin https://github.com/tu-usuario/pharma-care-hub.git
   ```
4. Envía el código a GitHub:
   ```bash
   git branch -M main
   git push -u origin main
   ```

> Si ya usas SSH, sustituye la URL por `git@github.com:tu-usuario/pharma-care-hub.git`.

## Notas

- El repositorio ya incluye `.gitignore` para no subir `node_modules` ni `dist`.
- Si tu VS Code muestra errores, recarga la ventana con `Cmd+Shift+P` → `Reload Window`.
