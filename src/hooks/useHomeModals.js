import { useState } from 'react';

export const useHomeModals = () => {
    const [activeModal, setActiveModal] = useState(null); // 'text', 'image', 'editing', 'chat'
    const [selectedReceiver, setSelectedReceiver] = useState(null);
    const [showMessBox, setShowMessBox] = useState(false);

    const openText = () => setActiveModal('text');
    const openImage = () => setActiveModal('image');
    const openEditor = () => setActiveModal('editing');
    
    const openChat = (receiver) => {
        console.log('Opening chat with:', receiver);
        setSelectedReceiver(receiver);
        setActiveModal('chat');
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedReceiver(null);
    };

    return {
        activeModal,
        selectedReceiver,
        showMessBox,
        setShowMessBox,
        openText,
        openImage,
        openEditor,
        openChat,
        closeModal,
        isTextOpen: activeModal === 'text',
        isImageOpen: activeModal === 'image',
        isEditorOpen: activeModal === 'editing',
        isChatOpen: activeModal === 'chat',
    };
};
