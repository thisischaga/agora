import Amis from "../components/Amis";
import { useState } from "react";

const FriendsPage = () => {
    const [active, setActive] = useState('amis');
    const [refresh, setRefresh] = useState(false);
    
    const userId = localStorage.getItem('userId');
    const pp = localStorage.getItem('pp');

    return (
        <Amis 
            setActive={setActive}
            active={active}
            pp={pp}
            userId={userId} 
            setRefresh={setRefresh} 
            refresh={refresh} 
        />
    );
};

export default FriendsPage;