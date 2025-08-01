/**
 * Service exports
 * Central export point for all API services
 */

// Export base service class
export { BaseService } from './base.service';

// Export types
export type {
  ServiceOptions,
  BatchOptions,
  QueryOptions,
  BatchResult,
  ValidationError,
} from './base.service';

// Export service-specific types
export type {
  TenantBasic,
  TenantBasicAttributes,
  TenantConfig,
  TenantConfigAttributes,
  Tenant,
  TenantAttributes,
} from './tenants.service';

export type {
  Account,
  AccountAttributes,
  AccountQueryOptions,
} from './accounts.service';

export type {
  Character,
  UpdateCharacterData,
} from '@/types/models/character';

export type {
  Inventory,
  Compartment,
  Asset,
  InventoryResponse,
  CompartmentType,
} from './inventory.service';

export type {
  Map,
  MapData,
  MapAttributes,
} from './maps.service';

export type {
  Guild,
  GuildAttributes,
  GuildMember,
  GuildFilters,
} from './guilds.service';

export type {
  NPC,
  Shop,
  Commodity,
  CommodityAttributes,
  ShopResponse,
} from './npcs.service';

export type {
  ConversationCreateRequest,
  ConversationUpdateRequest,
  ConversationResponse,
  ConversationsResponse,
} from './conversations.service';

export type {
  TemplateCreateRequest,
  TemplateUpdateRequest,
  TemplateResponse,
  TemplatesResponse,
} from './templates.service';

// Individual services will be exported here as they are implemented:
export { tenantsService } from './tenants.service';
export { accountsService } from './accounts.service';
export { charactersService } from './characters.service';
export { inventoryService } from './inventory.service';
export { mapsService } from './maps.service';
export { guildsService } from './guilds.service';
export { npcsService } from './npcs.service';
export { conversationsService } from './conversations.service';
export { templatesService } from './templates.service';