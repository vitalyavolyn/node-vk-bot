import StoreMetadata from './StoreMetadata'

export function Payload() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        StoreMetadata.anyMetadata.push({
            name: 'payload',
            propertyKey,
            target
        })
    }
}