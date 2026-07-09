export type UserRole = "manager" | "worker"

export const ROLE_COOKIE_NAME = "ff_role"

export function getRoleHome(role: UserRole) {
  return role === "manager" ? "/dashboard" : "/"
}

export function getProfilePath(role: UserRole) {
  return role === "manager" ? "/dashboard/profile" : "/profile"
}

export function setRoleCookie(role: UserRole) {
  if (typeof document === "undefined") return

  document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=604800; samesite=lax`
}

export function clearRoleCookie() {
  if (typeof document === "undefined") return

  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}
