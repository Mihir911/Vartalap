import { HiDocumentArrowDown, HiPlay, HiMicrophone, HiCheck, HiCheckBadge } from "react-icons/hi2";

const MessageBubble = ({ message, isOwn, showSender }) => {
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const renderFile = () => {
        const { fileUrl, fileType, image } = message;
        // Backward compatibility for old image field
        const url = fileUrl || image;
        const type = fileType || (image ? "image" : "");

        if (!url) return null;

        if (type === "image") {
            return (
                <div className="message-file-container image">
                    <img
                        src={url}
                        alt="shared"
                        className="message-image"
                        onClick={() => window.open(url, "_blank")}
                    />
                </div>
            );
        }

        if (type === "video") {
            return (
                <div className="message-file-container video" onClick={() => window.open(url, "_blank")}>
                    <HiPlay className="file-icon" />
                    <span>Video File</span>
                </div>
            );
        }

        if (type === "audio") {
            return (
                <div className="message-file-container audio" onClick={() => window.open(url, "_blank")}>
                    <HiMicrophone className="file-icon" />
                    <span>Audio File</span>
                </div>
            );
        }

        return (
            <div className="message-file-container doc" onClick={() => window.open(url, "_blank")}>
                <HiDocumentArrowDown className="file-icon" />
                <div className="file-info">
                    <span className="file-name">Document</span>
                    <span className="file-size">Click to download</span>
                </div>
            </div>
        );
    };

    const isRead = message.readBy && message.readBy.length > 1;

    return (
        <div className={`message-wrapper ${isOwn ? "sent" : "received"}`}>
            <div className="message-bubble animate-scale-in">
                {showSender && !isOwn && (
                    <div className="message-sender">{message.sender.name}</div>
                )}

                {renderFile()}

                {message.content && (
                    <div className="message-content">{message.content}</div>
                )}

                <div className="message-footer">
                    <span className="message-time">{formatTime(message.createdAt)}</span>
                    {isOwn && (
                        <span className={`message-status ${isRead ? "read" : ""}`}>
                            {isRead ? <HiCheckBadge /> : <HiCheck />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
