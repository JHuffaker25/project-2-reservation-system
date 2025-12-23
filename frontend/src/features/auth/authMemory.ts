let credentials: { email: string; password: string } | null = null;

export function setCredentials(email: string, password: string) {
  credentials = { email, password };
}

export function clearCredentials() {
  credentials = null;
}

export function getCredentials() {
  return credentials;
}
