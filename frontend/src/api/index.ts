// api/index.ts — ponto único de import da camada de rede.

export { API_BASE_URL } from './config';
export { request, ApiError, setUnauthorizedHandler } from './client';
export { login, logout, hasSession, type AuthUser } from './auth';
export {
  getPoints,
  getTopology,
  createPoint,
  updatePoint,
  deletePointApi,
} from './resources';
export { pointFromDTO, pointToDTO, panelDefFromDTO, panelCode } from './mappers';
export type { Topology, ConnectionPointDTO } from './dto';
