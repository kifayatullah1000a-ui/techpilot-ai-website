/**
 * TechPilot AI - Safe API Client Utility
 * Prevents "Unexpected token '<', '<!doctype ...' is not valid JSON" errors
 * by checking HTTP status and Content-Type before parsing JSON.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  isHtmlFallback?: boolean;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.toLowerCase().includes('application/json');

    if (isJson) {
      const json = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          data: json,
          error: json.message || json.error || `Server returned error (${res.status} ${res.statusText})`,
        };
      }
      return {
        ok: true,
        status: res.status,
        data: json,
      };
    }

    // Response is NOT JSON (e.g. HTML from Vite SPA fallback, Cloud Run error page, or gateway timeout)
    const rawText = await res.text();
    const isHtml = rawText.includes('<!DOCTYPE') || rawText.includes('<!doctype') || rawText.includes('<html');

    let errorMessage = `Unexpected response format: received ${contentType || 'text/plain'} instead of JSON (HTTP ${res.status}).`;
    if (isHtml) {
      if (res.status === 404) {
        errorMessage = `The requested API endpoint was not found (HTTP 404).`;
      } else if (res.status === 502 || res.status === 503 || res.status === 504) {
        errorMessage = `The upstream AI service is temporarily unavailable or experiencing high demand (HTTP ${res.status}). Please try again in a moment.`;
      } else {
        errorMessage = `The server returned an HTML page instead of JSON (HTTP ${res.status}).`;
      }
    } else if (rawText.trim().length > 0 && rawText.length < 300) {
      errorMessage = rawText.trim();
    }

    return {
      ok: false,
      status: res.status,
      error: errorMessage,
      isHtmlFallback: isHtml,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err?.message || 'Network connection failed. Please verify your connection.',
    };
  }
}
