import {DailyParticipant} from '@daily-co/react-native-daily-js';
import {renderHook} from '@testing-library/react-hooks';
import {
  DailyUserData,
  SessionData,
} from '../../../../../shared/src/types/Session';
import useSessionState from '../state/state';
import useDailyState from '../../../lib/daily/state/state';
import useSessionExercise from './useSessionExercise';
import useSessionParticipants from './useSessionParticipants';

const mockUseSessionExercise = useSessionExercise as jest.Mock;
jest.mock('./useSessionExercise');

const createParticipant = (id: string, userData?: DailyUserData) => ({
  [id]: {user_id: id, userData} as DailyParticipant,
});

describe('useSessionParticipants', () => {
  it('should order participants depending on sort order', () => {
    useDailyState.setState({
      participants: {
        ...createParticipant('test-id-1'),
        ...createParticipant('test-id-2'),
        ...createParticipant('test-id-3'),
      },
      participantsSortOrder: ['test-id-2', 'test-id-3', 'test-id-1'],
    });

    const {result} = renderHook(() => useSessionParticipants());

    expect(result.current).toEqual([
      {user_id: 'test-id-2'},
      {user_id: 'test-id-3'},
      {user_id: 'test-id-1'},
    ]);
  });

  it('filter participants if participant is on spotlight', () => {
    mockUseSessionExercise.mockReturnValue({
      slide: {current: {type: 'host'}},
    });

    useDailyState.setState({
      participants: {
        ...createParticipant('some-spotlight-user-id'),
        ...createParticipant('some-other-user-id'),
      },
    });
    useSessionState.setState({
      session: {
        exerciseState: {
          dailySpotlightId: 'some-spotlight-user-id',
        },
      } as SessionData,
    });

    const {result} = renderHook(() => useSessionParticipants());

    expect(result.current).toEqual([{user_id: 'some-other-user-id'}]);
  });

  it('returns all participants when no session spotlight participant', () => {
    mockUseSessionExercise.mockReturnValue({
      slide: {current: {type: 'host'}},
    });

    useDailyState.setState({
      participants: {
        ...createParticipant('some-spotlight-user-id'),
        ...createParticipant('some-other-user-id'),
      },
    });

    const {result} = renderHook(() => useSessionParticipants());

    expect(result.current).toEqual([
      {user_id: 'some-spotlight-user-id'},
      {user_id: 'some-other-user-id'},
    ]);
  });

  it('returns all participants when content is not ”spotlight type"', () => {
    mockUseSessionExercise.mockReturnValue({
      slide: {current: {type: 'not-host'}},
    });

    useDailyState.setState({
      participants: {
        ...createParticipant('some-spotlight-user-id'),
        ...createParticipant('some-other-user-id'),
      },
    });
    useSessionState.setState({
      session: {
        exerciseState: {
          dailySpotlightId: 'some-spotlight-user-id',
        },
      } as SessionData,
    });

    const {result} = renderHook(() => useSessionParticipants());

    expect(result.current).toEqual([
      {user_id: 'some-spotlight-user-id'},
      {user_id: 'some-other-user-id'},
    ]);
  });

  it('filter participants who are in the portal', () => {
    useDailyState.setState({
      participants: {
        ...createParticipant('some-in-portal-user-id', {inPortal: true}),
        ...createParticipant('some-not-in-portal-user-id', {inPortal: false}),
        ...createParticipant('some-without-user-data-user-id'),
      },
    });

    const {result} = renderHook(() => useSessionParticipants());

    expect(result.current).toEqual([
      {user_id: 'some-not-in-portal-user-id', userData: {inPortal: false}},
      {user_id: 'some-without-user-data-user-id'},
    ]);
  });
});
