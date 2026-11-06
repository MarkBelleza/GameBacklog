import { useState } from 'react';
import '../css/NoticeBox.css';

function NoticeBox({ title, message, storageKey }) {
    const [isVisible, setIsVisible] = useState(
        () => sessionStorage.getItem(storageKey) !== 'dismissed'
        /* 
            Initially sessionStorage.getItem(storageKey) is null, so isVisible will be true.
            We use sessionStorage so that the notice box will reappear if the user closes and 
            reopens the browser tab, but stay dismissed when refresehing the page.
        */
    );

    const handleClose = () => {
        sessionStorage.setItem(storageKey, 'dismissed');
        setIsVisible(false);
    }

    if (!isVisible) { return null; }

    return (
        <div className="notice-box">
            <div className="notice-content">
                <h3>{title}</h3>
                <p>{message}</p>
            </div>

            <button
                className="notice-close"
                onClick={handleClose}
                aria-label="Close"
            >
                &times;
            </button>
        </div>
    );
    // Note: &times; is an HTML character that displays the multiplication symbol (×).
}

export default NoticeBox;