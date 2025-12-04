# Upload Deployment Files

> Before you create a deployment you need to upload the required files for that deployment. To do it, you need to first upload each file to this endpoint. Once that's completed, you can create a new deployment with the uploaded files. The file content must be placed inside the body of the request. In the case of a successful response you'll receive a status code 200 with an empty body.

## OpenAPI

````yaml https://spec.speakeasy.com/vercel/vercel-docs/vercel-oas-with-code-samples post /v2/files
paths:
  path: /v2/files
  method: post
  servers:
    - url: https://api.vercel.com
      description: Production API
  request:
    security:
      - title: bearerToken
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: Default authentication mechanism
          cookie: {}
    parameters:
      path: {}
      query:
        teamId:
          schema:
            - type: string
              description: The Team identifier to perform the request on behalf of.
              example: team_1a2b3c4d5e6f7g8h9i0j1k2l
        slug:
          schema:
            - type: string
              description: The Team slug to perform the request on behalf of.
              example: my-team-url-slug
      header:
        Content-Length:
          schema:
            - type: number
              description: The file size in bytes
        x-vercel-digest:
          schema:
            - type: string
              description: The file SHA1 used to check the integrity
              maxLength: 40
        x-now-digest:
          schema:
            - type: string
              description: The file SHA1 used to check the integrity
              deprecated: true
              maxLength: 40
        x-now-size:
          schema:
            - type: number
              description: The file size as an alternative to `Content-Length`
              deprecated: true
      cookie: {}
    body:
      application/octet-stream:
        schemaArray:
          - type: file
            contentEncoding: binary
        examples:
          example: {}
    codeSamples:
      - label: uploadFile
        lang: typescript
        source: |-
          import { Vercel } from "@vercel/sdk";

          const vercel = new Vercel({
            bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
          });

          async function run() {
            const result = await vercel.deployments.uploadFile({
              teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
              slug: "my-team-url-slug",
            });

            console.log(result);
          }

          run();
      - label: uploadFile
        lang: go
        source: "package main\n\nimport(\n\t\"os\"\n\t\"github.com/vercel/vercel\"\n\t\"context\"\n\t\"github.com/vercel/vercel/models/operations\"\n\t\"log\"\n)\n\nfunc main() {\n    s := vercel.New(\n        vercel.WithSecurity(os.Getenv(\"VERCEL_BEARER_TOKEN\")),\n    )\n\n    ctx := context.Background()\n    res, err := s.Deployments.UploadFile(ctx, operations.UploadFileRequest{})\n    if err != nil {\n        log.Fatal(err)\n    }\n    if res.OneOf != nil {\n        // handle response\n    }\n}"
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              urls:
                allOf:
                  - items:
                      type: string
                    type: array
                    description: Array of URLs where the file was updated
                    example:
                      - example-upload.aws.com
            requiredProperties:
              - urls
          - type: object
            properties: {}
        examples:
          example:
            value:
              urls:
                - example-upload.aws.com
        description: |-
          File already uploaded
          File successfully uploaded
    '400':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: |-
              One of the provided values in the headers is invalid
              Digest is not valid
              File size is not valid
        examples: {}
        description: |-
          One of the provided values in the headers is invalid
          Digest is not valid
          File size is not valid
    '401':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: The request is not authorized.
        examples: {}
        description: The request is not authorized.
    '403':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: You do not have permission to access this resource.
        examples: {}
        description: You do not have permission to access this resource.
  deprecated: false
  type: path
components:
  schemas: {}

````

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://vercel.mintlify.app/docs/rest-api/reference/llms.txt