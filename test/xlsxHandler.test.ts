// const request = require('supertest');
// const server = require('./../src/server');
// const app = require('./../src/app');


// describe("POST /xlsx", function () {
//     it("First file", function (done) {   
//         this.timeout(10000);
//         request(app)
//             .post("/uploadXlsx")
//             .set("Content-Type", "application/x-www-form-urlencoded")
//             .attach("xlsxfile[0]","./test/files/aoe-metadata-test.xlsx")
//             // .expect("Content-Type", "application/x-www-form-urlencoded")
//             .expect(500, done);
//     });
// });
describe('First test', function() {
    it('test1', function()  {
        let result = 'aa';
        expect(result).toBe('aa');
    });
    // it('test2', function() {
    //     let result = 'aa';
    //     // expect(result).to.equal('a');
    //     expect(result).toBe('a');
    // });
});


//     });
// }
//    });

// afterAll(() => {
//     app.close();
//     console.log('server closed!');
//    });

// export {};