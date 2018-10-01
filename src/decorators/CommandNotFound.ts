import StoreMetadata from './StoreMetadata'

export function CommandNotFound() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        StoreMetadata.anyMetadata.push({
            name: 'command-notfound',
            propertyKey,
            target
        })
    }
}