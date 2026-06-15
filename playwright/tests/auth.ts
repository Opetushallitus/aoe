import * as path from 'node:path'

export enum User {
  AOEUSER = 'aoeuser',
  TUOMAS_JUKOLA = 'tuomas.jukola'
}

export const authFileByUser: Record<User, string> = {
  [User.AOEUSER]: path.join(__dirname, '../.auth/user.json'),
  [User.TUOMAS_JUKOLA]: path.join(__dirname, '../.auth/tuomas.jukola.json')
}
