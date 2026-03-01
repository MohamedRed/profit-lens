export type AdminRangeDays = 7 | 30 | 90;
export type AdminSortDir = "asc" | "desc";

export interface AdminGetOverviewRequest {
  rangeDays?: AdminRangeDays;
}

export interface AdminKpiDelta {
  previousValue: number;
  absoluteChange: number;
  percentChange: number | null;
  trend: "up" | "down" | "flat";
}

export interface AdminGetOverviewResponse {
  rangeDays: AdminRangeDays;
  generatedAtIso: string;
  kpis: {
    totalUsers: number;
    activeUsersInRange: number;
    offersInRange: number;
    positiveOffersInRange: number;
    negativeOffersInRange: number;
    openTicketsInRange: number;
    resolvedTicketsInRange: number;
    paidUsers: number;
    freeUsers: number;
  };
  deltas: {
    activeUsersInRange: AdminKpiDelta;
    offersInRange: AdminKpiDelta;
    ticketsInRange: AdminKpiDelta;
  };
}

export type AdminUsersSortBy = "lastActivityAt" | "createdAt" | "offerCount30d";

export interface AdminListUsersRequest {
  query?: string;
  sortBy?: AdminUsersSortBy;
  sortDir?: AdminSortDir;
  pageSize?: number;
  cursor?: string;
}

export interface AdminUserRow {
  uid: string;
  emailMasked: string | null;
  createdAtIso: string | null;
  lastActivityAtIso: string | null;
  offerCount30d: number;
  helpTicketCount30d: number;
  entitlementPlanId: string | null;
  entitlementStatus: string | null;
  isPaid: boolean;
}

export interface AdminListUsersResponse {
  rows: AdminUserRow[];
  nextCursor: string | null;
}

export interface AdminGetUserSnapshotRequest {
  uid: string;
  includeSensitive?: boolean;
}

export interface AdminUserSnapshotResponse {
  user: {
    uid: string;
    emailMasked: string | null;
    email: string | null;
    createdAtIso: string | null;
    lastActivityAtIso: string | null;
    countryCode: string | null;
    currencyCode: string | null;
    preferredLocale: string | null;
    minProfitabilityEuro: number | null;
  };
  entitlement: {
    planId: string | null;
    status: string | null;
    source: string | null;
    offerLimit: number | null;
    periodStartIso: string | null;
    periodEndIso: string | null;
    periodKey: string | null;
    cancelAtPeriodEnd: boolean | null;
  };
  usage: {
    periodKey: string | null;
    offerCount: number;
  };
  recentOffers: AdminOfferRow[];
  recentTickets: AdminHelpTicketRow[];
  devices: AdminUserDeviceSummary[];
}

export interface AdminUserDeviceSummary {
  deviceId: string;
  platform: string | null;
  active: boolean;
  firstSeenIso: string | null;
  lastSeenIso: string | null;
}

export type AdminOfferSource = "manual" | "screenshot";
export type AdminProfitabilityFilter = "positive" | "negative";

export interface AdminListOffersRequest {
  uid?: string;
  source?: AdminOfferSource;
  dateFromIso?: string;
  dateToIso?: string;
  profitability?: AdminProfitabilityFilter;
  pageSize?: number;
  cursor?: string;
}

export interface AdminOfferRow {
  uid: string;
  offerId: string;
  source: string | null;
  createdAtIso: string | null;
  payoutEuro: number | null;
  distanceKm: number | null;
  durationMinutes: number | null;
  netProfitEuro: number | null;
  profitability: "positive" | "negative" | "neutral";
  pickupSummary: string | null;
  dropoffSummary: string | null;
}

export interface AdminListOffersResponse {
  rows: AdminOfferRow[];
  nextCursor: string | null;
}

export interface AdminListHelpTicketsRequest {
  uid?: string;
  status?: string;
  delivererStatus?: string;
  dateFromIso?: string;
  dateToIso?: string;
  pageSize?: number;
  cursor?: string;
}

export interface AdminHelpTicketRow {
  uid: string;
  ticketId: string;
  title: string | null;
  descriptionPreview: string | null;
  status: string | null;
  delivererStatus: string | null;
  createdAtIso: string | null;
  updatedAtIso: string | null;
  emailMasked: string | null;
}

export interface AdminListHelpTicketsResponse {
  rows: AdminHelpTicketRow[];
  counters: {
    byStatus: Record<string, number>;
    byDelivererStatus: Record<string, number>;
  };
  nextCursor: string | null;
}

export interface AdminGetHelpTicketDetailRequest {
  uid: string;
  ticketId: string;
  includeSensitive?: boolean;
}

export interface AdminHelpTicketDetailAttachment {
  id: string;
  type: "image" | "audio" | "unknown";
  filename: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  durationSeconds: number | null;
  uploadedAtIso: string | null;
  storagePath: string | null;
  url: string | null;
}

export interface AdminHelpTicketDetailTimelineEvent {
  id: string;
  status: string | null;
  message: string | null;
  atIso: string | null;
  source: string | null;
}

export interface AdminGetHelpTicketDetailResponse {
  ticket: {
    uid: string;
    ticketId: string;
    title: string | null;
    description: string | null;
    status: string | null;
    delivererStatus: string | null;
    delivererStatusMessage: string | null;
    createdAtIso: string | null;
    updatedAtIso: string | null;
    emailMasked: string | null;
    email: string | null;
  };
  attachments: AdminHelpTicketDetailAttachment[];
  timeline: AdminHelpTicketDetailTimelineEvent[];
}

export interface AdminPrincipal {
  uid: string;
  email: string;
  normalizedEmail: string;
}

export type AdminEndpointName =
  | "adminGetOverview"
  | "adminListUsers"
  | "adminGetUserSnapshot"
  | "adminListOffers"
  | "adminListHelpTickets"
  | "adminGetHelpTicketDetail";
