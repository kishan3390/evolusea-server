export interface RevenueCatCustomerV1 {
  request_date: string;
  request_date_ms: number;
  subscriber: RevenueCatCustomerSubscriberV1;
}

export interface RevenueCatCustomerSubscriberV1 {
  entitlements: Record<string, RevenueCatEntitlementV1>;
  first_seen: string;
  management_url: string;
  non_subscriptions: Record<string, any>;
  original_app_user_id: string;
  original_application_version: string;
  original_purchase_date: string;
  subscriptions: Record<string, any>;
}

export interface RevenueCatEntitlementV1 {
  // Value is null for lifetime subscriptions
  expires_date: string | null;
  grace_period_expires_date: string | null;
  product_identifier: string;
  purchase_date: string;
}
