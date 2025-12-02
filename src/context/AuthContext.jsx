import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        setLoading(true)

        setTimeout(() => {
                    try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setIsAuthenticated(true)
                console.log('User authenticated:', userData.email || userData.firstName);
            } else {
                console.log('No token/user found, setting as unauthenticated')
                setUser(null)
                setIsAuthenticated(false)
            }
        } catch (error) {
            console.error('Auth check failed', error);
            logout();
        } finally {
            setLoading(false);
        }

        },0);
    };

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        console.log('🚨 LOGOUT FUNCTION CALLED!')
        console.trace('Logout called from')

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        setUser(null);
        setIsAuthenticated(false);
        // window.location.href='/'
    };

    const updateUser = (updatedUserData) => {
        const newUserData = {...user, ...updatedUserData};
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        checkAuthStatus
    };


    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};