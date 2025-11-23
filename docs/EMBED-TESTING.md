# Testing the Embed Feature

## Quick Test Checklist

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test the Embed Page

- Navigate to: `http://localhost:3000/embed`
- Should see: Nickname entry form
- Enter a nickname (2+ chars)
- Should see: Game interface with leaderboard

### 3. Test Embed Info Page

- Navigate to: `http://localhost:3000/en/embed-info`
- Should see: Documentation page with copy button
- Click "Copy" button - should copy embed code
- Preview iframe should be visible and functional

### 4. Test Language Selector in Embed Info

- In embed-info page, click language buttons (EN/ES)
- Preview iframe should reload with selected language
- Embed code should update with correct `?lang=` parameter
- Copy button should copy updated code

### 5. Test Header Navigation

- Navigate to: `http://localhost:3000/en`
- Look for "📦 Embed" link in header navigation
- Click it - should go to embed-info page

### 6. Test Footer Link

- Navigate to: `http://localhost:3000/en`
- Scroll to footer
- Should see: "📦 Embed" link
- Click it - should go to embed-info page

### 7. Test Game Functionality

In the embed version:

- [ ] Can enter nickname
- [ ] Can submit guesses
- [ ] Similarity percentage displays correctly
- [ ] Attempts counter decreases
- [ ] Leaderboard loads (if data exists)
- [ ] Win state shows confetti and correct word
- [ ] Lose state shows correct word
- [ ] "Play the full version →" link works

### 7. Test Responsive Design

- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)

### 8. Test in Real iframe

Create test.html:

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Test Embed</h1>
    <!-- English version -->
    <iframe src="http://localhost:3000/embed?lang=en" width="100%" height="800"></iframe>

    <!-- Spanish version -->
    <!-- <iframe src="http://localhost:3000/embed?lang=es" width="100%" height="800"></iframe> -->
  </body>
</html>
```

Open test.html in browser and verify game works inside iframe with both languages.

## Expected Behavior

### On First Visit

1. User sees nickname form
2. Enters nickname
3. Sees game with:
   - Attempts remaining (12)
   - Category (if available)
   - Word length
   - Input field for guesses
   - Empty leaderboard (or top 5 if others played)

### During Game

1. User types a guess
2. Submits with Enter or click button
3. Guess appears in history with similarity %
4. Attempts counter decreases
5. Leaderboard updates if user makes progress

### On Win

1. Confetti animation
2. Target word revealed
3. Success message
4. Leaderboard shows with user's entry

### On Lose

1. Target word revealed
2. Game over message
3. Can still see leaderboard

## Common Issues

### Issue: TypeError in EmbedClient

**Cause**: Missing dependencies or incorrect imports
**Fix**: Check that all UI components are imported correctly

### Issue: Leaderboard not loading

**Cause**: No data in database for today
**Fix**: Play the main game first to create today's challenge

### Issue: "Cannot find module './EmbedClient'"

**Cause**: TypeScript hasn't picked up new files
**Fix**: Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "Restart TS Server")

### Issue: Iframe blocked by CSP

**Cause**: Strict Content Security Policy
**Fix**: Check next.config.js headers are correctly set

### Issue: LocalStorage not working

**Cause**: Browser privacy settings or iframe restrictions
**Fix**: Ensure site is served over HTTPS in production

## Performance Checks

- [ ] First load < 2 seconds
- [ ] API calls respond < 500ms
- [ ] No console errors
- [ ] No memory leaks (check DevTools)
- [ ] Smooth animations (60fps)

## Browser Compatibility

Test in:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Production Checklist

Before deploying:

- [ ] Update X-Frame-Options in next.config.js if needed
- [ ] Test with production domain in embed code
- [ ] Verify CORS settings
- [ ] Check rate limiting on APIs
- [ ] Test with real production data
- [ ] Verify analytics tracking (if applicable)
- [ ] Update documentation with production URLs

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Responsive on all devices
✅ Game is fully playable
✅ Leaderboard displays correctly
✅ Can be embedded on external sites
✅ Documentation is clear and complete

---

If all checks pass, the embed feature is ready to use! 🎉
