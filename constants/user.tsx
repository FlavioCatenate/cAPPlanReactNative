export default interface User {
  activated: boolean;
  authorities: string[];
  createdBy: string;
  createdDate: string | null;
  email: string;
  firstName: string;
  id: number;
  imageUrl: string;
  langKey: string;
  lastModifiedBy: string;
  lastModifiedDate: string | null;
  lastName: string;
  login: string;
}