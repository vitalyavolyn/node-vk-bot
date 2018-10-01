import StoreMetadata from './StoreMetadata'

export function GetPayload(jsonString: string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        StoreMetadata.getPayloadMetadata.push({
            jsonString,
            propertyKey,
            target
        })
    }
}