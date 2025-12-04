# Create a new deployment

> Create a new deployment with all the required and intended data. If the deployment is not a git deployment, all files must be provided with the request, either referenced or inlined. Additionally, a deployment id can be specified to redeploy a previous deployment.

## OpenAPI

````yaml https://spec.speakeasy.com/vercel/vercel-docs/vercel-oas-with-code-samples post /v13/deployments
paths:
  path: /v13/deployments
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
        forceNew:
          schema:
            - type: enum<string>
              enum:
                - '0'
                - '1'
              description: >-
                Forces a new deployment even if there is a previous similar
                deployment
        skipAutoDetectionConfirmation:
          schema:
            - type: enum<string>
              enum:
                - '0'
                - '1'
              description: >-
                Allows to skip framework detection so the API would not fail to
                ask for confirmation
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
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              customEnvironmentSlugOrId:
                allOf:
                  - description: >-
                      Deploy to a custom environment, which will override the
                      default environment
                    type: string
              deploymentId:
                allOf:
                  - description: An deployment id for an existing deployment to redeploy
                    type: string
                    example: dpl_2qn7PZrx89yxY34vEZPD31Y9XVj6
              files:
                allOf:
                  - description: A list of objects with the files to be deployed
                    items:
                      oneOf:
                        - additionalProperties: false
                          description: >-
                            Used in the case you want to inline a file inside
                            the request
                          properties:
                            data:
                              description: >-
                                The file content, it could be either a `base64`
                                (useful for images, etc.) of the files or the
                                plain content for source code
                              type: string
                            encoding:
                              description: >-
                                The file content encoding, it could be either a
                                base64 (useful for images, etc.) of the files or
                                the plain text for source code.
                              enum:
                                - base64
                                - utf-8
                            file:
                              description: The file name including the whole path
                              example: folder/file.js
                              type: string
                          required:
                            - file
                            - data
                          title: InlinedFile
                          type: object
                        - additionalProperties: false
                          description: >-
                            Used in the case you want to reference a file that
                            was already uploaded
                          properties:
                            file:
                              description: The file path relative to the project root
                              example: folder/file.js
                              type: string
                            sha:
                              description: >-
                                The file contents hashed with SHA1, used to
                                check the integrity
                              type: string
                            size:
                              description: The file size in bytes
                              type: integer
                          required:
                            - file
                          title: UploadedFile
                          type: object
                    type: array
              gitMetadata:
                allOf:
                  - description: >-
                      Populates initial git metadata for different git
                      providers.
                    additionalProperties: false
                    type: object
                    properties:
                      remoteUrl:
                        type: string
                        description: The git repository's remote origin url
                        example: https://github.com/vercel/next.js
                      commitAuthorName:
                        type: string
                        description: The name of the author of the commit
                        example: kyliau
                      commitAuthorEmail:
                        type: string
                        description: The email of the author of the commit
                        example: kyliau@example.com
                      commitMessage:
                        type: string
                        description: The commit message
                        example: >-
                          add method to measure Interaction to Next Paint (INP)
                          (#36490)
                      commitRef:
                        type: string
                        description: The branch on which the commit was made
                        example: main
                      commitSha:
                        type: string
                        description: The hash of the commit
                        example: dc36199b2234c6586ebe05ec94078a895c707e29
                      dirty:
                        type: boolean
                        description: >-
                          Whether or not there have been modifications to the
                          working tree since the latest commit
                        example: true
                      ci:
                        type: boolean
                        description: True if process.env.CI was set when deploying
                        example: true
                      ciType:
                        type: string
                        description: The type of CI system used
                        example: github-actions
                      ciGitProviderUsername:
                        type: string
                        description: >-
                          The username used for the Git Provider (e.g. GitHub)
                          if their CI (e.g. GitHub Actions) was used, if
                          available
                        example: rauchg
                      ciGitRepoVisibility:
                        type: string
                        description: >-
                          The visibility of the Git repository if their CI (e.g.
                          GitHub Actions) was used, if available
                        example: private
              gitSource:
                allOf:
                  - description: >-
                      Defines the Git Repository source to be deployed. This
                      property can not be used in combination with `files`.
                    anyOf:
                      - properties:
                          ref:
                            type: string
                            example: main
                          repoId:
                            oneOf:
                              - type: number
                              - type: string
                            example: 123456789
                          sha:
                            type: string
                            example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
                          type:
                            enum:
                              - github
                            type: string
                        required:
                          - type
                          - ref
                          - repoId
                        type: object
                      - properties:
                          org:
                            type: string
                            example: vercel
                          ref:
                            type: string
                            example: main
                          repo:
                            type: string
                            example: next.js
                          sha:
                            type: string
                            example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
                          type:
                            enum:
                              - github
                            type: string
                        required:
                          - type
                          - ref
                          - org
                          - repo
                        type: object
                      - properties:
                          ref:
                            type: string
                            example: main
                          repoId:
                            oneOf:
                              - type: number
                              - type: string
                            example: 123456789
                          sha:
                            type: string
                            example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
                          type:
                            enum:
                              - github-limited
                            type: string
                        required:
                          - type
                          - ref
                          - repoId
                        type: object
                      - properties:
                          org:
                            type: string
                            example: vercel
                          ref:
                            type: string
                            example: main
                          repo:
                            type: string
                            example: next.js
                          sha:
                            type: string
                            example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
                          type:
                            enum:
                              - github-limited
                            type: string
                        required:
                          - type
                          - ref
                          - org
                          - repo
                        type: object
                      - properties:
                          projectId:
                            oneOf:
                              - type: number
                              - type: string
                            example: 987654321
                          ref:
                            type: string
                            example: main
                          sha:
                            type: string
                            example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
                          type:
                            enum:
                              - gitlab
                            type: string
                        required:
                          - type
                          - ref
                          - projectId
                        type: object
                      - properties:
                          ref:
                            type: string
                            example: main
                          repoUuid:
                            type: string
                            example: 123e4567-e89b-12d3-a456-426614174000
                          sha:
                            type: string
                            example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
                          type:
                            enum:
                              - bitbucket
                            type: string
                          workspaceUuid:
                            type: string
                            example: 987e6543-e21b-12d3-a456-426614174000
                        required:
                          - type
                          - ref
                          - repoUuid
                        type: object
                      - properties:
                          owner:
                            type: string
                            example: bitbucket_user
                          ref:
                            type: string
                            example: main
                          sha:
                            type: string
                            example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
                          slug:
                            type: string
                            example: my-awesome-project
                          type:
                            enum:
                              - bitbucket
                            type: string
                        required:
                          - type
                          - ref
                          - owner
                          - slug
                        type: object
              meta:
                allOf:
                  - additionalProperties:
                      maxLength: 65536
                      type: string
                    description: >-
                      An object containing the deployment's metadata. Multiple
                      key-value pairs can be attached to a deployment
                    example:
                      foo: bar
                    maxProperties: 100
                    type: object
              monorepoManager:
                allOf:
                  - description: >-
                      The monorepo manager that is being used for this
                      deployment. When `null` is used no monorepo manager is
                      selected
                    type: string
                    nullable: true
              name:
                allOf:
                  - description: A string with the project name used in the deployment URL
                    example: my-instant-deployment
                    type: string
              project:
                allOf:
                  - description: >-
                      The target project identifier in which the deployment will
                      be created. When defined, this parameter overrides name
                    example: my-deployment-project
                    type: string
              projectSettings:
                allOf:
                  - additionalProperties: false
                    description: >-
                      Project settings that will be applied to the deployment.
                      It is required for the first deployment of a project and
                      will be saved for any following deployments
                    properties:
                      buildCommand:
                        description: >-
                          The build command for this project. When `null` is
                          used this value will be automatically detected
                        maxLength: 256
                        type: string
                        nullable: true
                        example: next build
                      commandForIgnoringBuildStep:
                        maxLength: 256
                        type: string
                        nullable: true
                      devCommand:
                        description: >-
                          The dev command for this project. When `null` is used
                          this value will be automatically detected
                        maxLength: 256
                        type: string
                        nullable: true
                      framework:
                        description: >-
                          The framework that is being used for this project.
                          When `null` is used no framework is selected
                        type: string
                        enum:
                          - null
                          - blitzjs
                          - nextjs
                          - gatsby
                          - remix
                          - react-router
                          - astro
                          - hexo
                          - eleventy
                          - docusaurus-2
                          - docusaurus
                          - preact
                          - solidstart-1
                          - solidstart
                          - dojo
                          - ember
                          - vue
                          - scully
                          - ionic-angular
                          - angular
                          - polymer
                          - svelte
                          - sveltekit
                          - sveltekit-1
                          - ionic-react
                          - create-react-app
                          - gridsome
                          - umijs
                          - sapper
                          - saber
                          - stencil
                          - nuxtjs
                          - redwoodjs
                          - hugo
                          - jekyll
                          - brunch
                          - middleman
                          - zola
                          - hydrogen
                          - vite
                          - tanstack-start
                          - vitepress
                          - vuepress
                          - parcel
                          - fastapi
                          - flask
                          - fasthtml
                          - sanity-v3
                          - sanity
                          - storybook
                          - nitro
                          - hono
                          - express
                          - h3
                          - nestjs
                          - elysia
                          - fastify
                          - xmcp
                        nullable: true
                      installCommand:
                        description: >-
                          The install command for this project. When `null` is
                          used this value will be automatically detected
                        maxLength: 256
                        type: string
                        nullable: true
                        example: pnpm install
                      nodeVersion:
                        description: >-
                          Override the Node.js version that should be used for
                          this deployment
                        enum:
                          - 24.x
                          - 22.x
                          - 20.x
                          - 18.x
                          - 16.x
                          - 14.x
                          - 12.x
                          - 10.x
                          - 8.10.x
                        type: string
                      outputDirectory:
                        description: >-
                          The output directory of the project. When `null` is
                          used this value will be automatically detected
                        maxLength: 256
                        type: string
                        nullable: true
                      rootDirectory:
                        description: >-
                          The name of a directory or relative path to the source
                          code of your project. When `null` is used it will
                          default to the project root
                        maxLength: 256
                        type: string
                        nullable: true
                      serverlessFunctionRegion:
                        description: >-
                          The region to deploy Serverless Functions in this
                          project
                        maxLength: 4
                        type: string
                        nullable: true
                      skipGitConnectDuringLink:
                        description: >-
                          Opts-out of the message prompting a CLI user to
                          connect a Git repository in `vercel link`.
                        type: boolean
                        deprecated: true
                      sourceFilesOutsideRootDirectory:
                        description: >-
                          Indicates if there are source files outside of the
                          root directory, typically used for monorepos
                        type: boolean
                    type: object
              target:
                allOf:
                  - description: >-
                      Either not defined, `staging`, `production`, or a custom
                      environment identifier. If `staging`, a staging alias in
                      the format `<project>-<team>.vercel.app` will be assigned.
                      If `production`, any aliases defined in `alias` will be
                      assigned. If omitted, the target will be `preview`.
                    type: string
                    example: production
              withLatestCommit:
                allOf:
                  - description: >-
                      When `true` and `deploymentId` is passed in, the sha from
                      the previous deployment's `gitSource` is removed forcing
                      the latest commit to be used.
                    type: boolean
            required: true
            requiredProperties:
              - name
            additionalProperties: false
        examples:
          example:
            value:
              customEnvironmentSlugOrId: <string>
              deploymentId: dpl_2qn7PZrx89yxY34vEZPD31Y9XVj6
              files:
                - data: <string>
                  encoding: base64
                  file: folder/file.js
              gitMetadata:
                remoteUrl: https://github.com/vercel/next.js
                commitAuthorName: kyliau
                commitAuthorEmail: kyliau@example.com
                commitMessage: add method to measure Interaction to Next Paint (INP) (#36490)
                commitRef: main
                commitSha: dc36199b2234c6586ebe05ec94078a895c707e29
                dirty: true
                ci: true
                ciType: github-actions
                ciGitProviderUsername: rauchg
                ciGitRepoVisibility: private
              gitSource:
                ref: main
                repoId: 123456789
                sha: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
                type: github
              meta:
                foo: bar
              monorepoManager: <string>
              name: my-instant-deployment
              project: my-deployment-project
              projectSettings:
                buildCommand: next build
                commandForIgnoringBuildStep: <string>
                devCommand: <string>
                framework: blitzjs
                installCommand: pnpm install
                nodeVersion: 24.x
                outputDirectory: <string>
                rootDirectory: <string>
                serverlessFunctionRegion: <string>
                skipGitConnectDuringLink: true
                sourceFilesOutsideRootDirectory: true
              target: production
              withLatestCommit: true
    codeSamples:
      - label: createDeployment
        lang: typescript
        source: |-
          import { Vercel } from "@vercel/sdk";

          const vercel = new Vercel({
            bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
          });

          async function run() {
            const result = await vercel.deployments.createDeployment({
              teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
              slug: "my-team-url-slug",
              requestBody: {
                deploymentId: "dpl_2qn7PZrx89yxY34vEZPD31Y9XVj6",
                files: [
                  {
                    data: "<value>",
                    file: "folder/file.js",
                  },
                ],
                gitMetadata: {
                  remoteUrl: "https://github.com/vercel/next.js",
                  commitAuthorName: "kyliau",
                  commitAuthorEmail: "kyliau@example.com",
                  commitMessage: "add method to measure Interaction to Next Paint (INP) (#36490)",
                  commitRef: "main",
                  commitSha: "dc36199b2234c6586ebe05ec94078a895c707e29",
                  dirty: true,
                  ci: true,
                  ciType: "github-actions",
                  ciGitProviderUsername: "rauchg",
                  ciGitRepoVisibility: "private",
                },
                gitSource: {
                  projectId: 987654321,
                  ref: "main",
                  sha: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
                  type: "gitlab",
                },
                meta: {
                  "foo": "bar",
                },
                name: "my-instant-deployment",
                project: "my-deployment-project",
                projectSettings: {
                  buildCommand: "next build",
                  installCommand: "pnpm install",
                },
                target: "production",
              },
            });

            console.log(result);
          }

          run();
      - label: createDeployment
        lang: go
        source: "package main\n\nimport(\n\t\"os\"\n\t\"github.com/vercel/vercel\"\n\t\"context\"\n\t\"github.com/vercel/vercel/models/operations\"\n\t\"log\"\n)\n\nfunc main() {\n    s := vercel.New(\n        vercel.WithSecurity(os.Getenv(\"VERCEL_BEARER_TOKEN\")),\n    )\n\n    ctx := context.Background()\n    res, err := s.Deployments.CreateDeployment(ctx, operations.CreateDeploymentRequest{\n        RequestBody: &operations.CreateDeploymentRequestBody{\n            Files: []operations.Files{\n                operations.CreateFilesUploadedFile(\n                    operations.UploadedFile{\n                        File: \"folder/file.js\",\n                    },\n                ),\n                operations.CreateFilesUploadedFile(\n                    operations.UploadedFile{\n                        File: \"folder/file.js\",\n                    },\n                ),\n            },\n            GitMetadata: &operations.GitMetadata{\n                RemoteURL: vercel.String(\"https://github.com/vercel/next.js\"),\n                CommitAuthorName: vercel.String(\"kyliau\"),\n                CommitMessage: vercel.String(\"add method to measure Interaction to Next Paint (INP) (#36490)\"),\n                CommitRef: vercel.String(\"main\"),\n                CommitSha: vercel.String(\"dc36199b2234c6586ebe05ec94078a895c707e29\"),\n                Dirty: vercel.Bool(true),\n            },\n            Meta: map[string]string{\n                \"foo\": \"bar\",\n            },\n            Name: \"my-instant-deployment\",\n            Project: vercel.String(\"my-deployment-project\"),\n        },\n    })\n    if err != nil {\n        log.Fatal(err)\n    }\n    if res.Object != nil {\n        // handle response\n    }\n}"
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              aliasAssignedAt:
                allOf:
                  - nullable: true
                    oneOf:
                      - type: number
                      - type: boolean
              alwaysRefuseToBuild:
                allOf:
                  - type: boolean
              build:
                allOf:
                  - properties:
                      env:
                        items:
                          type: string
                        type: array
                    required:
                      - env
                    type: object
              buildArtifactUrls:
                allOf:
                  - items:
                      type: string
                    type: array
              builds:
                allOf:
                  - items:
                      properties:
                        use:
                          type: string
                        src:
                          type: string
                        config:
                          additionalProperties: true
                          type: object
                      required:
                        - use
                      type: object
                    type: array
              env:
                allOf:
                  - items:
                      type: string
                    type: array
              inspectorUrl:
                allOf:
                  - nullable: true
                    type: string
              isInConcurrentBuildsQueue:
                allOf:
                  - type: boolean
              isInSystemBuildsQueue:
                allOf:
                  - type: boolean
              projectSettings:
                allOf:
                  - properties:
                      nodeVersion:
                        type: string
                        enum:
                          - 24.x
                          - 22.x
                          - 20.x
                          - 18.x
                          - 16.x
                          - 14.x
                          - 12.x
                          - 10.x
                          - 8.10.x
                      buildCommand:
                        nullable: true
                        type: string
                      devCommand:
                        nullable: true
                        type: string
                      framework:
                        nullable: true
                        type: string
                        enum:
                          - blitzjs
                          - nextjs
                          - gatsby
                          - remix
                          - react-router
                          - astro
                          - hexo
                          - eleventy
                          - docusaurus-2
                          - docusaurus
                          - preact
                          - solidstart-1
                          - solidstart
                          - dojo
                          - ember
                          - vue
                          - scully
                          - ionic-angular
                          - angular
                          - polymer
                          - svelte
                          - sveltekit
                          - sveltekit-1
                          - ionic-react
                          - create-react-app
                          - gridsome
                          - umijs
                          - sapper
                          - saber
                          - stencil
                          - nuxtjs
                          - redwoodjs
                          - hugo
                          - jekyll
                          - brunch
                          - middleman
                          - zola
                          - hydrogen
                          - vite
                          - tanstack-start
                          - vitepress
                          - vuepress
                          - parcel
                          - fastapi
                          - flask
                          - fasthtml
                          - sanity-v3
                          - sanity
                          - storybook
                          - nitro
                          - hono
                          - express
                          - h3
                          - nestjs
                          - elysia
                          - fastify
                          - xmcp
                      commandForIgnoringBuildStep:
                        nullable: true
                        type: string
                      installCommand:
                        nullable: true
                        type: string
                      outputDirectory:
                        nullable: true
                        type: string
                      speedInsights:
                        properties:
                          id:
                            type: string
                          enabledAt:
                            type: number
                          disabledAt:
                            type: number
                          canceledAt:
                            type: number
                          hasData:
                            type: boolean
                          paidAt:
                            type: number
                        required:
                          - id
                        type: object
                      webAnalytics:
                        properties:
                          id:
                            type: string
                          disabledAt:
                            type: number
                          canceledAt:
                            type: number
                          enabledAt:
                            type: number
                          hasData:
                            type: boolean
                        required:
                          - id
                        type: object
                    type: object
              readyStateReason:
                allOf:
                  - type: string
              integrations:
                allOf:
                  - properties:
                      status:
                        type: string
                        enum:
                          - skipped
                          - pending
                          - ready
                          - error
                          - timeout
                      startedAt:
                        type: number
                      completedAt:
                        type: number
                      skippedAt:
                        type: number
                      skippedBy:
                        type: string
                    required:
                      - status
                      - startedAt
                    type: object
              images:
                allOf:
                  - properties:
                      sizes:
                        items:
                          type: number
                        type: array
                      qualities:
                        items:
                          type: number
                        type: array
                      domains:
                        items:
                          type: string
                        type: array
                      remotePatterns:
                        items:
                          properties:
                            protocol:
                              type: string
                              enum:
                                - http
                                - https
                              description: Must be `http` or `https`.
                            hostname:
                              type: string
                              description: >-
                                Can be literal or wildcard. Single `*` matches a
                                single subdomain. Double `**` matches any number
                                of subdomains.
                            port:
                              type: string
                              description: >-
                                Can be literal port such as `8080` or empty
                                string meaning no port.
                            pathname:
                              type: string
                              description: >-
                                Can be literal or wildcard. Single `*` matches a
                                single path segment. Double `**` matches any
                                number of path segments.
                            search:
                              type: string
                              description: >-
                                Can be literal query string such as `?v=1` or
                                empty string meaning no query string.
                          required:
                            - hostname
                          type: object
                        type: array
                      localPatterns:
                        items:
                          properties:
                            pathname:
                              type: string
                              description: >-
                                Can be literal or wildcard. Single `*` matches a
                                single path segment. Double `**` matches any
                                number of path segments.
                            search:
                              type: string
                              description: >-
                                Can be literal query string such as `?v=1` or
                                empty string meaning no query string.
                          type: object
                        type: array
                      minimumCacheTTL:
                        type: number
                      formats:
                        items:
                          type: string
                          enum:
                            - image/avif
                            - image/webp
                        type: array
                      dangerouslyAllowSVG:
                        type: boolean
                      contentSecurityPolicy:
                        type: string
                      contentDispositionType:
                        type: string
                        enum:
                          - inline
                          - attachment
                    type: object
              alias:
                allOf:
                  - items:
                      type: string
                    type: array
                    description: >-
                      A list of all the aliases (default aliases, staging
                      aliases and production aliases) that were assigned upon
                      deployment creation
                    example: []
              aliasAssigned:
                allOf:
                  - type: boolean
                    description: >-
                      A boolean that will be true when the aliases from the
                      alias property were assigned successfully
                    example: true
              bootedAt:
                allOf:
                  - type: number
              buildingAt:
                allOf:
                  - type: number
              buildContainerFinishedAt:
                allOf:
                  - type: number
                    description: >-
                      Since April 2025 it necessary for On-Demand Concurrency
                      Minutes calculation
              buildSkipped:
                allOf:
                  - type: boolean
              creator:
                allOf:
                  - properties:
                      uid:
                        type: string
                        description: The ID of the user that created the deployment
                        example: 96SnxkFiMyVKsK3pnoHfx3Hz
                      username:
                        type: string
                        description: The username of the user that created the deployment
                        example: john-doe
                      avatar:
                        type: string
                        description: The avatar of the user that created the deployment
                    required:
                      - uid
                    type: object
                    description: Information about the deployment creator
              initReadyAt:
                allOf:
                  - type: number
              isFirstBranchDeployment:
                allOf:
                  - type: boolean
              lambdas:
                allOf:
                  - items:
                      properties:
                        id:
                          type: string
                        createdAt:
                          type: number
                        readyState:
                          type: string
                          enum:
                            - BUILDING
                            - ERROR
                            - INITIALIZING
                            - READY
                        entrypoint:
                          nullable: true
                          type: string
                        readyStateAt:
                          type: number
                        output:
                          items:
                            properties:
                              path:
                                type: string
                              functionName:
                                type: string
                            required:
                              - path
                              - functionName
                            type: object
                          type: array
                      required:
                        - id
                        - output
                      type: object
                      description: >-
                        A partial representation of a Build used by the
                        deployment endpoint.
                    type: array
              public:
                allOf:
                  - type: boolean
                    description: >-
                      A boolean representing if the deployment is public or not.
                      By default this is `false`
                    example: false
              ready:
                allOf:
                  - type: number
              status:
                allOf:
                  - type: string
                    enum:
                      - QUEUED
                      - BUILDING
                      - ERROR
                      - INITIALIZING
                      - READY
                      - CANCELED
              team:
                allOf:
                  - properties:
                      id:
                        type: string
                      name:
                        type: string
                      slug:
                        type: string
                      avatar:
                        type: string
                    required:
                      - id
                      - name
                      - slug
                    type: object
                    description: The team that owns the deployment if any
              userAliases:
                allOf:
                  - items:
                      type: string
                    type: array
                    description: >-
                      An array of domains that were provided by the user when
                      creating the Deployment.
                    example:
                      - sub1.example.com
                      - sub2.example.com
              previewCommentsEnabled:
                allOf:
                  - type: boolean
                    description: >-
                      Whether or not preview comments are enabled for the
                      deployment
                    example: false
              ttyBuildLogs:
                allOf:
                  - type: boolean
              customEnvironment:
                allOf:
                  - oneOf:
                      - properties:
                          id:
                            type: string
                            description: >-
                              Unique identifier for the custom environment
                              (format: env_*)
                          slug:
                            type: string
                            description: URL-friendly name of the environment
                          type:
                            type: string
                            enum:
                              - production
                              - preview
                              - development
                            description: >-
                              The type of environment (production, preview, or
                              development)
                          description:
                            type: string
                            description: Optional description of the environment's purpose
                          branchMatcher:
                            properties:
                              type:
                                type: string
                                enum:
                                  - endsWith
                                  - startsWith
                                  - equals
                                description: The type of matching to perform
                              pattern:
                                type: string
                                description: The pattern to match against branch names
                            required:
                              - type
                              - pattern
                            type: object
                            description: >-
                              Configuration for matching git branches to this
                              environment
                          domains:
                            items:
                              properties:
                                name:
                                  type: string
                                apexName:
                                  type: string
                                projectId:
                                  type: string
                                redirect:
                                  nullable: true
                                  type: string
                                redirectStatusCode:
                                  nullable: true
                                  type: number
                                  enum:
                                    - 307
                                    - 301
                                    - 302
                                    - 308
                                gitBranch:
                                  nullable: true
                                  type: string
                                customEnvironmentId:
                                  nullable: true
                                  type: string
                                updatedAt:
                                  type: number
                                createdAt:
                                  type: number
                                verified:
                                  type: boolean
                                  description: >-
                                    `true` if the domain is verified for use
                                    with the project. If `false` it will not be
                                    used as an alias on this project until the
                                    challenge in `verification` is completed.
                                verification:
                                  items:
                                    properties:
                                      type:
                                        type: string
                                      domain:
                                        type: string
                                      value:
                                        type: string
                                      reason:
                                        type: string
                                    required:
                                      - type
                                      - domain
                                      - value
                                      - reason
                                    type: object
                                    description: >-
                                      A list of verification challenges, one of
                                      which must be completed to verify the
                                      domain for use on the project. After the
                                      challenge is complete `POST
                                      /projects/:idOrName/domains/:domain/verify`
                                      to verify the domain. Possible challenges:
                                      - If `verification.type = TXT` the
                                      `verification.domain` will be checked for
                                      a TXT record matching
                                      `verification.value`.
                                  type: array
                                  description: >-
                                    A list of verification challenges, one of
                                    which must be completed to verify the domain
                                    for use on the project. After the challenge
                                    is complete `POST
                                    /projects/:idOrName/domains/:domain/verify`
                                    to verify the domain. Possible challenges: -
                                    If `verification.type = TXT` the
                                    `verification.domain` will be checked for a
                                    TXT record matching `verification.value`.
                              required:
                                - name
                                - apexName
                                - projectId
                                - verified
                              type: object
                              description: List of domains associated with this environment
                            type: array
                            description: List of domains associated with this environment
                          currentDeploymentAliases:
                            items:
                              type: string
                            type: array
                            description: List of aliases for the current deployment
                          createdAt:
                            type: number
                            description: Timestamp when the environment was created
                          updatedAt:
                            type: number
                            description: Timestamp when the environment was last updated
                        required:
                          - id
                          - slug
                          - type
                          - createdAt
                          - updatedAt
                        type: object
                        description: >-
                          If the deployment was created using a Custom
                          Environment, then this property contains information
                          regarding the environment used.
                      - properties:
                          id:
                            type: string
                        required:
                          - id
                        type: object
                        description: >-
                          If the deployment was created using a Custom
                          Environment, then this property contains information
                          regarding the environment used.
              oomReport:
                allOf:
                  - type: string
                    enum:
                      - out-of-memory
              aliasWarning:
                allOf:
                  - nullable: true
                    properties:
                      code:
                        type: string
                      message:
                        type: string
                      link:
                        type: string
                      action:
                        type: string
                    required:
                      - code
                      - message
                    type: object
              id:
                allOf:
                  - type: string
                    description: A string holding the unique ID of the deployment
                    example: dpl_89qyp1cskzkLrVicDaZoDbjyHuDJ
              createdAt:
                allOf:
                  - type: number
                    description: >-
                      A number containing the date when the deployment was
                      created in milliseconds
                    example: 1540257589405
              readyState:
                allOf:
                  - type: string
                    enum:
                      - QUEUED
                      - BUILDING
                      - ERROR
                      - INITIALIZING
                      - READY
                      - CANCELED
                    description: >-
                      The state of the deployment depending on the process of
                      deploying, or if it is ready or in an error state
                    example: READY
              name:
                allOf:
                  - type: string
                    description: >-
                      The name of the project associated with the deployment at
                      the time that the deployment was created
                    example: my-project
              type:
                allOf:
                  - type: string
                    enum:
                      - LAMBDAS
              aliasError:
                allOf:
                  - nullable: true
                    properties:
                      code:
                        type: string
                      message:
                        type: string
                    required:
                      - code
                      - message
                    type: object
                    description: >-
                      An object that will contain a `code` and a `message` when
                      the aliasing fails, otherwise the value will be `null`
                    example: null
              aliasFinal:
                allOf:
                  - nullable: true
                    type: string
              autoAssignCustomDomains:
                allOf:
                  - type: boolean
                    description: applies to custom domains only, defaults to `true`
              automaticAliases:
                allOf:
                  - items:
                      type: string
                    type: array
              buildErrorAt:
                allOf:
                  - type: number
              checksState:
                allOf:
                  - type: string
                    enum:
                      - registered
                      - running
                      - completed
              checksConclusion:
                allOf:
                  - type: string
                    enum:
                      - succeeded
                      - failed
                      - skipped
                      - canceled
              deletedAt:
                allOf:
                  - nullable: true
                    type: number
                    description: >-
                      A number containing the date when the deployment was
                      deleted at milliseconds
                    example: 1540257589405
              defaultRoute:
                allOf:
                  - type: string
                    description: >-
                      Computed field that is only available for deployments with
                      a microfrontend configuration.
              canceledAt:
                allOf:
                  - type: number
              errorCode:
                allOf:
                  - type: string
              errorLink:
                allOf:
                  - type: string
              errorMessage:
                allOf:
                  - nullable: true
                    type: string
              errorStep:
                allOf:
                  - type: string
              passiveRegions:
                allOf:
                  - items:
                      type: string
                    type: array
                    description: >-
                      Since November 2023 this field defines a set of regions
                      that we will deploy the lambda to passively Lambdas will
                      be deployed to these regions but only invoked if all of
                      the primary `regions` are marked as out of service
              gitSource:
                allOf:
                  - oneOf:
                      - properties:
                          type:
                            type: string
                            enum:
                              - github
                          repoId:
                            oneOf:
                              - type: string
                              - type: number
                          ref:
                            nullable: true
                            type: string
                          sha:
                            type: string
                          prId:
                            nullable: true
                            type: number
                        required:
                          - type
                          - repoId
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - github
                          org:
                            type: string
                          repo:
                            type: string
                          ref:
                            nullable: true
                            type: string
                          sha:
                            type: string
                          prId:
                            nullable: true
                            type: number
                        required:
                          - type
                          - org
                          - repo
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - github-custom-host
                          host:
                            type: string
                          repoId:
                            oneOf:
                              - type: string
                              - type: number
                          ref:
                            nullable: true
                            type: string
                          sha:
                            type: string
                          prId:
                            nullable: true
                            type: number
                        required:
                          - type
                          - host
                          - repoId
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - github-custom-host
                          host:
                            type: string
                          org:
                            type: string
                          repo:
                            type: string
                          ref:
                            nullable: true
                            type: string
                          sha:
                            type: string
                          prId:
                            nullable: true
                            type: number
                        required:
                          - type
                          - host
                          - org
                          - repo
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - github-limited
                          repoId:
                            oneOf:
                              - type: string
                              - type: number
                          ref:
                            nullable: true
                            type: string
                          sha:
                            type: string
                          prId:
                            nullable: true
                            type: number
                        required:
                          - type
                          - repoId
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - github-limited
                          org:
                            type: string
                          repo:
                            type: string
                          ref:
                            nullable: true
                            type: string
                          sha:
                            type: string
                          prId:
                            nullable: true
                            type: number
                        required:
                          - type
                          - org
                          - repo
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - gitlab
                          projectId:
                            oneOf:
                              - type: string
                              - type: number
                          ref:
                            nullable: true
                            type: string
                          sha:
                            type: string
                          prId:
                            nullable: true
                            type: number
                        required:
                          - type
                          - projectId
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - bitbucket
                          workspaceUuid:
                            type: string
                          repoUuid:
                            type: string
                          ref:
                            nullable: true
                            type: string
                          sha:
                            type: string
                          prId:
                            nullable: true
                            type: number
                        required:
                          - type
                          - repoUuid
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - bitbucket
                          owner:
                            type: string
                          slug:
                            type: string
                          ref:
                            nullable: true
                            type: string
                          sha:
                            type: string
                          prId:
                            nullable: true
                            type: number
                        required:
                          - type
                          - owner
                          - slug
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - custom
                          ref:
                            type: string
                          sha:
                            type: string
                          gitUrl:
                            type: string
                        required:
                          - type
                          - ref
                          - sha
                          - gitUrl
                        type: object
                        description: >-
                          Allows custom git sources (local folder mounted to the
                          container) in test mode
                      - properties:
                          type:
                            type: string
                            enum:
                              - github
                          ref:
                            type: string
                          sha:
                            type: string
                          repoId:
                            type: number
                          org:
                            type: string
                          repo:
                            type: string
                        required:
                          - type
                          - ref
                          - sha
                          - repoId
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - github-custom-host
                          host:
                            type: string
                          ref:
                            type: string
                          sha:
                            type: string
                          repoId:
                            type: number
                          org:
                            type: string
                          repo:
                            type: string
                        required:
                          - type
                          - host
                          - ref
                          - sha
                          - repoId
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - github-limited
                          ref:
                            type: string
                          sha:
                            type: string
                          repoId:
                            type: number
                          org:
                            type: string
                          repo:
                            type: string
                        required:
                          - type
                          - ref
                          - sha
                          - repoId
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - gitlab
                          ref:
                            type: string
                          sha:
                            type: string
                          projectId:
                            type: number
                        required:
                          - type
                          - ref
                          - sha
                          - projectId
                        type: object
                      - properties:
                          type:
                            type: string
                            enum:
                              - bitbucket
                          ref:
                            type: string
                          sha:
                            type: string
                          owner:
                            type: string
                          slug:
                            type: string
                          workspaceUuid:
                            type: string
                          repoUuid:
                            type: string
                        required:
                          - type
                          - ref
                          - sha
                          - workspaceUuid
                          - repoUuid
                        type: object
              meta:
                allOf:
                  - additionalProperties:
                      type: string
                    type: object
              originCacheRegion:
                allOf:
                  - type: string
              nodeVersion:
                allOf:
                  - type: string
                    enum:
                      - 24.x
                      - 22.x
                      - 20.x
                      - 18.x
                      - 16.x
                      - 14.x
                      - 12.x
                      - 10.x
                      - 8.10.x
                    description: >-
                      If set it overrides the `projectSettings.nodeVersion` for
                      this deployment.
              project:
                allOf:
                  - properties:
                      id:
                        type: string
                      name:
                        type: string
                      framework:
                        nullable: true
                        type: string
                    required:
                      - id
                      - name
                    type: object
                    description: >-
                      The public project information associated with the
                      deployment.
              prebuilt:
                allOf:
                  - type: boolean
              readySubstate:
                allOf:
                  - type: string
                    enum:
                      - STAGED
                      - ROLLING
                      - PROMOTED
                    description: >-
                      Substate of deployment when readyState is 'READY' Tracks
                      whether or not deployment has seen production traffic: -
                      STAGED: never seen production traffic - ROLLING: in the
                      process of having production traffic gradually
                      transitioned. - PROMOTED: has seen production traffic
              regions:
                allOf:
                  - items:
                      type: string
                    type: array
                    description: The regions the deployment exists in
                    example:
                      - sfo1
              softDeletedByRetention:
                allOf:
                  - type: boolean
                    description: >-
                      flag to indicate if the deployment was deleted by
                      retention policy
                    example: 'true'
              source:
                allOf:
                  - type: string
                    enum:
                      - api-trigger-git-deploy
                      - cli
                      - clone/repo
                      - git
                      - import
                      - import/repo
                      - redeploy
                      - v0-web
                    description: Where was the deployment created from
                    example: cli
              target:
                allOf:
                  - nullable: true
                    type: string
                    enum:
                      - staging
                      - production
                    description: >-
                      If defined, either `staging` if a staging alias in the
                      format `<project>.<team>.now.sh` was assigned upon
                      creation, or `production` if the aliases from `alias` were
                      assigned. `null` value indicates the "preview" deployment.
                    example: null
              undeletedAt:
                allOf:
                  - type: number
                    description: >-
                      A number containing the date when the deployment was
                      undeleted at milliseconds
                    example: 1540257589405
              url:
                allOf:
                  - type: string
                    description: A string with the unique URL of the deployment
                    example: my-instant-deployment-3ij3cxz9qr.now.sh
              version:
                allOf:
                  - type: number
                    enum:
                      - 2
                    description: >-
                      The platform version that was used to create the
                      deployment.
                    example: 2
              oidcTokenClaims:
                allOf:
                  - properties:
                      iss:
                        type: string
                      sub:
                        type: string
                      scope:
                        type: string
                      aud:
                        type: string
                      owner:
                        type: string
                      owner_id:
                        type: string
                      project:
                        type: string
                      project_id:
                        type: string
                      environment:
                        type: string
                      plan:
                        type: string
                    required:
                      - iss
                      - sub
                      - scope
                      - aud
                      - owner
                      - owner_id
                      - project
                      - project_id
                      - environment
                      - plan
                    type: object
              projectId:
                allOf:
                  - type: string
              plan:
                allOf:
                  - type: string
                    enum:
                      - pro
                      - enterprise
                      - hobby
              connectBuildsEnabled:
                allOf:
                  - type: boolean
              connectConfigurationId:
                allOf:
                  - type: string
              createdIn:
                allOf:
                  - type: string
              crons:
                allOf:
                  - items:
                      properties:
                        schedule:
                          type: string
                        path:
                          type: string
                      required:
                        - schedule
                        - path
                      type: object
                    type: array
              functions:
                allOf:
                  - nullable: true
                    additionalProperties:
                      properties:
                        architecture:
                          type: string
                          enum:
                            - x86_64
                            - arm64
                        memory:
                          type: number
                        maxDuration:
                          type: number
                        runtime:
                          type: string
                        includeFiles:
                          type: string
                        excludeFiles:
                          type: string
                        experimentalTriggers:
                          items:
                            properties:
                              type:
                                type: string
                                enum:
                                  - queue/v1beta
                                description: Event type - must be "queue/v1beta" (REQUIRED)
                              topic:
                                type: string
                                description: >-
                                  Name of the queue topic to consume from
                                  (REQUIRED)
                              consumer:
                                type: string
                                description: >-
                                  Name of the consumer group for this trigger
                                  (REQUIRED)
                              maxDeliveries:
                                type: number
                                description: >-
                                  Maximum number of delivery attempts for
                                  message processing (OPTIONAL) This represents
                                  the total number of times a message can be
                                  delivered, not the number of retries. Must be
                                  at least 1 if specified. Behavior when not
                                  specified depends on the server's default
                                  configuration.
                              retryAfterSeconds:
                                type: number
                                description: >-
                                  Delay in seconds before retrying failed
                                  executions (OPTIONAL) Behavior when not
                                  specified depends on the server's default
                                  configuration.
                              initialDelaySeconds:
                                type: number
                                description: >-
                                  Initial delay in seconds before first
                                  execution attempt (OPTIONAL) Must be 0 or
                                  greater. Use 0 for no initial delay. Behavior
                                  when not specified depends on the server's
                                  default configuration.
                            required:
                              - type
                              - topic
                              - consumer
                            type: object
                            description: >-
                              Queue trigger event for Vercel's queue system.
                              Handles "queue/v1beta" events with queue-specific
                              configuration.
                          type: array
                        supportsCancellation:
                          type: boolean
                      type: object
                    type: object
              monorepoManager:
                allOf:
                  - nullable: true
                    type: string
              ownerId:
                allOf:
                  - type: string
              passiveConnectConfigurationId:
                allOf:
                  - type: string
                    description: >-
                      Since November 2023 this field defines a Secure Compute
                      network that will only be used to deploy passive lambdas
                      to (as in passiveRegions)
              routes:
                allOf:
                  - nullable: true
                    items:
                      oneOf:
                        - properties:
                            src:
                              type: string
                            dest:
                              type: string
                            headers:
                              additionalProperties:
                                type: string
                              type: object
                            methods:
                              items:
                                type: string
                              type: array
                            continue:
                              type: boolean
                            override:
                              type: boolean
                            caseSensitive:
                              type: boolean
                            check:
                              type: boolean
                            important:
                              type: boolean
                            status:
                              type: number
                            has:
                              items:
                                oneOf:
                                  - properties:
                                      type:
                                        type: string
                                        enum:
                                          - host
                                      value:
                                        oneOf:
                                          - type: string
                                          - properties:
                                              eq:
                                                oneOf:
                                                  - type: string
                                                  - type: number
                                              neq:
                                                type: string
                                              inc:
                                                items:
                                                  type: string
                                                type: array
                                              ninc:
                                                items:
                                                  type: string
                                                type: array
                                              pre:
                                                type: string
                                              suf:
                                                type: string
                                              re:
                                                type: string
                                              gt:
                                                type: number
                                              gte:
                                                type: number
                                              lt:
                                                type: number
                                              lte:
                                                type: number
                                            type: object
                                    required:
                                      - type
                                      - value
                                    type: object
                                  - properties:
                                      type:
                                        type: string
                                        enum:
                                          - header
                                          - cookie
                                          - query
                                      key:
                                        type: string
                                      value:
                                        oneOf:
                                          - type: string
                                          - properties:
                                              eq:
                                                oneOf:
                                                  - type: string
                                                  - type: number
                                              neq:
                                                type: string
                                              inc:
                                                items:
                                                  type: string
                                                type: array
                                              ninc:
                                                items:
                                                  type: string
                                                type: array
                                              pre:
                                                type: string
                                              suf:
                                                type: string
                                              re:
                                                type: string
                                              gt:
                                                type: number
                                              gte:
                                                type: number
                                              lt:
                                                type: number
                                              lte:
                                                type: number
                                            type: object
                                    required:
                                      - type
                                      - key
                                    type: object
                              type: array
                            missing:
                              items:
                                oneOf:
                                  - properties:
                                      type:
                                        type: string
                                        enum:
                                          - host
                                      value:
                                        oneOf:
                                          - type: string
                                          - properties:
                                              eq:
                                                oneOf:
                                                  - type: string
                                                  - type: number
                                              neq:
                                                type: string
                                              inc:
                                                items:
                                                  type: string
                                                type: array
                                              ninc:
                                                items:
                                                  type: string
                                                type: array
                                              pre:
                                                type: string
                                              suf:
                                                type: string
                                              re:
                                                type: string
                                              gt:
                                                type: number
                                              gte:
                                                type: number
                                              lt:
                                                type: number
                                              lte:
                                                type: number
                                            type: object
                                    required:
                                      - type
                                      - value
                                    type: object
                                  - properties:
                                      type:
                                        type: string
                                        enum:
                                          - header
                                          - cookie
                                          - query
                                      key:
                                        type: string
                                      value:
                                        oneOf:
                                          - type: string
                                          - properties:
                                              eq:
                                                oneOf:
                                                  - type: string
                                                  - type: number
                                              neq:
                                                type: string
                                              inc:
                                                items:
                                                  type: string
                                                type: array
                                              ninc:
                                                items:
                                                  type: string
                                                type: array
                                              pre:
                                                type: string
                                              suf:
                                                type: string
                                              re:
                                                type: string
                                              gt:
                                                type: number
                                              gte:
                                                type: number
                                              lt:
                                                type: number
                                              lte:
                                                type: number
                                            type: object
                                    required:
                                      - type
                                      - key
                                    type: object
                              type: array
                            mitigate:
                              properties:
                                action:
                                  type: string
                                  enum:
                                    - challenge
                                    - deny
                              required:
                                - action
                              type: object
                            transforms:
                              items:
                                properties:
                                  type:
                                    type: string
                                    enum:
                                      - request.headers
                                      - request.query
                                      - response.headers
                                  op:
                                    type: string
                                    enum:
                                      - append
                                      - set
                                      - delete
                                  target:
                                    properties:
                                      key:
                                        oneOf:
                                          - type: string
                                          - properties:
                                              eq:
                                                oneOf:
                                                  - type: string
                                                  - type: number
                                              neq:
                                                type: string
                                              inc:
                                                items:
                                                  type: string
                                                type: array
                                              ninc:
                                                items:
                                                  type: string
                                                type: array
                                              pre:
                                                type: string
                                              suf:
                                                type: string
                                              gt:
                                                type: number
                                              gte:
                                                type: number
                                              lt:
                                                type: number
                                              lte:
                                                type: number
                                            type: object
                                    required:
                                      - key
                                    type: object
                                  args:
                                    oneOf:
                                      - type: string
                                      - items:
                                          type: string
                                        type: array
                                  env:
                                    items:
                                      type: string
                                    type: array
                                required:
                                  - type
                                  - op
                                  - target
                                type: object
                              type: array
                            locale:
                              properties:
                                redirect:
                                  additionalProperties:
                                    type: string
                                  type: object
                                cookie:
                                  type: string
                              type: object
                            middlewarePath:
                              type: string
                              description: >-
                                A middleware key within the `output` key under
                                the build result. Overrides a `middleware`
                                definition.
                            middlewareRawSrc:
                              items:
                                type: string
                              type: array
                              description: The original middleware matchers.
                            middleware:
                              type: number
                              description: >-
                                A middleware index in the `middleware` key under
                                the build result
                          required:
                            - src
                          type: object
                        - properties:
                            handle:
                              type: string
                              enum:
                                - error
                                - filesystem
                                - hit
                                - miss
                                - rewrite
                                - resource
                            src:
                              type: string
                            dest:
                              type: string
                            status:
                              type: number
                          required:
                            - handle
                          type: object
                        - properties:
                            src:
                              type: string
                            continue:
                              type: boolean
                            middleware:
                              type: number
                              enum:
                                - 0
                          required:
                            - src
                            - continue
                            - middleware
                          type: object
                    type: array
              gitRepo:
                allOf:
                  - nullable: true
                    oneOf:
                      - properties:
                          namespace:
                            type: string
                          projectId:
                            type: number
                          type:
                            type: string
                            enum:
                              - gitlab
                          url:
                            type: string
                          path:
                            type: string
                          defaultBranch:
                            type: string
                          name:
                            type: string
                          private:
                            type: boolean
                          ownerType:
                            type: string
                            enum:
                              - team
                              - user
                        required:
                          - namespace
                          - projectId
                          - type
                          - url
                          - path
                          - defaultBranch
                          - name
                          - private
                          - ownerType
                        type: object
                      - properties:
                          org:
                            type: string
                          repo:
                            type: string
                          repoId:
                            type: number
                          type:
                            type: string
                            enum:
                              - github
                          repoOwnerId:
                            type: number
                          path:
                            type: string
                          defaultBranch:
                            type: string
                          name:
                            type: string
                          private:
                            type: boolean
                          ownerType:
                            type: string
                            enum:
                              - team
                              - user
                        required:
                          - org
                          - repo
                          - repoId
                          - type
                          - repoOwnerId
                          - path
                          - defaultBranch
                          - name
                          - private
                          - ownerType
                        type: object
                      - properties:
                          owner:
                            type: string
                          repoUuid:
                            type: string
                          slug:
                            type: string
                          type:
                            type: string
                            enum:
                              - bitbucket
                          workspaceUuid:
                            type: string
                          path:
                            type: string
                          defaultBranch:
                            type: string
                          name:
                            type: string
                          private:
                            type: boolean
                          ownerType:
                            type: string
                            enum:
                              - team
                              - user
                        required:
                          - owner
                          - repoUuid
                          - slug
                          - type
                          - workspaceUuid
                          - path
                          - defaultBranch
                          - name
                          - private
                          - ownerType
                        type: object
              flags:
                allOf:
                  - oneOf:
                      - properties:
                          definitions:
                            additionalProperties:
                              properties:
                                options:
                                  items:
                                    properties:
                                      value:
                                        $ref: '#/components/schemas/FlagJSONValue'
                                      label:
                                        type: string
                                    required:
                                      - value
                                    type: object
                                  type: array
                                url:
                                  type: string
                                description:
                                  type: string
                              type: object
                            type: object
                        required:
                          - definitions
                        type: object
                        description: >-
                          Flags defined in the Build Output API, used by this
                          deployment. Primarily used by the Toolbar to know
                          about the used flags.
                      - items:
                          type: object
                          description: >-
                            Flags defined in the Build Output API, used by this
                            deployment. Primarily used by the Toolbar to know
                            about the used flags.
                        type: array
                        description: >-
                          Flags defined in the Build Output API, used by this
                          deployment. Primarily used by the Toolbar to know
                          about the used flags.
              microfrontends:
                allOf:
                  - oneOf:
                      - properties:
                          isDefaultApp:
                            type: boolean
                          defaultAppProjectName:
                            type: string
                            description: >-
                              The project name of the default app of this
                              deployment's microfrontends group.
                          defaultRoute:
                            type: string
                            description: >-
                              A path that is used to take screenshots and as the
                              default path in preview links when a domain for
                              this microfrontend is shown in the UI.
                          groupIds:
                            items:
                              oneOf:
                                - type: string
                                - type: string
                            maxItems: 2
                            minItems: 2
                            type: array
                            description: >-
                              The group of microfrontends that this project
                              belongs to. Each microfrontend project must belong
                              to a microfrontends group that is the set of
                              microfrontends that are used together.
                        required:
                          - defaultAppProjectName
                          - groupIds
                        type: object
                      - properties:
                          isDefaultApp:
                            type: boolean
                          mfeConfigUploadState:
                            type: string
                            enum:
                              - success
                              - waiting_on_build
                              - no_config
                            description: >-
                              The result of the microfrontends config upload
                              during deployment creation / build. Only set for
                              default app deployments. The config upload is
                              attempted during deployment create, and then again
                              during the build. If the config is not in the root
                              directory, or the deployment is prebuilt, the
                              config cannot be uploaded during deployment
                              create. The upload during deployment build finds
                              the config even if it's not in the root directory,
                              as it has access to all files. Uploading the
                              config during create is ideal, as then all child
                              deployments are guaranteed to have access to the
                              default app deployment config even if the default
                              app has not yet started building. If the config is
                              not uploaded, the child app will show as building
                              until the config has been uploaded during the
                              default app build. - `success` - The config was
                              uploaded successfully, either when the deployment
                              was created or during the build. -
                              `waiting_on_build` - The config could not be
                              uploaded during deployment create, will be
                              attempted again during the build. - `no_config` -
                              No config was found. Only set once the build has
                              not found the config in any of the deployment's
                              files. - `undefined` - Legacy deployments, or
                              there was an error uploading the config during
                              deployment create.
                          defaultAppProjectName:
                            type: string
                            description: >-
                              The project name of the default app of this
                              deployment's microfrontends group.
                          defaultRoute:
                            type: string
                            description: >-
                              A path that is used to take screenshots and as the
                              default path in preview links when a domain for
                              this microfrontend is shown in the UI.
                          groupIds:
                            items:
                              oneOf:
                                - type: string
                                - type: string
                            maxItems: 2
                            minItems: 2
                            type: array
                            description: >-
                              The group of microfrontends that this project
                              belongs to. Each microfrontend project must belong
                              to a microfrontends group that is the set of
                              microfrontends that are used together.
                        required:
                          - isDefaultApp
                          - defaultAppProjectName
                          - groupIds
                        type: object
              config:
                allOf:
                  - properties:
                      version:
                        type: number
                      functionType:
                        type: string
                        enum:
                          - fluid
                          - standard
                      functionMemoryType:
                        type: string
                        enum:
                          - standard
                          - standard_legacy
                          - performance
                      functionTimeout:
                        nullable: true
                        type: number
                      secureComputePrimaryRegion:
                        nullable: true
                        type: string
                      secureComputeFallbackRegion:
                        nullable: true
                        type: string
                      isUsingActiveCPU:
                        type: boolean
                    required:
                      - functionType
                      - functionMemoryType
                      - functionTimeout
                      - secureComputePrimaryRegion
                      - secureComputeFallbackRegion
                    type: object
                    description: >-
                      Since February 2025 the configuration must include
                      snapshot data at the time of deployment creation to
                      capture properties for the /deployments/:id/config
                      endpoint utilized for displaying Deployment Configuration
                      on the frontend This is optional because older deployments
                      may not have this data captured
              checks:
                allOf:
                  - properties:
                      deployment-alias:
                        properties:
                          state:
                            type: string
                            enum:
                              - succeeded
                              - failed
                              - pending
                          startedAt:
                            type: number
                          completedAt:
                            type: number
                        required:
                          - state
                          - startedAt
                        type: object
                        description: >-
                          Condensed check data. Retrieve individual check and
                          check run data using api-checks v2 routes.
                    required:
                      - deployment-alias
                    type: object
            description: The successfully created deployment
            requiredProperties:
              - build
              - env
              - inspectorUrl
              - isInConcurrentBuildsQueue
              - isInSystemBuildsQueue
              - projectSettings
              - aliasAssigned
              - bootedAt
              - buildingAt
              - buildSkipped
              - creator
              - public
              - status
              - id
              - createdAt
              - readyState
              - name
              - type
              - meta
              - regions
              - url
              - version
              - projectId
              - plan
              - createdIn
              - ownerId
              - routes
        examples:
          example:
            value:
              aliasAssignedAt: 123
              alwaysRefuseToBuild: true
              build:
                env:
                  - <string>
              buildArtifactUrls:
                - <string>
              builds:
                - use: <string>
                  src: <string>
                  config: {}
              env:
                - <string>
              inspectorUrl: <string>
              isInConcurrentBuildsQueue: true
              isInSystemBuildsQueue: true
              projectSettings:
                nodeVersion: 24.x
                buildCommand: <string>
                devCommand: <string>
                framework: blitzjs
                commandForIgnoringBuildStep: <string>
                installCommand: <string>
                outputDirectory: <string>
                speedInsights:
                  id: <string>
                  enabledAt: 123
                  disabledAt: 123
                  canceledAt: 123
                  hasData: true
                  paidAt: 123
                webAnalytics:
                  id: <string>
                  disabledAt: 123
                  canceledAt: 123
                  enabledAt: 123
                  hasData: true
              readyStateReason: <string>
              integrations:
                status: skipped
                startedAt: 123
                completedAt: 123
                skippedAt: 123
                skippedBy: <string>
              images:
                sizes:
                  - 123
                qualities:
                  - 123
                domains:
                  - <string>
                remotePatterns:
                  - protocol: http
                    hostname: <string>
                    port: <string>
                    pathname: <string>
                    search: <string>
                localPatterns:
                  - pathname: <string>
                    search: <string>
                minimumCacheTTL: 123
                formats:
                  - image/avif
                dangerouslyAllowSVG: true
                contentSecurityPolicy: <string>
                contentDispositionType: inline
              alias: []
              aliasAssigned: true
              bootedAt: 123
              buildingAt: 123
              buildContainerFinishedAt: 123
              buildSkipped: true
              creator:
                uid: 96SnxkFiMyVKsK3pnoHfx3Hz
                username: john-doe
                avatar: <string>
              initReadyAt: 123
              isFirstBranchDeployment: true
              lambdas:
                - id: <string>
                  createdAt: 123
                  readyState: BUILDING
                  entrypoint: <string>
                  readyStateAt: 123
                  output:
                    - path: <string>
                      functionName: <string>
              public: false
              ready: 123
              status: QUEUED
              team:
                id: <string>
                name: <string>
                slug: <string>
                avatar: <string>
              userAliases:
                - sub1.example.com
                - sub2.example.com
              previewCommentsEnabled: false
              ttyBuildLogs: true
              customEnvironment:
                id: <string>
                slug: <string>
                type: production
                description: <string>
                branchMatcher:
                  type: endsWith
                  pattern: <string>
                domains:
                  - name: <string>
                    apexName: <string>
                    projectId: <string>
                    redirect: <string>
                    redirectStatusCode: 307
                    gitBranch: <string>
                    customEnvironmentId: <string>
                    updatedAt: 123
                    createdAt: 123
                    verified: true
                    verification:
                      - type: <string>
                        domain: <string>
                        value: <string>
                        reason: <string>
                currentDeploymentAliases:
                  - <string>
                createdAt: 123
                updatedAt: 123
              oomReport: out-of-memory
              aliasWarning:
                code: <string>
                message: <string>
                link: <string>
                action: <string>
              id: dpl_89qyp1cskzkLrVicDaZoDbjyHuDJ
              createdAt: 1540257589405
              readyState: READY
              name: my-project
              type: LAMBDAS
              aliasError: null
              aliasFinal: <string>
              autoAssignCustomDomains: true
              automaticAliases:
                - <string>
              buildErrorAt: 123
              checksState: registered
              checksConclusion: succeeded
              deletedAt: 1540257589405
              defaultRoute: <string>
              canceledAt: 123
              errorCode: <string>
              errorLink: <string>
              errorMessage: <string>
              errorStep: <string>
              passiveRegions:
                - <string>
              gitSource:
                type: github
                repoId: <string>
                ref: <string>
                sha: <string>
                prId: 123
              meta: {}
              originCacheRegion: <string>
              nodeVersion: 24.x
              project:
                id: <string>
                name: <string>
                framework: <string>
              prebuilt: true
              readySubstate: STAGED
              regions:
                - sfo1
              softDeletedByRetention: 'true'
              source: cli
              target: null
              undeletedAt: 1540257589405
              url: my-instant-deployment-3ij3cxz9qr.now.sh
              version: 2
              oidcTokenClaims:
                iss: <string>
                sub: <string>
                scope: <string>
                aud: <string>
                owner: <string>
                owner_id: <string>
                project: <string>
                project_id: <string>
                environment: <string>
                plan: <string>
              projectId: <string>
              plan: pro
              connectBuildsEnabled: true
              connectConfigurationId: <string>
              createdIn: <string>
              crons:
                - schedule: <string>
                  path: <string>
              functions: {}
              monorepoManager: <string>
              ownerId: <string>
              passiveConnectConfigurationId: <string>
              routes:
                - src: <string>
                  dest: <string>
                  headers: {}
                  methods:
                    - <string>
                  continue: true
                  override: true
                  caseSensitive: true
                  check: true
                  important: true
                  status: 123
                  has:
                    - type: host
                      value: <string>
                  missing:
                    - type: host
                      value: <string>
                  mitigate:
                    action: challenge
                  transforms:
                    - type: request.headers
                      op: append
                      target:
                        key: <string>
                      args: <string>
                      env:
                        - <string>
                  locale:
                    redirect: {}
                    cookie: <string>
                  middlewarePath: <string>
                  middlewareRawSrc:
                    - <string>
                  middleware: 123
              gitRepo:
                namespace: <string>
                projectId: 123
                type: gitlab
                url: <string>
                path: <string>
                defaultBranch: <string>
                name: <string>
                private: true
                ownerType: team
              flags:
                definitions: {}
              microfrontends:
                isDefaultApp: true
                defaultAppProjectName: <string>
                defaultRoute: <string>
                groupIds:
                  - <string>
              config:
                version: 123
                functionType: fluid
                functionMemoryType: standard
                functionTimeout: 123
                secureComputePrimaryRegion: <string>
                secureComputeFallbackRegion: <string>
                isUsingActiveCPU: true
              checks:
                deployment-alias:
                  state: succeeded
                  startedAt: 123
                  completedAt: 123
        description: The successfully created deployment
    '400':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: |-
              One of the provided values in the request body is invalid.
              One of the provided values in the request query is invalid.
        examples: {}
        description: |-
          One of the provided values in the request body is invalid.
          One of the provided values in the request query is invalid.
    '401':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: The request is not authorized.
        examples: {}
        description: The request is not authorized.
    '402':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: >-
              The account was soft-blocked for an unhandled reason.

              The account is missing a payment so payment method must be updated

              Pro customers are allowed to deploy Serverless Functions to up to
              `proMaxRegions` regions, or if the project was created before the
              limit was introduced.

              Deploying to Serverless Functions to multiple regions requires a
              plan update
        examples: {}
        description: >-
          The account was soft-blocked for an unhandled reason.

          The account is missing a payment so payment method must be updated

          Pro customers are allowed to deploy Serverless Functions to up to
          `proMaxRegions` regions, or if the project was created before the
          limit was introduced.

          Deploying to Serverless Functions to multiple regions requires a plan
          update
    '403':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: You do not have permission to access this resource.
        examples: {}
        description: You do not have permission to access this resource.
    '404': {}
    '409':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: The deployment project is being transferred
        examples: {}
        description: The deployment project is being transferred
    '500': {}
  deprecated: false
  type: path
components:
  schemas:
    FlagJSONValue:
      nullable: true
      oneOf:
        - type: string
        - type: number
        - type: boolean
        - items:
            $ref: '#/components/schemas/FlagJSONValue'
          type: array
          description: >-
            TODO: The following types will eventually be exported by a more
            relevant package.
        - additionalProperties:
            $ref: '#/components/schemas/FlagJSONValue'
          type: object

````

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://vercel.mintlify.app/docs/rest-api/reference/llms.txt