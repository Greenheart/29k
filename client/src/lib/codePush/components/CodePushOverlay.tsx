import React from 'react';
import {StyleSheet} from 'react-native';
import codepush from 'react-native-code-push';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {useTranslation} from 'react-i18next';

import Button from '../../../common/components/Buttons/Button';
import {Heading18} from '../../../common/components/Typography/Heading/Heading';
import {COLORS} from '../../../../../shared/src/constants/colors';

import useCodePushState from '..//state/state';
import useAppState from '../../appState/state/state';
import useRestartApp from '../hooks/useRestartApp';
import {Spacer16} from '../../../common/components/Spacers/Spacer';
import {Body18} from '../../../common/components/Typography/Body/Body';
import styled from 'styled-components/native';
import {GUTTERS} from '../../../common/constants/spacings';
import useKillSwitchState from '../../killSwitch/state/state';

// import * as metrics from '../../lib/metrics';
// import {EVENTS} from '../../constants/metrics';

const {INSTALLING_UPDATE, DOWNLOADING_PACKAGE, UPDATE_INSTALLED} =
  codepush.SyncStatus;

const Container = styled.View({
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  alignItems: 'center',
  justifyContent: 'center',
});

const Prompt = styled.View({
  margin: GUTTERS.BIG,
  padding: GUTTERS.BIG,
  borderRadius: 16,
  backgroundColor: COLORS.GREYLIGHTEST,
  alignItems: 'center',
});

const Row = styled.View({
  flexDirection: 'row',
});

const CodePushOverlay = () => {
  const {t} = useTranslation('Component.CodePushOverlay');

  const restartApp = useRestartApp();

  const status = useCodePushState(state => state.status);
  const downloadProgress = useCodePushState(state => state.downloadProgress);
  const isColdStarted = useAppState(state => state.isColdStarted);
  const isRequiredUpdate = useKillSwitchState(
    state => state.requiresBundleUpdate,
  );
  const setRequiresBundleUpdate = useKillSwitchState(
    state => state.setRequiresBundleUpdate,
  );

  if (!isRequiredUpdate) {
    return null;
  }

  const handleDismiss = () => {
    //metrics.logEvent(EVENTS.DISMISS_REQUIRED_UPDATE);
    setRequiresBundleUpdate(false);
  };

  const handleRestart = () => {
    //metrics.logEvent(EVENTS.UPDATE_APP_REQUIRED);
    restartApp();
  };

  switch (status) {
    case DOWNLOADING_PACKAGE:
    case INSTALLING_UPDATE:
      return (
        <Container>
          <Prompt>
            <Heading18>{t('downloading.title')}</Heading18>
            <Spacer16 />
            <AnimatedCircularProgress
              fill={downloadProgress * 100}
              size={30}
              width={2}
              rotation={0}
              tintColor={COLORS.GREYDARK}
              backgroundColor={COLORS.GREYMEDIUM}
              lineCap="round"
            />
            <Spacer16 />
            <Body18>{t('downloading.text')}</Body18>
          </Prompt>
        </Container>
      );

    case UPDATE_INSTALLED:
      return (
        <Container>
          <Prompt>
            <Heading18>{t('install.title')}</Heading18>
            <Spacer16 />
            <Body18>{t('install.text')}</Body18>
            <Spacer16 />
            <Row>
              {!isColdStarted && (
                <>
                  <Button onPress={handleDismiss} variant="secondary">
                    {t('install.dismiss_button')}
                  </Button>
                  <Spacer16 />
                </>
              )}
              <Button onPress={handleRestart}>
                {t('install.restart_button')}
              </Button>
            </Row>
          </Prompt>
        </Container>
      );

    default:
      return null;
  }
};

export default CodePushOverlay;
