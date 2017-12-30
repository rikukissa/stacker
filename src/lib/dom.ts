export function getBodyTextarea(): HTMLTextAreaElement | null {
  return document.querySelector(
    'textarea[name="pull_request[body]"]'
  ) as HTMLTextAreaElement | null;
}

export function getBodyTextareaValue(): string | null {
  const $textarea = getBodyTextarea();

  return $textarea && $textarea.value;
}
