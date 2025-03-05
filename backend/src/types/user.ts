export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  sync_status: 'pending' | 'synced' | 'failed';
  crm_id: string | null;
  last_updated?: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
}
