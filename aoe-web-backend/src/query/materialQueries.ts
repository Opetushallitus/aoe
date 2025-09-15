import { db } from '@resource/postgresClient'
import winstonLogger from '@util/winstonLogger'

export async function updateEducationalMaterial(emid: string) {
  return await db.tx(async (t: any) => {
    await t.none('UPDATE educationalmaterial SET obsoleted = 1 WHERE id = $1;', [emid])
    winstonLogger.debug(`Educational material obsoleted for id: ${emid}`)

    const materialIds = await t.any(
      'UPDATE material SET obsoleted = 1 WHERE educationalmaterialid = $1 RETURNING id;',
      [emid]
    )
    winstonLogger.debug(`Materials obsoleted: ${JSON.stringify(materialIds)}`)

    for (const { id } of materialIds) {
      const attachmentIds = await t.any(
        'UPDATE attachment SET obsoleted = 1 WHERE materialid = $1 RETURNING id;',
        [id]
      )
      winstonLogger.debug(
        `Attachments obsoleted for material id ${id}: ${JSON.stringify(attachmentIds)}`
      )
    }

    return { id: materialIds }
  })
}

export async function changeEducationalMaterialUser(emid: string, id: string) {
  return await db.tx(async (t: any) => {
    const username = await t.oneOrNone('SELECT username FROM users WHERE id = $1;', [id])
    if (!username || !username.username) {
      return false
    }

    await t.none('UPDATE educationalmaterial SET usersusername = $1 WHERE id = $2;', [
      username.username,
      emid
    ])
    winstonLogger.debug(
      `Changed educational material owner to: ${username.username} for material id: ${emid}`
    )
    return true
  })
}

export async function getUsers() {
  return await db.any('SELECT id, firstname, lastname, email FROM users;')
}

export async function getOwnerName(materialid: string) {
  return await db.oneOrNone(
    'SELECT firstname, lastname FROM educationalmaterial AS em JOIN users ON em.usersusername = users.username WHERE em.id = $1;',
    [materialid]
  )
}

export async function getMaterialName(materialid: string) {
  return await db.any(
    'SELECT materialname, language FROM materialname WHERE educationalmaterialid = $1;',
    [materialid]
  )
}
