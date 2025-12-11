/**
 * Application factory for creating and configuring the Teams app
 */

import { App } from "@microsoft/teams.apps";
import { IStorage } from "@microsoft/teams.common";
import { DevtoolsPlugin } from "@microsoft/teams.dev";
import { getCredentialOptions } from "../auth/tokenFactory";

export interface AppConfig {
  storage: IStorage;
  plugins?: any[];
  credentialOptions?: any;
}

/**
 * Create and configure the Teams app
 */
export function createApp(config: AppConfig): App {
  const credentialOptions = config.credentialOptions || getCredentialOptions();
  const plugins = config.plugins || [new DevtoolsPlugin()];

  return new App({
    ...credentialOptions,
    storage: config.storage,
    plugins,
  });
}

