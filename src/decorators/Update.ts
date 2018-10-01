import StoreMetadata from './StoreMetadata'

export function Update() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        StoreMetadata.anyMetadata.push({
            name: 'update',
            propertyKey,
            target
        })
    }
}