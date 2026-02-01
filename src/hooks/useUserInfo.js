import { useMemo } from 'react';

export const useUserInfo = (userData) => {
    const userInfo = useMemo(() => {
        return {
            userId: userData?.userId,
            username: userData?.username,
            userPP: userData?.userPP,
            notifications: userData?.notifications || [],
        };
    }, [userData]);

    return userInfo;
};
