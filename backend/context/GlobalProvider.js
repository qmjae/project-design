import React, { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, updateDefectStatus } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  // Track dismissed history notifications to prevent them from reappearing
  const [dismissedHistoryIds, setDismissedHistoryIds] = useState([]);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const addNotification = (newNotification) => {
    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    try{
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }
    catch(error){
        console.error('Error removing notification:', error);
    }
  };
  
  // Add a new function to dismiss history notifications
  const dismissHistoryNotification = (id) => {
    try {
      console.log(`Dismissing history notification with ID: ${id}`);
      // Add this ID to our list of dismissed history notifications
      setDismissedHistoryIds(prev => [...prev, id]);
    } catch (error) {
      console.error('Error dismissing history notification:', error);
    }
  };

  // Improved updateNotificationType function
  const updateNotificationType = async (id, newType) => {
    try {
      console.log(`Updating notification - ID: "${id}", Type: "${newType}"`);
      
      // Check if ID is valid before proceeding
      if (!id) {
        console.error("Invalid notification ID: cannot update status");
        return;
      }
      
      // First update the local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, type: newType } : notification
        )
      );
      
      // Convert the notification type to the appropriate status enum value
      let statusValue = 'pending'; // Default
      if (newType === 'Resolved') {
        statusValue = 'resolved';
      }
      
      console.log(`Converting notification type "${newType}" to status "${statusValue}"`);
      
      // Call the utility function to update the database
      await updateDefectStatus(id, statusValue);
      
      console.log(`Successfully updated document ${id} with status: ${statusValue}`);
      
    } catch (error) {
      console.error('Error updating notification type:', error);
      // Don't throw the error here - we want the app to continue functioning
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        notifications,
        addNotification,
        removeNotification,
        updateNotificationType,
        dismissHistoryNotification,
        dismissedHistoryIds
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;