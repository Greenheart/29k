import React, {useMemo} from 'react';
import {
  BottomSheetNavigationOptions,
  createBottomSheetNavigator,
} from '@th3rdwave/react-navigation-bottom-sheet';

import {ModalStackProps} from './constants/routes';
import SessionModal from '../../routes/SessionModal/SessionModal';
import CreateSessionModal from '../../routes/CreateSessionModal/CreateSessionModal';
import JoinSessionModal from '../../routes/JoinSessionModal/JoinSessionModal';
import UpgradeAccountModal from '../../routes/UpgradeAccountModal/UpgradeAccountModal';
import AddSessionModal from '../../routes/AddSessionModal/AddSessionModal';
import SessionUnavailableModal from '../../routes/SessionUnavailableModal/SessionUnavailableModal';
import {COLORS} from '../../../../shared/src/constants/colors';
import SETTINGS from '../../common/constants/settings';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppStackWrapper from './AppStack';
import {BottomSheetBackdrop} from '@gorhom/bottom-sheet';

const ModalStack = createBottomSheetNavigator<ModalStackProps>();

const modalScreenOptions: BottomSheetNavigationOptions = {
  backdropComponent: ({animatedIndex, animatedPosition, style}) => (
    <BottomSheetBackdrop
      pressBehavior="close"
      animatedIndex={animatedIndex}
      animatedPosition={animatedPosition}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.1}
      style={style}
    />
  ),
  backgroundStyle: {
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.09,
    shadowRadius: 35,
    elevation: 35,
    borderRadius: SETTINGS.BORDER_RADIUS.MODALS,
    overflow: 'visible',
  },
  handleStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
};

const ModalStackWrapper = () => {
  const {top} = useSafeAreaInsets();

  const sheetModalScreenOptions = useMemo(
    () => ({
      ...modalScreenOptions,
      snapPoints: ['50%', '75%', '100%'],
      style: {
        // Using margin instead of topInset to make the shadow visible when snapped at 100%
        marginTop: top,
      },
      handleIndicatorStyle: {
        backgroundColor: COLORS.GREYDARK,
      },
    }),
    [top],
  );

  const cardModalScreenOptions = useMemo(
    () => ({
      ...modalScreenOptions,
      snapPoints: [200],
      detached: true,
      bottomInset: 10,
      style: {
        marginHorizontal: 10,
      },
      handleIndicatorStyle: {
        opacity: 0,
      },
    }),
    [],
  );

  return (
    <ModalStack.Navigator>
      <ModalStack.Screen name="App" component={AppStackWrapper} />

      <ModalStack.Group screenOptions={sheetModalScreenOptions}>
        <ModalStack.Screen name={'SessionModal'} component={SessionModal} />
        <ModalStack.Screen
          name={'CreateSessionModal'}
          component={CreateSessionModal}
        />
        <ModalStack.Screen
          name={'UpgradeAccountModal'}
          component={UpgradeAccountModal}
        />
      </ModalStack.Group>

      <ModalStack.Group screenOptions={cardModalScreenOptions}>
        <ModalStack.Screen
          name={'AddSessionModal'}
          component={AddSessionModal}
        />
        <ModalStack.Screen
          name={'JoinSessionModal'}
          component={JoinSessionModal}
        />
        <ModalStack.Screen
          name={'SessionUnavailableModal'}
          component={SessionUnavailableModal}
        />
      </ModalStack.Group>
    </ModalStack.Navigator>
  );
};

export default ModalStackWrapper;
