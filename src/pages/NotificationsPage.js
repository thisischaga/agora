import Notifs from "../components/Notifs";
import { useState } from "react";

const NotificationsPage = () => {
    const [active, setActive] = useState('notifications');
    const [refresh, setRefresh] = useState(false);
    
    const userId = localStorage.getItem('userId');
    const pp = localStorage.getItem('pp');

    return (
        <Notifs 
            setActive={setActive}
            active={active}
            pp={pp}
            userId={userId} 
            setRefresh={setRefresh} 
            refresh={refresh} 
        />
    );
};

export default NotificationsPage;