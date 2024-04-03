import { db } from '@resource/clientPostgres';

export const updateViewCounter = async (id: string): Promise<void> => {
  // View counter disabled in development mode.
  if (['development', 'localhost'].includes(process.env.NODE_ENV)) return;
  try {
    await db.tx(async (t: any) => {
      const query = `
        UPDATE educationalmaterial
        SET viewcounter = viewcounter + 1, counterupdatedat = NOW()
        WHERE id = $1
      `;
      await t.none(query, [id]);
    });
  } catch (error) {
    throw new Error(error);
  }
};

export async function updateDownloadCounter(id: string): Promise<void> {
  try {
    await db.tx(async (t: any) => {
      const query =
        'update educationalmaterial set downloadcounter = downloadcounter + 1, counterupdatedat = now() where id = $1;';
      await t.none(query, [id]);
    });
  } catch (error) {
    throw new Error(error);
  }
}

export const getPopularityQuery =
  'select a/NULLIF(b,0) as popularity from' +
  '(select' +
  '(select (viewcounter + downloadcounter + (select count(*) from rating where id = $1)) ' +
  'from educationalmaterial where id = $1) as a, ' +
  '(select (SELECT EXTRACT(DAY FROM (select sum(now() - publishedat) from educationalmaterial where id = $1))) as b))' +
  'as c;';

export async function getPopularity(id: string): Promise<any> {
  try {
    const response = await db.task(async (t: any) => {
      return await t.oneOrNone(getPopularityQuery, [id]);
    });
    return response.popularity;
  } catch (error) {
    throw new Error(error);
  }
}
