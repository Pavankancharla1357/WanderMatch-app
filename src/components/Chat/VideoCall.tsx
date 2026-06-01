import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoCallProps {
  roomName: string;
  displayName: string;
  email: string;
  onClose: () => void;
  type: 'video' | 'audio';
}

export const VideoCall: React.FC<VideoCallProps> = ({ roomName, displayName, email, onClose, type }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
    >
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between text-white border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h3 className="font-bold text-sm tracking-tight">
            {type === 'video' ? 'Video' : 'Audio'} Call: {roomName.split('-')[0]}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 w-full bg-gray-950 flex items-center justify-center relative overflow-hidden">
        <JitsiMeeting
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: type === 'audio',
            prejoinPageEnabled: false,
            disableModeratorIndicator: true,
            enableEmailInStats: false,
            enableWelcomePage: false,
            noticeMessage: 'Connecting to TripBridge Secure Line...',
            toolbarButtons: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'security'
            ]
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            APP_NAME: 'TripBridge',
            DEFAULT_REMOTE_DISPLAY_NAME: 'Traveler',
          }}
          userInfo={{
            displayName: displayName,
            email: email
          }}
          onReadyToClose={onClose}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }}
        />
      </div>
    </motion.div>
  );
};
