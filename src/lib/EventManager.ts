type EventsMap = {
  [k: string]: (...args: any[]) => void;
};

export class EventManager<Events extends EventsMap> {
  private listeners = new Map<keyof Events, Set<Events[any]>>();

  public on = <E extends keyof Events>(event: E, listener: Events[E]): void => {
    const newListeners = this.listeners.get(event)?.add(listener) ?? new Set([listener]);
    this.listeners.set(event, newListeners);
  };

  public off = <E extends keyof Events>(event: E, listener: Events[E]): void => {
    this.listeners.get(event)?.delete(listener);
  };

  public emit = <E extends keyof Events>(event: E, ...data: Parameters<Events[E]>): void => {
    const listeners = this.listeners.get(event);
    if (listeners && listeners.size > 0) {
      listeners.forEach((callback: Events[E]) => {
        callback(...data);
      });
    }
  };

  public removeAllListeners = (): void => {
    this.listeners = new Map<keyof Events, Set<Events[any]>>();
  };

  public hasRegisteredEventListeners = <E extends keyof Events>(event: E): boolean => {
    return this.listeners.has(event);
  };
}
