import StoreMetadata from './StoreMetadata'

export function Voice() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        StoreMetadata.anyMetadata.push({
            name: 'voice',
            propertyKey,
            target
        })
    }
}