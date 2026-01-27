# Railway Environment Variables

Set these in your Railway web service:

```
NODE_ENV=production
PORT=${{PORT}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=change-this-to-a-long-random-string-in-production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=*
```

## Notes:

- `PORT` - Automatically provided by Railway (use the reference variable)
- `DATABASE_URL` - Reference your Postgres service (adjust "Postgres" if your service has a different name)
- `JWT_SECRET` - Generate a secure random string (at least 32 characters)
- `ALLOWED_ORIGINS` - Set to `*` to allow all origins, or specify your domain

## How to Set Variables in Railway:

1. Go to your project dashboard
2. Click on your **web service** (not the database)
3. Click **"Variables"** tab
4. Click **"New Variable"** for each one
5. For `DATABASE_URL`, click **"Add Reference"** → Select your Postgres service → Select `DATABASE_URL`
