import { useEffect } from "react";
import styles from './toast.module.css';


const Toast = ({message, setToast})=>{

    useEffect(()=>{
        setTimeout(()=>{
            setToast(null)
        }, 3000);

        
    },[])

    return(
        <div className={styles.toastContainer}>
            {message}
        </div>
    )
}
export default Toast;