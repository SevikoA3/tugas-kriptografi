import { collection, getDocs, query, where } from "firebase/firestore";
import db from "./connect_db";

const isLoggedIn = async () => {
  try {
    const session = localStorage.getItem('session');
    if (!session) {
      return false;
    }

    const user = JSON.parse(session);
    if (!user.username || !user.password) {
      return false;
    }

    const userCollection = collection(db, 'users');
    const q = query(userCollection, where('username', '==', user.username), where('password', '==', user.password));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user: ', error);
    return false;
  }
};

export default isLoggedIn;