import { HiDocumentArrowDown, HiPlay, HiMicrophone, HiCheck, HiCheckBadge } from "react-icons/hi2";

const MessageBubble = ({ message, isSent, showSender }) => {
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const renderFile = () => {
        const { fileUrl, fileType, image } = message;
        const url = fileUrl || image;
        const type = fileType || (image ? "image" : "");

        if (!url) return null;

        if (type === "image") {
            return (
                <div className="message-file-container image" style={{ marginBottom: message.content ? '8px' : '0' }}>
                    <img
                        src={url}
                        alt="shared"
                        className="message-image"
                        style={{ borderRadius: '12px', cursor: 'pointer' }}
                        onClick={() => window.open(url, "_blank")}
                    />
                </div>
            );
        }

        return (
            <div
                className={`message-file-container ${type}`}
                onClick={() => window.open(url, "_blank")}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    marginBottom: message.content ? '8px' : '0'
                }}
            >
                {type === "video" ? <HiPlay className="file-icon" /> :
                    type === "audio" ? <HiMicrophone className="file-icon" /> :
                        <HiDocumentArrowDown className="file-icon" />}
                <div className="file-info">
                    <span className="file-name" style={{ fontSize: '13px', fontWeight: '600' }}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} File
                    </span>
                    <span className="file-size" style={{ fontSize: '11px', opacity: 0.7 }}>Click to view</span>
                </div>
            </div>
        );
    };

    const isRead = message.readBy && message.readBy.length > 1;

    return (
        <div className={`message-wrapper ${isSent ? "sent" : "received"}`}>
            <div className={`message-bubble animate-scale-in ${isSent ? "message-sent" : "message-received"}`}>
                {showSender && !isSent && (
                    <div className="message-sender" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--secondary-glow)', marginBottom: '4px' }}>
                        {message.sender.name}
                    </div>
                )}

                {renderFile()}

                {message.content && (
                    <div className="message-content" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                        {message.content}
                    </div>
                )}

                <div className="message-footer" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', opacity: 0.8 }}>
                    <span className="message-time" style={{ fontSize: '10px' }}>{formatTime(message.createdAt)}</span>
                    {isSent && (
                        <span className={`message-status ${isRead ? "read" : ""}`} style={{ fontSize: '14px', display: 'flex' }}>
                            {isRead ? <HiCheckBadge style={{ color: 'var(--secondary-glow)' }} /> : <HiCheck />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
