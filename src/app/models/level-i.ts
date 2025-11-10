export interface LevelI {
  _id: string;
  id?: string;
  name: string;
  position?: {
    _id: number;
    name: string
  };
  positionId: number,
}
