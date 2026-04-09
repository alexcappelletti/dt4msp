# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## OWS Map API

Il progetto espone un endpoint server-side per proxy OWS:

- `GET /api/ows/map`

Configura le variabili ambiente:

- `OWS_BASE_URL` URL base del servizio OWS (es. WMS endpoint)
- `OWS_TIMEOUT_MS` timeout richiesta upstream in millisecondi (default `15000`)

Esempio:

```bash
/api/ows/map?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=workspace:layer&CRS=EPSG:3857&BBOX=1372100,5695000,1380000,5702000&WIDTH=1024&HEIGHT=768&FORMAT=image/png
```

L'endpoint inoltra i query params al servizio OWS configurato e restituisce la risposta originale (JSON/XML/immagine).
