import { create } from 'zustand'

interface IUserStore {
    email: string
    setEmail: (email: string) => void
}

export const useUserStore = create<IUserStore>(
    (set) => ({
        email: '',
        setEmail: (email: string) => set({ email: email })
    })
)