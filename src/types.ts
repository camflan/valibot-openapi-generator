import type { OpenAPIV3 } from "openapi-types";
import { AnySchema } from "valibot";

import type { AllowedMethod } from "./helper.ts";

/** Enhanced OpenAPI response container, allows passing Valibot schemas as the schema value */
export type ContentWithSchema = {
  content?: {
    [key: string]: Omit<OpenAPIV3.MediaTypeObject, "schema"> & {
      schema?:
        | AnySchema
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.SchemaObject
        | ResolverResult;
    };
  };
};

export type DescribeRouteOptions = Omit<
  OpenAPIV3.OperationObject,
  "requestBody" | "responses"
> & {
  /**
   * Pass `true` to hide route from OpenAPI/swagger document
   */
  hide?: boolean;

  method: "ALL" | OpenAPIRoute["method"];

  /**
   * Request body
   */
  requestBody?:
    | (ContentWithSchema & OpenAPIV3.RequestBodyObject)
    | OpenAPIV3.ReferenceObject;

  /**
   * Responses of the request
   */
  responses?: {
    [key: string]:
      | (ContentWithSchema & OpenAPIV3.ResponseObject)
      | OpenAPIV3.ReferenceObject;
  };

  /**
   * Validate response of the route
   * @experimental
   */
  validateResponse?: boolean;
};

export type HandlerResponse = {
  metadata?: Record<string, unknown>;
  resolver: (config: OpenAPIRouteHandlerConfig) => PromiseOr<{
    components?: OpenAPIV3.ComponentsObject["schemas"];
    docs: OpenAPIV3.OperationObject;
  }>;
};

export type HasUndefined<T> = undefined extends T ? true : false;

export interface OpenAPIRoute {
  data:
    | DescribeRouteOptions
    | Pick<OpenAPIV3.OperationObject, "parameters" | "requestBody">;
  method: AllowedMethod;
  path: string;
}

export type OpenAPIRouteHandlerConfig = { [key: string]: unknown } & {
  components: OpenAPIV3.ComponentsObject["schemas"];
  version: "3.0.0" | "3.0.1" | "3.0.2" | "3.0.3" | "3.1.0";
};

export type OpenApiSpecsOptions = {
  /**
   * Customize OpenAPI config, refers to Swagger 2.0 config
   *
   * @see https://swagger.io/specification/v2/
   */
  documentation?: Omit<
    Partial<OpenAPIV3.Document>,
    | "x-express-openapi-additional-middleware"
    | "x-express-openapi-validation-strict"
  >;

  /**
   * Paths to exclude from OpenAPI endpoint
   *
   * @default []
   */
  exclude?: Array<RegExp | string> | RegExp | string;

  /**
   * Exclude methods from Open API
   */
  excludeMethods?: AllowedMethod[];

  /**
   * Determine if Swagger should exclude static files.
   *
   * @default true
   */
  excludeStaticFile?: boolean;

  /**
   * Exclude tags from OpenAPI
   */
  excludeTags?: string[];
};

export type PromiseOr<T> = Promise<T> | T;

export type ResolverResult = {
  builder: (options?: OpenAPIRouteHandlerConfig) => PromiseOr<{
    components?: OpenAPIV3.ComponentsObject["schemas"];
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
  }>;
  validator: (values: unknown) => PromiseOr<void>;
};
