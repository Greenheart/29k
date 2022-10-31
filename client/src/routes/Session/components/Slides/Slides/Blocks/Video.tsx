import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components/native';
import RNVideo, {VideoProperties} from 'react-native-video';
import {useRecoilValue} from 'recoil';

import {sessionExerciseStateSelector} from '../../../../state/state';
import VideoBase from '../../../VideoBase/VideoBase';

const StyledVideo = styled(VideoBase)({
  flex: 1,
});

type VideoProps = {
  source: VideoProperties['source'];
  active: boolean;
  preview?: string;
  autoLoop?: boolean;
};
const Video: React.FC<VideoProps> = ({
  active,
  source,
  preview,
  autoLoop = false,
}) => {
  const videoRef = useRef<RNVideo>(null);
  const [videoLength, setVideoLength] = useState(0);
  const exerciseState = useRecoilValue(sessionExerciseStateSelector);
  const previousState = useRef({playing: false, timestamp: new Date()});

  useEffect(() => {
    if (active && !autoLoop && videoLength && exerciseState) {
      // Block is active, video and state is loaded
      const playing = exerciseState.playing;
      const timestamp = exerciseState.timestamp.toDate();

      if (
        timestamp > previousState.current.timestamp &&
        previousState.current.playing === playing
      ) {
        // State is equal, but newer - reset to beginning
        videoRef.current?.seek(0);
      } else if (timestamp < previousState.current.timestamp && playing) {
        // State is old - compensate time played
        const timeDiff = (new Date().getTime() - timestamp.getTime()) / 1000;
        if (timeDiff < videoLength) {
          // Do not seek passed video length
          videoRef.current?.seek(timeDiff);
        } else {
          videoRef.current?.seek(videoLength - 1);
        }
      }

      // Update previous state
      previousState.current = {
        playing,
        timestamp,
      };
    }
  }, [active, autoLoop, videoLength, previousState, exerciseState]);

  return (
    <StyledVideo
      source={source}
      poster={preview}
      ref={videoRef}
      onLoad={({duration}) => setVideoLength(duration)}
      repeat={autoLoop}
      resizeMode="contain"
      posterResizeMode="contain"
      paused={!active || (!exerciseState?.playing && !autoLoop)}
      allowsExternalPlayback={false}
    />
  );
};

export default Video;
