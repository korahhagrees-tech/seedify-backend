import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

export function createErrorResponse(
  error: string,
  status: number = 400,
  message?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function createNotFoundResponse(resource: string): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
}

export function createUnauthorizedResponse(): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}
