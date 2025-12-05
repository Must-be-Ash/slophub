Update deployment integration action



Updates the deployment integration action for the specified integration installation

PATCH
/
v1
/
deployments
/
{deploymentId}
/
integrations
/
{integrationConfigurationId}
/
resources
/
{resourceId}
/
actions
/
{action}
Authorizations
​
Authorization
stringheaderrequired
Default authentication mechanism

Path Parameters
​
deploymentId
stringrequired
​
integrationConfigurationId
stringrequired
​
resourceId
stringrequired
​
action
stringrequired
Body
application/json
​
status
enum<string>
Available options: running, succeeded, failed 
​
statusText
string
​
statusUrl
string<uri>
​
outcomes
object[]
Hide child attributes

​
outcomes.kind
stringrequired
​
outcomes.secrets
object[]required
Hide child attributes

​
outcomes.secrets.name
stringrequired
​
outcomes.secrets.value
stringrequired

```
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await vercel.integrations.updateIntegrationDeploymentAction({
    deploymentId: "<id>",
    integrationConfigurationId: "<id>",
    resourceId: "<id>",
    action: "<value>",
  });


}

run();
```

```
curl --request PATCH \
  --url https://api.vercel.com/v1/deployments/{deploymentId}/integrations/{integrationConfigurationId}/resources/{resourceId}/actions/{action} \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "status": "running",
  "statusText": "<string>",
  "statusUrl": "<string>",
  "outcomes": [
    {
      "kind": "<string>",
      "secrets": [
        {
          "name": "<string>",
          "value": "<string>"
        }
      ]
    }
  ]
}
'
```