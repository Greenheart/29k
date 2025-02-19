import {renderHook} from '@testing-library/react-hooks';
import {SessionData} from '../../../../../shared/src/types/Session';
import useExerciseById from '../../../lib/content/hooks/useExerciseById';
import useSessionState from '../state/state';
import useSessionExercise from './useSessionExercise';

jest.mock('../../../lib/content/hooks/useExerciseById', () => jest.fn());

const mockUseExerciseById = useExerciseById as jest.Mock;

describe('useSessionExercise', () => {
  it('should return null if no exercise exists', () => {
    mockUseExerciseById.mockReturnValue(null);
    useSessionState.setState({
      session: {
        id: 'test',
      } as SessionData,
    });

    const {result} = renderHook(() => useSessionExercise());

    expect(result.current).toBe(null);
  });

  it('should return null if no session exists', () => {
    mockUseExerciseById.mockReturnValue({});
    useSessionState.setState({
      session: null,
    });
    const {result} = renderHook(() => useSessionExercise());

    expect(result.current).toBe(null);
  });

  it('should return exercise and slide', () => {
    mockUseExerciseById.mockReturnValue({
      slides: [{type: 'slide-1'}, {type: 'slide-2'}, {type: 'slide-3'}],
    });
    useSessionState.setState({
      session: {
        exerciseState: {index: 1},
      } as SessionData,
    });

    const {result} = renderHook(() => useSessionExercise());

    expect(result.current).toEqual({
      slide: {
        index: 1,
        current: {type: 'slide-2'},
        next: {type: 'slide-3'},
        previous: {type: 'slide-1'},
      },
      slides: [{type: 'slide-1'}, {type: 'slide-2'}, {type: 'slide-3'}],
    });
  });

  it('should memoize return', () => {
    mockUseExerciseById.mockReturnValue({
      slides: [{type: 'slide-1'}, {type: 'slide-2'}, {type: 'slide-3'}],
    });
    useSessionState.setState({
      session: {
        exerciseState: {index: 1},
      } as SessionData,
    });

    const {result, rerender} = renderHook(() => useSessionExercise());

    rerender();

    expect(result.all.length).toBe(2);
    expect(result.all[0]).toBe(result.all[1]);
  });

  it('should return exercise and only current slide', () => {
    mockUseExerciseById.mockReturnValue({
      slides: [{type: 'slide-1'}],
    });
    useSessionState.setState({
      session: {
        exerciseState: {index: 0},
      } as SessionData,
    });

    const {result} = renderHook(() => useSessionExercise());

    expect(result.current).toEqual({
      slide: {
        index: 0,
        current: {type: 'slide-1'},
        next: undefined,
        previous: undefined,
      },
      slides: [{type: 'slide-1'}],
    });
  });
});
