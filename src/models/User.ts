import { ScoringFormat } from './ScoringFormat';

export interface User {
    id: string,
    name: string,
    scoringFormat?: ScoringFormat, // should be 'POINT_10_DECIMAL' if site does not have formatting
    site?: string
}

declare global {
    function createUserObject(userObject: User): User
}

export function createUserObject(userObject: User): User {
    return userObject
}