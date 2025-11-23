export interface UserProfileI {
  _id: string;
  nickname: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  photo: string;
  role: string;
  contactNumber: string;

  position: {
    _id: string;
    name: string;
  };

  level: {
    _id: string;
    name: string;
  };

  department: {
    _id: string;
    name: string;
  };
}
