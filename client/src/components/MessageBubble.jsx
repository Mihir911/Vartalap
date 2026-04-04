const MessageBubble = ({ message, isOwn, showSender }) => {
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className={`message-wrapper ${isOwn ? "sent" : "received"}`}>
            <div className="message-bubble">
                {showSender && !isOwn && (
                    <div className="message-sender">{message.sender.name}</div>
                )}
                {message.image && (
                    <img
                        src={message.image}
                        alt="shared"
                        className="message-image"
                        onClick={() => window.open(message.image, "_blank")}
                    />
                )}
                {message.content && (
                    <div className="message-content">{message.content}</div>
                )}
                <div className="message-time">{formatTime(message.createdAt)}</div>
            </div>
        </div>
    );
};

export default MessageBubble;
