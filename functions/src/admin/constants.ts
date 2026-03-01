export const ADMIN_REGION = "europe-west1";
export const ADMIN_ACCESS_DOC_PATH = "admin/config/access";
export const ADMIN_DEFAULT_PAGE_SIZE = 20;
export const ADMIN_MAX_PAGE_SIZE = 100;
export const ADMIN_CURSOR_VERSION = 1;

export const adminCallableConfig = {
  cors: true,
  timeoutSeconds: 45,
  memory: "512MiB" as const,
  region: ADMIN_REGION,
};
