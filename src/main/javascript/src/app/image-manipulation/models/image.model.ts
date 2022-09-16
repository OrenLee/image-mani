import { Effects } from "./effects.model";

export interface Image {
  id: number,
  name: string,
  type: string,
  image: string,
  effects: Effects
}
