import { defineMiddlewares, validateAndTransformQuery } from "@medusajs/framework/http"
import { authenticate } from "@medusajs/medusa"
import { AdminGetUsersParams } from "@medusajs/medusa/api/admin/users/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/auth/:provider/register",
      middlewares: [
        authenticate("user", ["api-key", "bearer", "session"], {
          allowUnregistered: true,
        }),
        validateAndTransformQuery(
          AdminGetUsersParams,
          {
            defaults: [
              "id",
              "email",
              "first_name",
              "last_name",
            ],
            allowed: [
              "id",
              "email",
              "first_name",
              "last_name",
            ],
            isList: false,
          }
        ),
      ]
    }
  ],
})