export interface LevelI {
  _id?: string;
  name: string;
  positionId: string;
  createdAt?: string;
  updatedAt?: string;
  Position?: {
    name: string;
  };
  id?: string; // في بعض الأحيان بيكون في id بالإضافة لـ _id
}
