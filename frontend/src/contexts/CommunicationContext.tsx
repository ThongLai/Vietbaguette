
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth, User } from './AuthContext';

interface VoiceMessage {
  id: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  active: boolean;
}

interface CommunicationContextType {
  isMicActive: boolean;
  setMicActive: (active: boolean) => void;
  voiceMessages: VoiceMessage[];
  startVoiceCommunication: () => void;
  endVoiceCommunication: () => void;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  mutedUsers: string[];
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider = ({ children }: { children: ReactNode }) => {
  const [isMicActive, setMicActive] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  // Clear inactivity timer on component unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityTimer]);

  const startVoiceCommunication = () => {
    if (!user) return;
    
    // Reset any existing timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    // Create a new voice message
    const newMessage: VoiceMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
      active: true,
    };
    
    setVoiceMessages(prev => [newMessage, ...prev.slice(0, 19)]);
    setMicActive(true);
    
    // Start a timer to check for inactivity after 60 seconds
    const timer = setTimeout(() => {
      toast.info('Voice communication still active', {
        action: {
          label: 'End',
          onClick: endVoiceCommunication,
        },
        duration: 10000,
      });
    }, 60000);
    
    setInactivityTimer(timer);

    // In a real implementation, this is where you'd connect to a voice API
    toast.success('Voice communication started', {
      description: 'Others can now hear you',
    });
    
    // Play a notification sound
    const audio = new Audio('/mic-on.mp3');
    audio.play().catch(e => console.error('Failed to play notification sound', e));
  };

  const endVoiceCommunication = () => {
    setMicActive(false);
    
    // Update the active status of the latest voice message
    setVoiceMessages(prev => prev.map((message, index) => {
      if (index === 0) {
        return { ...message, active: false };
      }
      return message;
    }));
    
    // Clear the inactivity timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }

    toast.info('Voice communication ended');
    
    // Play a notification sound
    const audio = new Audio('/mic-off.mp3');
    audio.play().catch(e => console.error('Failed to play notification sound', e));
  };

  const muteUser = (userId: string) => {
    setMutedUsers(prev => [...prev, userId]);
    toast.info('User muted');
  };

  const unmuteUser = (userId: string) => {
    setMutedUsers(prev => prev.filter(id => id !== userId));
    toast.info('User unmuted');
  };

  return (
    <CommunicationContext.Provider
      value={{
        isMicActive,
        setMicActive,
        voiceMessages,
        startVoiceCommunication,
        endVoiceCommunication,
        muteUser,
        unmuteUser,
        mutedUsers,
      }}
    >
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};
