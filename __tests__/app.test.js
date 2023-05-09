const app = require('../app');
const connection = require('../db/connection');
const seed = require('../db/seeds/seed');
const devData = require('../db/data/test-data/index');
const request = require('supertest');

beforeEach(() => {
    return seed(devData);
})

afterAll(() => {
    if (connection) connection.end();
})

describe('GET /api/topics', () => {
    it('status 200, responds with an array of topic objects,  each of which should have the following properties: slug, description.', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body}) => {
                const {topics} = body;
                expect(topics).toBeArray();
                
                topics.forEach(topic => {
                    expect(topic).toHaveProperty('slug', expect.any(String));
                    expect(topic).toHaveProperty('description', expect.any(String));
                })
            })
    })
})