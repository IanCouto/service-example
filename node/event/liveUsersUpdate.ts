import { EventContext } from '@vtex/api'

import { Clients } from '../clients/index'
import { COURSE_ENTITY } from '../utils/constants'

export async function updateLiveUsers(ctx: EventContext<Clients>) {
  const liveUsersProducts = await ctx.clients.analytics.getLiveUsers()
  console.log('MOCKED LIVE USERS ', liveUsersProducts)
  await Promise.all(
    liveUsersProducts.map(async ({ slug, liveUsers }) => {
      try {
        const [savedProduct] = await ctx.clients.masterdata.searchDocuments<{
          id: string
          slug: string
          count: number
        }>({
          dataEntity: COURSE_ENTITY,
          fields: ['slug', 'count', 'id'],
          pagination: {
            page: 1,
            pageSize: 1,
          },
          schema: 'v1',
          where: `slug=${slug}`,
        })

        console.log('SAVED PRODUCT', savedProduct)

        await ctx.clients.masterdata
          .createOrUpdateEntireDocument({
            dataEntity: COURSE_ENTITY,
            fields: {
              slug,
              count: liveUsers,
            },
            id: savedProduct?.id,
            schema: 'v1',
          })
          .then(res => {
            console.log(res)
            return res
          })
      } catch (e) {
        console.log(`failed to update product ${slug}`)
        console.log(e)
      }
    })
  )
  return true
}
