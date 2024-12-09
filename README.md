# valibot-openapi-generator

Uses Valibot schemas to generate Open API documentation

## Install

Install from JSR,
    npx jsr add @camflan/valibot-openapi-generator

## Status

This is being used in production but needs a lot of help to become as powerful as it can be. Please PR any help, especially around some of the ignored type errors

## Inspiration/sources

I used [hono-openapi](https://github.com/rhinobase/hono-openapi) as the starting point, many thanks to that repository and those contributors.

## Example usage

```ts
const openApiSpec = getOpenAPISpecs(
  [
    describeRoute("/accounts", {
      summary: "List accounts",
      description: "Lists all accounts you have access to",
      method: "GET",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: v.object({
                accounts: v.array(
                  v.object({
                    id: v.string(),
                    email: v.string(),
                    name: v.string(),
                  }),
                ),
              }),
            },
          },
          description: "OK",
        },
        500: {
          description: "Server error",
        },
      },
    }),
    describeRoute("/accounts/{accountId}", {
      summary: "Account detail",
      description: "Shows detailed information for a specific account",
      method: "GET",
      parameters: [
        {
          in: "path",
          name: "accountId",
          required: true,
        },
      ],
      responses: {
        200: {
          content: {
            "application/json": {
              schema: v.object({
                account: v.object({
                  id: v.string(),
                  email: v.string(),
                  name: v.string(),
                }),
              }),
            },
          },
          description: "OK",
        },
        401: {
          description: "Not authorized",
        },
        500: {
          description: "Server error",
        },
      },
    }),
  ],
  {
    documentation: {
      info: {
        title: "My first schema",
        version: "1",
      },
    },
  },
);
```

<details>
  <summary>JSON output for the above example</summary>
</details>
    ```json
    {
  "openapi": "3.1.0",
  "info": {
    "description": "Development documentation",
    "title": "My first schema",
    "version": "1"
  },
  "components": { "schemas": {} },
  "paths": {
    "/accounts": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "accounts": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "email": { "type": "string" },
                          "id": { "type": "string" },
                          "name": { "type": "string" }
                        },
                        "required": ["email", "id", "name"],
                        "additionalProperties": false
                      }
                    }
                  },
                  "required": ["accounts"],
                  "additionalProperties": false
                }
              }
            },
            "description": "OK"
          },
          "500": { "description": "Server error" }
        },
        "operationId": "getAccounts",
        "description": "Lists all accounts you have access to",
        "summary": "List accounts"
      }
    },
    "/accounts/{accountId}": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "account": {
                      "type": "object",
                      "properties": {
                        "email": { "type": "string" },
                        "id": { "type": "string" },
                        "name": { "type": "string" }
                      },
                      "required": ["email", "id", "name"],
                      "additionalProperties": false
                    }
                  },
                  "required": ["account"],
                  "additionalProperties": false
                }
              }
            },
            "description": "OK"
          },
          "401": { "description": "Not authorized" },
          "500": { "description": "Server error" }
        },
        "operationId": "getAccountsByAccountId",
        "description": "Shows detailed information for a specific account",
        "parameters": [{ "in": "path", "name": "accountId", "required": true }],
        "summary": "Account detail"
      }
    }
  },
  "tags": []
}
    ```
</details>
