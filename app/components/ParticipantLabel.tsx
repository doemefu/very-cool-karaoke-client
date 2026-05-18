interface ParticipantLabelProps {
  participantId: number;
  userId: string;
  adminId: string;
}

export default function ParticipantLabel({ participantId, userId, adminId }: ParticipantLabelProps) {
  const isMe = String(participantId) === String(userId);
  const isHost = String(participantId) === String(adminId);

  if (isMe && isHost) return <span style={{ color: "#FF2D7E", marginLeft: 6, fontSize: 11 }}>(me &amp; host)</span>;
  if (isHost)         return <span style={{ color: "#FF2D7E", marginLeft: 6, fontSize: 11 }}>(host)</span>;
  if (isMe)           return <span style={{ color: "#00C2FF", marginLeft: 6, fontSize: 11 }}>(me)</span>;
  return null;
}
