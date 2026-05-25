import { TatNetAPIError } from "../client.js";

export function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function deleted() {
  return {
    content: [{ type: "text" as const, text: "Deleted successfully." }],
  };
}

export function apiErr(e: unknown) {
  let text: string;
  if (e instanceof TatNetAPIError) {
    text = `API Error ${e.status} (${e.code}): ${e.message}`;
    if (e.details?.length) {
      text += `\nDetails:\n${JSON.stringify(e.details, null, 2)}`;
    }
  } else {
    text = `Unexpected error: ${String(e)}`;
  }
  return {
    content: [{ type: "text" as const, text }],
    isError: true as const,
  };
}
