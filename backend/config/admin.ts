import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET", "replace-admin-jwt-secret"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT", "replace-api-token-salt"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT", "replace-transfer-token-salt"),
    },
  },
  secrets: {
    encryptionKey: env("ENCRYPTION_KEY", "replace-encryption-key"),
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
});

export default config;
