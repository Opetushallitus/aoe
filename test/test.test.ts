//import 'mocha';
//import {expect} from 'chai';
const request = require('supertest');
const server = require('./../src/server');
const app = require('./../src/app');

// beforeAll(async () => {
//     const server = app.listen(3000, () => {
//         console.log(
//           "  App is running at http://localhost:%d in %s mode",
//           app.get("port"),
//           app.get("env")
//         );
//         console.log("  Press CTRL-C to stop\n");
//       });
//     // do something before anything else runs
//     console.log('Jest starting!');
//    });

// describe('First test', function() {
//     it('test1', function()  {
//         let result = 'aa';
//         expect(result).toBe('aa');
//     });
//     it('test2', function() {
//         let result = 'aa';
//         // expect(result).to.equal('a');
//         expect(result).toBe('a');
//     });
// });

describe("basic route tests", () => {
    test("POST create user", async () => {
        const user = {
            "firstname": "Tapio2",
            "lastname": "Järvinen",
            "username": "ttk.s" + new Date() + "@csc.fi"
            }
        const response = await request(app).post("/createUser").send(user)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.status).toEqual(200);
        
    });
    test("POST new material", async () => {
        const response = await request(app)
            .post("/material/file")
            // .set("Content-Type", "application/x-www-form-urlencoded")
            .field("materialname","testmaterial")
            .field("usersid",1)
            .field("technicalname","tekninen nimi")
            .field("licensecode","cc-11")
            .field("timerequired","300")
            .field("agerangemin","1")
            .field("agerangemax","300")
            .attach("myFiles","./test/files/filesendingtest.rtf");
        expect(response.status).toEqual(200);
        console.log(response.body[0].id);
        const response2 = await request(app).get("/material/" + response.body[0].id);
        expect(response2.status).toEqual(200);
        expect(response2.body[0].id).toContain(response.body[0].id);
        console.log(response2.body[0]);

    });
    test('get home route GET /', async () => {
        const response = await request(app).get('/material/3');
        expect(response.status).toEqual(200);
        expect(response.body[0].id).toContain('3');
    });
});

describe("xlsx metadata", () => {
    test("POST metadata name empty/", async () => {
        const response = await request(app)
            .post("/uploadXlsx")
            .set("Content-Type", "application/x-www-form-urlencoded")
            .attach("xlsxfile","./test/files/aoe-metadata-test-no-name.xlsx");
        expect(response.status).toEqual(400);
    });

    test("POST dublicates found/", async () => {
        const data = { error:
            [ { row: 2,
                column: 'avainsana',
                reason: 'avainsana has dublicate value' },
              { row: 2,
                column: 'saavutettavuus',
                reason: 'saavutettavuus has dublicate value' },
              { row: 2,
                column: 'oppiaste',
                reason: 'oppiaste has dublicate value' },
              { row: 2,
                column: 'kayttotapa',
                reason: 'kayttotapa has dublicate value' },
              { row: 2,
                column: 'julkaisia',
                reason: 'julkaisia has dublicate value' },
              { row: 2,
                column: 'opettaa',
                reason: 'opettaa has dublicate value' },
              { row: 2,
                column: 'arvioi',
                reason: 'arvioi has dublicate value' },
              { row: 2,
                column: 'vaikeustaso',
                reason: 'vaikeustaso has dublicate value' },
              { row: 2,
                column: 'koulutusaste',
                reason: 'koulutusaste has dublicate value' },
              { row: 2,
                column: 'oppiaine',
                reason: 'oppiaine has dublicate value' },
              { row: 2,
                column: 'alkutasovaatimus',
                reason: 'alkutasovaatimus has dublicate value' },
              { row: 2,
                column: 'lukutaitovaatimus',
                reason: 'lukutaitovaatimus has dublicate value' },
              { row: 3, column: 'nimi', reason: 'nimi cannot be empty' } ] };

        const response = await request(app)
            .post("/uploadXlsx")
            .set("Content-Type", "application/x-www-form-urlencoded")
            .attach("xlsxfile","./test/files/aoe-metadata-test-dublicate.xlsx");
        expect(response.status).toEqual(400);
        // expect(response.body).toEqual(data);
    });

    test("POST invalid Content-Type", async () => {
        const response = await request(app)
            .post("/uploadXlsx")
            .set("Content-Type", "applicaton/json");
        expect(response.status).toEqual(400);
        expect(response.text).toEqual("Not file found");
    });

    test("POST valid xlsx /", async () => {
        const response = await request(app)
            .post("/uploadXlsx")
            .set("Content-Type", "application/x-www-form-urlencoded")
            .attach("xlsxfile","./test/files/aoe-metadata-test.xlsx");
        expect(response.status).toEqual(200);   
    });

    test("POST invalid file type /", async () => {
        
        const response = await request(app)
            .post("/uploadXlsx")
            .set("Content-Type", "application/x-www-form-urlencoded")
            .attach("xlsxfile","./test/files/typetest.rtf");
        expect(response.status).toEqual(400);
    });
    // test("POST h /", async () => {
    //     console.log(app);
    //     const response = await request(app)
    //         .post("/uploadXlsx")
    //         .set("Content-Type", "text/plain")
    //         .send("test");
    //         // .attach("xlsxfilemaybeerror","./test/files/aoe-metadata-test.xlsx");
    //         // console.log(response);
    //     expect(response.status).toEqual(500);   
    // });
});

afterAll(() => {
    app.close();
    console.log('server closed!');
   });
