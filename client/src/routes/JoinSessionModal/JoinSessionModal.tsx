import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components/native';

import {JoinSessionError} from '../../../../shared/src/errors/Session';
import {COLORS} from '../../../../shared/src/constants/colors';

import Gutters from '../../common/components/Gutters/Gutters';
import {Spacer16} from '../../common/components/Spacers/Spacer';
import {Body14} from '../../common/components/Typography/Body/Body';
import VerificationCode from '../../common/components/VerificationCode/VerificationCode';
import {ModalStackProps} from '../../lib/navigation/constants/routes';
import {joinSession} from '../Sessions/api/session';
import useSessions from '../Sessions/hooks/useSessions';
import CardModal from '../../common/components/Modals/CardModal';
import {ModalHeading} from '../../common/components/Typography/Heading/Heading';

const ErrorText = styled(Body14)({color: COLORS.ERROR, textAlign: 'center'});

const JoinSessionModal = () => {
  const {t} = useTranslation('Modal.JoinSession');
  const {
    params: {inviteCode: inviteCode},
  } = useRoute<RouteProp<ModalStackProps, 'JoinSessionModal'>>();
  const {fetchSessions} = useSessions();
  const {goBack, navigate} =
    useNavigation<NativeStackNavigationProp<ModalStackProps, 'SessionModal'>>();
  const [errorString, setErrorString] = useState<string | null>(null);

  return (
    <CardModal>
      <Gutters>
        <ModalHeading>{t('title')}</ModalHeading>
        <Spacer16 />
        <VerificationCode
          prefillCode={`${inviteCode || ''}`}
          onCodeCompleted={async value => {
            try {
              const session = await joinSession(value);
              fetchSessions();
              goBack();
              navigate('SessionModal', {session: session});
            } catch (err) {
              switch ((err as Error).message) {
                case JoinSessionError.notFound:
                  setErrorString(t('errors.sessionNotFound'));
                  break;
                default:
                  goBack();
                  navigate('SessionUnavailableModal');
                  break;
              }
            }
          }}
        />
        {errorString && (
          <>
            <Spacer16 />
            <ErrorText>{errorString}</ErrorText>
          </>
        )}
      </Gutters>
    </CardModal>
  );
};

export default JoinSessionModal;
