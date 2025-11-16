# TODO: Fix Backend Errors

## Errors to Fix
- Unauthorized error from Lingo.dev (likely invalid API key in .env)
- ZodError: Invalid locale code (validate targetLocale before passing to lingo)
- ReferenceError: text is not defined (fix destructuring in /translate endpoint)

## Steps
- [x] Add validateLocale function to check valid locale codes
- [x] Update destructuring in all endpoints to provide defaults
- [x] Add locale validation in translation endpoints
- [x] Test the server after fixes

## Test Results
- [x] Invalid locale validation: Returns proper error messages
- [x] ReferenceError fixed: No more crashes in catch blocks
- [x] API key validation: Server starts only if key is present
- [x] Lingo.dev API: Still unauthorized (API key issue, not code)
- [x] OpenRouter API: Fails due to missing or invalid key (not code)

## Remaining Issues
- LINGODOTDEV_API_KEY appears invalid (Unauthorized error)
- OPENROUTER_API_KEY not set or invalid (generation failed)
