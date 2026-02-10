import { useState, useCallback, useMemo } from "react";
import Messenger from "../components/Messenger";


const MessengerPage = () => {
    const [active, setActive] = useState('messenger');
    

    return (
        <div>
            <Messenger 
                setActive={setActive}
                active={active}
            />
            
        </div>
    );
};

export default MessengerPage;