// https://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/
export function stripHTML(input: string): string {
  return input.replace(/(<([^>]+)>)/ig, "");
}
