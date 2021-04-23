'use strict'
const { parseMultipartData, sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const isAdmin = (user) => {
  return (
    user.role?.name === 'Admin' ||
    user?.roles?.find((i) => i.name.toLowerCase().includes('admin'))
  )
}

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async find(ctx) {
    const d = await strapi.services.todos.find()
    if (!ctx.state.user?.id) return []

    return sanitizeEntity(
      d.filter((i) => i.users_permissions_user?.id === ctx.state.user.id),
      { model: strapi.models.todos },
    )
  },

  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    const data = {
      ...ctx.request.body,
      users_permissions_user: ctx.state.user.id,
    }
    const entity = await strapi.services.todos.create(data)
    return sanitizeEntity(entity, { model: strapi.models.todos })
  },

  // /**
  //  * Update the record.
  //  *
  //  * @return {Object}
  //  */

  async update(ctx) {
    const { id } = ctx.params

    const entity = await strapi.services.todos.findOne({ id })
    if (ctx.state.user?.id === entity.users_permissions_user?.id) {
      const entity = await strapi.services.todos.update(
        { id },
        ctx.request.body,
      )
      return sanitizeEntity(entity, { model: strapi.models.todos })
    }
    throw new Error('Not allowed')
  },

  async delete(ctx) {
    const { id } = ctx.params

    const entity = await strapi.services.todos.findOne({ id })
    if (ctx.state.user.id === entity.users_permissions_user.id) {
      const entity = await strapi.services.todos.delete({ id })
      return sanitizeEntity(entity, { model: strapi.models.todos })
    }
    return 1
  },
}
