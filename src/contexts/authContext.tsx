import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../services/userServices/userService';
import { UserLogin } from '../services/userServices/login';
import { createFishLog } from '../services/fishLogService/createFishLog';
import NetInfo from '@react-native-community/netinfo';

interface IAuthProvider {
  children: React.ReactNode;
}

interface IAuthContext {
  userId: string;
  authenticated: boolean | undefined;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider: React.FC<IAuthProvider> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState<boolean | undefined>();
  const [userId, setUserId] = useState('');

  async function getValues() {
    const token = await AsyncStorage.getItem('@eupescador/token');
    const _userId = await AsyncStorage.getItem('@eupescador/userId');
    const userAdmin = await AsyncStorage.getItem('@eupescador/userAdmin');

    return { token, _userId, userAdmin };
  }
  const handleAutenticate = async () => {
    const values = await getValues();
    if (values.token && values._userId) {
      userService.defaults.headers.Authorization = `Bearer ${values.token}`;
      setAuthenticated(true);
      setUserId(JSON.stringify(values._userId));
    } else {
      setAuthenticated(false);
    }
  };
  useEffect(() => {
    handleAutenticate();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const result = await UserLogin(email, password);

      await AsyncStorage.setItem('@eupescador/token', result.data.token);
      await AsyncStorage.setItem('@eupescador/userId', JSON.stringify(result.data.id));
      await AsyncStorage.setItem(
        '@eupescador/userAdmin',
        JSON.stringify(result.data.admin),
      );
      const hasAcessTheApp = await AsyncStorage.getItem('hasAcessTheApp');
      if (!!hasAcessTheApp == false) {
        await AsyncStorage.setItem('hasAcessTheApp', 'false');
      }
      userService.defaults.headers.Authorization = `Bearer ${result.data.token}`;
      setAuthenticated(true);
      setUserId(result.data.id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async function signOut() {
    setAuthenticated(false);
    setUserId('');
    await AsyncStorage.removeItem('@eupescador/token');
    await AsyncStorage.removeItem('@eupescador/userId');
    await AsyncStorage.removeItem('@eupescador/userAdmin');
    await AsyncStorage.removeItem('drafts');
    userService.defaults.headers.Authorization = undefined;
  }

  useEffect(() => {
    async function getFishCache() {
      const conection = await NetInfo.fetch();
      const response = await AsyncStorage.getItem('@eupescador/newfish');
      const fish = JSON.parse(response!);
      if (fish && conection.isConnected) {
        await createFishLog(
          fish.fishPhoto,
          fish.name,
          fish.largeGroup,
          fish.group,
          fish.species,
          fish.weight,
          fish.lenght,
          fish.coordenates.latitude,
          fish.coordenates.longitude,
        );
        await AsyncStorage.removeItem('@eupescador/newfish');
      };
    };

    getFishCache();

  },[]);

  return (
    <AuthContext.Provider
      value={{
        userId,
        signIn,
        signOut,
        authenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
