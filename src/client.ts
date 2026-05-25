export class TatNetAPIError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown[]
  ) {
    super(message);
    this.name = "TatNetAPIError";
  }
}

export interface Page<T> {
  data: T[];
  limit: number;
  offset: number;
  count: number;
}

export class TatNetClient {
  readonly baseUrl: string;

  constructor(
    private readonly apiKey: string,
    baseUrl: string = "https://api.tatnet.ru/v1"
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private get authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }

  private async parse<T>(resp: Response): Promise<T> {
    if (resp.status === 204) return undefined as T;
    const body = (await resp.json()) as unknown;
    if (!resp.ok) {
      const err = (
        body as { error?: { code?: string; message?: string; details?: unknown[] } }
      ).error ?? {};
      throw new TatNetAPIError(
        resp.status,
        err.code ?? "unknown",
        err.message ?? `HTTP ${resp.status}`,
        err.details
      );
    }
    return body as T;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const resp = await fetch(this.buildUrl(path, params), {
      headers: this.authHeaders,
    });
    return this.parse<T>(resp);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const resp = await fetch(this.buildUrl(path), {
      method: "POST",
      headers: this.authHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.parse<T>(resp);
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const resp = await fetch(this.buildUrl(path), {
      method: "PATCH",
      headers: this.authHeaders,
      body: JSON.stringify(body),
    });
    return this.parse<T>(resp);
  }

  async del(path: string): Promise<void> {
    const resp = await fetch(this.buildUrl(path), {
      method: "DELETE",
      headers: this.authHeaders,
    });
    await this.parse<void>(resp);
  }
}
