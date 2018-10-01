import StoreMetadata from './StoreMetadata'

export function Sticker() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        StoreMetadata.anyMetadata.push({
            name: 'sticker',
            propertyKey,
            target
        })
    }
}