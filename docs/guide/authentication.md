# Authentication

Kiwi Code uses a token-based authentication system with automatic refresh. Tokens are stored securely on disk and shared across all three components (TUI, CLI, Runtime).

## Login

```bash
kiwi login
```

This prompts for your email and password, then exchanges them for tokens via the Kiwi API:

```
User → POST /v1/auth/ (email + password)
     ← { access_token, refresh_token, expires_in }
     → Saved to ~/.kiwi/tokens.json
```

## Token Storage

Tokens are stored at `~/.kiwi/tokens.json` with `0600` permissions (owner read/write only):

```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_at": "2025-07-07T00:00:00"
}
```

### Security Features

- **Atomic writes:** Tokens are written to a temp file then atomically renamed — no partial writes
- **Cross-process locking:** File-based locks (`fcntl` on Unix, `msvcrt` on Windows) prevent concurrent refresh races
- **Retry on read:** Up to 5 retries with 50ms delay for transient read errors
- **JWT expiry detection:** Parses the JWT `exp` claim as a fallback when `expires_at` is not provided
- **Safety buffer:** Tokens are considered expired 60 seconds before actual expiry

## Token Refresh

When the access token expires, Kiwi Code automatically refreshes it:

```
Client → POST /v1/auth/session/refresh?refresh_token=...
       ← { access_token, refresh_token }
       → Saved to ~/.kiwi/tokens.json
```

The TUI runs a background refresh timer that refreshes tokens when they're within 5 minutes of expiry.

## Check Auth Status

```bash
kiwi whoami
# Authenticated
# Server: https://api.runkai.ai
```

Or in the TUI:

```
/status
```

## Logout

```bash
kiwi logout
```

This deletes `~/.kiwi/tokens.json`.

## Runtime Token Sharing

When the TUI spawns a `kiwi-runtime` process, it passes the access token via the `--token` flag. The runtime uses this token for WebSocket authentication. If the token is refreshed while the runtime is running, the TUI updates the runtime's token through a shared control directory.

## Troubleshooting

### "Not authenticated"
Run `kiwi login` to sign in.

### "Saved session expired"
Your refresh token has also expired. Run `kiwi login` again.

### Token file permissions
If you see permission errors, ensure `~/.kiwi/tokens.json` has mode `0600`:

```bash
chmod 600 ~/.kiwi/tokens.json
```
