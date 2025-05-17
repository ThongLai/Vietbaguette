
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunication } from '@/contexts/CommunicationContext';
import { Mic, MicOff, Volume2, User, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const CommunicationPanel = () => {
  const { isMicActive, startVoiceCommunication, endVoiceCommunication, voiceMessages, muteUser, unmuteUser, mutedUsers } = useCommunication();
  const { user } = useAuth();
  const [expandedHistory, setExpandedHistory] = useState(false);

  const toggleMic = () => {
    if (isMicActive) {
      endVoiceCommunication();
    } else {
      startVoiceCommunication();
    }
  };

  const toggleMuteUser = (userId: string) => {
    if (mutedUsers.includes(userId)) {
      unmuteUser(userId);
    } else {
      muteUser(userId);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Volume2 className="mr-2 h-5 w-5" />
          Voice Communication
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Push to Talk */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Push to talk to communicate with other staff members. All logged-in staff will hear your message.
          </p>
          <Button
            onClick={toggleMic}
            className={`w-full h-16 text-lg ${isMicActive ? 'bg-red-500 hover:bg-red-600' : ''}`}
            variant={isMicActive ? "destructive" : "default"}
          >
            {isMicActive ? (
              <>
                <MicOff className="mr-2 h-6 w-6" />
                Release to Stop
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </>
            ) : (
              <>
                <Mic className="mr-2 h-6 w-6" />
                Hold to Talk
              </>
            )}
          </Button>
        </div>

        {/* Active Communication */}
        {voiceMessages.length > 0 && voiceMessages[0].active && (
          <div className="mb-6 p-4 border rounded-md bg-muted/30 flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback>{voiceMessages[0].senderName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{voiceMessages[0].senderName}</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <span className="flex h-2 w-2 relative mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Speaking now...
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleMuteUser(voiceMessages[0].senderId)}
            >
              {mutedUsers.includes(voiceMessages[0].senderId) ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}

        {/* Communication History */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Recent Communications</h3>
            <Button
              variant="link"
              onClick={() => setExpandedHistory(!expandedHistory)}
              className="p-0 h-auto text-sm"
            >
              {expandedHistory ? 'Show Less' : 'Show All'}
            </Button>
          </div>

          <div className="space-y-3">
            {voiceMessages
              .slice(0, expandedHistory ? voiceMessages.length : 3)
              .filter(msg => !msg.active) // Don't show active message twice
              .map((message) => (
                <div 
                  key={message.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/20"
                >
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{message.senderName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{message.active ? 'Active' : 'Ended'}</Badge>
                </div>
              ))}

            {voiceMessages.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No recent communications
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationPanel;
