//import 'mocha';
//import {expect} from 'chai';
const request = require('supertest');
const server = require('./../src/server');
const app = require('./../src/app');
const username = "ttk.s" + new Date() + "@csc.fi";

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
            "username": username
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
            .field("username",username)
            .field("technicalname","tekninen nimi")
            .field("licensecode","cc-11")
            .field("timerequired","300")
            .field("agerangemin","1")
            .field("agerangemax","300")
            .attach("myFiles","./test/files/filesendingtest.rtf");
        expect(response.status).toEqual(200);
        console.log(response.body.id);
        const response2 = await request(app).get("/material/" + response.body.id);
        expect(response2.status).toEqual(200);
        expect(response2.body.id).toContain(response.body.id);
        console.log(response2.body);

    });
    test('GET materialdata/', async () => {
        const response = await request(app).get('/material/1');
        expect(response.status).toEqual(200);
        expect(response.body.id).toContain('1');
    });

    test('POST link/', async () => {
      const response = await request(app).post('/material/link/1').send(
        {"materials" :
          [
            {
            "link" : "test.csc.fi"
            },
            {
            "link" : "test2.csc.fi"
            }
          ]
        }
      );
      expect(response.status).toEqual(200);
      expect(response.body.materials[0].link).toContain("test.csc.fi");
  });

    test('PUT metadata material /', async () => {
      const response = await request(app).put('/material/1')
            .send({
              "id": 3,
              "publishedAt" : "1920-01-01T00:00:00.000Z",
              "author": [
                {
                  "authorname": "jari isometso",
                "organization": "CSC"
                  
                }
                ],
              "publisher": [
                "suomen kirjakerho",
                "CSC",
                "ministeri"
              ],
                "materialname": [
                {
                  "text": "Uusi nimi 3",
                  "lang": "fi"
                },
                {
                  "text": "desc",
                  "lang": "en"
                },
                {
                  "text": "häj",
                  "lang": "se"
                }
              ],
              "description": [
                {
                  "text": "Kuvaus",
                  "lang": "fi"
                },
                {
                  "text": "description here",
                  "lang": "en"
                },
                {
                  "text": "häj",
                  "lang": "se"
                }
              ],
              "keywords": [
                {"key": "p10","value" : "avainsana2"},
                {"key": "p2","value" : "toinen sana"}
              ],
              "learningResourceType": [
                {"value" : "biologia"},
                {"value" : "matikka2"},
                {"value" : "matikka5"}
              ],
              "timeRequired": "3",
              "typicalAgeRange": {
                "min": "1",
                "max": "20"
              },
              "educationalAlignment": [
                {
                  "alignmentType": "teaches",
                  "targetName": "ma",
                  "source": "koodisto2",
                  "complexity": "A1"
                },
                    {
                  "alignmentType": "teaches",
                  "targetName": "m43",
                  "source": "koodisto1",
                  "complexity": "A1"
                },
                    {
                  "alignmentType": "teaches2",
                  "targetName": "ma",
                  "source": "koodisto1",
                  "complexity": "A1"
                }
              ],
              "educationalRole": [
                {"value" : "teachers"},
                {"value" : "student"},
                {"value" : "student2"}
              ],
              "educationalUse": [
                {"value" : "teachers23"},
                {"value" : "student22"}
              ],
             "inLanguage": [
                {"value" : "FI", "url" : "example.fi"},
                {"value" : "EN", "url" : "example.fi"}
              ],
              "accessibilityFeature": [
                {"value" : "tableOfContents"},
                {"value" : "annotations"}
              ],
              "accessibilityHazard": [
                {"value" : "flashing"},
                {"value" : "sound"}
              ],
              "accessibilityAPI": [
                {"value" : "ATK"},
                {"value" : "JavaAccessibility"}
              ],
              "accessibilityControl": [
                {"value" : "fullKeyboardControl"},
                {"value" : "fullMouseControl"}
              ],
              "licenseInformation": 
                {"value" : "CCBY4.0"},
              "isBasedOn": [
                {"author" : "Topi S",
                 "materialname" : "Kalevin vala",
                 "url" : "uusi.example://url.fi",
                 "aoeid" : ""
                },
                {"author" : "Topi S3",
                 "materialname" : "Kalevin vala",
                 "url" : "example://url.fi",
                 "aoeid" : ""
                }
              ]  
            });
      expect(response.status).toEqual(200);
      // expect(response.body[0][0].id).toContain('3');
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
