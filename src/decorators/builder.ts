import {Bot} from '../index'
import * as path from 'path'
import * as glob from 'glob'
import StoreMetadata from './StoreMetadata'
export function build(bot: Bot, controllers: string[]) {
    if (!(controllers as any[]).every(value => value instanceof Function))
        (controllers as string[]).forEach(value => glob.sync(path.normalize(value)).filter(file =>
            file.substring(file.length - 5, file.length) !== '.d.ts'
        ).forEach(dir => require(dir)))

    StoreMetadata.vkControllerMetadata.forEach(controller => {
        let controllerInstance = new (controller.target as any)(bot)

        StoreMetadata.getMetadata
            .filter(get => get.target === controller.target.prototype)
            .forEach(getMetadata => {
                bot.get(getMetadata.pattern, function(...args) {
                    controllerInstance[getMetadata.propertyKey](...args)
                })
            })
        StoreMetadata.getPayloadMetadata
            .filter(get => get.target === controller.target.prototype)
            .forEach(getMetadata => {
                bot.getPayload(getMetadata.jsonString, function(...args) {
                    controllerInstance[getMetadata.propertyKey](...args)
                })
            })

        StoreMetadata.anyMetadata
            .filter(get => get.target === controller.target.prototype)
            .forEach(anyMetadata => {
                bot.on(anyMetadata.name, function(...args) {
                    controllerInstance[anyMetadata.propertyKey](...args)
                })
            })
    })
}