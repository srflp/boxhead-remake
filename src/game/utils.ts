export const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

export function throttle<Func extends (...args: any[]) => void>(
  func: Func,
  waitMilliseconds: number,
): Func {
  let lastExecution = 0;

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

    if (sinceLastExecution >= waitMilliseconds) {
      execute();
    }
  } as Func;

  return throttledFunction;
}
