export const readEnvVariable = (variableKey: string, defaultValue?: any) => process.env[variableKey] ?? defaultValue;

export const readRequiredEnvVariable = (variableKey: string) => {
  const variable = readEnvVariable(variableKey);

  if (!variable) {
    throw new Error(`Required variable ${variableKey} missing`);
  }

  return variable;
};

export const readJWTKey = (variableKey: string) => {
  const variable = readRequiredEnvVariable(variableKey);

  return variable.replace(/\\n/g, '\n');
};
