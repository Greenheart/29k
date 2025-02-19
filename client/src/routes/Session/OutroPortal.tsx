import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';
import Video from 'react-native-video';
import styled from 'styled-components/native';

import {
  BottomSafeArea,
  TopSafeArea,
} from '../../common/components/Spacers/Spacer';
import {SPACINGS} from '../../common/constants/spacings';
import useSessionExercise from './hooks/useSessionExercise';
import useLeaveSession from './hooks/useLeaveSession';
import VideoBase from './components/VideoBase/VideoBase';
import usePreventGoingBack from '../../lib/navigation/hooks/usePreventGoingBack';
import useNavigateWithFade from '../../lib/navigation/hooks/useNavigateWithFade';
import Screen from '../../common/components/Screen/Screen';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useIsFocused} from '@react-navigation/native';
import Button from '../../common/components/Buttons/Button';
import {useTranslation} from 'react-i18next';
import Gutters from '../../common/components/Gutters/Gutters';
import AudioFader from './components/AudioFader/AudioFader';
import Sentry from '../../lib/sentry';

const VideoStyled = styled(VideoBase)({
  ...StyleSheet.absoluteFillObject,
  flex: 1,
});

const reverseVideo = (url: string) => {
  const transformFlags = (url.match(/cloudinary.*\/upload\/?(.*)\/v/) ?? [])[1];

  if (transformFlags === undefined) {
    Sentry.captureException(
      new Error('Could not reverse the video - Invalid url'),
    );
    return url;
  }

  if (transformFlags === '') {
    return url.replace('/upload/v', '/upload/e_reverse/v');
  } else {
    return url.replace(transformFlags, `${transformFlags},e_reverse`);
  }
};

const TopBar = styled(Gutters)({
  justifyContent: 'flex-end',
  flexDirection: 'row',
});

const OutroPortal: React.FC = () => {
  const loopingVid = useRef<Video>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const exercise = useSessionExercise();
  const {leaveSession} = useLeaveSession();
  const [readyToLeave, setReadyToLeave] = useState(false);
  const isFocused = useIsFocused();
  const {t} = useTranslation('Screen.Portal');

  usePreventGoingBack();
  useNavigateWithFade();

  const outroPortal = exercise?.outroPortal;
  const introPortal = exercise?.introPortal;

  useEffect(() => {
    if (
      !outroPortal?.video &&
      (!introPortal?.videoEnd || !introPortal?.videoLoop)
    ) {
      leaveSession();
    }
  }, [
    introPortal?.videoEnd,
    introPortal?.videoLoop,
    outroPortal?.video,
    leaveSession,
  ]);

  if (
    outroPortal?.video?.source &&
    (!introPortal?.videoLoop?.source || !introPortal?.videoEnd?.source)
  ) {
    return null;
  }

  const onEndVideoLoad = () => {
    loopingVid.current?.seek(0);
    setVideoLoaded(true);
  };

  const onLoopVideoEnd = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy');
    setReadyToLeave(true);
  };

  return (
    <Screen>
      <TopSafeArea minSize={SPACINGS.SIXTEEN} />

      {!outroPortal?.video?.source &&
        introPortal?.videoLoop?.source &&
        introPortal?.videoEnd?.source && (
          <>
            {isFocused && introPortal?.videoLoop?.audio && (
              <AudioFader
                source={introPortal?.videoLoop.audio}
                repeat
                paused={!videoLoaded}
                volume={readyToLeave ? 1 : 0}
                duration={readyToLeave ? 20000 : 5000}
              />
            )}
            <VideoStyled
              ref={loopingVid}
              onLoad={onEndVideoLoad}
              paused={!readyToLeave || !isFocused}
              source={{uri: reverseVideo(introPortal.videoLoop.source)}}
              resizeMode="cover"
              posterResizeMode="cover"
              repeat={true}
            />

            {!readyToLeave && (
              <VideoStyled
                onEnd={onLoopVideoEnd}
                paused={!isFocused}
                source={{uri: reverseVideo(introPortal.videoEnd.source)}}
                resizeMode="cover"
                poster={introPortal.videoEnd?.preview}
                posterResizeMode="cover"
              />
            )}
          </>
        )}

      {outroPortal?.video?.source && (
        <VideoStyled
          ref={loopingVid}
          onLoad={() => {
            loopingVid.current?.seek(0);
            onLoopVideoEnd();
          }}
          source={{uri: outroPortal.video.source}}
          resizeMode="cover"
          poster={outroPortal.video?.preview}
          posterResizeMode="cover"
          repeat={true}
        />
      )}
      {readyToLeave && (
        <TopBar>
          <Button variant="secondary" small onPress={leaveSession}>
            {t('leavePortal')}
          </Button>
        </TopBar>
      )}
      <BottomSafeArea minSize={SPACINGS.SIXTEEN} />
    </Screen>
  );
};

export default OutroPortal;
