import "server-only";

/**
 * Helper to safely build error responses from server actions / route handlers.
 * Logs the full error server-side; returns a generic message + correlation code
 * to the client so we never leak Prisma internals, file paths, schema names, etc.
 */

import { Prisma } from "@prisma/client";

type ErrorEnvelope = {
  message: string;
  code: string;
};

function randomCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function logAndMaskError(scope: string, error: unknown, fallbackMessage: string): ErrorEnvelope {
  const code = randomCode();
  // Detailed log stays server-side only.
  console.error(`[${scope}][${code}]`, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { message: "Ya existe un registro con ese identificador unico.", code };
    }
    if (error.code === "P2003") {
      return { message: "No fue posible relacionar el registro. Revisa las dependencias.", code };
    }
    if (error.code === "P2025") {
      return { message: "El registro solicitado ya no existe.", code };
    }
  }

  return { message: fallbackMessage, code };
}
