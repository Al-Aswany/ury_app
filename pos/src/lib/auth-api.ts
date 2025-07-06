import { call, db } from './frappe-sdk';

interface LoggedUserResponse {
  message: string | null;
}

interface UserDoc {
  name: string;
  full_name: string;
  roles: Array<{
    name: string;
    role: string;
    parent: string;
  }>;
}

export const getLoggedUser = async (): Promise<LoggedUserResponse> => {
  try {
    const response = await call.get('frappe.auth.get_logged_user');
    return response as LoggedUserResponse;
  } catch (error) {
    console.error('Error getting logged user:', error);
    return { message: null };
  }
};

export const getUserRoles = async (email: string): Promise<{ roles: string[]; full_name: string }> => {
  try {
    // Get user details using db.getDoc
    const userDoc = await db.getDoc<UserDoc>('User', email);
    
    if (!userDoc || !userDoc.roles) {
      return { roles: [], full_name: '' };
    }

    // Extract role names and full_name from the user doc
    return {
      roles: userDoc.roles.map(role => role.role),
      full_name: userDoc.full_name
    };
  } catch (error) {
    console.error('Error getting user details:', error);
    return { roles: [], full_name: '' };
  }
};