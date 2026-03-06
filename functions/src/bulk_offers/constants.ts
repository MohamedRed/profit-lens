export const BULK_REGION = "europe-west1";

export const bulkCallableConfig = {
  cors: true,
  timeoutSeconds: 60,
  memory: "512MiB" as const,
  region: BULK_REGION,
};

export const MAX_BULK_ROWS_PER_COMMIT = 120;
