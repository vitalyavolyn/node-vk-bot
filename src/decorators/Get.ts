import UserEvent from '../interfaces/UserEvent'
import StoreMetadata from './StoreMetadata'

export function Get(pattern: UserEvent['pattern']) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        StoreMetadata.getMetadata.push({
            pattern,
            propertyKey,
            target
        })
    }
}