export class Highscore {
  localStorageKey: string = "boxhead-highscore";
  updated = false;

  get() {
    return parseInt(localStorage.getItem(this.localStorageKey) || "0");
  }

  set(value: number) {
    localStorage.setItem(this.localStorageKey, value.toString());
    this.updated = true;
  }
}
