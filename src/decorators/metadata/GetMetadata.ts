import UserEvent from '../../interfaces/UserEvent'

export interface GetMetadata {
    target: any
    propertyKey: string
    pattern: UserEvent['pattern']
}