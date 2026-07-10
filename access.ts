// Only this email is allowed into the staff dashboard (العيادة الطبية).
// Change here to grant access to a different account.
export const ALLOWED_ADMIN_EMAIL = "karimaismail1998@gmail.com";

export function isAllowedAdmin(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === ALLOWED_ADMIN_EMAIL;
}