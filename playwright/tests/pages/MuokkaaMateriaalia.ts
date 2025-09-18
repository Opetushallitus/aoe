import type { Page } from '@playwright/test'
import { MateriaaliFormi } from './MateriaaliFormi'
import { Header } from './Header'

export const MuokkaaMateriaalia = (page: Page) => {
  return {
    header: Header(page),
    ...MateriaaliFormi(page, true)
  }
}
