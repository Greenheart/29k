import React, {useEffect} from 'react';

import * as i18n from './lib/i18n';
import * as sentry from './lib/sentry';
import * as metrics from './lib/metrics';

import useResumeFromBackgrounded from './lib/appState/hooks/useResumeFromBackgrounded';
import useAppState from './lib/appState/state/state';
import useCheckForUpdate from './lib/codePush/hooks/useCheckForUpdate';
import useKillSwitch from './lib/killSwitch/hooks/useKillSwitch';
import useAuthenticateUser from './lib/user/hooks/useAuthenticateUser';
import {GIT_COMMIT_SHORT} from 'config';

i18n.init();
sentry.init();
metrics.init();

const Bootstrap: React.FC<{children: React.ReactNode}> = ({children}) => {
  useAuthenticateUser();

  const setIsColdStarted = useAppState(state => state.setIsColdStarted);
  const checkKillSwitch = useKillSwitch();
  const checkForUpdate = useCheckForUpdate();

  // Check killswitch and updates on mount
  useEffect(() => {
    checkKillSwitch();
    checkForUpdate();
    metrics.setCoreProperties({
      'App Git Commit': GIT_COMMIT_SHORT,
    });
  }, [checkKillSwitch, checkForUpdate]);

  // Check killswitch and updates when resuming from background
  useResumeFromBackgrounded(() => {
    setIsColdStarted(false);
    checkKillSwitch();
    checkForUpdate();
  });

  return <>{children}</>;
};

export default Bootstrap;
