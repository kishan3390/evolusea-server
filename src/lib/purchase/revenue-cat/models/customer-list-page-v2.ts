export interface CustomerListPageV2 {
  object: 'list';
  items: CustomerListPageItemV2[];
  next_page: string | null;
  url: string;
}

export interface CustomerListPageItemV2 {
  object: 'customer';
  id: string;
  project_id: string;
  first_seen_at: number;
  last_see_at: number | null;
  last_seen_app_version: string | null;
  last_seen_country: string | null;
  last_seen_platform: string | null;
  last_seen_platform_version: string | null;
}
