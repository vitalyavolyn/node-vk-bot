import StoreMetadata from './StoreMetadata'

export function PollError() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        StoreMetadata.anyMetadata.push({
            name: 'poll-error',
            propertyKey,
            target
        })
    }
}