import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { extractBearerToken, verifyAccessToken, TokenPayload } from "./auth";
import { apiError } from "./api-response";

export interface AuthContext {
  token: string;
  user: TokenPayload;
}

/**
 * Validates request Bearer token and ensures user has one of the allowed roles.
 * Returns { ok: true, context } or { ok: false, response }
 */
export function authorize(
  req: NextRequest,
  allowedRoles?: Role[]
): { ok: true; context: AuthContext } | { ok: false; response: ReturnType<typeof apiError> } {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) {
    return {
      ok: false,
      response: apiError("UNAUTHORIZED", "Token autentikasi diperlukan", 401),
    };
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return {
      ok: false,
      response: apiError("UNAUTHORIZED", "Token tidak valid atau telah kedaluwarsa", 401),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(payload.role)) {
      return {
        ok: false,
        response: apiError(
          "FORBIDDEN",
          `Akses ditolak. Fitur ini hanya untuk peran: ${allowedRoles.join(", ")}`,
          403
        ),
      };
    }
  }

  return {
    ok: true,
    context: { token, user: payload },
  };
}

/**
 * RBAC Helper Matrix check
 */
export const Roles = {
  ALL: ["CITIZEN", "OFFICER", "ADMIN", "SUPERADMIN"] as Role[],
  STAFF: ["OFFICER", "ADMIN", "SUPERADMIN"] as Role[],
  ADMINS: ["ADMIN", "SUPERADMIN"] as Role[],
  SUPERADMIN_ONLY: ["SUPERADMIN"] as Role[],
  OFFICER_ONLY: ["OFFICER"] as Role[],
  CITIZEN_ONLY: ["CITIZEN"] as Role[],
};
