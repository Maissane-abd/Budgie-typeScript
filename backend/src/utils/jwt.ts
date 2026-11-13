function getEnvVariable(name: string): string {
  const value: string | undefined = process.env[name];

  if (!value) {
    throw new Error(`${name} n'est pas défini`);
  }

  return value;
}

export const JWT_SECRET: string = getEnvVariable('JWT_SECRET');
