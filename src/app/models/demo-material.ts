/**
 * @ignore
 */
export interface DemoMaterial {
  id: number;
  name: string; // nimi
  author: string; // tekijä
  description: string; // kuvaus
  educationalSubject: string[]; // aihealue
  publishDate: Date; // julkaisunajankohta
  learningResourceType: string[]; // oppimateriaalin tyyppi
  educationalLevel: string[]; // koulutusaste
  about: string[]; // asiasana
  license: string; // lisenssi
  inLanguage: string; // kieli
  educationalRole: string[]; // kohderyhmä
  publisher?: string; // julkaisija
  accessibilityFeature?: string[]; // saavutettavuuden tukitoiminnot
  accessibilityHazard?: string[]; // saavutettavuuden esteet
  accessibilityControl?: string[]; // saavutettavuuden käyttötavat
  accessibilityAPI?: string[]; // saavutettavuutta avustavat teknologiat
  educationalUse?: string[]; // käyttökohde
  timeRequired?: string; // opiskeluun kuluva aika
  educationalAge?: string; // kohderyhmän ikä
  interactivityType?: string; // opiskelun muoto
  isBasedOnURL?: string[]; // materiaali hyödyntää seuraavia materiaaleja
  teaches1?: string; // opetussuunnitelma
  teaches2?: string[]; // sisältöalue tai tutkinnon osa
}
