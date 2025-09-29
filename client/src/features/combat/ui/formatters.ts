export function formatTemplate(template: string, data: Record<string, string | number>): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const value = data[key.trim()];
    return value !== undefined ? String(value) : "";
  });
}
