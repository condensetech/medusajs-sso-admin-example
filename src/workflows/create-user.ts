import { UserDTO } from "@medusajs/framework/types"
import { createWorkflow, transform, WorkflowData, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"
import { createUsersWorkflow, CreateUserAccountWorkflowInput } from "@medusajs/medusa/core-flows"

export const createUserWorkflow = createWorkflow(
  "create-user-workflow",
  (
    input: WorkflowData<CreateUserAccountWorkflowInput>
  ): WorkflowResponse<UserDTO> => {
    const users = createUsersWorkflow.runAsStep({
      input: {
        users: [input.userData],
      }
    })

    const user = transform(
      users,
      (users: UserDTO[]) => users[0]
    )
    
    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "user",
      value: user.id,
    })

    return new WorkflowResponse(user)
  }
)