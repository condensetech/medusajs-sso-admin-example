import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      ssl: false,
      sslmode: 'disable',
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/auth-google",
            id: "google",
            options: {
              clientId: process.env.MEDUSA_AUTH_GOOGLE_CLIENT_ID,
              clientSecret: process.env.MEDUSA_AUTH_GOOGLE_CLIENT_SECRET,
              // use a default value, this will be overridden by our frontend
              callbackUrl:
                process.env.MEDUSA_AUTH_GOOGLE_DEFAULT_CALLBACK_URL || 
                `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/auth/user/google`,
            }
          },
        ],
      },
    },
  ],
})
