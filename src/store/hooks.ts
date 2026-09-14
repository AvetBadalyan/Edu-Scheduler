/**
 * Typed Redux hooks — use these everywhere instead of raw useSelector/useDispatch.
 * This gives full TypeScript inference on state shape and dispatch.
 */
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector)
