import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createUserWorkflow } from "../../../../workflows/create-user";
import { refetchUser } from "@medusajs/medusa/api/admin/users/helpers";
import { CreateUserDTO } from "@medusajs/framework/types";
import { MedusaError, Modules } from "@medusajs/framework/utils";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  if (req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a user."
    )
  }
  const authId = req.auth_context.auth_identity_id;
  if (!authId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "User is missing an auth identity."
    )
  }

  const authModuleService = req.scope.resolve(Modules.AUTH);
  const providerIdentities = await authModuleService.listProviderIdentities({
    auth_identity_id: authId,
    provider: req.params.provider
  })
  if (providerIdentities.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "User is missing a provider identity."
    )
  }
  const providerIdentity = providerIdentities[0]
  if (!providerIdentity.user_metadata) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "User is missing user metadata."
    )
  }
  const { user_metadata } = providerIdentity;

  const createUsers = createUserWorkflow(req.scope)
  const userData: CreateUserDTO = {
    email: user_metadata.email as string,
    first_name: (user_metadata.given_name || user_metadata.first_name) as string | null,
    last_name: (user_metadata.family_name || user_metadata.last_name) as string | null,
  }

  const { result } = await createUsers.run({
    input: { userData, authIdentityId: req.auth_context.auth_identity_id },
  })

  const user = await refetchUser(
    result.id,
    req.scope,
    req.queryConfig.fields
  )

  res.status(200).json({ user })
}