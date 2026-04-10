import type { UserType } from "./UserType"
export interface AuthType {
    token: string,
    user: UserType
}