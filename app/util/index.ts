export function getEnv(name: string, defaultValue?: string): string {
  let value: string | undefined;
  if ('process' in globalThis) {
    value = globalThis.process.env[name];
  } else if (name in globalThis) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value = (globalThis as any)[name];
  }
  if (!value) {
    if (defaultValue != null) {
      return defaultValue;
    }
    throw new Error(`Missing ${name} env`);
  }
  return value;
}
