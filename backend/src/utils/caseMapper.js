function snakeToCamel(str) {
  return str.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

export function toCamelCase(input) {
  if (Array.isArray(input)) {
    return input.map((item) => toCamelCase(item));
  }
  if (input !== null && typeof input === "object" && !(input instanceof Date)) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [snakeToCamel(key), toCamelCase(value)])
    );
  }
  return input;
}
