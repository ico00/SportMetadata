# Web Deployment Guide

Aplikacija je sada podržana i za web i za desktop (Tauri). Automatski detektira okruženje i koristi odgovarajući storage mehanizam.

## Build za Web

```bash
npm run build:web
```

Ovo će kreirati `dist-web` folder sa statičkim fajlovima koji se mogu deployati na bilo koji web hosting.

## Deployment Opcije

### 1. Static Hosting (Vercel, Netlify, GitHub Pages)

1. Build aplikaciju:
   ```bash
   npm run build:web
   ```

2. Deploy `dist-web` folder na hosting servis

### 2. Vercel

```bash
npm install -g vercel
vercel --prod
```

### 3. Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist-web
```

### 3. GitHub Pages

1. Build aplikaciju
2. Push `dist-web` folder na GitHub
3. Enable GitHub Pages u repository settings

## Razlike između Web i Desktop verzije

- **Storage**: Web koristi `localStorage`, Desktop koristi file system
- **Export**: Web koristi browser download API, Desktop koristi native file dialog
- **Sve ostalo**: Isto funkcionira u obje verzije

## Development

Za web development:
```bash
npm run dev
```

Za desktop development:
```bash
npm run tauri:dev
```
