/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/_sitemap` | `/sale` | `/sale/consent` | `/sale/device-release` | `/sale/device-selection` | `/sale/imei-capture` | `/sale/kyc-capture` | `/sale/loan-terms` | `/sale/otp-verification` | `/sale/phone-verification`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
