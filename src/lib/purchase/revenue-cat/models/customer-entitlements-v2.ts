export interface RevenueCatCustomerEntitlementsV2 {
  object: 'list';
  items: RevenueCatCustomerEntitlementV2[];
  next_page: string;
  url: string;
}

export interface RevenueCatCustomerEntitlementV2 {
  object: 'customer.active_entitlement';
  entitlement_id: string;
  expires_at: number;
}
