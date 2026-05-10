export interface DeveloperKey {
  id: string;
  user_id: string;
  developer_id: string;
  public_key: string;
  private_key_enc: string;
  name: string;
  created_at: string;
}

export interface CapabilitySummary {
  input_types?: string[];
  languages?: string[];
  models?: string[];
  output_types?: string[];
  protocols?: string[];
  skills?: string[];
}

export interface PricingModel {
  base_price?: number;
  currency?: string;
  details?: string;
  type?: string;
  unit?: string;
}

export interface EntityRecord {
  id?: string;
  user_id?: string;
  entity_id: string;
  name: string;
  description?: string | null;
  entity_url?: string | null;
  category?: string | null;
  tags?: string[] | null;
  summary?: string | null;
  entity_index?: number | null;
  fqan?: string | null;
  developer_handle?: string | null;
  entity_type?: string | null;
  service_endpoint?: string | null;
  openapi_url?: string | null;
  entity_pricing?: PricingModel | null;
  status: string;
  source: string;
  created_at?: string;
  updated_at?: string;
  registered_at?: string | null;
  capability_summary?: CapabilitySummary | null;
  developer_id?: string | null;
  home_registry?: string | null;
  last_heartbeat?: string | null;
  public_key?: string | null;
  schema_version?: string | null;
  signature?: string | null;
  ttl?: number | null;
  type?: string | null;
}
