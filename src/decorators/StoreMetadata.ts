import {VkControllerMetadata} from './metadata/VkControllerMetadata'
import {GetMetadata} from './metadata/GetMetadata'
import {AnyMetadata} from './metadata/AnyMetadata'
import {GetPayloadMetadata} from './metadata/GetPayloadMetadata'

class StoreMetadata {
    public getPayloadMetadata: GetPayloadMetadata[] = []
    public getMetadata: GetMetadata[] = []
    public vkControllerMetadata: VkControllerMetadata[] = []
    public anyMetadata: AnyMetadata[] = []

}
export default new StoreMetadata()
