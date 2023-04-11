import { User } from 'src/users/user.entity';

interface IAuth {
    authUser: User;
    token: string;
  }
  export default IAuth