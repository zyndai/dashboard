export interface DeveloperKey {
  id: string;
  user_id: string;
  developer_id: string;
  public_key: string;
  private_key_enc: string;
  name: string;
  created_at: string;
}

export interface EntityPricing {
  model: string;
  base_price_usd: number;
  currency: string;
  payment_methods: string[];
  rates?: Record<string, number>;
}

export interface EntityRecord {
  id: string;
  user_id: string;
  entity_id: string | null;
  name: string;
  description: string | null;
  entity_url: string | null;
  category: string | null;
  tags: string[] | null;
  summary: string | null;
  entity_index: number | null;
  fqan: string | null;
  entity_type: string | null;
  service_endpoint: string | null;
  openapi_url: string | null;
  entity_pricing: EntityPricing | null;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}
