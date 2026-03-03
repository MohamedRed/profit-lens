import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from './client';
import { firebaseFunctionsRegion } from '../config/runtime-config';
import type {
  AdminGetHelpTicketDetailRequest,
  AdminGetHelpTicketDetailResponse,
  AdminGetOverviewRequest,
  AdminGetOverviewResponse,
  AdminGetUserSnapshotRequest,
  AdminListHelpTicketsRequest,
  AdminListHelpTicketsResponse,
  AdminListOffersRequest,
  AdminListOffersResponse,
  AdminListUsersRequest,
  AdminListUsersResponse,
  AdminUserSnapshotResponse,
} from '../types/admin';

const getFn = () => getFunctions(getFirebaseApp(), firebaseFunctionsRegion);

async function callAdmin<Req extends object, Res>(
  name: string,
  payload: Req,
): Promise<Res> {
  const callable = httpsCallable<Req, Res>(getFn(), name);
  const result = await callable(payload);
  return result.data;
}

export const callAdminGetOverview = async (payload: AdminGetOverviewRequest) => {
  return await callAdmin<AdminGetOverviewRequest, AdminGetOverviewResponse>('adminGetOverview', payload);
};

export const callAdminListUsers = async (payload: AdminListUsersRequest) => {
  return await callAdmin<AdminListUsersRequest, AdminListUsersResponse>('adminListUsers', payload);
};

export const callAdminGetUserSnapshot = async (payload: AdminGetUserSnapshotRequest) => {
  return await callAdmin<AdminGetUserSnapshotRequest, AdminUserSnapshotResponse>('adminGetUserSnapshot', payload);
};

export const callAdminListOffers = async (payload: AdminListOffersRequest) => {
  return await callAdmin<AdminListOffersRequest, AdminListOffersResponse>('adminListOffers', payload);
};

export const callAdminListHelpTickets = async (payload: AdminListHelpTicketsRequest) => {
  return await callAdmin<AdminListHelpTicketsRequest, AdminListHelpTicketsResponse>('adminListHelpTickets', payload);
};

export const callAdminGetHelpTicketDetail = async (payload: AdminGetHelpTicketDetailRequest) => {
  return await callAdmin<AdminGetHelpTicketDetailRequest, AdminGetHelpTicketDetailResponse>(
    'adminGetHelpTicketDetail',
    payload,
  );
};
