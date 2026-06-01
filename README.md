# frrr

React + Node/Express store (Luvé on Store).

## Local development

```bash
npm install
npm --prefix server install
npm --prefix client install
npm run start-all
```

- Store: http://localhost:3001  
- API: http://localhost:4000  

## Production (www.aaaurrrssimpire.org)

See [deploy/DEPLOY.md](deploy/DEPLOY.md).

```bash
npm run start:prod
```

Builds the client with `REACT_APP_API_URL=https://www.aaaurrrssimpire.org` and runs the API + static site on port **4000**.

## Google sign-in

Add redirect URI in Google Console:

`https://www.aaaurrrssimpire.org/auth/google/callback`
