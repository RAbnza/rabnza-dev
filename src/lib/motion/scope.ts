import { createScope, type Scope } from "animejs";

export function createMotionScope(
  root: HTMLElement,
  setup: () => void | (() => void),
): Scope {
  const scope = createScope({
    root,
  });

  scope.add(setup);

  return scope;
}
