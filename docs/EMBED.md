# Embeddable Version (iframe)

This project includes an embeddable version of the game that can be integrated into other websites using an iframe.

## Features

The embed version includes:

- ✅ Core game functionality (12 attempts to guess the word)
- ✅ Real-time similarity feedback
- ✅ Top 5 daily leaderboard
- ✅ Anonymous play with nickname
- ✅ Simplified UI optimized for embedding
- ❌ No authentication required
- ❌ No email reminders
- ❌ No complex badges/achievements
- ❌ No Rocky bonus feature

## Usage

### Basic Embed

Add this code to your HTML page:

```html
<iframe src="https://your-domain.com/embed" width="100%" height="800" frameborder="0" title="Guess the Word Game"></iframe>
```

### With Language Parameter

Specify the language using the `lang` query parameter (supports `en` or `es`):

```html
<!-- English (default) -->
<iframe src="https://your-domain.com/embed?lang=en" width="100%" height="800"></iframe>

<!-- Spanish -->
<iframe src="https://your-domain.com/embed?lang=es" width="100%" height="800"></iframe>
```

### Responsive Embed

For responsive sizing, use this approach:

```html
<div style="position: relative; padding-bottom: 100%; height: 0; overflow: hidden; max-width: 100%;">
  <iframe
    src="https://your-domain.com/embed?lang=en"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    title="Guess the Word Game"
  ></iframe>
</div>
```

### Recommended Dimensions

- **Desktop**: 1000px width × 800px height
- **Tablet**: 100% width × 800px height
- **Mobile**: 100% width × 900px height (needs more vertical space)

### Example with CSS

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .game-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .game-iframe {
        width: 100%;
        height: 800px;
        border: none;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      @media (max-width: 768px) {
        .game-iframe {
          height: 900px;
        }
      }
    </style>
  </head>
  <body>
    <div class="game-container">
      <h1>Play Guess the Word</h1>
      <iframe src="https://your-domain.com/embed?lang=en" class="game-iframe" title="Guess the Word Game" allow="clipboard-write"></iframe>
    </div>
  </body>
</html>
```

## Local Development

To test the embed locally:

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open the embed version at:

   ```
   # English
   http://localhost:3000/embed
   http://localhost:3000/embed?lang=en

   # Spanish
   http://localhost:3000/embed?lang=es
   ```

3. To test in an iframe, create a test HTML file:
   ```html
   <iframe src="http://localhost:3000/embed?lang=en" width="100%" height="800"></iframe>
   ```

## Customization

### Colors and Branding

The embed version uses the same Tailwind theme as the main app. To customize colors, modify `tailwind.config.ts`.

### Language

The embed supports both English and Spanish via the `lang` query parameter:

- `?lang=en` - English (default)
- `?lang=es` - Spanish

The language determines:

- Which daily word challenge to fetch
- API responses and data
- The daily leaderboard shown

**Note:** UI text is currently in English only. For full multilingual UI, additional translations would be needed.

## API Endpoints Used

The embed version uses the following existing API endpoints:

- `GET /api/challenge` - Fetches current challenge and user progress
- `POST /api/guess` - Submits a guess and receives similarity score
- `GET /api/leaderboard` - Fetches the daily leaderboard

All endpoints support anonymous users via `browserId` and `nickname` parameters.

## Security Considerations

- The embed version uses `localStorage` to store `browserId` and `nickname`
- No sensitive authentication data is stored
- Rate limiting is handled by the existing API
- CORS headers should be configured if embedding on external domains

## Adding CORS Support (if needed)

If you plan to embed on external domains, add CORS headers in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/embed',
      headers: [
        { key: 'X-Frame-Options', value: 'ALLOWALL' },
        { key: 'Content-Security-Policy', value: "frame-ancestors *" }
      ],
    },
  ]
}
```

## Limitations

- Embed version requires JavaScript enabled
- LocalStorage must be available
- Minimum width of 320px recommended
- Best experience on screens 768px+

## Support

For issues or questions about the embed version, refer to the main project documentation or open an issue in the repository.
