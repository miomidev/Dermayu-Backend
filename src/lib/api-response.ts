import { NextResponse } from "next/server";

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

// Convert BigInt values to string or number so JSON.stringify succeeds
export function serializeData<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export function apiSuccess<T>(data: T, meta?: PaginationMeta, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data: serializeData(data),
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: Array<{ field: string; issue: string }>
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code,
        message,
        ...(details && details.length > 0 ? { details } : {}),
      },
    },
    { status }
  );
}
