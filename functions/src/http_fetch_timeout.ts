import { HttpsError } from "firebase-functions/v2/https";

type FetchWithTimeoutParams = {
  url: string | URL;
  init?: RequestInit;
  timeoutMs: number;
  timeoutMessage: string;
  unavailableMessage: string;
};

export async function fetchWithTimeout(
  params: FetchWithTimeoutParams
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(params.timeoutMs);
  const signal = params.init?.signal
    ? AbortSignal.any([params.init.signal, timeoutSignal])
    : timeoutSignal;

  try {
    return await fetch(params.url, {
      ...params.init,
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new HttpsError("deadline-exceeded", params.timeoutMessage);
    }
    const details = error instanceof Error ? ` ${error.message}` : "";
    throw new HttpsError(
      "unavailable",
      `${params.unavailableMessage}.${details}`.trim()
    );
  }
}

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.name === "AbortError" || error.name === "TimeoutError";
}
