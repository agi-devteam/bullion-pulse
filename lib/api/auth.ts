import type { UserInfo } from "@/domain/auth";
import { AUTH_INFO_PATH } from "@/lib/auth/constants";
import { apiGet, apiPost } from "@/lib/api/http";

interface CredentialsResponseDto {
  request_id: string;
}

interface VerificationResponseDto {
  access_token: string;
}

interface UserInfoDto {
  id: number;
  name: string;
  role?: string;
  image?: string | null;
  permissions?: string[];
}

export async function requestCredentials(
  email: string,
  password: string,
): Promise<string> {
  const response = await apiPost<CredentialsResponseDto>("/auth/credentials", {
    email,
    password,
  });
  return response.request_id;
}

export async function verifyOtp(
  requestId: string,
  otp: string,
): Promise<string> {
  const response = await apiPost<VerificationResponseDto>(
    "/auth/verification",
    {
      request_id: requestId,
      otp,
    },
  );
  return response.access_token;
}

export function toUserInfo(dto: UserInfoDto): UserInfo {
  return {
    id: dto.id,
    name: dto.name,
    image: dto.image ?? null,
    permissions: Array.isArray(dto.permissions) ? dto.permissions : [],
  };
}

export async function fetchUserInfo(): Promise<UserInfo> {
  const dto = await apiGet<UserInfoDto>(AUTH_INFO_PATH);
  return toUserInfo(dto);
}
