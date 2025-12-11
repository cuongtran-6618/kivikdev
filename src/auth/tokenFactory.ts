/**
 * Authentication token factory module
 */

import { TokenCredentials } from "@microsoft/teams.api";
import { ManagedIdentityCredential } from "@azure/identity";

export interface TokenFactory {
  (scope: string | string[], tenantId?: string): Promise<string>;
}

/**
 * Creates a token factory function for managed identity authentication
 */
export const createTokenFactory = (clientId?: string): TokenFactory => {
  return async (scope: string | string[], tenantId?: string): Promise<string> => {
    const managedIdentityCredential = new ManagedIdentityCredential({
      clientId: clientId || process.env.CLIENT_ID,
    });
    const scopes = Array.isArray(scope) ? scope : [scope];
    const tokenResponse = await managedIdentityCredential.getToken(scopes, {
      tenantId: tenantId,
    });

    return tokenResponse.token;
  };
};

/**
 * Creates token credentials configuration
 */
export const createTokenCredentials = (clientId?: string): TokenCredentials => {
  return {
    clientId: clientId || process.env.CLIENT_ID || "",
    token: createTokenFactory(clientId),
  };
};

/**
 * Gets credential options based on app type
 */
export const getCredentialOptions = (appType?: string): TokenCredentials | undefined => {
  const type = appType || process.env.BOT_TYPE;
  return type === "UserAssignedMsi" ? createTokenCredentials() : undefined;
};


