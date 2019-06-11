export function stripHTML(input: string): string {
  return input.replace(/(<([^>]+)>)/ig, "");
}
