function getEnvVariable(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} n'est pas défini`);
    }
    return value;
}
export const JWT_SECRET = getEnvVariable('JWT_SECRET');
