import React, { createContext, useState, useContext, useEffect } from 'react';
import { instance } from '../api/axios';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const pointsResponse = await instance.get('/api/user-points');
        setPoints(pointsResponse.data.points);

        const photosResponse = await instance.get('/api/user-photos');
        setPhotos(photosResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setPoints(0);
    setPhotos([]);
  };

  const updatePoints = async () => {
    try {
      const response = await instance.get('/api/user-points');
      setPoints(response.data.points);
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  const updatePhotos = async () => {
    try {
      const response = await instance.get('/api/user-photos');
      setPhotos(response.data);
    } catch (error) {
      console.error('Error updating photos:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, points, updatePoints, photos, updatePhotos }}>
      {children}
    </UserContext.Provider>
  );
};
