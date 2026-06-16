import type { Context } from "hono";

// Server Error Handler
export const serverError = (c: Context, error: any) => {
  console.error("Error: ", error);
  return c.json(
    {
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    },
    500,
  );
};

// Bad Request Handler
export const badRequestError = (
  c: Context,
  {
    message = "Bad Request",
    fields = [],
  }: { message?: string; fields?: Array<{ name: string; message: string }> },
) => {
  return c.json(
    {
      success: false,
      error: {
        message: message,
        code: 400,
      },
      fields: fields.length > 0 ? fields : null,
    },
    400,
  );
};

// Conflict Error Handler
export const conflictError = (
  c: Context,
  {
    message = "Conflict",
    fields = [],
  }: { message?: string; fields?: Array<{ name: string; message: string }> },
) => {
  console.error("Conflict: ", message, fields);
  return c.json(
    {
      success: false,
      error: {
        message: message,
        code: 409,
      },
      fields,
    },
    409,
  );
};

// Not Found Handler
export const notFoundError = (c: Context) => {
  console.error("Not Found: ", c.req.url);
  return c.json(
    {
      success: false,
      message: `Not Found - [${c.req.method}] ${c.req.url}`,
    },
    404,
  );
};

// Authentication Error Handler
export const authenticationError = (
  c: Context,
  message = "Authentication Failed",
) => {
  console.error("Authentication Error: ", message);
  return c.json(
    {
      success: false,
      error: {
        message: message,
        code: 401,
      },
    },
    401,
  );
};

// Authorization Error Handler
export const authorizationError = (
  c: Context,
  message = "Permission Denied",
) => {
  console.error("Authorization Error: ", message);
  return c.json(
    {
      success: false,
      error: {
        message: message,
        code: 403,
      },
    },
    403,
  );
};

export const schemaValidationError = (error: any, message: string) => ({
  message,
  fields: error.issues.map((issue: any) => ({
    name: String(issue.path[0]),
    message: issue.message,
  })),
});