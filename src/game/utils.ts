export const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

export function throttle<Func extends (...args: any[]) => void>(
  func: Func,
  waitMilliseconds: number | (() => number),
): Func {
  let lastExecution = 0;
  let currentWaitMilliseconds: number =
    typeof waitMilliseconds === "number"
      ? waitMilliseconds
      : waitMilliseconds();

  const throttledFunction = function (
    this: ThisParameterType<Func>,
    ...args: Parameters<Func>
  ) {
    const now = Date.now();
    const sinceLastExecution = now - lastExecution;
    const context = this;

    const execute = () => {
      lastExecution = now;
      func.apply(context, args);
    };

    if (sinceLastExecution >= currentWaitMilliseconds) {
      execute();
      if (typeof waitMilliseconds === "function") {
        currentWaitMilliseconds = waitMilliseconds();
      }
    }
  } as Func;

  return throttledFunction;
}

export function getRandomIntInclusive(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}
