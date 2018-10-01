import StoreMetadata from './StoreMetadata'

export function VkController(): Function {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        StoreMetadata.vkControllerMetadata.push({target})
    }
}