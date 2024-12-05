import type {
  JSONSchema,
  ParserOptions,
} from "@apidevtools/json-schema-ref-parser";

export type addPrefixToObject = {
  [K in keyof JSONSchema as `x-${K}`]: JSONSchema[K];
};

export interface Options {
  cloneSchema?: boolean;
  convertUnreferencedDefinitions?: boolean;
  dereference?: boolean;
  dereferenceOptions?: ParserOptions | undefined;
}

export type SchemaType = ExtendedJSONSchema & {
  example?: JSONSchema["examples"][number];
  nullable?: boolean;
  "x-patternProperties"?: JSONSchema["patternProperties"];
};

export type SchemaTypeKeys = keyof SchemaType;

type ExtendedJSONSchema = addPrefixToObject & JSONSchema;
