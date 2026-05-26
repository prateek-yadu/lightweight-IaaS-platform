import type { AuthState } from '@/interface/AuthState'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'



const initialState: AuthState = {
  isAuthenticated: false,
  name: undefined,
  email: undefined,
  imageUrl: undefined
}

export const authHandlerSlice = createSlice({
  name: 'AuthHandler',
  initialState,
  reducers: {
    updateAuthState: (state, action: PayloadAction<AuthState>) => {
      state.isAuthenticated = action.payload.isAuthenticated
      state.name = action.payload.name
      state.email = action.payload.email
      state.imageUrl = action.payload.imageUrl
    }
  },
})

// Action creators are generated for each case reducer function
export const { updateAuthState } = authHandlerSlice.actions

export default authHandlerSlice.reducer