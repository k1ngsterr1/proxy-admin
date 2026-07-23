import Cookies from "js-cookie";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const cookieOptions = {
  expires: 3650,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

const isBrowser = () => typeof window !== "undefined";

export const saveTokens = ({ accessToken, refreshToken }: AuthTokens) => {
  if (!isBrowser()) return;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  Cookies.set("accessToken", accessToken, cookieOptions);
  Cookies.set("refreshToken", refreshToken, cookieOptions);
};

export const clearTokens = () => {
  if (!isBrowser()) return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
};

export const getAccessToken = () => {
  if (!isBrowser()) return null;
  return Cookies.get("accessToken") || localStorage.getItem("accessToken");
};

export const getRefreshToken = () => {
  if (!isBrowser()) return null;
  return Cookies.get("refreshToken") || localStorage.getItem("refreshToken");
};
